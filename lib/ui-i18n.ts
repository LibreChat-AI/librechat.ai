import { defineI18nUI } from 'fumadocs-ui/i18n'
import { i18n, LOCALE_NAMES } from '@/lib/i18n'
import { zh } from '@/lib/ui-translations/zh'
import { es } from '@/lib/ui-translations/es'
import { fr } from '@/lib/ui-translations/fr'
import { de } from '@/lib/ui-translations/de'
import { ja } from '@/lib/ui-translations/ja'
import { ptBR } from '@/lib/ui-translations/pt-BR'
import { it } from '@/lib/ui-translations/it'
import { nl } from '@/lib/ui-translations/nl'
import { pl } from '@/lib/ui-translations/pl'
import { vi } from '@/lib/ui-translations/vi'
import { ko } from '@/lib/ui-translations/ko'
import { id } from '@/lib/ui-translations/id'
import { tr } from '@/lib/ui-translations/tr'

/**
 * UI string dictionary for the React chrome around the docs and the landing
 * page. Docs *content* is translated separately into per-locale MDX files; this
 * covers the surrounding components (page actions, navbar, hub components, the
 * landing page, footer, feedback widget) that would otherwise stay English on a
 * localized URL.
 *
 * English is the source of truth: the `UIStrings` type is derived from `en`, so
 * every other locale must provide the exact same shape. `getUI` falls back to
 * English only for unknown locales.
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
    copying: 'Copying...',
    copied: 'Copied!',
    copyFailed: 'Copy failed',
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
          adminPanel: {
            title: 'Admin Panel',
            description: 'Browser UI for users, roles, and config overrides',
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
  toolkit: {
    credentials: {
      generate: 'Generate Credentials',
      regenerate: 'Regenerate Credentials',
      generateAria: 'Generate new credentials',
      regenerateAria: 'Regenerate credentials',
      regionAria: 'Generated credentials',
      copy: 'Copy',
      copying: 'Copying...',
      copied: 'Copied',
      copyFailed: 'Copy failed',
      copyAria: 'Copy {label}',
      valueAria: '{label} value',
      copyAll: 'Copy All as .env',
      copiedAll: 'Copied to clipboard!',
      copyAllAria: 'Copy all credentials as .env block',
      allCopiedStatus: 'All 5 credentials copied as KEY=value format',
      allCopyFailedStatus: 'Clipboard copy failed. Select and copy the values manually.',
      emptyPrefix: 'Click the button above to generate secure random credentials for your',
      emptySuffix: 'file.',
      hints: {
        CREDS_KEY: 'Encryption key for stored credentials',
        CREDS_IV: 'Initialization vector for encryption',
        JWT_SECRET: 'Secret for signing access tokens',
        JWT_REFRESH_SECRET: 'Secret for signing refresh tokens',
        MEILI_KEY: 'MeiliSearch master key',
      },
    },
    yaml: {
      dropFile: 'Drop YAML file here',
      placeholder: 'Paste your librechat.yaml content here, or drag & drop a file...',
      empty: 'Validation results will appear here once you paste or drop YAML content.',
      valid: 'YAML is valid!',
      clear: 'Clear',
      clearAria: 'Clear editor',
      badIndentation:
        'Incorrect indentation at line {line}. Each entry in YAML should be properly indented.',
      errorAtLine: '{reason} at line {line}',
      unknownError: 'Unknown YAML error',
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
  'pt-BR': ptBR,
  it,
  nl,
  pl,
  vi,
  ko,
  id,
  tr,
}

export const UI_DICTIONARY_LOCALES = Object.freeze(Object.keys(dictionaries))

/** Returns the UI strings for a locale, falling back to English. */
export function getUI(lang?: string): UIStrings {
  return (lang && dictionaries[lang]) || en
}

/** Interpolates `{key}` placeholders in a dictionary string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replaceAll(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

/**
 * Translations for Fumadocs' own UI chrome — the search dialog/trigger, table
 * of contents, pagination, language switcher, theme switch, sidebar, banner and
 * code-block controls, including their `aria-label`s.
 *
 * Fumadocs 15+ keys every string (visible text AND accessibility labels) by its
 * descriptive English string with a `(context)` suffix; the English value is the
 * key itself, so only the non-default locales need entries and any key we omit
 * falls back to English. `defineI18nUI(...).provider(locale)` builds the
 * `I18nProviderProps` (locale + locales + translations) we hand to the
 * RootProvider and the per-page language-switcher providers.
 *
 * `displayName` is what the language switcher shows for each locale.
 */
