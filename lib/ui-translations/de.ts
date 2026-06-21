import type { UIStrings } from '@/lib/ui-i18n'

export const de: UIStrings = {
  nav: {
    docs: 'Dokumentation',
    blog: 'Blog',
    changelog: 'Änderungsverlauf',
    discord: 'Discord',
    joinDiscord: 'Discord beitreten',
  },
  pageActions: {
    copyMarkdown: 'Markdown kopieren',
    copyMarkdownAria: 'Seite als Markdown kopieren',
    open: 'Öffnen',
    openAria: 'Seite in externen Tools öffnen',
    openInGitHub: 'In GitHub öffnen',
    openInLibreChat: 'In LibreChat öffnen',
    openInChatGPT: 'In ChatGPT öffnen',
    openInClaude: 'In Claude öffnen',
    openInGemini: 'In Gemini öffnen',
    openInPerplexity: 'In Perplexity öffnen',
    openInCursor: 'In Cursor öffnen',
  },
  feedback: {
    question: 'Wie finden Sie diese Anleitung?',
    good: 'Gut',
    bad: 'Schlecht',
    thanks: 'Vielen Dank für Ihr Feedback!',
    submitAgain: 'Erneut senden',
    placeholder: 'Weiteres Feedback? (optional)',
    submit: 'Senden',
    additionalAria: 'Weiteres Feedback',
  },
  version: {
    label: 'Version',
    aria: 'Dokumentationsversion auswählen',
  },
  logoMenu: {
    openNewTab: 'In neuem Tab öffnen',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Dokumentations-Logo (png)',
    docsLogoSvg: 'Dokumentations-Logo (svg)',
  },
  common: {
    learnMore: 'Mehr erfahren',
    getStarted: 'Loslegen',
    readDocs: 'Dokumentation lesen',
    viewFullGuide: 'Vollständige Anleitung ansehen',
    recommended: 'Empfohlen',
    prerequisites: 'Voraussetzungen',
    commands: 'Befehle',
    explore: 'Entdecken',
    resources: 'Ressourcen',
  },
  // Shared resource cards used by both DocsHub and QuickStartHub.
  resources: {
    changelog: { title: 'Änderungsverlauf', description: 'Neueste Veröffentlichungen' },
    roadmap: { title: 'Roadmap 2026', description: 'Was geplant ist' },
    discord: { title: 'Discord', description: 'Hilfe erhalten' },
  },
  docsHub: {
    sections: {
      deploy: 'Bereitstellen',
      configure: 'Konfigurieren',
      use: 'Verwenden',
      contribute: 'Mitwirken',
    },
    items: {
      quickStart: { title: 'Schnellstart', description: 'Docker-Einrichtung in 5 Minuten' },
      local: { title: 'Lokale Installation', description: 'Docker, npm und Helm Chart' },
      remote: { title: 'Remote-Hosting', description: 'DigitalOcean, Railway und mehr' },
      configuration: {
        title: 'Konfiguration',
        description: 'Umgebungsvariablen, YAML und Authentifizierung',
      },
      customEndpoints: {
        title: 'Benutzerdefinierte Endpunkte',
        description: 'Ollama, Deepseek, Groq und mehr verbinden',
      },
      features: { title: 'Funktionen', description: 'MCP, Agenten, Code-Interpreter, Artefakte' },
      userGuides: {
        title: 'Benutzerhandbücher',
        description: 'Voreinstellungen, Tipps und bewährte Methoden',
      },
      development: {
        title: 'Entwicklung',
        description: 'Mitwirken, Architektur und Debugging',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Schnellstart-Anleitungen',
    methods: {
      docker: {
        tag: 'Empfohlen',
        time: '~5 Min.',
        description: 'Alles enthalten — MongoDB, MeiliSearch und RAG API laufen automatisch.',
        steps: [
          'Repository klonen',
          '.env.example nach .env kopieren',
          'docker compose up ausführen',
        ],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 Min.',
        description:
          'Manuelle Einrichtung mit Node.js. Erfordert separate MongoDB- und MeiliSearch-Instanzen.',
        steps: [
          'Klonen und Abhängigkeiten installieren',
          '.env konfigurieren und MongoDB starten',
          'npm run backend ausführen',
        ],
        prereqs: ['Node.js v20.19+', 'MongoDB-Instanz'],
      },
      railway: {
        tag: 'Ein-Klick',
        time: '~3 Min.',
        description:
          'Sofort in der Cloud bereitstellen. Keine lokale Einrichtung, kein Docker, keine zu verwaltenden Server.',
        steps: [
          'Auf die Bereitstellen-Schaltfläche klicken',
          'GitHub verbinden',
          'Umgebungsvariablen festlegen',
        ],
        prereqs: ['Railway-Konto', 'GitHub-Konto'],
      },
    },
    afterInstallationHeading: 'Nach der Installation',
    connectProviders: {
      title: 'KI-Anbieter verbinden',
      description:
        'OpenRouter, Ollama, Deepseek, Groq und weitere OpenAI-kompatible Dienste hinzufügen',
    },
    exploreFeatures: {
      title: 'Funktionen',
      description: 'Agenten, MCP, Websuche, RAG, Artefakte, Bildgenerierung und mehr',
    },
    exploreUserGuides: {
      title: 'Benutzerhandbücher',
      description:
        'Erfahren Sie, wie Sie Voreinstellungen und KI-Anbieter nutzen und sich in der Oberfläche zurechtfinden',
    },
  },
  featuresHub: {
    ariaLabel: 'Funktionsnavigation',
    featuredHeading: 'Empfohlen',
    coreFeaturesHeading: 'Kernfunktionen',
    hero: {
      title: 'Model Context Protocol',
      description:
        'Verbinden Sie KI-Modelle über MCP mit jedem externen Tool oder Dienst — dem offenen Standard für die Integration von KI-Tools',
    },
    highlights: {
      agents: {
        title: 'Agenten',
        description:
          'Erstellen Sie benutzerdefinierte KI-Assistenten mit Tools, Dateiverarbeitung, Code-Ausführung und API-Aktionen — ganz ohne Programmierung.',
      },
      codeInterpreter: {
        title: 'Code-Interpreter',
        description:
          'Führen Sie Python, JavaScript, Go, Rust und mehr aus — sicher isoliert und ohne Einrichtung.',
      },
      artifacts: {
        title: 'Artefakte',
        description:
          'Erstellen Sie React-Komponenten, HTML-Seiten und Mermaid-Diagramme direkt im Chat.',
      },
      memory: {
        title: 'Gedächtnis',
        description:
          'Dauerhafter Kontext über Unterhaltungen hinweg, damit sich Ihre KI an Vorlieben und Verlauf erinnert.',
      },
      webSearch: {
        title: 'Websuche',
        description:
          'Geben Sie jedem Modell mit integrierter Suche und Neuanordnung live Zugriff auf das Internet.',
      },
      authentication: {
        title: 'Authentifizierung',
        description:
          'Unternehmenstaugliches SSO mit OAuth2, SAML, LDAP und Zwei-Faktor-Authentifizierung.',
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Suche & Wissen',
        items: {
          webSearch: {
            title: 'Websuche',
            description: 'Live-Zugriff auf das Internet mit integrierter Suche und Neuanordnung',
          },
          search: {
            title: 'Suche',
            description: 'Nachrichten und Unterhaltungen mit Meilisearch finden',
          },
          ragApi: {
            title: 'RAG API',
            description: 'Mit Dateien chatten dank Retrieval-Augmented Generation',
          },
          memory: {
            title: 'Gedächtnis',
            description: 'Dauerhafter Kontext über Unterhaltungen hinweg',
          },
          ocr: { title: 'OCR', description: 'Text aus Bildern und Dokumenten extrahieren' },
        },
      },
      media: {
        title: 'Medien',
        items: {
          imageGen: {
            title: 'Bildgenerierung',
            description: 'Bilder erstellen mit GPT-Image-1, DALL-E, Stable Diffusion und Flux',
          },
          uploadAsText: {
            title: 'Als Text hochladen',
            description: 'Dateien als Texteingabe hochladen und verarbeiten',
          },
        },
      },
      chat: {
        title: 'Chat',
        items: {
          fork: { title: 'Verzweigen', description: 'Unterhaltungen in mehrere Stränge aufteilen' },
          importConvos: {
            title: 'Unterhaltungen importieren',
            description: 'Chats aus ChatGPT und anderen Plattformen importieren',
          },
          shareableLinks: {
            title: 'Teilbare Links',
            description: 'Unterhaltungen über öffentliche Links teilen',
          },
          temporaryChat: {
            title: 'Temporärer Chat',
            description: 'Private Unterhaltungen, die nicht im Verlauf gespeichert werden',
          },
          urlQuery: {
            title: 'URL-Abfrageparameter',
            description: 'Chats dynamisch über die URL konfigurieren',
          },
          resumableStreams: {
            title: 'Fortsetzbare Streams',
            description: 'Automatisch erneut verbinden und unterbrochene Antworten fortsetzen',
          },
        },
      },
      security: {
        title: 'Sicherheit',
        items: {
          authentication: {
            title: 'Authentifizierung',
            description: 'Mehrbenutzer-Authentifizierung mit OAuth2, SAML, LDAP und mehr',
          },
          passwordReset: {
            title: 'Passwort zurücksetzen',
            description: 'E-Mail-basierte Passwortwiederherstellung',
          },
          moderation: {
            title: 'Moderationssystem',
            description: 'Inhaltsmoderation und Sicherheitskontrollen',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'In Docker enthalten',
    bundledNote:
      'Docker Compose verwaltet alle Abhängigkeiten. Mit npm oder Helm installieren und konfigurieren Sie diese Dienste separat.',
    chooseMethodHeading: 'Methode auswählen',
    difficulty: {
      Beginner: 'Einsteiger',
      Intermediate: 'Fortgeschritten',
      Advanced: 'Experte',
    },
    externalServicesRequired: 'Externe Dienste erforderlich',
    methods: {
      docker: {
        description:
          'Alles läuft in Containern. MongoDB, MeiliSearch, RAG API und Vector DB sind alle automatisch enthalten.',
      },
      npm: {
        description:
          'LibreChat direkt mit Node.js ausführen. Externe Dienste wie MongoDB und MeiliSearch verwalten Sie selbst.',
      },
      helm: {
        description:
          'Mit Helm auf Kubernetes bereitstellen. Ideal für Produktionscluster und Infrastructure-as-Code-Workflows.',
      },
    },
    notRunningLocallyHeading: 'Läuft nicht lokal?',
    remoteHosting: {
      title: 'Remote-Hosting',
      description: 'DigitalOcean, Railway, Azure und mehr',
    },
    envConfig: {
      title: '.env-Konfiguration',
      description: 'Ausführliche Anleitung zu Umgebungsvariablen',
    },
  },
  footer: {
    headings: {
      about: 'Über uns',
      resources: 'Ressourcen',
      documentation: 'Dokumentation',
      blog: 'Blog',
      newsletter: 'Newsletter',
      legal: 'Rechtliches',
    },
    items: {
      about: 'Über uns',
      contactUs: 'Kontakt',
      features: 'Funktionen',
      changelog: 'Änderungsverlauf',
      roadmap: 'Roadmap',
      demo: 'Demo',
      status: 'Status',
      getStarted: 'Loslegen',
      localInstall: 'Lokale Installation',
      remoteInstall: 'Remote-Installation',
      blog: 'Blog',
      blogAuthors: 'Blog-Autoren',
      subscribe: 'Abonnieren',
      unsubscribe: 'Abbestellen',
      termsOfService: 'Nutzungsbedingungen',
      privacyPolicy: 'Datenschutzerklärung',
      cookiePolicy: 'Cookie-Richtlinie',
    },
  },
  home: {
    metaTitle: 'LibreChat - Die Open-Source-KI-Plattform',
    metaDescription:
      'LibreChat vereint all Ihre KI-Unterhaltungen in einer einheitlichen, anpassbaren Oberfläche.',
    starOnGitHub: 'Auf GitHub mit Stern markieren',
    starAria: 'LibreChat auf GitHub mit Stern markieren — {count} Sterne',
    heroTitleTop: 'Die Open-Source-',
    heroTitleBottom: 'KI-Plattform',
    heroSubtitle:
      'LibreChat vereint all Ihre KI-Unterhaltungen in einer einheitlichen, anpassbaren Oberfläche',
    getStarted: 'Loslegen',
    getStartedAria: 'Mit der LibreChat-Dokumentation loslegen',
    tryDemo: 'Demo testen',
    tryDemoAria: 'Die LibreChat-Demo testen',
    desktopLightAlt: 'LibreChat-Desktop-Oberfläche im hellen Modus',
    desktopDarkAlt: 'LibreChat-Desktop-Oberfläche im dunklen Modus',
    mobileLightAlt: 'LibreChat-Mobiloberfläche im hellen Modus',
    mobileDarkAlt: 'LibreChat-Mobiloberfläche im dunklen Modus',
    trustedBy: 'Weltweit von Unternehmen genutzt',
    featuresHeading: 'Alles, was Sie brauchen',
    featuresSubtitle: 'Eine umfassende Plattform für KI-gestützte Unterhaltungen',
    primaryActionsAria: 'Primäre Aktionen',
    features: {
      agents: {
        title: 'Agenten',
        description:
          'Fortschrittliche Agenten mit Dateiverarbeitung, Code-Interpretation und API-Aktionen',
      },
      codeInterpreter: {
        title: 'Code-Interpreter',
        description: 'Code in mehreren Sprachen sicher und ohne Einrichtung ausführen',
      },
      models: {
        title: 'Modelle',
        description: 'KI-Modellauswahl mit Anthropic, AWS, OpenAI, Azure und mehr',
      },
      artifacts: {
        title: 'Artefakte',
        description: 'React- und HTML-Code sowie Mermaid-Diagramme im Chat erstellen',
      },
      search: {
        title: 'Suche',
        description: 'Nachrichten, Dateien und Code-Schnipsel im Handumdrehen durchsuchen',
      },
      mcp: {
        title: 'MCP',
        description:
          'Mit Model-Context-Protocol-Unterstützung jedes Tool oder jeden Dienst verbinden',
      },
      memory: {
        title: 'Gedächtnis',
        description:
          'Dauerhafter Kontext über Unterhaltungen hinweg, damit sich Ihre KI an Sie erinnert',
      },
      webSearch: {
        title: 'Websuche',
        description:
          'Geben Sie jedem Modell mit integrierter Suche und Neuanordnung live Zugriff auf das Internet',
      },
      authentication: {
        title: 'Authentifizierung',
        description:
          'Unternehmenstaugliches SSO mit OAuth, SAML, LDAP und Zwei-Faktor-Authentifizierung',
      },
    },
    learnMore: 'Mehr erfahren',
    communityHeading: 'Open Source, von der Community getragen',
    communitySubtitle:
      'Schließen Sie sich Tausenden von Entwicklern und Organisationen an, die mit LibreChat arbeiten',
    githubStars: 'GitHub-Sterne',
    dockerPulls: 'Docker-Pulls',
    contributors: 'Mitwirkende',
    communityLinksAria: 'Community-Links',
    githubAria: 'LibreChat auf GitHub',
    discordAria: 'LibreChat auf Discord',
    ctaHeading: 'Beginnen Sie, mit LibreChat zu entwickeln',
    ctaSubtitle: 'Mit unserer Schnellstartanleitung sind Sie in wenigen Minuten startklar',
    quickstartGuide: 'Schnellstartanleitung',
    quickstartAria: 'Schnellstartanleitung lesen',
  },
}
