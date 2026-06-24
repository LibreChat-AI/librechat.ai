import type { UIStrings } from '@/lib/ui-i18n'

export const ja: UIStrings = {
  nav: {
    docs: 'ドキュメント',
    blog: 'ブログ',
    changelog: '変更履歴',
    discord: 'Discord',
    joinDiscord: 'Discord に参加',
  },
  pageActions: {
    copyMarkdown: 'Markdown をコピー',
    copyMarkdownAria: 'ページを Markdown としてコピー',
    open: '開く',
    openAria: 'ページを外部ツールで開く',
    openInGitHub: 'GitHub で開く',
    openInLibreChat: 'LibreChat で開く',
    openInChatGPT: 'ChatGPT で開く',
    openInClaude: 'Claude で開く',
    openInGemini: 'Gemini で開く',
    openInPerplexity: 'Perplexity で開く',
    openInCursor: 'Cursor で開く',
  },
  feedback: {
    question: 'このガイドはいかがでしたか？',
    good: '良い',
    bad: '悪い',
    thanks: 'フィードバックありがとうございます！',
    submitAgain: 'もう一度送信',
    placeholder: 'その他のフィードバックがあればお書きください（任意）',
    submit: '送信',
    additionalAria: '追加のフィードバック',
  },
  version: {
    label: 'バージョン',
    aria: 'ドキュメントのバージョンを選択',
  },
  logoMenu: {
    openNewTab: '新しいタブで開く',
    logoPng: 'ロゴ（png）',
    logoSvg: 'ロゴ（svg）',
    docsLogoPng: 'ドキュメントロゴ（png）',
    docsLogoSvg: 'ドキュメントロゴ（svg）',
  },
  common: {
    learnMore: '詳しく見る',
    getStarted: '始める',
    readDocs: 'ドキュメントを読む',
    viewFullGuide: '完全なガイドを見る',
    recommended: '推奨',
    prerequisites: '前提条件',
    commands: 'コマンド',
    explore: '探索する',
    resources: 'リソース',
  },
  // Shared resource cards used by both DocsHub and QuickStartHub.
  resources: {
    changelog: { title: '変更履歴', description: '最新のリリース' },
    roadmap: { title: '2026 ロードマップ', description: '今後の予定' },
    discord: { title: 'Discord', description: 'サポートを受ける' },
  },
  docsHub: {
    sections: {
      deploy: 'デプロイ',
      configure: '設定',
      use: '使い方',
      contribute: '貢献',
    },
    items: {
      quickStart: { title: 'クイックスタート', description: '5 分で Docker をセットアップ' },
      local: { title: 'ローカルインストール', description: 'Docker、npm、Helm Chart' },
      remote: { title: 'リモートホスティング', description: 'DigitalOcean、Railway など' },
      configuration: {
        title: '設定',
        description: '環境変数、YAML、認証',
      },
      customEndpoints: {
        title: 'カスタムエンドポイント',
        description: 'Ollama、Deepseek、Groq などに接続',
      },
      features: {
        title: '機能',
        description: 'MCP、エージェント、コードインタープリター、アーティファクト',
      },
      userGuides: {
        title: 'ユーザーガイド',
        description: 'プリセット、ヒント、ベストプラクティス',
      },
      development: {
        title: '開発',
        description: '貢献、アーキテクチャ、デバッグ',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'クイックスタートガイド',
    methods: {
      docker: {
        tag: '推奨',
        time: '約5分',
        description: 'すべて込み — MongoDB、MeiliSearch、RAG API が自動で実行されます。',
        steps: [
          'リポジトリをクローン',
          '.env.example を .env にコピー',
          'docker compose up を実行',
        ],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '約20分',
        description:
          'Node.js を使った手動セットアップ。MongoDB と MeiliSearch のインスタンスを個別に用意する必要があります。',
        steps: [
          'クローンして依存関係をインストール',
          '.env を設定し MongoDB を起動',
          'npm run backend を実行',
        ],
        prereqs: ['Node.js v20.19+', 'MongoDB インスタンス'],
      },
      railway: {
        tag: 'ワンクリック',
        time: '約3分',
        description:
          'すぐにクラウドへデプロイ。ローカルのセットアップも Docker も、管理するサーバーも不要です。',
        steps: ['デプロイボタンをクリック', 'GitHub を接続', '環境変数を設定'],
        prereqs: ['Railway アカウント', 'GitHub アカウント'],
      },
    },
    afterInstallationHeading: 'インストール後',
    connectProviders: {
      title: 'AI プロバイダーを接続',
      description: 'OpenRouter、Ollama、Deepseek、Groq など OpenAI 互換サービスを追加',
    },
    exploreFeatures: {
      title: '機能',
      description: 'エージェント、MCP、Web 検索、RAG、アーティファクト、画像生成など',
    },
    exploreUserGuides: {
      title: 'ユーザーガイド',
      description: 'プリセットや AI プロバイダーの使い方、インターフェースの操作方法を学ぶ',
    },
  },
  featuresHub: {
    ariaLabel: '機能ナビゲーション',
    featuredHeading: '注目',
    coreFeaturesHeading: '主要機能',
    hero: {
      title: 'Model Context Protocol',
      description:
        'MCP（AI ツール連携のためのオープン標準）を通じて、AI モデルをあらゆる外部ツールやサービスに接続',
    },
    highlights: {
      agents: {
        title: 'エージェント',
        description:
          'ツール、ファイル処理、コード実行、API アクションを備えたカスタム AI アシスタントを構築 — コーディング不要。',
      },
      codeInterpreter: {
        title: 'コードインタープリター',
        description:
          'Python、JavaScript、Go、Rust などを実行 — 安全にサンドボックス化され、セットアップ不要。',
      },
      artifacts: {
        title: 'アーティファクト',
        description: 'React コンポーネント、HTML ページ、Mermaid 図をチャット内で直接生成。',
      },
      memory: {
        title: 'メモリ',
        description: '会話をまたいで持続するコンテキストにより、AI が好みや履歴を記憶します。',
      },
      webSearch: {
        title: 'Web 検索',
        description:
          '組み込みの検索と再ランク付けで、あらゆるモデルにリアルタイムのインターネットアクセスを提供。',
      },
      authentication: {
        title: '認証',
        description: 'OAuth2、SAML、LDAP、二要素認証に対応したエンタープライズ向け SSO。',
      },
    },
    categories: {
      searchKnowledge: {
        title: '検索とナレッジ',
        items: {
          webSearch: {
            title: 'Web 検索',
            description: '組み込みの検索と再ランク付けによるリアルタイムのインターネットアクセス',
          },
          search: {
            title: '検索',
            description: 'Meilisearch でメッセージや会話を検索',
          },
          ragApi: {
            title: 'RAG API',
            description: '検索拡張生成を使ってファイルとチャット',
          },
          memory: { title: 'メモリ', description: '会話をまたいで持続するコンテキスト' },
          ocr: { title: 'OCR', description: '画像やドキュメントからテキストを抽出' },
        },
      },
      media: {
        title: 'メディア',
        items: {
          imageGen: {
            title: '画像生成',
            description: 'GPT-Image-1、DALL-E、Stable Diffusion、Flux で画像を作成',
          },
          uploadAsText: {
            title: 'テキストとしてアップロード',
            description: 'ファイルをテキスト入力としてアップロードして処理',
          },
        },
      },
      chat: {
        title: 'チャット',
        items: {
          fork: { title: 'フォーク', description: '会話を複数のスレッドに分割' },
          importConvos: {
            title: '会話のインポート',
            description: 'ChatGPT やその他のプラットフォームからチャットをインポート',
          },
          shareableLinks: {
            title: '共有リンク',
            description: '公開リンクで会話を共有',
          },
          temporaryChat: {
            title: '一時的なチャット',
            description: '履歴に保存されないプライベートな会話',
          },
          urlQuery: {
            title: 'URL クエリパラメータ',
            description: 'URL を通じてチャットを動的に設定',
          },
          resumableStreams: {
            title: '再開可能なストリーム',
            description: '中断された応答を自動的に再接続して再開',
          },
        },
      },
      security: {
        title: 'セキュリティ',
        items: {
          authentication: {
            title: '認証',
            description: 'OAuth2、SAML、LDAP などによるマルチユーザー認証',
          },
          adminPanel: {
            title: '管理パネル',
            description: 'ユーザー、ロール、設定オーバーライドを管理するブラウザ UI',
          },
          passwordReset: {
            title: 'パスワードのリセット',
            description: 'メールによるパスワード復旧',
          },
          moderation: {
            title: 'モデレーションシステム',
            description: 'コンテンツのモデレーションと安全管理',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Docker に同梱',
    bundledNote:
      'Docker Compose がすべての依存関係を処理します。npm や Helm では、これらのサービスを個別にインストールして設定します。',
    chooseMethodHeading: '方法を選択',
    difficulty: {
      Beginner: '初級',
      Intermediate: '中級',
      Advanced: '上級',
    },
    externalServicesRequired: '外部サービスが必要',
    methods: {
      docker: {
        description:
          'すべてがコンテナで実行されます。MongoDB、MeiliSearch、RAG API、Vector DB はすべて自動的に含まれます。',
      },
      npm: {
        description:
          'LibreChat を Node.js で直接実行します。MongoDB や MeiliSearch などの外部サービスはご自身で管理します。',
      },
      helm: {
        description:
          'Helm を使って Kubernetes 上にデプロイ。本番クラスターや Infrastructure as Code のワークフローに最適です。',
      },
    },
    notRunningLocallyHeading: 'ローカルで実行しませんか？',
    remoteHosting: {
      title: 'リモートホスティング',
      description: 'DigitalOcean、Railway、Azure など',
    },
    envConfig: {
      title: '.env の設定',
      description: '環境変数に関する詳細ガイド',
    },
  },
  footer: {
    headings: {
      about: '概要',
      resources: 'リソース',
      documentation: 'ドキュメント',
      blog: 'ブログ',
      newsletter: 'ニュースレター',
      legal: '法的事項',
    },
    items: {
      about: '概要',
      contactUs: 'お問い合わせ',
      features: '機能',
      changelog: '変更履歴',
      roadmap: 'ロードマップ',
      demo: 'デモ',
      status: 'ステータス',
      getStarted: '始める',
      localInstall: 'ローカルインストール',
      remoteInstall: 'リモートインストール',
      blog: 'ブログ',
      blogAuthors: 'ブログ著者',
      subscribe: '購読する',
      unsubscribe: '購読を解除',
      termsOfService: '利用規約',
      privacyPolicy: 'プライバシーポリシー',
      cookiePolicy: 'Cookie ポリシー',
    },
  },
  toolkit: {
    credentials: {
      generate: '認証情報を生成',
      regenerate: '認証情報を再生成',
      generateAria: '新しい認証情報を生成',
      regionAria: '生成された認証情報',
      copy: 'コピー',
      copied: 'コピー済み',
      copyAria: '{label} をコピー',
      valueAria: '{label} の値',
      copyAll: 'すべて .env としてコピー',
      copiedAll: 'クリップボードにコピーしました！',
      copyAllAria: 'すべての認証情報を .env ブロックとしてコピー',
      allCopiedStatus: '5 件の認証情報を KEY=value 形式でコピーしました',
      emptyPrefix: '上のボタンをクリックして、安全なランダム認証情報を',
      emptySuffix: 'ファイル用に生成します。',
      hints: {
        CREDS_KEY: '保存された認証情報の暗号化キー',
        CREDS_IV: '暗号化の初期化ベクトル',
        JWT_SECRET: 'アクセストークン署名用のシークレット',
        JWT_REFRESH_SECRET: 'リフレッシュトークン署名用のシークレット',
        MEILI_KEY: 'MeiliSearch マスターキー',
      },
    },
    yaml: {
      dropFile: 'YAML ファイルをここにドロップ',
      placeholder:
        'librechat.yaml の内容をここに貼り付けるか、ファイルをドラッグ＆ドロップしてください...',
      empty: 'YAML 内容を貼り付けるかドロップすると、ここに検証結果が表示されます。',
      valid: 'YAML は有効です！',
      clear: 'クリア',
      clearAria: 'エディターをクリア',
      badIndentation:
        '{line} 行目のインデントが正しくありません。YAML の各項目は正しくインデントする必要があります。',
      errorAtLine: '{reason}（{line} 行目）',
      unknownError: '不明な YAML エラー',
    },
  },
  home: {
    metaTitle: 'LibreChat - オープンソースの AI プラットフォーム',
    metaDescription:
      'LibreChat は、すべての AI 会話を統一されたカスタマイズ可能なインターフェースに集約します。',
    starOnGitHub: 'GitHub でスター',
    starAria: 'GitHub で LibreChat にスター — {count} 個のスター',
    heroTitleTop: 'オープンソースの',
    heroTitleBottom: 'AI プラットフォーム',
    heroSubtitle:
      'LibreChat は、すべての AI 会話を統一されたカスタマイズ可能なインターフェースに集約します',
    getStarted: '始める',
    getStartedAria: 'LibreChat のドキュメントを始める',
    tryDemo: 'デモを試す',
    tryDemoAria: 'LibreChat のデモを試す',
    desktopLightAlt: 'ライトモードの LibreChat デスクトップインターフェース',
    desktopDarkAlt: 'ダークモードの LibreChat デスクトップインターフェース',
    mobileLightAlt: 'ライトモードの LibreChat モバイルインターフェース',
    mobileDarkAlt: 'ダークモードの LibreChat モバイルインターフェース',
    trustedBy: '世界中の企業に信頼されています',
    featuresHeading: '必要なものすべて',
    featuresSubtitle: 'AI を活用した会話のための総合的なプラットフォーム',
    primaryActionsAria: '主要なアクション',
    features: {
      agents: {
        title: 'エージェント',
        description: 'ファイル処理、コード解釈、API アクションを備えた高度なエージェント',
      },
      codeInterpreter: {
        title: 'コードインタープリター',
        description: '複数の言語のコードをセットアップ不要で安全に実行',
      },
      models: {
        title: 'モデル',
        description: 'Anthropic、AWS、OpenAI、Azure などを含む AI モデルの選択',
      },
      artifacts: {
        title: 'アーティファクト',
        description: 'React、HTML コード、Mermaid 図をチャット内で作成',
      },
      search: {
        title: '検索',
        description: 'メッセージ、ファイル、コードスニペットを瞬時に検索',
      },
      mcp: {
        title: 'MCP',
        description: 'Model Context Protocol 対応であらゆるツールやサービスに接続',
      },
      memory: {
        title: 'メモリ',
        description: '会話をまたいで持続するコンテキストにより、AI があなたを記憶',
      },
      webSearch: {
        title: 'Web 検索',
        description:
          '組み込みの検索と再ランク付けで、あらゆるモデルにリアルタイムのインターネットアクセスを提供',
      },
      authentication: {
        title: '認証',
        description: 'OAuth、SAML、LDAP、二要素認証に対応したエンタープライズ向け SSO',
      },
    },
    learnMore: '詳しく見る',
    communityHeading: 'オープンソース、コミュニティ主導',
    communitySubtitle: 'LibreChat で構築する何千もの開発者や組織に参加しましょう',
    githubStars: 'GitHub スター',
    dockerPulls: 'Docker プル',
    contributors: '貢献者',
    communityLinksAria: 'コミュニティリンク',
    githubAria: 'GitHub の LibreChat',
    discordAria: 'Discord の LibreChat',
    ctaHeading: 'LibreChat で構築を始める',
    ctaSubtitle: 'クイックスタートガイドで数分で立ち上げて実行',
    quickstartGuide: 'クイックスタートガイド',
    quickstartAria: 'クイックスタートガイドを読む',
  },
}