export const uiI18n = defineI18nUI(i18n, {
  en: { displayName: LOCALE_NAMES.en },
  zh: {
    displayName: LOCALE_NAMES.zh,
    'Search(search dialog)': '搜索',
    'Search(search trigger)': '搜索',
    'No results found(search dialog)': '未找到结果',
    'On this page(table of contents)': '本页内容',
    'No Headings(table of contents)': '无标题',
    'Last updated on(page footer)': '最后更新于',
    'Choose a language(language switcher)': '选择语言',
    'Choose a language(language switcher)(aria-label)': '选择语言',
    'Next Page(pagination)': '下一页',
    'Previous Page(pagination)': '上一页',
    'Edit on GitHub(edit page)': '在 GitHub 上编辑',
    'Open Search(search trigger)(aria-label)': '开启搜索',
    'Close Search(search dialog)(aria-label)': '关闭搜索',
    'Open Sidebar(sidebar)(aria-label)': '开启侧边栏',
    'Collapse Sidebar(sidebar)(aria-label)': '收起侧边栏',
    'Toggle Theme(theme switcher)(aria-label)': '切换主题',
    'Toggle Menu(mobile menu)(aria-label)': '切换菜单',
    'Close Banner(banner)(aria-label)': '关闭横幅',
    'Copy Text(code block)(aria-label)': '复制文字',
    'Copied Text(code block)(aria-label)': '已复制文字',
    'Copy Anchor Link(heading anchor)(aria-label)': '复制锚点链接',
    'Dark(theme switcher)(aria-label)': '深色',
    'Light(theme switcher)(aria-label)': '浅色',
    'System(theme switcher)(aria-label)': '系统',
  },
  es: {
    displayName: LOCALE_NAMES.es,
    'Search(search dialog)': 'Buscar',
    'Search(search trigger)': 'Buscar',
    'No results found(search dialog)': 'No se encontraron resultados',
    'On this page(table of contents)': 'En esta página',
    'No Headings(table of contents)': 'Sin encabezados',
    'Last updated on(page footer)': 'Última actualización el',
    'Choose a language(language switcher)': 'Elegir idioma',
    'Choose a language(language switcher)(aria-label)': 'Elegir idioma',
    'Next Page(pagination)': 'Siguiente',
    'Previous Page(pagination)': 'Anterior',
    'Edit on GitHub(edit page)': 'Editar en GitHub',
    'Open Search(search trigger)(aria-label)': 'Abrir búsqueda',
    'Close Search(search dialog)(aria-label)': 'Cerrar búsqueda',
    'Open Sidebar(sidebar)(aria-label)': 'Abrir barra lateral',
    'Collapse Sidebar(sidebar)(aria-label)': 'Contraer barra lateral',
    'Toggle Theme(theme switcher)(aria-label)': 'Cambiar tema',
    'Toggle Menu(mobile menu)(aria-label)': 'Alternar menú',
    'Close Banner(banner)(aria-label)': 'Cerrar banner',
    'Copy Text(code block)(aria-label)': 'Copiar texto',
    'Copied Text(code block)(aria-label)': 'Texto copiado',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Copiar enlace de anclaje',
    'Dark(theme switcher)(aria-label)': 'Oscuro',
    'Light(theme switcher)(aria-label)': 'Claro',
    'System(theme switcher)(aria-label)': 'Sistema',
  },
  fr: {
    displayName: LOCALE_NAMES.fr,
    'Search(search dialog)': 'Rechercher',
    'Search(search trigger)': 'Rechercher',
    'No results found(search dialog)': 'Aucun résultat trouvé',
    'On this page(table of contents)': 'Sur cette page',
    'No Headings(table of contents)': 'Aucun titre',
    'Last updated on(page footer)': 'Dernière mise à jour le',
    'Choose a language(language switcher)': 'Choisir la langue',
    'Choose a language(language switcher)(aria-label)': 'Choisir la langue',
    'Next Page(pagination)': 'Suivant',
    'Previous Page(pagination)': 'Précédent',
    'Edit on GitHub(edit page)': 'Modifier sur GitHub',
    'Open Search(search trigger)(aria-label)': 'Ouvrir la recherche',
    'Close Search(search dialog)(aria-label)': 'Fermer la recherche',
    'Open Sidebar(sidebar)(aria-label)': 'Ouvrir la barre latérale',
    'Collapse Sidebar(sidebar)(aria-label)': 'Réduire la barre latérale',
    'Toggle Theme(theme switcher)(aria-label)': 'Changer de thème',
    'Toggle Menu(mobile menu)(aria-label)': 'Basculer le menu',
    'Close Banner(banner)(aria-label)': 'Fermer la bannière',
    'Copy Text(code block)(aria-label)': 'Copier le texte',
    'Copied Text(code block)(aria-label)': 'Texte copié',
    'Copy Anchor Link(heading anchor)(aria-label)': "Copier le lien d'ancrage",
    'Dark(theme switcher)(aria-label)': 'Sombre',
    'Light(theme switcher)(aria-label)': 'Clair',
    'System(theme switcher)(aria-label)': 'Système',
  },
  de: {
    displayName: LOCALE_NAMES.de,
    'Search(search dialog)': 'Suche',
    'Search(search trigger)': 'Suche',
    'No results found(search dialog)': 'Keine Ergebnisse gefunden',
    'On this page(table of contents)': 'Auf dieser Seite',
    'No Headings(table of contents)': 'Keine Überschriften',
    'Last updated on(page footer)': 'Zuletzt aktualisiert am',
    'Choose a language(language switcher)': 'Sprache auswählen',
    'Choose a language(language switcher)(aria-label)': 'Sprache auswählen',
    'Next Page(pagination)': 'Weiter',
    'Previous Page(pagination)': 'Zurück',
    'Edit on GitHub(edit page)': 'Auf GitHub bearbeiten',
    'Open Search(search trigger)(aria-label)': 'Suche öffnen',
    'Close Search(search dialog)(aria-label)': 'Suche schließen',
    'Open Sidebar(sidebar)(aria-label)': 'Seitenleiste öffnen',
    'Collapse Sidebar(sidebar)(aria-label)': 'Seitenleiste einklappen',
    'Toggle Theme(theme switcher)(aria-label)': 'Design wechseln',
    'Toggle Menu(mobile menu)(aria-label)': 'Menü umschalten',
    'Close Banner(banner)(aria-label)': 'Banner schließen',
    'Copy Text(code block)(aria-label)': 'Text kopieren',
    'Copied Text(code block)(aria-label)': 'Text kopiert',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Ankerlink kopieren',
    'Dark(theme switcher)(aria-label)': 'Dunkel',
    'Light(theme switcher)(aria-label)': 'Hell',
    'System(theme switcher)(aria-label)': 'System',
  },
  ja: {
    displayName: LOCALE_NAMES.ja,
    'Search(search dialog)': '検索',
    'Search(search trigger)': '検索',
    'No results found(search dialog)': '結果が見つかりません',
    'On this page(table of contents)': 'このページの内容',
    'No Headings(table of contents)': '見出しなし',
    'Last updated on(page footer)': '最終更新日',
    'Choose a language(language switcher)': '言語を選択',
    'Choose a language(language switcher)(aria-label)': '言語を選択',
    'Next Page(pagination)': '次へ',
    'Previous Page(pagination)': '前へ',
    'Edit on GitHub(edit page)': 'GitHub で編集',
    'Open Search(search trigger)(aria-label)': '検索を開く',
    'Close Search(search dialog)(aria-label)': '検索を閉じる',
    'Open Sidebar(sidebar)(aria-label)': 'サイドバーを開く',
    'Collapse Sidebar(sidebar)(aria-label)': 'サイドバーを閉じる',
    'Toggle Theme(theme switcher)(aria-label)': 'テーマを切り替え',
    'Toggle Menu(mobile menu)(aria-label)': 'メニューを切り替え',
    'Close Banner(banner)(aria-label)': 'バナーを閉じる',
    'Copy Text(code block)(aria-label)': 'テキストをコピー',
    'Copied Text(code block)(aria-label)': 'コピーしました',
    'Copy Anchor Link(heading anchor)(aria-label)': 'アンカーリンクをコピー',
    'Dark(theme switcher)(aria-label)': 'ダーク',
    'Light(theme switcher)(aria-label)': 'ライト',
    'System(theme switcher)(aria-label)': 'システム',
  },
  'pt-BR': {
    displayName: LOCALE_NAMES['pt-BR'],
    'Search(search dialog)': 'Buscar',
    'Search(search trigger)': 'Buscar',
    'No results found(search dialog)': 'Nenhum resultado encontrado',
    'On this page(table of contents)': 'Nesta página',
    'No Headings(table of contents)': 'Sem títulos',
    'Last updated on(page footer)': 'Última atualização em',
    'Choose a language(language switcher)': 'Escolher idioma',
    'Choose a language(language switcher)(aria-label)': 'Escolher idioma',
    'Next Page(pagination)': 'Próxima página',
    'Previous Page(pagination)': 'Página anterior',
    'Edit on GitHub(edit page)': 'Editar no GitHub',
    'Open Search(search trigger)(aria-label)': 'Abrir busca',
    'Close Search(search dialog)(aria-label)': 'Fechar busca',
    'Open Sidebar(sidebar)(aria-label)': 'Abrir barra lateral',
    'Collapse Sidebar(sidebar)(aria-label)': 'Recolher barra lateral',
    'Toggle Theme(theme switcher)(aria-label)': 'Alternar tema',
    'Toggle Menu(mobile menu)(aria-label)': 'Alternar menu',
    'Close Banner(banner)(aria-label)': 'Fechar banner',
    'Copy Text(code block)(aria-label)': 'Copiar texto',
    'Copied Text(code block)(aria-label)': 'Texto copiado',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Copiar link da âncora',
    'Dark(theme switcher)(aria-label)': 'Escuro',
    'Light(theme switcher)(aria-label)': 'Claro',
    'System(theme switcher)(aria-label)': 'Sistema',
  },
  it: {
    displayName: LOCALE_NAMES.it,
    'Search(search dialog)': 'Cerca',
    'Search(search trigger)': 'Cerca',
    'No results found(search dialog)': 'Nessun risultato trovato',
    'On this page(table of contents)': 'In questa pagina',
    'No Headings(table of contents)': 'Nessun titolo',
    'Last updated on(page footer)': 'Ultimo aggiornamento il',
    'Choose a language(language switcher)': 'Scegli lingua',
    'Choose a language(language switcher)(aria-label)': 'Scegli lingua',
    'Next Page(pagination)': 'Pagina successiva',
    'Previous Page(pagination)': 'Pagina precedente',
    'Edit on GitHub(edit page)': 'Modifica su GitHub',
    'Open Search(search trigger)(aria-label)': 'Apri ricerca',
    'Close Search(search dialog)(aria-label)': 'Chiudi ricerca',
    'Open Sidebar(sidebar)(aria-label)': 'Apri barra laterale',
    'Collapse Sidebar(sidebar)(aria-label)': 'Comprimi barra laterale',
    'Toggle Theme(theme switcher)(aria-label)': 'Cambia tema',
    'Toggle Menu(mobile menu)(aria-label)': 'Apri/chiudi menu',
    'Close Banner(banner)(aria-label)': 'Chiudi banner',
    'Copy Text(code block)(aria-label)': 'Copia testo',
    'Copied Text(code block)(aria-label)': 'Testo copiato',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Copia link ancora',
    'Dark(theme switcher)(aria-label)': 'Scuro',
    'Light(theme switcher)(aria-label)': 'Chiaro',
    'System(theme switcher)(aria-label)': 'Sistema',
  },
  nl: {
    displayName: LOCALE_NAMES.nl,
    'Search(search dialog)': 'Zoeken',
    'Search(search trigger)': 'Zoeken',
    'No results found(search dialog)': 'Geen resultaten gevonden',
    'On this page(table of contents)': 'Op deze pagina',
    'No Headings(table of contents)': 'Geen koppen',
    'Last updated on(page footer)': 'Laatst bijgewerkt op',
    'Choose a language(language switcher)': 'Taal kiezen',
    'Choose a language(language switcher)(aria-label)': 'Taal kiezen',
    'Next Page(pagination)': 'Volgende pagina',
    'Previous Page(pagination)': 'Vorige pagina',
    'Edit on GitHub(edit page)': 'Bewerken op GitHub',
    'Open Search(search trigger)(aria-label)': 'Zoeken openen',
    'Close Search(search dialog)(aria-label)': 'Zoeken sluiten',
    'Open Sidebar(sidebar)(aria-label)': 'Zijbalk openen',
    'Collapse Sidebar(sidebar)(aria-label)': 'Zijbalk inklappen',
    'Toggle Theme(theme switcher)(aria-label)': 'Thema wisselen',
    'Toggle Menu(mobile menu)(aria-label)': 'Menu wisselen',
    'Close Banner(banner)(aria-label)': 'Banner sluiten',
    'Copy Text(code block)(aria-label)': 'Tekst kopiëren',
    'Copied Text(code block)(aria-label)': 'Tekst gekopieerd',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Ankerlink kopiëren',
    'Dark(theme switcher)(aria-label)': 'Donker',
    'Light(theme switcher)(aria-label)': 'Licht',
    'System(theme switcher)(aria-label)': 'Systeem',
  },
  pl: {
    displayName: LOCALE_NAMES.pl,
    'Search(search dialog)': 'Szukaj',
    'Search(search trigger)': 'Szukaj',
    'No results found(search dialog)': 'Nie znaleziono wyników',
    'On this page(table of contents)': 'Na tej stronie',
    'No Headings(table of contents)': 'Brak nagłówków',
    'Last updated on(page footer)': 'Ostatnio zaktualizowano',
    'Choose a language(language switcher)': 'Wybierz język',
    'Choose a language(language switcher)(aria-label)': 'Wybierz język',
    'Next Page(pagination)': 'Następna strona',
    'Previous Page(pagination)': 'Poprzednia strona',
    'Edit on GitHub(edit page)': 'Edytuj na GitHub',
    'Open Search(search trigger)(aria-label)': 'Otwórz wyszukiwanie',
    'Close Search(search dialog)(aria-label)': 'Zamknij wyszukiwanie',
    'Open Sidebar(sidebar)(aria-label)': 'Otwórz pasek boczny',
    'Collapse Sidebar(sidebar)(aria-label)': 'Zwiń pasek boczny',
    'Toggle Theme(theme switcher)(aria-label)': 'Przełącz motyw',
    'Toggle Menu(mobile menu)(aria-label)': 'Przełącz menu',
    'Close Banner(banner)(aria-label)': 'Zamknij baner',
    'Copy Text(code block)(aria-label)': 'Kopiuj tekst',
    'Copied Text(code block)(aria-label)': 'Tekst skopiowany',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Kopiuj link kotwicy',
    'Dark(theme switcher)(aria-label)': 'Ciemny',
    'Light(theme switcher)(aria-label)': 'Jasny',
    'System(theme switcher)(aria-label)': 'Systemowy',
  },
  vi: {
    displayName: LOCALE_NAMES.vi,
    'Search(search dialog)': 'Tìm kiếm',
    'Search(search trigger)': 'Tìm kiếm',
    'No results found(search dialog)': 'Không tìm thấy kết quả',
    'On this page(table of contents)': 'Trên trang này',
    'No Headings(table of contents)': 'Không có tiêu đề',
    'Last updated on(page footer)': 'Cập nhật lần cuối vào',
    'Choose a language(language switcher)': 'Chọn ngôn ngữ',
    'Choose a language(language switcher)(aria-label)': 'Chọn ngôn ngữ',
    'Next Page(pagination)': 'Trang tiếp theo',
    'Previous Page(pagination)': 'Trang trước',
    'Edit on GitHub(edit page)': 'Chỉnh sửa trên GitHub',
    'Open Search(search trigger)(aria-label)': 'Mở tìm kiếm',
    'Close Search(search dialog)(aria-label)': 'Đóng tìm kiếm',
    'Open Sidebar(sidebar)(aria-label)': 'Mở thanh bên',
    'Collapse Sidebar(sidebar)(aria-label)': 'Thu gọn thanh bên',
    'Toggle Theme(theme switcher)(aria-label)': 'Chuyển đổi giao diện',
    'Toggle Menu(mobile menu)(aria-label)': 'Chuyển đổi menu',
    'Close Banner(banner)(aria-label)': 'Đóng banner',
    'Copy Text(code block)(aria-label)': 'Sao chép văn bản',
    'Copied Text(code block)(aria-label)': 'Đã sao chép văn bản',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Sao chép liên kết neo',
    'Dark(theme switcher)(aria-label)': 'Tối',
    'Light(theme switcher)(aria-label)': 'Sáng',
    'System(theme switcher)(aria-label)': 'Hệ thống',
  },
  ko: {
    displayName: LOCALE_NAMES.ko,
    'Search(search dialog)': '검색',
    'Search(search trigger)': '검색',
    'No results found(search dialog)': '결과를 찾을 수 없습니다',
    'On this page(table of contents)': '이 페이지',
    'No Headings(table of contents)': '제목 없음',
    'Last updated on(page footer)': '마지막 업데이트',
    'Choose a language(language switcher)': '언어 선택',
    'Choose a language(language switcher)(aria-label)': '언어 선택',
    'Next Page(pagination)': '다음 페이지',
    'Previous Page(pagination)': '이전 페이지',
    'Edit on GitHub(edit page)': 'GitHub에서 편집',
    'Open Search(search trigger)(aria-label)': '검색 열기',
    'Close Search(search dialog)(aria-label)': '검색 닫기',
    'Open Sidebar(sidebar)(aria-label)': '사이드바 열기',
    'Collapse Sidebar(sidebar)(aria-label)': '사이드바 접기',
    'Toggle Theme(theme switcher)(aria-label)': '테마 전환',
    'Toggle Menu(mobile menu)(aria-label)': '메뉴 전환',
    'Close Banner(banner)(aria-label)': '배너 닫기',
    'Copy Text(code block)(aria-label)': '텍스트 복사',
    'Copied Text(code block)(aria-label)': '텍스트 복사됨',
    'Copy Anchor Link(heading anchor)(aria-label)': '앵커 링크 복사',
    'Dark(theme switcher)(aria-label)': '어두움',
    'Light(theme switcher)(aria-label)': '밝음',
    'System(theme switcher)(aria-label)': '시스템',
  },
  id: {
    displayName: LOCALE_NAMES.id,
    'Search(search dialog)': 'Cari',
    'Search(search trigger)': 'Cari',
    'No results found(search dialog)': 'Tidak ada hasil ditemukan',
    'On this page(table of contents)': 'Di halaman ini',
    'No Headings(table of contents)': 'Tidak ada heading',
    'Last updated on(page footer)': 'Terakhir diperbarui pada',
    'Choose a language(language switcher)': 'Pilih bahasa',
    'Choose a language(language switcher)(aria-label)': 'Pilih bahasa',
    'Next Page(pagination)': 'Halaman berikutnya',
    'Previous Page(pagination)': 'Halaman sebelumnya',
    'Edit on GitHub(edit page)': 'Edit di GitHub',
    'Open Search(search trigger)(aria-label)': 'Buka pencarian',
    'Close Search(search dialog)(aria-label)': 'Tutup pencarian',
    'Open Sidebar(sidebar)(aria-label)': 'Buka sidebar',
    'Collapse Sidebar(sidebar)(aria-label)': 'Ciutkan sidebar',
    'Toggle Theme(theme switcher)(aria-label)': 'Ganti tema',
    'Toggle Menu(mobile menu)(aria-label)': 'Ganti menu',
    'Close Banner(banner)(aria-label)': 'Tutup banner',
    'Copy Text(code block)(aria-label)': 'Salin teks',
    'Copied Text(code block)(aria-label)': 'Teks disalin',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Salin tautan anchor',
    'Dark(theme switcher)(aria-label)': 'Gelap',
    'Light(theme switcher)(aria-label)': 'Terang',
    'System(theme switcher)(aria-label)': 'Sistem',
  },
  tr: {
    displayName: LOCALE_NAMES.tr,
    'Search(search dialog)': 'Ara',
    'Search(search trigger)': 'Ara',
    'No results found(search dialog)': 'Sonuç bulunamadı',
    'On this page(table of contents)': 'Bu sayfada',
    'No Headings(table of contents)': 'Başlık yok',
    'Last updated on(page footer)': 'Son güncelleme',
    'Choose a language(language switcher)': 'Dil seç',
    'Choose a language(language switcher)(aria-label)': 'Dil seç',
    'Next Page(pagination)': 'Sonraki sayfa',
    'Previous Page(pagination)': 'Önceki sayfa',
    'Edit on GitHub(edit page)': "GitHub'da düzenle",
    'Open Search(search trigger)(aria-label)': 'Aramayı aç',
    'Close Search(search dialog)(aria-label)': 'Aramayı kapat',
    'Open Sidebar(sidebar)(aria-label)': 'Kenar çubuğunu aç',
    'Collapse Sidebar(sidebar)(aria-label)': 'Kenar çubuğunu daralt',
    'Toggle Theme(theme switcher)(aria-label)': 'Temayı değiştir',
    'Toggle Menu(mobile menu)(aria-label)': 'Menüyü değiştir',
    'Close Banner(banner)(aria-label)': 'Bannerı kapat',
    'Copy Text(code block)(aria-label)': 'Metni kopyala',
    'Copied Text(code block)(aria-label)': 'Metin kopyalandı',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Bağlantı çapasını kopyala',
    'Dark(theme switcher)(aria-label)': 'Koyu',
    'Light(theme switcher)(aria-label)': 'Açık',
    'System(theme switcher)(aria-label)': 'Sistem',
  },
})
