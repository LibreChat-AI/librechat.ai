import type { UIStrings } from '@/lib/ui-i18n'

export const zh: UIStrings = {
  nav: {
    docs: '文档',
    blog: '博客',
    changelog: '更新日志',
    discord: 'Discord',
    joinDiscord: '加入 Discord',
  },
  pageActions: {
    copyMarkdown: '复制 Markdown',
    copyMarkdownAria: '将页面复制为 Markdown',
    open: '打开',
    openAria: '在外部工具中打开页面',
    openInGitHub: '在 GitHub 中打开',
    openInLibreChat: '在 LibreChat 中打开',
    openInChatGPT: '在 ChatGPT 中打开',
    openInClaude: '在 Claude 中打开',
    openInGemini: '在 Gemini 中打开',
    openInPerplexity: '在 Perplexity 中打开',
    openInCursor: '在 Cursor 中打开',
  },
  feedback: {
    question: '这篇指南怎么样？',
    good: '不错',
    bad: '不好',
    thanks: '感谢您的反馈！',
    submitAgain: '再次提交',
    placeholder: '还有其他反馈吗？（可选）',
    submit: '提交',
    additionalAria: '补充反馈',
  },
  version: {
    label: '版本',
    aria: '选择文档版本',
  },
  logoMenu: {
    openNewTab: '在新标签页中打开',
    logoPng: 'Logo（png）',
    logoSvg: 'Logo（svg）',
    docsLogoPng: '文档 Logo（png）',
    docsLogoSvg: '文档 Logo（svg）',
  },
  common: {
    learnMore: '了解更多',
    getStarted: '开始使用',
    readDocs: '阅读文档',
    viewFullGuide: '查看完整指南',
    recommended: '推荐',
    prerequisites: '前置条件',
    commands: '命令',
    explore: '探索',
    resources: '资源',
  },
  // Shared resource cards used by both DocsHub and QuickStartHub.
  resources: {
    changelog: { title: '更新日志', description: '最新发布' },
    roadmap: { title: '2026 路线图', description: '规划内容' },
    discord: { title: 'Discord', description: '获取帮助' },
  },
  docsHub: {
    sections: {
      deploy: '部署',
      configure: '配置',
      use: '使用',
      contribute: '贡献',
    },
    items: {
      quickStart: { title: '快速开始', description: '5 分钟完成 Docker 部署' },
      local: { title: '本地安装', description: 'Docker、npm 和 Helm Chart' },
      remote: { title: '远程托管', description: 'DigitalOcean、Railway 等' },
      configuration: {
        title: '配置',
        description: '环境变量、YAML 和认证',
      },
      customEndpoints: {
        title: '自定义端点',
        description: '连接 Ollama、Deepseek、Groq 等',
      },
      features: { title: '功能', description: 'MCP、智能体、代码解释器、Artifacts' },
      userGuides: { title: '用户指南', description: '预设、技巧和最佳实践' },
      development: {
        title: '开发',
        description: '贡献、架构和调试',
      },
    },
  },
  quickStartHub: {
    ariaLabel: '快速开始指南',
    methods: {
      docker: {
        tag: '推荐',
        time: '约 5 分钟',
        description: '一切尽在其中——MongoDB、MeiliSearch 和 RAG API 自动运行。',
        steps: ['克隆仓库', '将 .env.example 复制为 .env', '运行 docker compose up'],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '约 20 分钟',
        description: '使用 Node.js 手动部署。需要单独的 MongoDB 和 MeiliSearch 实例。',
        steps: ['克隆并安装依赖', '配置 .env 并启动 MongoDB', '运行 npm run backend'],
        prereqs: ['Node.js v20.19+', 'MongoDB 实例'],
      },
      railway: {
        tag: '一键部署',
        time: '约 3 分钟',
        description: '即刻部署到云端。无需本地部署、无需 Docker、无需管理服务器。',
        steps: ['点击部署按钮', '连接你的 GitHub', '设置环境变量'],
        prereqs: ['Railway 账户', 'GitHub 账户'],
      },
    },
    afterInstallationHeading: '安装之后',
    connectProviders: {
      title: '连接 AI 服务商',
      description: '添加 OpenRouter、Ollama、Deepseek、Groq 以及其他兼容 OpenAI 的服务',
    },
    exploreFeatures: {
      title: '功能',
      description: '智能体、MCP、网络搜索、RAG、Artifacts、图像生成等',
    },
    exploreUserGuides: {
      title: '用户指南',
      description: '了解如何使用预设、AI 服务商以及如何在界面中导航',
    },
  },
  featuresHub: {
    ariaLabel: '功能导航',
    featuredHeading: '精选',
    coreFeaturesHeading: '核心功能',
    hero: {
      title: 'Model Context Protocol',
      description: '通过 MCP——AI 工具集成的开放标准——将 AI 模型连接到任何外部工具或服务',
    },
    highlights: {
      agents: {
        title: '智能体',
        description: '构建自定义 AI 助手，支持工具、文件处理、代码执行和 API 操作——无需编写代码。',
      },
      codeInterpreter: {
        title: '代码解释器',
        description: '执行 Python、JavaScript、Go、Rust 等代码——安全沙箱隔离，无需任何配置。',
      },
      artifacts: {
        title: 'Artifacts',
        description: '直接在聊天中生成 React 组件、HTML 页面和 Mermaid 图表。',
      },
      memory: {
        title: '记忆',
        description: '跨对话的持久上下文，让你的 AI 记住偏好与历史记录。',
      },
      webSearch: {
        title: '网络搜索',
        description: '通过内置搜索和重排序，为任何模型提供实时互联网访问能力。',
      },
      authentication: {
        title: '身份认证',
        description: '面向企业的 SSO，支持 OAuth2、SAML、LDAP 和双因素认证。',
      },
    },
    categories: {
      searchKnowledge: {
        title: '搜索与知识',
        items: {
          webSearch: {
            title: '网络搜索',
            description: '通过内置搜索和重排序实现实时互联网访问',
          },
          search: {
            title: '搜索',
            description: '使用 Meilisearch 查找消息和对话',
          },
          ragApi: {
            title: 'RAG API',
            description: '使用检索增强生成与文件对话',
          },
          memory: { title: '记忆', description: '跨对话的持久上下文' },
          ocr: { title: 'OCR', description: '从图像和文档中提取文本' },
        },
      },
      media: {
        title: '媒体',
        items: {
          imageGen: {
            title: '图像生成',
            description: '使用 GPT-Image-1、DALL-E、Stable Diffusion 和 Flux 创建图像',
          },
          uploadAsText: {
            title: '以文本形式上传',
            description: '将文件作为文本输入进行上传和处理',
          },
        },
      },
      chat: {
        title: '聊天',
        items: {
          fork: { title: '分叉', description: '将对话拆分为多个分支' },
          importConvos: {
            title: '导入对话',
            description: '从 ChatGPT 和其他平台导入聊天记录',
          },
          shareableLinks: {
            title: '可分享链接',
            description: '通过公开链接分享对话',
          },
          temporaryChat: {
            title: '临时聊天',
            description: '不会保存到历史记录的私密对话',
          },
          urlQuery: {
            title: 'URL 查询参数',
            description: '通过 URL 动态配置聊天',
          },
          resumableStreams: {
            title: '可恢复的流',
            description: '自动重连并恢复中断的回复',
          },
        },
      },
      security: {
        title: '安全',
        items: {
          authentication: {
            title: '身份认证',
            description: '支持 OAuth2、SAML、LDAP 等的多用户认证',
          },
          adminPanel: {
            title: '管理面板',
            description: '用于管理用户、角色和配置覆盖的网页界面',
          },
          passwordReset: {
            title: '密码重置',
            description: '基于邮件的密码找回',
          },
          moderation: {
            title: '审核系统',
            description: '内容审核与安全控制',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Docker 内置组件',
    bundledNote:
      'Docker Compose 会处理所有依赖项。使用 npm 或 Helm 时，你需要单独安装和配置这些服务。',
    chooseMethodHeading: '选择一种方式',
    difficulty: {
      Beginner: '入门',
      Intermediate: '进阶',
      Advanced: '高级',
    },
    externalServicesRequired: '需要外部服务',
    methods: {
      docker: {
        description:
          '一切都在容器中运行。MongoDB、MeiliSearch、RAG API 和 Vector DB 均自动包含在内。',
      },
      npm: {
        description:
          '使用 Node.js 直接运行 LibreChat。你需要自行管理 MongoDB 和 MeiliSearch 等外部服务。',
      },
      helm: {
        description: '使用 Helm 在 Kubernetes 上部署。最适合生产集群和基础设施即代码工作流。',
      },
    },
    notRunningLocallyHeading: '不在本地运行？',
    remoteHosting: {
      title: '远程托管',
      description: 'DigitalOcean、Railway、Azure 等',
    },
    envConfig: {
      title: '.env 配置',
      description: '环境变量的深入指南',
    },
  },
  footer: {
    headings: {
      about: '关于',
      resources: '资源',
      documentation: '文档',
      blog: '博客',
      newsletter: '订阅资讯',
      legal: '法律',
    },
    items: {
      about: '关于',
      contactUs: '联系我们',
      features: '功能',
      changelog: '更新日志',
      roadmap: '路线图',
      demo: '演示',
      status: '服务状态',
      getStarted: '开始使用',
      localInstall: '本地安装',
      remoteInstall: '远程安装',
      blog: '博客',
      blogAuthors: '博客作者',
      subscribe: '订阅',
      unsubscribe: '取消订阅',
      termsOfService: '服务条款',
      privacyPolicy: '隐私政策',
      cookiePolicy: 'Cookie 政策',
    },
  },
  toolkit: {
    credentials: {
      generate: '生成凭据',
      regenerate: '重新生成凭据',
      generateAria: '生成新凭据',
      regionAria: '已生成的凭据',
      copy: '复制',
      copied: '已复制',
      copyAria: '复制 {label}',
      valueAria: '{label} 的值',
      copyAll: '全部复制为 .env',
      copiedAll: '已复制到剪贴板！',
      copyAllAria: '将所有凭据复制为 .env 块',
      allCopiedStatus: '已按 KEY=value 格式复制全部 5 个凭据',
      emptyPrefix: '点击上方按钮，为你的',
      emptySuffix: '文件生成安全的随机凭据。',
      hints: {
        CREDS_KEY: '用于存储凭据的加密密钥',
        CREDS_IV: '用于加密的初始化向量',
        JWT_SECRET: '用于签名访问令牌的密钥',
        JWT_REFRESH_SECRET: '用于签名刷新令牌的密钥',
        MEILI_KEY: 'MeiliSearch 主密钥',
      },
    },
    yaml: {
      dropFile: '将 YAML 文件拖放到这里',
      placeholder: '在此粘贴你的 librechat.yaml 内容，或拖放文件...',
      empty: '粘贴或拖放 YAML 内容后，验证结果会显示在这里。',
      valid: 'YAML 有效！',
      clear: '清空',
      clearAria: '清空编辑器',
      badIndentation: '第 {line} 行缩进不正确。YAML 中的每个条目都应正确缩进。',
      errorAtLine: '{reason}，第 {line} 行',
      unknownError: '未知 YAML 错误',
    },
  },
  home: {
    metaTitle: 'LibreChat - 开源 AI 平台',
    metaDescription: 'LibreChat 将你所有的 AI 对话汇聚到一个统一、可定制的界面中。',
    starOnGitHub: '在 GitHub 上加星',
    starAria: '在 GitHub 上为 LibreChat 加星——{count} 颗星',
    heroTitleTop: '开源',
    heroTitleBottom: 'AI 平台',
    heroSubtitle: 'LibreChat 将你所有的 AI 对话汇聚到一个统一、可定制的界面中',
    getStarted: '开始使用',
    getStartedAria: '开始使用 LibreChat 文档',
    tryDemo: '试用演示',
    tryDemoAria: '试用 LibreChat 演示',
    desktopLightAlt: '浅色模式下的 LibreChat 桌面界面',
    desktopDarkAlt: '深色模式下的 LibreChat 桌面界面',
    mobileLightAlt: '浅色模式下的 LibreChat 移动端界面',
    mobileDarkAlt: '深色模式下的 LibreChat 移动端界面',
    trustedBy: '深受全球企业信赖',
    featuresHeading: '你所需要的一切',
    featuresSubtitle: '一个面向 AI 驱动对话的综合性平台',
    primaryActionsAria: '主要操作',
    features: {
      agents: {
        title: '智能体',
        description: '具备文件处理、代码解释和 API 操作能力的高级智能体',
      },
      codeInterpreter: {
        title: '代码解释器',
        description: '安全地执行多种语言的代码，无需任何配置',
      },
      models: {
        title: '模型',
        description: '可选用 Anthropic、AWS、OpenAI、Azure 等多种 AI 模型',
      },
      artifacts: {
        title: 'Artifacts',
        description: '在聊天中创建 React、HTML 代码和 Mermaid 图表',
      },
      search: {
        title: '搜索',
        description: '即时搜索消息、文件和代码片段',
      },
      mcp: {
        title: 'MCP',
        description: '凭借 Model Context Protocol 支持，连接任何工具或服务',
      },
      memory: {
        title: '记忆',
        description: '跨对话的持久上下文，让你的 AI 记住你',
      },
      webSearch: {
        title: '网络搜索',
        description: '通过内置搜索和重排序，为任何模型提供实时互联网访问能力',
      },
      authentication: {
        title: '身份认证',
        description: '面向企业的 SSO，支持 OAuth、SAML、LDAP 和双因素认证',
      },
    },
    learnMore: '了解更多',
    communityHeading: '开源，社区驱动',
    communitySubtitle: '加入数以千计的开发者和组织，一起用 LibreChat 进行构建',
    githubStars: 'GitHub 星标',
    dockerPulls: 'Docker 拉取次数',
    contributors: '贡献者',
    communityLinksAria: '社区链接',
    githubAria: 'GitHub 上的 LibreChat',
    discordAria: 'Discord 上的 LibreChat',
    ctaHeading: '开始用 LibreChat 进行构建',
    ctaSubtitle: '借助我们的快速入门指南，几分钟内即可启动并运行',
    quickstartGuide: '快速入门指南',
    quickstartAria: '阅读快速入门指南',
  },
}
