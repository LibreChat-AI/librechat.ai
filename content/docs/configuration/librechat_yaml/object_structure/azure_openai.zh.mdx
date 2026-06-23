---
title: Azure OpenAI 对象结构
icon: Azure
---

将 Azure OpenAI Service 集成到您的应用程序中，使您能够无缝利用 Azure OpenAI 托管的多个部署和区域模型。本节详细介绍了如何根据您的需求配置 Azure OpenAI endpoint。

**[有关设置 Azure OpenAI 配置的详细指南，请点击此处](/docs/configuration/librechat_yaml/ai_endpoints/azure)**

## 示例配置 [#example-configuration]

```yaml filename="Example Azure OpenAI Object Structure"
endpoints:
  azureOpenAI:
    titleModel: "gpt-4-turbo"
    groups:
      - group: "my-westus" # arbitrary name
        apiKey: "${WESTUS_API_KEY}"
        instanceName: "actual-instance-name" # name of the resource group or instance
        version: "2023-12-01-preview"
        # baseURL: https://prod.example.com
        # additionalHeaders:
        #   X-Custom-Header: value
        models:
          gpt-4-vision-preview:
            deploymentName: gpt-4-vision-preview
            version: "2024-02-15-preview"
          gpt-3.5-turbo:
            deploymentName: gpt-35-turbo
          gpt-3.5-turbo-1106:
            deploymentName: gpt-35-turbo-1106
          gpt-4:
            deploymentName: gpt-4
          gpt-4-1106-preview:
            deploymentName: gpt-4-1106-preview
      - group: "my-eastus"
        apiKey: "${EASTUS_API_KEY}"
        instanceName: "actual-eastus-instance-name"
        deploymentName: gpt-4-turbo
        version: "2024-02-15-preview"
        baseURL: "https://gateway.ai.cloudflare.com/v1/cloudflareId/azure/azure-openai/${INSTANCE_NAME}/${DEPLOYMENT_NAME}" # uses env variables
        additionalHeaders:
          X-Custom-Header: value
        models:
          gpt-4-turbo: true
```

> **注意：** Azure OpenAI endpoint 支持所有 [Shared Endpoint Settings](/docs/configuration/librechat_yaml/object_structure/shared_endpoint_settings)，包括 `streamRate`、`titleModel`、`titleMethod`、`titlePrompt`、`titlePromptTemplate` 和 `titleEndpoint`。

## assistants

**密钥：**
<OptionTable
  options={[
    ['assistants', 'Boolean', '启用或禁用 Azure OpenAI endpoint 的 assistants。设置为 `true` 时，将激活与此 endpoint 关联的 assistants。', 'Choose one, either the official OpenAI API or Azure OpenAI API for assistants, not both.'],
  ]}
/>

**默认值：** 未指定

**示例：**
```yaml filename="endpoints / azureOpenAI / assistants"
assistants: true
```

## groups

**密钥：**
<OptionTable
  options={[
    ['groups', 'Array', '按地理位置或用途对模型组进行的配置。`groups` 数组中的每一项都配置了一组特定分组下的模型，通常按地理区域或不同的配置进行划分。', ''],
  ]}
/>

**默认值：** 未指定

