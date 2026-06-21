import { i18n } from '@/lib/i18n'
import { zh } from '@/lib/ui-translations/zh'
import { es } from '@/lib/ui-translations/es'
import { fr } from '@/lib/ui-translations/fr'
import { de } from '@/lib/ui-translations/de'
import { ja } from '@/lib/ui-translations/ja'

/**
 * UI string dictionary for the React chrome around the docs and the landing
 * page. Docs *content* is translated separately into per-locale MDX files; this
 * covers the surrounding components (page actions, navbar, hub components, the
 * landing page, footer, feedback widget) that would otherwise stay English on a
 * localized URL.
 *
 * English is the source of truth: the `UIStrings` type is derived from `en`, so
 * every other locale must provide the exact same shape. `getUI` falls back to
 * English for unknown locales and for any locale not yet fully translated.
 *
 * Keep brand, product and technology names, shell commands and code snippets
 * untranslated (LibreChat, Docker, npm, MCP, MongoDB, OAuth, React, …).
 */
export type UILocale = (typeof i18n.languages)[number]

const en = {
  nav: {
    docs: 'Docs',
    blog: 'Blog',
    changelog: 'Changelog',
    discord: 'Discord',
    joinDiscord: 'Join Discord',
  },
  pageActions: {
    copyMarkdown: 'Copy Markdown',
    copyMarkdownAria: 'Copy page as Markdown',
    open: 'Open',
    openAria: 'Open page in external tools',
    openInGitHub: 'Open in GitHub',
    openInLibreChat: 'Open in LibreChat',
    openInChatGPT: 'Open in ChatGPT',
    openInClaude: 'Open in Claude',
    openInGemini: 'Open in Gemini',
    openInPerplexity: 'Open in Perplexity',
    openInCursor: 'Open in Cursor',
  },
  feedback: {
    question: 'How is this guide?',
    good: 'Good',
    bad: 'Bad',
    thanks: 'Thank you for your feedback!',
    submitAgain: 'Submit again',
    placeholder: 'Any additional feedback? (optional)',
    submit: 'Submit',
    additionalAria: 'Additional feedback',
  },
  version: {
    label: 'Version',
    aria: 'Select documentation version',
  },
  logoMenu: {
    openNewTab: 'Open in new tab',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Docs Logo (png)',
    docsLogoSvg: 'Docs Logo (svg)',
  },
  common: {
    learnMore: 'Learn more',
    getStarted: 'Get started',
    readDocs: 'Read the docs',
    viewFullGuide: 'View full guide',
    recommended: 'Recommended',
    prerequisites: 'Prerequisites',
    commands: 'Commands',
    explore: 'Explore',
    resources: 'Resources',
  },
  // Shared resource cards used by both DocsHub and QuickStartHub.
  resources: {
    changelog: { title: 'Changelog', description: 'Latest releases' },
    roadmap: { title: '2026 Roadmap', description: "What's planned" },
    discord: { title: 'Discord', description: 'Get help' },
  },
  docsHub: {
    sections: {
      deploy: 'Deploy',
      configure: 'Configure',
      use: 'Use',
      contribute: 'Contribute',
    },
    items: {
      quickStart: { title: 'Quick Start', description: 'Docker setup in 5 minutes' },
      local: { title: 'Local Installation', description: 'Docker, npm, and Helm Chart' },
      remote: { title: 'Remote Hosting', description: 'DigitalOcean, Railway, and more' },
      configuration: {
        title: 'Configuration',
        description: 'Environment variables, YAML, and auth',
      },
      customEndpoints: {
        title: 'Custom Endpoints',
        description: 'Connect Ollama, Deepseek, Groq, and more',
      },
      features: { title: 'Features', description: 'MCP, Agents, Code Interpreter, Artifacts' },
      userGuides: { title: 'User Guides', description: 'Presets, tips, and best practices' },
      development: {
        title: 'Development',
        description: 'Contributing, architecture, and debugging',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Quick start guides',
    methods: {
      docker: {
        tag: 'Recommended',
        time: '~5 min',
        description: 'Everything included — MongoDB, MeiliSearch, and RAG API run automatically.',
        steps: ['Clone the repository', 'Copy .env.example to .env', 'Run docker compose up'],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 min',
        description:
          'Manual setup with Node.js. Requires separate MongoDB and MeiliSearch instances.',
        steps: [
          'Clone and install dependencies',
          'Configure .env and start MongoDB',
          'Run npm run backend',
        ],
        prereqs: ['Node.js v20.19+', 'MongoDB instance'],
      },
      railway: {
        tag: 'One-click',
        time: '~3 min',
        description:
          'Deploy to the cloud instantly. No local setup, no Docker, no servers to manage.',
        steps: ['Click the deploy button', 'Connect your GitHub', 'Set environment variables'],
        prereqs: ['Railway account', 'GitHub account'],
      },
    },
    afterInstallationHeading: 'After Installation',
    connectProviders: {
      title: 'Connect AI Providers',
      description: 'Add OpenRouter, Ollama, Deepseek, Groq, and other OpenAI-compatible services',
    },
    exploreFeatures: {
      title: 'Features',
      description: 'Agents, MCP, web search, RAG, artifacts, image generation, and more',
    },
    exploreUserGuides: {
      title: 'User Guides',
      description: 'Learn how to use presets, AI providers, and navigate the interface',
    },
  },
  featuresHub: {
    ariaLabel: 'Features navigation',
    featuredHeading: 'Featured',
    coreFeaturesHeading: 'Core Features',
    hero: {
      title: 'Model Context Protocol',
      description:
        'Connect AI models to any external tool or service through MCP — the open standard for AI tool integration',
    },
    highlights: {
      agents: {
        title: 'Agents',
        description:
          'Build custom AI assistants with tools, file handling, code execution, and API actions — no coding required.',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description:
          'Execute Python, JavaScript, Go, Rust, and more — securely sandboxed with zero setup.',
      },
      artifacts: {
        title: 'Artifacts',
        description:
          'Generate React components, HTML pages, and Mermaid diagrams directly inside chat.',
      },
      memory: {
        title: 'Memory',
        description:
          'Persistent context across conversations so your AI remembers preferences and history.',
      },
      webSearch: {
        title: 'Web Search',
        description: 'Give any model live internet access with built-in search and reranking.',
      },
      authentication: {
        title: 'Authentication',
        description: 'Enterprise-ready SSO with OAuth2, SAML, LDAP, and two-factor authentication.',
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Search & Knowledge',
        items: {
          webSearch: {
            title: 'Web Search',
            description: 'Live internet access with built-in search and reranking',
          },
          search: {
            title: 'Search',
            description: 'Find messages and conversations with Meilisearch',
          },
          ragApi: {
            title: 'RAG API',
            description: 'Chat with files using retrieval-augmented generation',
          },
          memory: { title: 'Memory', description: 'Persistent context across conversations' },
          ocr: { title: 'OCR', description: 'Extract text from images and documents' },
        },
      },
      media: {
        title: 'Media',
        items: {
          imageGen: {
            title: 'Image Generation',
            description: 'Create images with GPT-Image-1, DALL-E, Stable Diffusion, and Flux',
          },
          uploadAsText: {
            title: 'Upload as Text',
            description: 'Upload and process files as text input',
          },
        },
      },
      chat: {
        title: 'Chat',
        items: {
          fork: { title: 'Fork', description: 'Split conversations into multiple threads' },
          importConvos: {
            title: 'Import Conversations',
            description: 'Import chats from ChatGPT and other platforms',
          },
          shareableLinks: {
            title: 'Shareable Links',
            description: 'Share conversations via public links',
          },
          temporaryChat: {
            title: 'Temporary Chat',
            description: "Private conversations that aren't saved to history",
          },
          urlQuery: {
            title: 'URL Query Parameters',
            description: 'Configure chats dynamically via URL',
          },
          resumableStreams: {
            title: 'Resumable Streams',
            description: 'Auto-reconnect and resume interrupted responses',
          },
        },
      },
      security: {
        title: 'Security',
        items: {
          authentication: {
            title: 'Authentication',
            description: 'Multi-user auth with OAuth2, SAML, LDAP, and more',
          },
          passwordReset: {
            title: 'Password Reset',
            description: 'Email-based password recovery',
          },
          moderation: {
            title: 'Moderation System',
            description: 'Content moderation and safety controls',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Bundled with Docker',
    bundledNote:
      'Docker Compose handles all dependencies. With npm or Helm, you install and configure these services separately.',
    chooseMethodHeading: 'Choose a method',
    difficulty: {
      Beginner: 'Beginner',
      Intermediate: 'Intermediate',
      Advanced: 'Advanced',
    },
    externalServicesRequired: 'External services required',
    methods: {
      docker: {
        description:
          'Everything runs in containers. MongoDB, MeiliSearch, RAG API, and Vector DB are all included automatically.',
      },
      npm: {
        description:
          'Run LibreChat directly with Node.js. You manage external services like MongoDB and MeiliSearch yourself.',
      },
      helm: {
        description:
          'Deploy on Kubernetes using Helm. Best for production clusters and infrastructure-as-code workflows.',
      },
    },
    notRunningLocallyHeading: 'Not running locally?',
    remoteHosting: {
      title: 'Remote Hosting',
      description: 'DigitalOcean, Railway, Azure, and more',
    },
    envConfig: {
      title: '.env Configuration',
      description: 'In-depth guide for environment variables',
    },
  },
  footer: {
    headings: {
      about: 'About',
      resources: 'Resources',
      documentation: 'Documentation',
      blog: 'Blog',
      newsletter: 'Newsletter',
      legal: 'Legal',
    },
    items: {
      about: 'About',
      contactUs: 'Contact Us',
      features: 'Features',
      changelog: 'Changelog',
      roadmap: 'Roadmap',
      demo: 'Demo',
      status: 'Status',
      getStarted: 'Get Started',
      localInstall: 'Local Install',
      remoteInstall: 'Remote Install',
      blog: 'Blog',
      blogAuthors: 'Blog Authors',
      subscribe: 'Subscribe',
      unsubscribe: 'Unsubscribe',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy policy',
      cookiePolicy: 'Cookie policy',
    },
  },
  home: {
    metaTitle: 'LibreChat - The Open-Source AI Platform',
    metaDescription:
      'LibreChat brings together all your AI conversations in one unified, customizable interface.',
    starOnGitHub: 'Star on GitHub',
    starAria: 'Star LibreChat on GitHub — {count} stars',
    heroTitleTop: 'The Open-Source',
    heroTitleBottom: 'AI Platform',
    heroSubtitle:
      'LibreChat brings together all your AI conversations in one unified, customizable interface',
    getStarted: 'Get Started',
    getStartedAria: 'Get started with LibreChat documentation',
    tryDemo: 'Try Demo',
    tryDemoAria: 'Try the LibreChat demo',
    desktopLightAlt: 'LibreChat desktop interface in light mode',
    desktopDarkAlt: 'LibreChat desktop interface in dark mode',
    mobileLightAlt: 'LibreChat mobile interface in light mode',
    mobileDarkAlt: 'LibreChat mobile interface in dark mode',
    trustedBy: 'Trusted by companies worldwide',
    featuresHeading: 'Everything you need',
    featuresSubtitle: 'A comprehensive platform for AI-powered conversations',
    primaryActionsAria: 'Primary actions',
    features: {
      agents: {
        title: 'Agents',
        description: 'Advanced agents with file handling, code interpretation, and API actions',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: 'Execute code in multiple languages securely with zero setup',
      },
      models: {
        title: 'Models',
        description: 'AI model selection including Anthropic, AWS, OpenAI, Azure, and more',
      },
      artifacts: {
        title: 'Artifacts',
        description: 'Create React, HTML code, and Mermaid diagrams in chat',
      },
      search: {
        title: 'Search',
        description: 'Search for messages, files, and code snippets in an instant',
      },
      mcp: {
        title: 'MCP',
        description: 'Connect to any tool or service with Model Context Protocol support',
      },
      memory: {
        title: 'Memory',
        description: 'Persistent context across conversations so your AI remembers you',
      },
      webSearch: {
        title: 'Web Search',
        description: 'Give any model live internet access with built-in search and reranking',
      },
      authentication: {
        title: 'Authentication',
        description: 'Enterprise-ready SSO with OAuth, SAML, LDAP, and two-factor auth',
      },
    },
    learnMore: 'Learn more',
    communityHeading: 'Open source, community driven',
    communitySubtitle: 'Join thousands of developers and organizations building with LibreChat',
    githubStars: 'GitHub Stars',
    dockerPulls: 'Docker Pulls',
    contributors: 'Contributors',
    communityLinksAria: 'Community links',
    githubAria: 'LibreChat on GitHub',
    discordAria: 'LibreChat on Discord',
    ctaHeading: 'Start building with LibreChat',
    ctaSubtitle: 'Get up and running in minutes with our quickstart guide',
    quickstartGuide: 'Quickstart Guide',
    quickstartAria: 'Read the quickstart guide',
  },
}

export type UIStrings = typeof en

// Locale dictionaries. Each must match the shape of `en`; missing locales fall
// back to English via `getUI`. The non-English objects live in ./ui-translations
// and are typed against UIStrings so the compiler enforces the shared shape.
const dictionaries: Record<string, UIStrings> = {
  en,
  zh,
  es,
  fr,
  de,
  ja,
}

/** Returns the UI strings for a locale, falling back to English. */
export function getUI(lang?: string): UIStrings {
  return (lang && dictionaries[lang]) || en
}

/** Interpolates `{key}` placeholders in a dictionary string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replaceAll(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

/**
 * Translations for Fumadocs' own UI chrome (search, table of contents, page
 * navigation, "Edit on GitHub", …). Passed to the I18nProvider so the built-in
 * layout text follows the docs / landing locale. English is Fumadocs' default,
 * so only the non-default locales are listed; getFumadocsText returns undefined
 * for English and lets Fumadocs use its own defaults.
 */
type FumadocsText = {
  search: string
  searchNoResult: string
  toc: string
  tocNoHeadings: string
  lastUpdate: string
  chooseLanguage: string
  nextPage: string
  previousPage: string
  chooseTheme: string
  editOnGithub: string
}

const fumadocsText: Record<string, FumadocsText> = {
  zh: {
    search: '搜索',
    searchNoResult: '未找到结果',
    toc: '本页内容',
    tocNoHeadings: '无标题',
    lastUpdate: '最后更新于',
    chooseLanguage: '选择语言',
    nextPage: '下一页',
    previousPage: '上一页',
    chooseTheme: '主题',
    editOnGithub: '在 GitHub 上编辑',
  },
  es: {
    search: 'Buscar',
    searchNoResult: 'No se encontraron resultados',
    toc: 'En esta página',
    tocNoHeadings: 'Sin encabezados',
    lastUpdate: 'Última actualización el',
    chooseLanguage: 'Elegir idioma',
    nextPage: 'Siguiente',
    previousPage: 'Anterior',
    chooseTheme: 'Tema',
    editOnGithub: 'Editar en GitHub',
  },
  fr: {
    search: 'Rechercher',
    searchNoResult: 'Aucun résultat trouvé',
    toc: 'Sur cette page',
    tocNoHeadings: 'Aucun titre',
    lastUpdate: 'Dernière mise à jour le',
    chooseLanguage: 'Choisir la langue',
    nextPage: 'Suivant',
    previousPage: 'Précédent',
    chooseTheme: 'Thème',
    editOnGithub: 'Modifier sur GitHub',
  },
  de: {
    search: 'Suche',
    searchNoResult: 'Keine Ergebnisse gefunden',
    toc: 'Auf dieser Seite',
    tocNoHeadings: 'Keine Überschriften',
    lastUpdate: 'Zuletzt aktualisiert am',
    chooseLanguage: 'Sprache auswählen',
    nextPage: 'Weiter',
    previousPage: 'Zurück',
    chooseTheme: 'Design',
    editOnGithub: 'Auf GitHub bearbeiten',
  },
  ja: {
    search: '検索',
    searchNoResult: '結果が見つかりません',
    toc: 'このページの内容',
    tocNoHeadings: '見出しなし',
    lastUpdate: '最終更新日',
    chooseLanguage: '言語を選択',
    nextPage: '次へ',
    previousPage: '前へ',
    chooseTheme: 'テーマ',
    editOnGithub: 'GitHub で編集',
  },
}

/** Fumadocs UI translations for a locale, or undefined to use Fumadocs' English defaults. */
export function getFumadocsText(lang?: string): FumadocsText | undefined {
  return lang ? fumadocsText[lang] : undefined
}
