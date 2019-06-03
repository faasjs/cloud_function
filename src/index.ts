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

    // 克隆一份配置对象
    const config = deepMerge(this.config);

    // 若没有指定云资源名，则使用默认的云资源名
    if (!config.name) {
      config.name = data.config.plugins.defaults.function;
    }

    // 检查是否定义了云资源
    if (!data.config.plugins[config.name]) {
      throw Error(`Resource not found: ${config.name}`);
    }

    // 合并云资源配置项
    if (!config.config) {
      config.config = Object.create(null);
    }
    config.config = deepMerge(config.config, data.config.plugins[config.name].config);

    // 添加服务商配置
    if (!data.config.plugins[config.name].provider) {
      throw Error(`Resource's provider is not defined: ${config.name}`);
    } else {
      config.provider = data.config.plugins[config.name].provider;
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