**注意：** [请参阅上方的示例。](#example-configuration)


## 组对象结构 [#group-object-structure]

`groups` 下的每一项都是记录列表的一部分，每一项都包含以下字段：

### group

**密钥：**
<OptionTable
  options={[
    ['group', 'String', '模型组的标识符。', ''],
  ]}
/>

**必需：** 是

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / group"
"group": "my-westus"
```

### apiKey

**密钥：**
<OptionTable
  options={[
    ['apiKey', 'String', '用于访问 Azure OpenAI Service 的 API 密钥。', 'It\'s highly recommended to use a custom env. variable reference for this field, i.e. `${YOUR_VARIABLE}`'],
  ]}
/>

**必需：** 是

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / apiKey"
apiKey: "${WESTUS_API_KEY}"
```

### instanceName

**密钥：**
<OptionTable
  options={[
    ['instanceName', 'String', 'Azure 实例的名称。**支持两种域名格式**：`.openai.azure.com`（旧版）和 `.cognitiveservices.azure.com`（新版）。您可以指定完整域名（例如 `my-instance.cognitiveservices.azure.com`），也可以仅指定实例名称（例如 `my-instance`），以保持与旧版 `.openai.azure.com` 格式的向后兼容性。', 'It\'s recommended to use a custom env. variable reference for this field, i.e. `${YOUR_VARIABLE}`'],
  ]}
/>

**必需：** 是

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / instanceName"
# Using just the instance name (legacy format applied)
instanceName: "my-westus"
# OR using the full domain (new format)
instanceName: "my-westus.cognitiveservices.azure.com"
```


### version

**密钥：**
<OptionTable
  options={[
    ['version', 'String', 'API 版本', 'It\'s recommended to use a custom env. variable reference for this field, i.e. `${YOUR_VARIABLE}`'],
  ]}
/>

**默认值：** 未指定

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / version"
version: "2023-12-01-preview"
```

### baseURL

**密钥：**
<OptionTable
  options={[
    ['baseURL', 'String', 'Azure OpenAI Service 的基础 URL。', 'It\'s recommended to use a custom env. variable reference for this field, i.e. `${YOUR_VARIABLE}`'],
  ]}
/>

**默认值：** 未指定

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / baseURL"
baseURL: "https://prod.example.com"
```

### additionalHeaders

**密钥：**
<OptionTable
  options={[
    ['additionalHeaders', 'Dictionary', 'API 请求的附加标头。所有标头值必须为字符串。', 'It\'s recommended to use a custom env. variable reference for the values of field, as shown in the example. `api-key` header value is sent on every request.'],
  ]}
/>

**默认值：** 未指定

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / additionalHeaders"
additionalHeaders:
  X-Custom-Header: ${YOUR_SECRET_CUSTOM_VARIABLE}
```

### serverless

**密钥：**
<OptionTable
  options={[
    ['serverless', 'Boolean', '指示使用 Azure OpenAI 聊天补全的无服务器推理 endpoint。当设置为 `true` 时，指定该组被配置为使用无服务器推理 endpoint 作为 Azure “模型即服务”(Models as a Service) 模型。', 'More info [here](../ai_endpoints/azure.mdx#serverless-inference-endpoints)'],
  ]}
/>

**默认值：** 未指定

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / serverless"
serverless: true
```

### addParams

**密钥：**
<OptionTable
  options={[
    ['addParams', 'Object/Dictionary', '为请求添加额外参数。适用于指定特定于 API 的选项。', ''],
  ]}
/>

**默认值：** 未指定

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / addParams"
addParams:
  safe_prompt: true
```

### dropParams

**密钥：**
<OptionTable
  options={[
    ['dropParams', 'Array/List of Strings', '从请求中移除默认参数。排除指定的默认参数。', 'Default parameters are the standard request parameters LibreChat sends to the Azure OpenAI API.'],
  ]}
/>

**默认值：** 未指定

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / dropParams"
dropParams: ["stop", "user", "frequency_penalty", "presence_penalty"]
```

### models

**密钥：**
<OptionTable
  options={[
    ['models', '', '针对组内各个模型的配置。用于配置每个模型的设置，包括部署名称和版本。', 'Model configurations can adopt the group\'s deployment name and/or version when configured as a boolean (set to `true`) or an object for detailed settings of either of those fields.'],
  ]}
/>

**默认值：** 未指定

**示例：**
```yaml filename="endpoints / azureOpenAI / groups / {group_item} / models"
models:
  gpt-4-vision-preview: 
    deploymentName: "arbitrary-deployment-name"
    version: "2024-02-15-preview"
```
