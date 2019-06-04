import deepMerge from '@faasjs/deep_merge';
import { Plugin, DeployData, Next } from '@faasjs/func';

export interface CloudFunctionConfig {
  name?: string;
  config?: {
    name?: string;
    memorySize?: number;
    timeout?: number;
    [key: string]: any;
  };
}

export class CloudFunction implements Plugin {
  public readonly type: string;
  private config: CloudFunctionConfig;

  /**
   * 创建云函数配置
   * @param config {object} 配置项，这些配置将强制覆盖默认配置
   * @param config.name {string} 云资源名
   * @param config.config {object} 云资源配置
   * @param config.config.name {string} 云函数名
   * @param config.config.memorySize {number} 内存大小，单位为 MB
   * @param config.config.timeout {number} 最长执行时间，单位为 秒
   */
  constructor (config: CloudFunctionConfig = Object.create(null)) {
    this.type = 'function';
    this.config = config;
  }

  public async onDeploy (data: DeployData, next: Next) {
    data.logger.debug('[CloudFunction] 组装云函数配置');
    data.logger.debug('%o', data);

    let config;

    if (!this.config.name) {
      // 若没有指定配置名，则读取默认配置
      config = deepMerge(data.config.plugins.defaults.function, this.config, { config: Object.create(null) });
    } else {
      // 检查配置是否存在
      if (!data.config.plugins[this.config.name]) {
        throw Error(`[faas.yaml] Plugin not found: ${this.config.name}`);
      }

      // 合并默认配置
      config = deepMerge(data.config.plugins[this.config.name], this.config, { config: Object.create(null) });
    }

    // 注入所使用插件的配置项
    config.pluginsConfig = Object.create(null);

    for (const key in data.plugins) {
      if (data.plugins.hasOwnProperty(key)) {
        config.pluginsConfig[key as string] = data.config.plugins[key as string];
      }
    }

    data.logger.debug('[CloudFunction] 组装完成 %o', config);

    // 引用服务商部署插件
    // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-var-requires
    const Provider = require(config.provider.type);
    const provider = new Provider();

    // 部署云函数
    await provider.deploy(this.type, data, config);

    await next();
  }
}
