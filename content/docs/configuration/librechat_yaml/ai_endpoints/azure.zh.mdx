---
title: Azure OpenAI
icon: Azure
description: 如何在 LibreChat 中通过 `librechat.yaml` 文件配置 Azure OpenAI，涵盖部署、模型组、多区域及相关设置。
---

# LibreChat 的 Azure OpenAI 集成 [#azure-openai-integration-for-librechat]

LibreChat 将 Azure OpenAI API 服务作为一等 endpoint 提供支持。要在 LibreChat 中使用 Azure OpenAI，请针对您的设置配置 [`librechat.yaml` 文件](/docs/configuration/librechat_yaml/object_structure/azure_openai)。本文档涵盖了使用多个部署和模型的设置过程。

## 示例 [#example]

一个包含下述许多选项和功能的配置示例：

```yaml filename="librechat.yaml"
endpoints:
  azureOpenAI:
    # Endpoint-level configuration
    titleModel: "llama-70b-chat"
    plugins: true
    assistants: true
    groups:
    # Group-level configuration
    - group: "my-resource-westus"
      apiKey: "${WESTUS_API_KEY}"
      instanceName: "my-resource-westus"
      version: "2024-03-01-preview"
      # Model-level configuration
      models:
        gpt-4-vision-preview:
          deploymentName: gpt-4-vision-preview
          version: "2024-03-01-preview"
        gpt-3.5-turbo:
          deploymentName: gpt-35-turbo
        gpt-4-1106-preview:
          deploymentName: gpt-4-1106-preview
    # Group-level configuration
    - group: "mistral-inference"
      apiKey: "${AZURE_MISTRAL_API_KEY}"
      baseURL: "https://Mistral-large-vnpet-serverless.region.inference.ai.azure.com/v1/chat/completions"
      serverless: true
      # Model-level configuration
      models:
        mistral-large: true
    # Group-level configuration
    - group: "my-resource-sweden"
      apiKey: "${SWEDEN_API_KEY}"
      instanceName: "my-resource-sweden"
      deploymentName: gpt-4-1106-preview
      version: "2024-03-01-preview"
      assistants: true
      # Model-level configuration
      models:
        gpt-4-turbo: true
```

此示例遵循 [Azure OpenAI Endpoint Configuration Docs](/docs/configuration/librechat_yaml/object_structure/azure_openai)。

每一级配置的详细信息请参阅其各自的章节：

