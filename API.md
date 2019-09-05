<a name="CloudFunction"></a>

## CloudFunction
**Kind**: global class  

* [CloudFunction](#CloudFunction)
    * [new CloudFunction(config)](#new_CloudFunction_new)
    * [.invoke(name, data, options)](#CloudFunction+invoke)
    * [.invokeSync(name, data, options)](#CloudFunction+invokeSync)

<a name="new_CloudFunction_new"></a>

### new CloudFunction(config)
创建云函数配置


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | 配置项，这些配置将强制覆盖默认配置 |
| config.name | <code>string</code> | 云资源名 |
| config.config | <code>object</code> | 云资源配置 |
| config.config.name | <code>string</code> | 云函数名 |
| config.config.memorySize | <code>number</code> | 内存大小，单位为 MB |
| config.config.timeout | <code>number</code> | 最长执行时间，单位为 秒 |
| config.validator | <code>object</code> | 事件校验配置 |
| config.validator.event | <code>object</code> | event 校验配置 |
| config.validator.event.whitelist | <code>string</code> | 白名单配置 |
| config.validator.event.onError | <code>function</code> | 自定义报错 |
| config.validator.event.rules | <code>object</code> | 参数校验规则 |

<a name="CloudFunction+invoke"></a>

### cloudFunction.invoke(name, data, options)
异步触发云函数

**Kind**: instance method of [<code>CloudFunction</code>](#CloudFunction)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | 云函数文件名或云函数名 |
| data | <code>any</code> | 参数 |
| options | <code>object</code> | 额外配置项 |

<a name="CloudFunction+invokeSync"></a>

### cloudFunction.invokeSync(name, data, options)
同步调用云函数

**Kind**: instance method of [<code>CloudFunction</code>](#CloudFunction)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | 云函数文件名或云函数名 |
| data | <code>any</code> | 参数 |
| options | <code>object</code> | 额外配置项 |

