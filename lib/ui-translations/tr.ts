import type { UIStrings } from '@/lib/ui-i18n'

export const tr: UIStrings = {
  nav: {
    docs: 'Dokümantasyon',
    blog: 'Blog',
    changelog: 'Değişiklik günlüğü',
    discord: 'Discord',
    joinDiscord: "Discord'a katıl",
  },
  pageActions: {
    copyMarkdown: "Markdown'ı kopyala",
    copying: 'Kopyalanıyor...',
    copied: 'Kopyalandı!',
    copyFailed: 'Kopyalama başarısız',
    copyMarkdownAria: 'Sayfayı Markdown olarak kopyala',
    open: 'Aç',
    openAria: 'Sayfayı harici araçlarda aç',
    openInGitHub: "GitHub'da aç",
    openInLibreChat: "LibreChat'te aç",
    openInChatGPT: "ChatGPT'de aç",
    openInClaude: "Claude'da aç",
    openInGemini: "Gemini'de aç",
    openInPerplexity: "Perplexity'de aç",
    openInCursor: "Cursor'da aç",
  },
  feedback: {
    question: 'Bu rehber nasıl?',
    good: 'İyi',
    bad: 'Kötü',
    thanks: 'Geri bildiriminiz için teşekkürler!',
    submitAgain: 'Tekrar gönder',
    placeholder: 'Ek geri bildirim var mı? (isteğe bağlı)',
    submit: 'Gönder',
    additionalAria: 'Ek geri bildirim',
  },
  version: {
    label: 'Sürüm',
    aria: 'Dokümantasyon sürümünü seç',
  },
  logoMenu: {
    openNewTab: 'Yeni sekmede aç',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Dokümantasyon logosu (png)',
    docsLogoSvg: 'Dokümantasyon logosu (svg)',
  },
  common: {
    learnMore: 'Daha fazla bilgi',
    getStarted: 'Başla',
    readDocs: 'Dokümantasyonu oku',
    viewFullGuide: 'Tam rehberi görüntüle',
    recommended: 'Önerilen',
    prerequisites: 'Ön koşullar',
    commands: 'Komutlar',
    explore: 'Keşfet',
    resources: 'Kaynaklar',
  },
  resources: {
    changelog: { title: 'Değişiklik günlüğü', description: 'En son sürümler' },
    roadmap: { title: '2026 Yol Haritası', description: 'Planlananlar' },
    discord: { title: 'Discord', description: 'Yardım al' },
  },
  docsHub: {
    sections: {
      deploy: 'Dağıt',
      configure: 'Yapılandır',
      use: 'Kullan',
      contribute: 'Katkıda bulun',
    },
    items: {
      quickStart: { title: 'Hızlı Başlangıç', description: '5 dakikada Docker kurulumu' },
      local: { title: 'Yerel Kurulum', description: 'Docker, npm ve Helm Chart' },
      remote: { title: 'Uzak Hosting', description: 'DigitalOcean, Railway ve daha fazlası' },
      configuration: {
        title: 'Yapılandırma',
        description: 'Ortam değişkenleri, YAML ve kimlik doğrulama',
      },
      customEndpoints: {
        title: 'Özel Endpointler',
        description: 'Ollama, Deepseek, Groq ve daha fazlasını bağla',
      },
      features: { title: 'Özellikler', description: 'MCP, ajanlar, Code Interpreter, artifactler' },
      userGuides: {
        title: 'Kullanıcı Rehberleri',
        description: 'Presetler, ipuçları ve iyi uygulamalar',
      },
      development: {
        title: 'Geliştirme',
        description: 'Katkı, mimari ve hata ayıklama',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Hızlı başlangıç rehberleri',
    methods: {
      docker: {
        tag: 'Önerilen',
        time: '~5 dk',
        description: 'Her şey dahil — MongoDB, MeiliSearch ve RAG API otomatik olarak çalışır.',
        steps: [
          "Repository'yi klonla",
          ".env.example'ı .env olarak kopyala",
          'docker compose up çalıştır',
        ],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 dk',
        description: 'Node.js ile manuel kurulum. Ayrı MongoDB ve MeiliSearch örnekleri gerekir.',
        steps: [
          'Klonla ve bağımlılıkları yükle',
          ".env'yi yapılandır ve MongoDB'yi başlat",
          'npm run backend çalıştır',
        ],
        prereqs: ['Node.js v20.19+', 'MongoDB örneği'],
      },
      railway: {
        tag: 'Tek tık',
        time: '~3 dk',
        description:
          'Anında buluta dağıtın. Yerel kurulum yok, Docker yok, yönetilecek sunucu yok.',
        steps: ['Dağıtım düğmesine tıkla', "GitHub'ını bağla", 'Ortam değişkenlerini ayarla'],
        prereqs: ['Railway hesabı', 'GitHub hesabı'],
      },
    },
    afterInstallationHeading: 'Kurulumdan sonra',
    connectProviders: {
      title: 'AI sağlayıcılarını bağla',
      description: 'OpenRouter, Ollama, Deepseek, Groq ve diğer OpenAI uyumlu servisleri ekle',
    },
    exploreFeatures: {
      title: 'Özellikler',
      description: 'Ajanlar, MCP, web arama, RAG, artifactler, görsel üretimi ve daha fazlası',
    },
    exploreUserGuides: {
      title: 'Kullanıcı Rehberleri',
      description:
        'Presetleri, AI sağlayıcılarını ve arayüzde gezinmeyi nasıl kullanacağınızı öğrenin',
    },
  },
  featuresHub: {
    ariaLabel: 'Özellik navigasyonu',
    featuredHeading: 'Öne çıkan',
    coreFeaturesHeading: 'Temel özellikler',
    hero: {
      title: 'Model Context Protocol',
      description:
        'AI modellerini MCP üzerinden herhangi bir harici araç veya servise bağlayın — AI araç entegrasyonu için açık standart',
    },
    highlights: {
      agents: {
        title: 'Ajanlar',
        description:
          'Araçlar, dosya işleme, kod yürütme ve API aksiyonlarıyla özel AI asistanları oluşturun — kodlama gerekmez.',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description:
          'Python, JavaScript, Go, Rust ve daha fazlasını güvenli sandbox içinde kurulum yapmadan çalıştırın.',
      },
      artifacts: {
        title: 'Artifactler',
        description:
          'React bileşenleri, HTML sayfaları ve Mermaid diyagramlarını doğrudan sohbet içinde üretin.',
      },
      memory: {
        title: 'Bellek',
        description:
          "AI'nızın tercihleri ve geçmişi hatırlaması için konuşmalar arasında kalıcı bağlam.",
      },
      webSearch: {
        title: 'Web arama',
        description:
          'Yerleşik arama ve reranking ile herhangi bir modele canlı internet erişimi verin.',
      },
      authentication: {
        title: 'Kimlik doğrulama',
        description: 'OAuth2, SAML, LDAP ve iki faktörlü kimlik doğrulama ile kurumsal SSO.',
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Arama ve bilgi',
        items: {
          webSearch: {
            title: 'Web arama',
            description: 'Yerleşik arama ve reranking ile canlı internet erişimi',
          },
          search: {
            title: 'Arama',
            description: 'Meilisearch ile mesajları ve konuşmaları bulun',
          },
          ragApi: {
            title: 'RAG API',
            description: 'retrieval-augmented generation ile dosyalarla sohbet edin',
          },
          memory: { title: 'Bellek', description: 'Konuşmalar arasında kalıcı bağlam' },
          ocr: { title: 'OCR', description: 'Görsellerden ve belgelerden metin çıkarın' },
        },
      },
      media: {
        title: 'Medya',
        items: {
          imageGen: {
            title: 'Görsel üretimi',
            description: 'GPT-Image-1, DALL-E, Stable Diffusion ve Flux ile görseller oluşturun',
          },
          uploadAsText: {
            title: 'Metin olarak yükle',
            description: 'Dosyaları metin girdisi olarak yükleyin ve işleyin',
          },
        },
      },
      chat: {
        title: 'Sohbet',
        items: {
          fork: { title: 'Fork', description: 'Konuşmaları birden fazla iş parçacığına ayırın' },
          importConvos: {
            title: 'Konuşmaları içe aktar',
            description: "ChatGPT'den ve diğer platformlardan sohbetleri içe aktarın",
          },
          shareableLinks: {
            title: 'Paylaşılabilir bağlantılar',
            description: 'Konuşmaları herkese açık bağlantılarla paylaşın',
          },
          temporaryChat: {
            title: 'Geçici sohbet',
            description: 'Geçmişe kaydedilmeyen özel konuşmalar',
          },
          urlQuery: {
            title: 'URL sorgu parametreleri',
            description: 'Sohbetleri URL üzerinden dinamik olarak yapılandırın',
          },
          resumableStreams: {
            title: 'Sürdürülebilir akışlar',
            description: 'Otomatik yeniden bağlanma ve kesilen yanıtları sürdürme',
          },
        },
      },
      security: {
        title: 'Güvenlik',
        items: {
          authentication: {
            title: 'Kimlik doğrulama',
            description: 'OAuth2, SAML, LDAP ve daha fazlasıyla çok kullanıcılı kimlik doğrulama',
          },
          adminPanel: {
            title: 'Yönetici paneli',
            description: 'Kullanıcılar, roller ve yapılandırma geçersiz kılmaları için tarayıcı UI',
          },
          passwordReset: {
            title: 'Parola sıfırlama',
            description: 'E-posta tabanlı parola kurtarma',
          },
          moderation: {
            title: 'Moderasyon sistemi',
            description: 'İçerik moderasyonu ve güvenlik kontrolleri',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Docker ile birlikte',
    bundledNote:
      'Docker Compose tüm bağımlılıkları yönetir. npm veya Helm ile bu servisleri ayrı olarak kurar ve yapılandırırsınız.',
    chooseMethodHeading: 'Bir yöntem seçin',
    difficulty: {
      Beginner: 'Başlangıç',
      Intermediate: 'Orta',
      Advanced: 'İleri',
    },
    externalServicesRequired: 'Harici servisler gerekli',
    methods: {
      docker: {
        description:
          'Her şey containerlarda çalışır. MongoDB, MeiliSearch, RAG API ve Vector DB otomatik olarak dahildir.',
      },
      npm: {
        description:
          'LibreChat’i doğrudan Node.js ile çalıştırın. MongoDB ve MeiliSearch gibi harici servisleri siz yönetirsiniz.',
      },
      helm: {
        description:
          'Helm kullanarak Kubernetes üzerinde dağıtın. Üretim clusterları ve infrastructure-as-code iş akışları için en iyisi.',
      },
    },
    notRunningLocallyHeading: 'Yerelde çalıştırmıyor musunuz?',
    remoteHosting: {
      title: 'Uzak hosting',
      description: 'DigitalOcean, Railway, Azure ve daha fazlası',
    },
    envConfig: {
      title: '.env yapılandırması',
      description: 'Ortam değişkenleri için ayrıntılı rehber',
    },
  },
  footer: {
    headings: {
      about: 'Hakkında',
      resources: 'Kaynaklar',
      documentation: 'Dokümantasyon',
      blog: 'Blog',
      newsletter: 'Bülten',
      legal: 'Yasal',
    },
    items: {
      about: 'Hakkında',
      contactUs: 'Bize ulaşın',
      features: 'Özellikler',
      changelog: 'Değişiklik günlüğü',
      roadmap: 'Yol haritası',
      demo: 'Demo',
      status: 'Durum',
      getStarted: 'Başla',
      localInstall: 'Yerel kurulum',
      remoteInstall: 'Uzak kurulum',
      blog: 'Blog',
      blogAuthors: 'Blog yazarları',
      subscribe: 'Abone ol',
      unsubscribe: 'Abonelikten çık',
      termsOfService: 'Hizmet şartları',
      privacyPolicy: 'Gizlilik politikası',
      cookiePolicy: 'Çerez politikası',
    },
  },
  toolkit: {
    credentials: {
      generate: 'Kimlik bilgileri oluştur',
      regenerate: 'Yeniden oluştur',
      generateAria: 'Yeni kimlik bilgileri oluştur',
      regenerateAria: 'Kimlik bilgilerini yeniden oluştur',
      regionAria: 'Oluşturulan kimlik bilgileri',
      copy: 'Kopyala',
      copying: 'Kopyalanıyor...',
      copied: 'Kopyalandı',
      copyFailed: 'Kopyalama başarısız',
      copyAria: '{label} kopyala',
      valueAria: '{label} değeri',
      copyAll: 'Tümünü .env olarak kopyala',
      copiedAll: 'Panoya kopyalandı!',
      copyAllAria: 'Tüm kimlik bilgilerini .env bloğu olarak kopyala',
      allCopiedStatus: '5 kimlik bilgisinin tamamı KEY=value formatında kopyalandı',
      allCopyFailedStatus: 'Panoya kopyalama başarısız oldu. Değerleri seçip elle kopyalayın.',
      emptyPrefix:
        'Şunun için güvenli rastgele kimlik bilgileri oluşturmak üzere yukarıdaki düğmeye tıklayın:',
      emptySuffix: 'dosyası.',
      hints: {
        CREDS_KEY: 'Saklanan kimlik bilgileri için şifreleme anahtarı',
        CREDS_IV: 'Şifreleme için başlatma vektörü',
        JWT_SECRET: 'Erişim tokenlarını imzalama sırrı',
        JWT_REFRESH_SECRET: 'Yenileme tokenlarını imzalama sırrı',
        MEILI_KEY: 'MeiliSearch ana anahtarı',
      },
    },
    yaml: {
      dropFile: 'YAML dosyasını buraya bırakın',
      placeholder:
        'librechat.yaml içeriğini buraya yapıştırın veya bir dosyayı sürükleyip bırakın...',
      empty: 'YAML yapıştırdığınızda veya bıraktığınızda doğrulama sonuçları burada görünecek.',
      valid: 'YAML geçerli!',
      clear: 'Temizle',
      clearAria: 'Editörü temizle',
      badIndentation:
        '{line}. satırda hatalı girinti. YAML’deki her giriş düzgün girintilenmelidir.',
      errorAtLine: '{line}. satırda {reason}',
      unknownError: 'Bilinmeyen YAML hatası',
    },
  },
  home: {
    metaTitle: 'LibreChat - Open-source AI platformu',
    metaDescription:
      'LibreChat, tüm AI konuşmalarınızı tek, birleşik ve özelleştirilebilir bir arayüzde toplar.',
    starOnGitHub: "GitHub'da yıldız ver",
    starAria: "GitHub'da LibreChat'e yıldız ver — {count} yıldız",
    heroTitleTop: 'Open-source',
    heroTitleBottom: 'AI platformu',
    heroSubtitle:
      'LibreChat, tüm AI konuşmalarınızı tek, birleşik ve özelleştirilebilir bir arayüzde toplar',
    getStarted: 'Başla',
    getStartedAria: 'LibreChat dokümantasyonu ile başla',
    tryDemo: 'Demoyu dene',
    tryDemoAria: 'LibreChat demosunu dene',
    desktopLightAlt: 'Açık modda LibreChat masaüstü arayüzü',
    desktopDarkAlt: 'Koyu modda LibreChat masaüstü arayüzü',
    mobileLightAlt: 'Açık modda LibreChat mobil arayüzü',
    mobileDarkAlt: 'Koyu modda LibreChat mobil arayüzü',
    trustedBy: 'Dünya genelindeki şirketler tarafından güveniliyor',
    featuresHeading: 'İhtiyacınız olan her şey',
    featuresSubtitle: 'AI destekli konuşmalar için kapsamlı bir platform',
    primaryActionsAria: 'Birincil eylemler',
    features: {
      agents: {
        title: 'Ajanlar',
        description: 'Dosya işleme, kod yorumlama ve API aksiyonlarıyla gelişmiş ajanlar',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: 'Kodu birden fazla dilde güvenli biçimde, kurulum olmadan çalıştırın',
      },
      models: {
        title: 'Modeller',
        description: 'Anthropic, AWS, OpenAI, Azure ve daha fazlasını içeren AI model seçimi',
      },
      artifacts: {
        title: 'Artifactler',
        description: 'Sohbette React, HTML kodu ve Mermaid diyagramları oluşturun',
      },
      search: {
        title: 'Arama',
        description: 'Mesajları, dosyaları ve kod parçalarını anında arayın',
      },
      mcp: {
        title: 'MCP',
        description: 'Model Context Protocol desteği olan herhangi bir araç veya servise bağlanın',
      },
      memory: {
        title: 'Bellek',
        description: "AI'nızın sizi hatırlaması için konuşmalar arasında kalıcı bağlam",
      },
      webSearch: {
        title: 'Web arama',
        description:
          'Yerleşik arama ve reranking ile herhangi bir modele canlı internet erişimi verin',
      },
      authentication: {
        title: 'Kimlik doğrulama',
        description: 'OAuth, SAML, LDAP ve iki faktörlü kimlik doğrulama ile kurumsal SSO',
      },
    },
    learnMore: 'Daha fazla bilgi',
    communityHeading: 'Open source, topluluk odaklı',
    communitySubtitle: 'LibreChat ile geliştiren binlerce geliştirici ve kuruluşa katılın',
    githubStars: 'GitHub yıldızları',
    dockerPulls: 'Docker indirmeleri',
    contributors: 'Katkıda bulunanlar',
    communityLinksAria: 'Topluluk bağlantıları',
    githubAria: "GitHub'da LibreChat",
    discordAria: "Discord'da LibreChat",
    ctaHeading: 'LibreChat ile geliştirmeye başlayın',
    ctaSubtitle: 'Hızlı başlangıç rehberimizle dakikalar içinde çalışır hale gelin',
    quickstartGuide: 'Hızlı başlangıç rehberi',
    quickstartAria: 'Hızlı başlangıç rehberini oku',
  },
}
