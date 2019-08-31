import deepMerge from '@faasjs/deep_merge';
import { Plugin, DeployData, Next, MountData, InvokeData } from '@faasjs/func';
import { loadNpmVersion } from '@faasjs/load';

export interface CloudFunctionConfig {
  name?: string;
  config?: {
    name?: string;
    memorySize?: number;
    timeout?: number;
    triggers?: {
      type: string;
      name: string;
      value: string;
    }[];
    [key: string]: any;
  };
}

export class CloudFunction implements Plugin {
  public readonly type: string;
  public name?: string;
  private config: {
    name?: string;
    memorySize?: number;
    timeout?: number;
    triggers?: {
      type: string;
      name: string;
      value: string;
    }[];
    [key: string]: any;
  };
  private adapter?: any;
  private context?: any;

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
    this.type = 'cloud_function';
    this.name = config.name;
    this.config = config.config || Object.create(null);
  }

  public async onDeploy (data: DeployData, next: Next) {
    data.logger!.debug('[CloudFunction] 组装云函数配置');
    data.logger!.debug('%o', data);

    const config = deepMerge(data.config!.plugins![this.name || this.type], { config: this.config });

    data.logger!.debug('[CloudFunction] 组装完成 %o', config);

    // 引用服务商部署插件
    // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-var-requires
    const Provider = require(config.provider.type);
    const provider = new Provider(config.provider.config);

    data.dependencies![config.provider.type as string] = loadNpmVersion(config.provider.type);

    // 部署云函数
    await provider.deploy(this.type, data, config);

    await next();
  }

  public async onMount (data: MountData, next: Next) {
    const config = deepMerge(data.config.plugins[this.name || this.type]);
    // 引用服务商部署插件
    // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-var-requires
    const Provider = require(config.provider.type);
    this.adapter = new Provider(config.provider.config);
    await next();
  }

  public async onInvoke (data: InvokeData, next: Next) {
    this.context = data.context;
    await next();
  }

  public invoke (name: string, data?: any, options?: any) {
    if (!data) {
      data = Object.create(null);
    }
    if (typeof data === 'object') {
      data.context = this.context;
    }
    return this.adapter.invokeCloudFunction(name, data, options);
  }
}