1. [端点级配置](#endpoint-level-configuration)

2. [组级配置](#group-level-configuration)

3. [模型级配置](#model-level-configuration)

## 设置 [#setup]

1. **编辑 `librechat.yaml`**：使用你偏好的文本编辑器或 IDE 打开并编辑 `librechat.yaml` 文件。

    - 可选：使用以下环境变量来指定远程或自定义文件路径：

    ```sh filename=".env"
    CONFIG_PATH="/alternative/path/to/librechat.yaml"
    ```

2. **配置 Azure OpenAI 设置**：请遵循下述结构来填充您的 Azure OpenAI 设置，包括 API 密钥、实例名称、模型组以及其他配置。

3. **移除旧版设置**：如果您正在使用任何旧版配置，请将其移除。LibreChat 服务器也会检测到这些配置并提醒您。

4. **保存更改**：保存 `librechat.yaml` 文件。

5. **重启 LibreChat**：重启您的 LibreChat 应用程序，以便加载更新后的配置。

## 必需字段 [#required-fields]

要将 Azure OpenAI 集成到 LibreChat，必须在您的 `librechat.yaml` 文件中配置特定字段。这些字段通过自定义变量和环境变量的组合进行验证。详细要求如下。

## Endpoint-Level Configuration [#endpoint-level-configuration]

#### 全局 Azure 设置： [#global-azure-settings]

**标题与对话设置：**
<OptionTable
  options={[
    ['titleModel', 'string', '指定用于生成对话标题的模型。如果未提供，默认模型将设置为 `gpt-3.5-turbo`，若缺少此模型则不会生成标题。您也可以将其设置为 `current_model` 以动态使用当前模型。', 'titleModel:'],
    ['plugins', 'boolean', '启用通过 Azure 使用插件的功能。设置为 `true` 以通过您的 Azure 配置激活 Plugins endpoint 支持。默认值：`false`。', 'plugins:false'],
    ['assistants', 'boolean', '启用通过 Azure 使用 Assistants。设置为 `true` 以通过您的 Azure 配置激活 Assistants endpoint。默认值：`false`。注意：这需要一个兼容 Assistants 的区域。', 'assistants:false'],
    ['summarize', 'boolean', '为所有 Azure 模型启用对话摘要功能。设置为 `true` 以激活摘要功能。默认值：`false`。', 'summarize:false'],
    ['summaryModel', 'string', '指定用于生成对话摘要的模型。如果未提供，默认行为是使用第一个组中 `default` 数组里的第一个模型。', 'summaryModel:'],
    ['titleConvo', 'boolean', '为所有 Azure 模型启用对话标题生成功能。设置为 `true` 以激活标题生成。默认值：`false`。', 'titleConvo:false'],
    ['titleMethod', 'string', '控制用于生成对话标题的方法。有效值："completion"（默认）、"structured"、"functions"（"structured" 的旧版别名）。', 'titleMethod:completion'],
    ['titlePrompt', 'string', '用于生成标题的自定义提示词。必须包含用于表示对话内容的 {convo} 占位符。', 'See documentation for default prompt'],
    ['titlePromptTemplate', 'string', '用于格式化对话内容的模板。必须包含 {input} 和 {output} 占位符。默认值："User: {input}\nAI: {output}"', 'titlePromptTemplate:'],
    ['titleEndpoint', 'string', '用于标题生成的替代 endpoint。可接受的值：openAI, azureOpenAI, google, anthropic, bedrock，或自定义 endpoint 名称。', 'titleEndpoint:'],
  ]}
/>

**群组配置：**
<OptionTable
  options={[
    ['groups', 'array', '指定 Azure OpenAI 模型组列表。每个组代表一组具有共享配置的模型。groups 字段是一个对象数组，其中每个对象定义了特定组的设置。这是 endpoint 级别的必填字段，且必须至少定义一个组。组级配置详见“组级配置”部分。', '# groups:[]'],
  ]}
/>

**自定义排序（可选）：**
<OptionTable
  options={[
    ['customOrder', 'number', '允许您在用户界面中为 Azure endpoint 指定自定义排序。数字越大，在列表中的位置越靠下。如果未提供，默认排序将由 `librechat.yaml` 文件中定义 endpoint 的顺序决定。', 'customOrder:'],
  ]}
/>

`customOrder` 选项已被注释掉，因为它是可选的。

在您的 `librechat.yaml` 文件中，这些 endpoint 级别设置的示例如下：

```yaml filename="librechat.yaml"
endpoints:
  azureOpenAI:
    titleModel: "gpt-3.5-turbo-1106"
    plugins: true
    assistants: true
    summarize: true
    summaryModel: "gpt-3.5-turbo-1106"
    titleConvo: true
    titleMethod: "functions"
    groups:
      # ... (group-level and model-level configurations)
```

## 组级配置 [#group-level-configuration]

可在自定义配置 (`librechat.yaml`) 文件中配置的字段。有关每个字段的更多信息，请参阅 [自定义配置文档中的 Azure OpenAI 部分](/docs/configuration/librechat_yaml/object_structure/azure_openai)。

组级配置：
组标识：
<OptionTable
options={[
['group', 'string', '模型组的唯一标识名称。不允许重复的组名，否则会导致验证错误。', 'group: default'],
]}
/>

身份验证：
<OptionTable
options={[
['apiKey', 'string', '必须是 Azure OpenAI 服务的有效 API 密钥。它可以是直接的密钥字符串，也可以是环境变量引用（例如 ${WESTUS_API_KEY}）。', 'apiKey: ${AZURE_API_KEY}'],
]}
/>

Azure OpenAI 实例：
<OptionTable
options={[
['instanceName', 'string', 'Azure OpenAI 实例的名称。此字段也支持引用环境变量。**支持两种域名格式**：`.openai.azure.com`（旧版）和 `.cognitiveservices.azure.com`（新版）。您可以指定完整域名（例如 `my-instance.cognitiveservices.azure.com`），也可以仅指定实例名称（例如 `my-instance`），以保持与旧版 `.openai.azure.com` 格式的向后兼容性。', 'instanceName: ${AZURE_OPENAI_INSTANCE}'],
]}
/>

部署配置：
<OptionTable
options={[
['deploymentName', 'string', '组级别的部署名称是可选的，但如果组内的任何模型被设置为 true，则该名称为必填项。', 'deploymentName: my-deployment'],
['version', 'string', '组级别的 Azure OpenAI API 版本是可选的，但如果组内的任何模型被设置为 true，则该版本为必填项。', 'version: 2023-03-15-preview'],
]}
/>

高级设置：
<OptionTable
options={[
['baseURL', 'string', 'Azure OpenAI API 请求的自定义基础 URL。支持环境变量引用。此项为可选，可用于高级路由场景。', 'baseURL: https://my-custom-base-url.com'],
['additionalHeaders', 'object', '指定 Azure OpenAI API 请求的任何额外标头，以键值对形式表示。值中可以包含环境变量引用。', 'additionalHeaders: {Authorization: ${AUTH_HEADER}}'],
['serverless', 'boolean', '指定该组是否为来自 Azure Model Catalog 的无服务器推理聊天补全 endpoint，对于此类 endpoint，仅需提供模型标识符、baseURL 和 apiKey。更多信息，请参阅 serverless inference endpoints。', 'serverless: true'],
['addParams', 'object', '为 Azure OpenAI API 请求添加或覆盖额外的参数。适用于以键值对形式指定 API 特定的选项。', 'addParams: {temperature: 0.7}'],
['dropParams', 'array', '允许从 Azure OpenAI API 请求中排除某些默认参数。对于不接受或无法识别特定参数的 API 非常有用。应将其指定为字符串列表。', 'dropParams: [top_p, stop]'],
]}
/>

模型配置：
<OptionTable
options={[
['models', 'object', '指定组内模型标识符与其配置的映射。键代表模型标识符，必须与相应的 OpenAI 模型名称匹配。值可以是布尔值（true）或包含特定模型设置的对象。如果模型设置为 true，它将继承组级别的 deploymentName 和 version。如果模型配置为对象，则可以拥有自己的 deploymentName 和 version。此字段为必填项，且每个组内必须至少定义一个模型。更多信息请见此处', 'models: {gpt-3.5-turbo: true, text-davinci-003: {}}'],
]}
/>

在 `librechat.yaml` 文件中进行组级配置的示例：

```yaml filename="librechat.yaml"
endpoints:
  azureOpenAI:
    # ... (endpoint-level configurations)
    groups:
      - group: "my-resource-group"
        apiKey: "${AZURE_API_KEY}"
        instanceName: "my-instance"
        deploymentName: "gpt-35-turbo"
        version: "2023-03-15-preview"
        baseURL: "https://my-instance.openai.azure.com/"
        additionalHeaders:
          CustomHeader: "HeaderValue"
        addParams:
          max_tokens: 2048
          temperature: 0.7
        dropParams:
          - "frequency_penalty"
          - "presence_penalty"
        models:
        # ... (model-level configurations)
```

## 模型级配置 [#model-level-configuration]

在每个组内，`models` 字段包含模型标识符与其配置之间的映射：

模型标识：
<OptionTable
options={[
['Model Identifier', 'string', '必须与对应的 OpenAI 模型名称匹配。可以是部分匹配。', 'gpt-3.5-turbo: true'],
]}
/>

模型配置：
<OptionTable
options={[
['Model Configuration', 'boolean/object', '布尔值 true：使用组级别的 deploymentName 和 version。对象：指定模型特定的 deploymentName 和 version。如果未提供，则继承自该组。', 'text-davinci-003: {deploymentName: my-model-deployment, version: 2023-03-15-preview}'],
['deploymentName', 'string', '此特定模型的部署名称。', 'deploymentName: my-model-deployment'],
['version', 'string', '此特定模型的 Azure OpenAI API 版本。', 'version: 2023-03-15-preview'],
]}
/>

Serverless 推理端点 (Serverless Inference Endpoints):
<OptionTable
options={[
['Serverless Inference Endpoints', 'note', '对于无服务器模型，将 model 设置为 true。', 'gpt-4: true'],
]}
/>

- **模型标识符必须与其对应的 OpenAI 模型名称匹配**，以便它能正确反映其已知的上下文限制和/或在视觉功能方面正常工作。例如，如果您打算使用 gpt-4-vision，则必须按如下方式进行配置：

```yaml filename="librechat.yaml"
endpoints:
  azureOpenAI:
    # ... (endpoint-level configurations)
    groups:
    # ... (group-level configurations)
    - group: "example_group"
    models:
     # Model identifiers must match OpenAI Model name (can be a partial match)
      gpt-4-vision-preview:
      # Object setting: must include at least "deploymentName" and/or "version"
        deploymentName: "arbitrary-deployment-name"
        version: "2024-02-15-preview" # version can be any that supports vision
      # Boolean setting, must be "true"
      gpt-4-turbo: true
```

- 请参阅 [Model Deployments](#model-deployments) 以获取更多示例。

- 如果一个模型被设置为 `true`，则意味着该模型将使用组级别的 `deploymentName` 和 `version`。在这种情况下，两者都必须在组级别进行定义。
  
- 如果模型被配置为对象，它可以指定自己的 `deploymentName` 和 `version`。如果未提供这些值，模型将继承该组的 `deploymentName` 和 `version`。

- 如果该组代表一个 [serverless inference endpoint](#serverless-inference-endpoints)，则应将 singular model 设置为 `true` 以将其添加到模型列表中。

### 特别注意事项 [#special-considerations]

1. **唯一名称**：模型名称和组名称在整个配置中都必须是唯一的。名称重复会导致验证失败。

2. **缺少必填字段**：如果在组级别（针对布尔值标记的模型）或模型配置内（如果未继承或未明确指定）缺少必填的 `deploymentName` 或 `version`，将会导致验证错误，除非该组代表一个 [serverless inference endpoint](#serverless-inference-endpoints)。

3. **环境变量引用**：该配置支持环境变量引用（例如 `${VARIABLE_NAME}`）。请确保所有被引用的变量均存在于您的环境中，以避免运行时错误。配置中引用的环境变量如果未定义，将会导致错误。`${INSTANCE_NAME}` 和 `${DEPLOYMENT_NAME}` 是特殊的占位符，它们不对应环境变量，而是对应当前所选模型的实例名称和部署名称。不建议将 `INSTANCE_NAME` 和 `DEPLOYMENT_NAME` 用作环境变量名称，以避免任何潜在的冲突。

4. **错误处理**: 配置中的任何问题，例如名称重复、未定义的环境变量或缺少必填字段，都将导致设置失效，并生成旨在快速解决问题的描述性错误消息。如果配置无效，您将无法运行服务器。

5. **模型标识符 (Model identifiers)**：一个（对本项目而言）未知的模型可以用作模型标识符，但它必须匹配一个已知模型，以便反映其已知的上下文长度，这对于消息/令牌处理至关重要；例如，`gpt-7000` 将是有效的，但会默认使用 4k 令牌限制，而 `gpt-4-turbo` 将被识别为具有 128k 上下文限制。

根据最新的模式定义和指南验证您的配置，以保持兼容性。


### 模型部署 [#model-deployments]

用户可用的模型列表由您在 [`azureOpenAI` endpoint 配置](/docs/configuration/librechat_yaml/object_structure/azure_openai) 中指定的模型分组决定。

例如：

```yaml filename="librechat.yaml"
# Example Azure OpenAI Object Structure
endpoints:
  azureOpenAI:
    groups:
      - group: "my-westus" # arbitrary name
        apiKey: "${WESTUS_API_KEY}"
        instanceName: "actual-instance-name" # name of the resource group or instance
        version: "2023-12-01-preview"
        models:
          gpt-4-vision-preview:
            deploymentName: gpt-4-vision-preview
            version: "2024-02-15-preview"
          gpt-3.5-turbo: true
      - group: "my-eastus"
        apiKey: "${EASTUS_API_KEY}"
        instanceName: "actual-eastus-instance-name"
        deploymentName: gpt-4-turbo
        version: "2024-02-15-preview"
        models:
          gpt-4-turbo: true
```

上述配置将按照定义的顺序为您的用户启用 `gpt-4-vision-preview`、`gpt-3.5-turbo` 和 `gpt-4-turbo`。

### 在 Azure 中使用 Assistants [#using-assistants-with-azure]

要启用 Azure OpenAI 的 Assistants 功能，主要有 2 个步骤。

1) 将 `azureOpenAI` endpoint **下**的 `assistants` 字段（即在 [Endpoint-level](#endpoint-level-configuration)）设置为 `true`，如下所示：

```yaml filename="librechat.yaml"
endpoints:
  azureOpenAI:
  # Enable use of Assistants with Azure
    assistants: true
```

2) 将 `assistants` 字段添加到与 Azure 的 Assistants API 集成兼容的组中。

- 您的组配置中至少必须有一个是兼容的。
- 您可以[在此处的 Azure 文档中查看兼容的区域和模型](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#assistants-preview)。
- 版本必须为 "2024-02-15-preview" 或更高版本，建议使用更高版本以获取最新功能。

```yaml filename="librechat.yaml"
endpoints:
  azureOpenAI:
    assistants: true
    groups:
      - group: "my-sweden-group"
        apiKey: "${SWEDEN_API_KEY}"
        instanceName: "actual-instance-name"
      # Mark this group as assistants compatible
        assistants: true
      # version must be "2024-02-15-preview" or later
        version: "2024-03-01-preview"
        models:
          # ... (model-level configuration)
```

**注意：**

- 对于凭据，请依赖在每个兼容 assistants 的组配置中指定的自定义环境变量。
- 如果您将多个区域标记为 assistants-compatible，您创建的助手将跨区域聚合到主助手选择列表中。
- 您上传到 Azure OpenAI 的文件（无论是消息级别还是助手级别）将仅在当前助手模型所属的区域内可用。
    - 出于这个原因，建议您仅为 Azure OpenAI Assistants 使用一个区域或资源组，否则将会遇到错误。
    - 对于官方的 `code_interpreter` 和 `retrieval` 功能，上传至 "OpenAI" 是默认行为。
- 即将支持下载由 assistants 生成的文件。
- 截至 2024 年 5 月 19 日，Azure OpenAI 尚不支持检索（retrieval）和流式传输（streaming）。
    - 为了避免在不支持检索功能时出现任何错误，建议通过 `azureAssistants` endpoint 配置完全禁用该功能：

    ```yaml filename="librechat.yaml"
    endpoints:
      azureOpenAI:
        # ...rest

      azureAssistants:
      # "retrieval" omitted.
        capabilities: ["code_interpreter", "actions", "tools"]
    ```

    - 默认情况下，除 retrieval 外的所有功能均已启用。

### 在 Azure 中使用插件 [#using-plugins-with-azure]

若要将 Plugins endpoint 与 Azure OpenAI 配合使用，你需要一个支持 **[function calling](https://techcommunity.microsoft.com/t5/azure-ai-services-blog/function-calling-is-now-available-in-azure-openai-service/ba-p/3879241)** 的部署。否则，请在 Agent 设置中关闭“Functions”。当你未使用“functions”模式时，建议同时关闭“skip completion”，这是一个对 Agent 生成内容进行审查的步骤。

若要将 Azure 与 Plugins endpoint 配合使用，请确保在您的 Azure OpenAI endpoint 配置中将 `plugins` 字段设置为 `true`：

```yaml filename="librechat.yaml"
# Example Azure OpenAI Object Structure
endpoints:
  azureOpenAI:
    plugins: true # <------- Set this
    groups:
    # omitted for brevity
```

配置 `plugins` 字段将配置 Plugins 以使用 Azure 模型。

**注意**：目前通过 `librechat.yaml` 进行的配置使用您从前端选择的主模型来使用插件，这通常不是在没有 Azure 的情况下的工作方式，在没有 Azure 时，使用的是“智能体 (Agent)”模型。当通过 Azure 使用插件时，可以忽略智能体模型设置。

### 在 Azure 中使用指定的 Base URL [#using-a-specified-base-url-with-azure]

Azure OpenAI API 请求的 base URL 可以动态配置。这对于代理服务（例如 [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/providers/azureopenai/)）非常有用，或者如果您希望显式覆盖应用程序的 baseURL 处理方式，也可以使用此功能。

LibreChat 将使用 baseURL 字段进行 Azure 模型分组，其中可以包含 Azure OpenAI API 实例和部署名称的占位符。

<Callout type="info" title="Azure Endpoint 域名格式支持">
Azure OpenAI 现在支持以下两种 endpoint 域名格式：
- **新格式**：`.cognitiveservices.azure.com`
- **旧版格式**：`.openai.azure.com`

当在不使用完整域名的情况下使用 `instanceName` 时，默认会应用旧版的 `.openai.azure.com` 格式。如果您提供了完整域名（例如 `my-instance.cognitiveservices.azure.com`），它将按原样使用。这适用于 `instanceName` 字段和 `baseURL` 配置。
</Callout>

在配置中，可以按如下方式自定义 base URL：

```yaml filename="librechat.yaml"
# librechat.yaml file, under an Azure group:
endpoints:
  azureOpenAI:
    groups:
      - group: "group-with-custom-base-url"
      baseURL: "https://example.azure-api.net/${INSTANCE_NAME}/${DEPLOYMENT_NAME}"

# Legacy format (.openai.azure.com)
      baseURL: "https://${INSTANCE_NAME}.openai.azure.com/openai/deployments/${DEPLOYMENT_NAME}"

# New format (.cognitiveservices.azure.com)
      baseURL: "https://${INSTANCE_NAME}.cognitiveservices.azure.com/openai/deployments/${DEPLOYMENT_NAME}"

# Cloudflare example
      baseURL: "https://gateway.ai.cloudflare.com/v1/ACCOUNT_TAG/GATEWAY/azure-openai/${INSTANCE_NAME}/${DEPLOYMENT_NAME}"
```

**注意**：`${INSTANCE_NAME}` 和 `${DEPLOYMENT_NAME}` 是唯一的占位符，它们不对应环境变量，而是对应当前所选模型的实例名称和部署名称。不建议将 INSTANCE_NAME 和 DEPLOYMENT_NAME 用作环境变量名称，以避免任何潜在的冲突。

**您也可以完全省略占位符，直接使用您的凭据构建 baseURL：**

```yaml filename="librechat.yaml"
      baseURL: "https://gateway.ai.cloudflare.com/v1/ACCOUNT_TAG/GATEWAY/azure-openai/my-secret-instance/my-deployment"
```
**最后，您可以通过自定义环境变量来指定整个 baseURL**

```yaml filename="librechat.yaml"
      baseURL: "${MY_CUSTOM_BASEURL}"
```


### 使用 Azure 启用自动生成标题 [#enabling-auto-generated-titles-with-azure]

要为 Azure 启用标题生成功能，请将 `titleConvo` 设置为 `true`。

```yaml filename="librechat.yaml"
# Example Azure OpenAI Object Structure
endpoints:
  azureOpenAI:
    titleConvo: true # <------- Set this
    groups:
    # omitted for brevity
```

**你也可以通过 `titleModel` 指定用于生成标题的模型**，前提是你已经在你的组（group(s)）中进行了配置。

```yaml filename="titleModel"
    titleModel: "gpt-3.5-turbo"
```

**注意**：“gpt-3.5-turbo” 是默认值，因此如果您想使用此确切模型并已对其进行配置，则可以省略它。如果未配置且 `titleConvo` 设置为 `true`，则标题生成过程将导致错误，且不会生成标题。您也可以通过将其设置为 `current_model` 来动态使用当前模型。

```yaml filename="titleModel"
    titleModel: "current_model"
```

### 在 Azure 上使用 GPT-4 Vision [#using-gpt-4-vision-with-azure]

若要使用 Azure OpenAI 的 Vision（图像分析）功能，请确保 `gpt-4-vision-preview` 已在[您的分组之一](#model-deployments)中被指定为模型。

这与 [OpenAI endpoint](/docs/configuration/pre_configured_ai/openai) 的工作方式相同：无需手动选择视觉模型，系统会在后台自动切换。

### 使用 Azure OpenAI Service 生成图像 (DALL-E) [#generate-images-with-azure-openai-service-dall-e]

| 模型 ID | 功能可用性 | 最大请求（字符） |
|----------|----------------------|-------------------------|
| dalle2   | East US              | 1000                    |
| dalle3   | Sweden Central       | 4000                    |

- 首先，你需要创建一个托管 DALL-E 的 Azure 资源。
    - 在撰写本文时，dall-e-3 可在 `SwedenCentral` 区域使用，dall-e-2 可在 `EastUS` 区域使用。
- 然后，您需要在上述区域之一中部署图像生成模型。
    - 请阅读 [Azure OpenAI Image Generation Quickstart Guide](https://learn.microsoft.com/en-us/azure/ai-services/openai/dall-e-quickstart) 以获取进一步的帮助。
- 根据 Azure 凭据配置您的环境变量：

DALL-E 配置选项：

#### DALL-E:

**API Keys:**
<OptionTable
  options={[
    ['DALLE_API_KEY', 'string', '用于 DALL-E 2 和 DALL-E 3 服务的 OpenAI API 密钥。','# DALLE_API_KEY='],
  ]}
/>

**API Keys (版本特定):**
<OptionTable
  options={[
    ['DALLE3_API_KEY', 'string', '用于 DALL-E 3 的 OpenAI API 密钥。','# DALLE3_API_KEY='],
    ['DALLE2_API_KEY', 'string', '用于 DALL-E 2 的 OpenAI API 密钥。','# DALLE2_API_KEY='],
  ]}
/>

**系统提示词 (System Prompts):**
<OptionTable
  options={[
    ['DALLE3_SYSTEM_PROMPT', 'string', 'DALL-E 3 的系统提示词','# DALLE3_SYSTEM_PROMPT="Your DALL-E-3 System Prompt here"'],
    ['DALLE2_SYSTEM_PROMPT', 'string', 'DALL-E 2 的系统提示词。','# DALLE2_SYSTEM_PROMPT="Your DALL-E-2 System Prompt here"'],
  ]}
/>

**反向代理设置：**
<OptionTable
  options={[
    ['DALLE_REVERSE_PROXY', 'string', '用于 DALL-E API 请求的反向代理 URL。','# DALLE_REVERSE_PROXY='],
  ]}
/>

**Base URLs:**
<OptionTable
  options={[
    ['DALLE3_BASEURL', 'string', 'DALL-E 3 API endpoint 的基础 URL。支持 `.openai.azure.com`（旧版）和 `.cognitiveservices.azure.com`（新版）两种域名格式。','# DALLE3_BASEURL=https://<AZURE_OPENAI_API_INSTANCE_NAME>.openai.azure.com/openai/deployments/<DALLE3_DEPLOYMENT_NAME>/\n# OR\n# DALLE3_BASEURL=https://<AZURE_OPENAI_API_INSTANCE_NAME>.cognitiveservices.azure.com/openai/deployments/<DALLE3_DEPLOYMENT_NAME>/'],
    ['DALLE2_BASEURL', 'string', 'DALL-E 2 API endpoint 的基础 URL。支持 `.openai.azure.com`（旧版）和 `.cognitiveservices.azure.com`（新版）两种域名格式。','# DALLE2_BASEURL=https://<AZURE_OPENAI_API_INSTANCE_NAME>.openai.azure.com/openai/deployments/<DALLE2_DEPLOYMENT_NAME>/\n# OR\n# DALLE2_BASEURL=https://<AZURE_OPENAI_API_INSTANCE_NAME>.cognitiveservices.azure.com/openai/deployments/<DALLE2_DEPLOYMENT_NAME>/'],
  ]}
/>

**Azure OpenAI 集成（可选）：**
<OptionTable
  options={[
    ['DALLE3_AZURE_API_VERSION', 'string', 'Azure OpenAI 服务中 DALL-E 3 的 API 版本。','# DALLE3_AZURE_API_VERSION=the-api-version # e.g.: 2023-12-01-preview'],
    ['DALLE2_AZURE_API_VERSION', 'string', 'Azure OpenAI 服务中 DALL-E 2 的 API 版本。','# DALLE2_AZURE_API_VERSION=the-api-version # e.g.: 2023-12-01-preview'],
  ]}
/>

将占位符文本替换为实际的提示词或指令，如果您选择直接在文件中包含 API 密钥，请提供它们（建议在代码库之外管理敏感密钥）。在软件中嵌入 API 密钥时，请查阅并遵守 OpenAI 的使用政策。

> 注意：如果您设置了 PROXY，它也将用于 DALL-E 调用，这适用于整个应用。

### Serverless Inference Endpoints [#serverless-inference-endpoints]

通过 `librechat.yaml` 文件，您可以配置 Azure AI Studio 无服务器推理端点，以访问来自 [Azure AI Foundry](https://ai.azure.com/explore) 的模型。除了需要 `serverless` 字段来指示这些端点所需的特殊处理外，仅需提供模型标识符、`baseURL` 和 `apiKey`。

- 您需要按照兼容模型卡中的说明，在 Azure AI Studio 上设置 **MaaS**（“模型即服务”）访问权限。

    - 作为参考，以下是一些已知的兼容模型卡片：

    - [Mistral-large](https://aka.ms/aistudio/landing/mistral-large) | [Meta-Llama-3.1-8B-Instruct](https://ai.azure.com/explore/models/Meta-Llama-3.1-8B-Instruct/version/4/) | [Phi-3-medium-128k-instruct](https://ai.azure.com/explore/models/Phi-3-medium-128k-instruct/version/1/registry/azureml)

- 您也可以查阅 [“Mistral-large” 模型发布的技术博客](https://techcommunity.microsoft.com/t5/ai-machine-learning-blog/mistral-large-mistral-ai-s-flagship-llm-debuts-on-azure-ai/ba-p/4066996) 以获取更多信息。

- 然后，你需要将它们添加到 librechat.yaml 文件中的 `azureOpenAI` 配置中。

- 以下是 `Meta-Llama-3.1-8B-Instruct` 的配置示例：

```yaml filename="librechat.yaml"
endpoints:
  azureOpenAI:
    groups:
    - group: "serverless-example"
      apiKey: "${LLAMA318B_API_KEY}"  # arbitrary env var name
      baseURL: "https://example.services.ai.azure.com/models/"
      version: "2024-05-01-preview" # Optional: specify API version
      serverless: true
      models:
        # Must match the deployment name of the model
        Meta-Llama-3.1-8B-Instruct: true
```

**注意**:

- Azure AI Foundry 模型现在为无服务器推理在 `/models/chat/completions?api-version=version` 下配置 endpoint。
  - `baseURL` 字段应设置为 endpoint 的根路径，不包含 `/models/` 之后的内容，即 `/chat/completions` 路径。
  - 示例：`https://example.services.ai.azure.com/models/` 对应 `https://example.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview`
  - `version` 查询参数是可选的，可以在 `baseURL` 字段中指定。
- `models` 字段中使用的模型名称必须与 Azure AI Foundry 中模型的部署名称一致。
- 与 LibreChat 的兼容性依赖于与 OpenAI API 规范的对等性，在撰写本文时，这些规范通常是 Azure AI Studio 上的 **“即用即付” (Pay-as-you-go)** 或“模型即服务” (MaaS) 部署，它们通过 `v1/completions` 或 `models/chat/completions` endpoint 处理，并与 OpenAI-SDK 兼容。
- 所有提供无服务器部署（"Serverless APIs"）的模型都与 Azure 模型目录兼容。您可以在“部署选项”（Deployment options）下筛选“Serverless API”，并在“推理任务”（inference tasks）下筛选“Chat completion”以查看完整列表；但实时 endpoint 模型尚未经过测试。
- 根据 OpenAI API 规范，这些无服务器推理 endpoint/模型可能支持也可能不支持函数调用，而函数调用是其与 Agents 配合使用的前提。
