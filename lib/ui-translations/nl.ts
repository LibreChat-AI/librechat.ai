import type { UIStrings } from '@/lib/ui-i18n'

export const nl: UIStrings = {
  nav: {
    docs: 'Documentatie',
    blog: 'Blog',
    changelog: 'Wijzigingslogboek',
    discord: 'Discord',
    joinDiscord: 'Word lid van Discord',
  },
  pageActions: {
    copyMarkdown: 'Markdown kopiëren',
    copying: 'Kopiëren...',
    copied: 'Gekopieerd!',
    copyFailed: 'Kopiëren mislukt',
    copyMarkdownAria: 'Pagina als Markdown kopiëren',
    open: 'Openen',
    openAria: 'Pagina openen in externe tools',
    openInGitHub: 'Openen in GitHub',
    openInLibreChat: 'Openen in LibreChat',
    openInChatGPT: 'Openen in ChatGPT',
    openInClaude: 'Openen in Claude',
    openInGemini: 'Openen in Gemini',
    openInPerplexity: 'Openen in Perplexity',
    openInCursor: 'Openen in Cursor',
  },
  feedback: {
    question: 'Hoe is deze gids?',
    good: 'Goed',
    bad: 'Slecht',
    thanks: 'Bedankt voor je feedback!',
    submitAgain: 'Opnieuw verzenden',
    placeholder: 'Nog aanvullende feedback? (optioneel)',
    submit: 'Verzenden',
    additionalAria: 'Aanvullende feedback',
  },
  version: {
    label: 'Versie',
    aria: 'Documentatieversie selecteren',
  },
  logoMenu: {
    openNewTab: 'Openen in nieuw tabblad',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Documentatielogo (png)',
    docsLogoSvg: 'Documentatielogo (svg)',
  },
  common: {
    learnMore: 'Meer informatie',
    getStarted: 'Aan de slag',
    readDocs: 'Lees de documentatie',
    viewFullGuide: 'Volledige gids bekijken',
    recommended: 'Aanbevolen',
    prerequisites: 'Vereisten',
    commands: 'Opdrachten',
    explore: 'Verkennen',
    resources: 'Bronnen',
  },
  resources: {
    changelog: { title: 'Wijzigingslogboek', description: 'Nieuwste releases' },
    roadmap: { title: 'Roadmap 2026', description: 'Wat er gepland staat' },
    discord: { title: 'Discord', description: 'Hulp krijgen' },
  },
  docsHub: {
    sections: {
      deploy: 'Deployen',
      configure: 'Configureren',
      use: 'Gebruiken',
      contribute: 'Bijdragen',
    },
    items: {
      quickStart: { title: 'Snelstart', description: 'Docker-installatie in 5 minuten' },
      local: { title: 'Lokale installatie', description: 'Docker, npm en Helm Chart' },
      remote: { title: 'Remote hosting', description: 'DigitalOcean, Railway en meer' },
      configuration: {
        title: 'Configuratie',
        description: 'Omgevingsvariabelen, YAML en authenticatie',
      },
      customEndpoints: {
        title: 'Aangepaste endpoints',
        description: 'Verbind Ollama, Deepseek, Groq en meer',
      },
      features: { title: 'Functies', description: 'MCP, agents, Code Interpreter, artefacten' },
      userGuides: {
        title: 'Gebruikersgidsen',
        description: 'Presets, tips en best practices',
      },
      development: {
        title: 'Ontwikkeling',
        description: 'Bijdragen, architectuur en debugging',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Snelstartgidsen',
    methods: {
      docker: {
        tag: 'Aanbevolen',
        time: '~5 min',
        description: 'Alles inbegrepen — MongoDB, MeiliSearch en RAG API draaien automatisch.',
        steps: [
          'Clone de repository',
          'Kopieer .env.example naar .env',
          'Voer docker compose up uit',
        ],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 min',
        description:
          'Handmatige installatie met Node.js. Vereist aparte MongoDB- en MeiliSearch-instanties.',
        steps: [
          'Clone en installeer afhankelijkheden',
          'Configureer .env en start MongoDB',
          'Voer npm run backend uit',
        ],
        prereqs: ['Node.js v20.19+', 'MongoDB-instantie'],
      },
      railway: {
        tag: 'Eén klik',
        time: '~3 min',
        description:
          'Deploy direct naar de cloud. Geen lokale installatie, geen Docker, geen servers om te beheren.',
        steps: ['Klik op de deployknop', 'Verbind je GitHub', 'Stel omgevingsvariabelen in'],
        prereqs: ['Railway-account', 'GitHub-account'],
      },
    },
    afterInstallationHeading: 'Na installatie',
    connectProviders: {
      title: 'AI-providers verbinden',
      description:
        'Voeg OpenRouter, Ollama, Deepseek, Groq en andere OpenAI-compatibele services toe',
    },
    exploreFeatures: {
      title: 'Functies',
      description: 'Agents, MCP, webzoekfunctie, RAG, artefacten, beeldgeneratie en meer',
    },
    exploreUserGuides: {
      title: 'Gebruikersgidsen',
      description: 'Leer presets en AI-providers gebruiken en door de interface navigeren',
    },
  },
  featuresHub: {
    ariaLabel: 'Functienavigatie',
    featuredHeading: 'Uitgelicht',
    coreFeaturesHeading: 'Kernfuncties',
    hero: {
      title: 'Model Context Protocol',
      description:
        'Verbind AI-modellen met elke externe tool of service via MCP — de open standaard voor AI-toolintegratie',
    },
    highlights: {
      agents: {
        title: 'Agents',
        description:
          'Bouw aangepaste AI-assistenten met tools, bestandsverwerking, code-uitvoering en API-acties — zonder te programmeren.',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description:
          'Voer Python, JavaScript, Go, Rust en meer uit — veilig in een sandbox en zonder installatie.',
      },
      artifacts: {
        title: 'Artefacten',
        description:
          'Genereer React-componenten, HTML-pagina’s en Mermaid-diagrammen direct in de chat.',
      },
      memory: {
        title: 'Geheugen',
        description:
          'Persistente context tussen gesprekken, zodat je AI voorkeuren en geschiedenis onthoudt.',
      },
      webSearch: {
        title: 'Webzoekfunctie',
        description: 'Geef elk model live internettoegang met ingebouwde zoekfunctie en reranking.',
      },
      authentication: {
        title: 'Authenticatie',
        description: 'Enterprise-ready SSO met OAuth2, SAML, LDAP en tweefactorauthenticatie.',
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Zoeken en kennis',
        items: {
          webSearch: {
            title: 'Webzoekfunctie',
            description: 'Live internettoegang met ingebouwde zoekfunctie en reranking',
          },
          search: {
            title: 'Zoeken',
            description: 'Vind berichten en gesprekken met Meilisearch',
          },
          ragApi: {
            title: 'RAG API',
            description: 'Chat met bestanden via retrieval-augmented generation',
          },
          memory: { title: 'Geheugen', description: 'Persistente context tussen gesprekken' },
          ocr: { title: 'OCR', description: 'Extraheer tekst uit afbeeldingen en documenten' },
        },
      },
      media: {
        title: 'Media',
        items: {
          imageGen: {
            title: 'Beeldgeneratie',
            description: 'Maak afbeeldingen met GPT-Image-1, DALL-E, Stable Diffusion en Flux',
          },
          uploadAsText: {
            title: 'Uploaden als tekst',
            description: 'Upload en verwerk bestanden als tekstinvoer',
          },
        },
      },
      chat: {
        title: 'Chat',
        items: {
          fork: { title: 'Fork', description: 'Splits gesprekken in meerdere threads' },
          importConvos: {
            title: 'Gesprekken importeren',
            description: 'Importeer chats uit ChatGPT en andere platforms',
          },
          shareableLinks: {
            title: 'Deelbare links',
            description: 'Deel gesprekken via openbare links',
          },
          temporaryChat: {
            title: 'Tijdelijke chat',
            description: 'Privégesprekken die niet in de geschiedenis worden opgeslagen',
          },
          urlQuery: {
            title: 'URL-queryparameters',
            description: 'Configureer chats dynamisch via de URL',
          },
          resumableStreams: {
            title: 'Hervatbare streams',
            description: 'Automatisch opnieuw verbinden en onderbroken antwoorden hervatten',
          },
        },
      },
      security: {
        title: 'Beveiliging',
        items: {
          authentication: {
            title: 'Authenticatie',
            description: 'Multi-user authenticatie met OAuth2, SAML, LDAP en meer',
          },
          adminPanel: {
            title: 'Beheerpaneel',
            description: 'Browser-UI voor gebruikers, rollen en configuratie-overschrijvingen',
          },
          passwordReset: {
            title: 'Wachtwoord resetten',
            description: 'Wachtwoordherstel via e-mail',
          },
          moderation: {
            title: 'Moderatiesysteem',
            description: 'Contentmoderatie en veiligheidscontroles',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Meegeleverd met Docker',
    bundledNote:
      'Docker Compose beheert alle afhankelijkheden. Met npm of Helm installeer en configureer je deze services afzonderlijk.',
    chooseMethodHeading: 'Kies een methode',
    difficulty: {
      Beginner: 'Beginner',
      Intermediate: 'Gemiddeld',
      Advanced: 'Geavanceerd',
    },
    externalServicesRequired: 'Externe services vereist',
    methods: {
      docker: {
        description:
          'Alles draait in containers. MongoDB, MeiliSearch, RAG API en Vector DB zijn automatisch inbegrepen.',
      },
      npm: {
        description:
          'Voer LibreChat rechtstreeks uit met Node.js. Je beheert externe services zoals MongoDB en MeiliSearch zelf.',
      },
      helm: {
        description:
          'Deploy op Kubernetes met Helm. Het beste voor productieclusters en infrastructure-as-code-workflows.',
      },
    },
    notRunningLocallyHeading: 'Draai je niet lokaal?',
    remoteHosting: {
      title: 'Remote hosting',
      description: 'DigitalOcean, Railway, Azure en meer',
    },
    envConfig: {
      title: '.env-configuratie',
      description: 'Diepgaande gids voor omgevingsvariabelen',
    },
  },
  footer: {
    headings: {
      about: 'Over',
      resources: 'Bronnen',
      documentation: 'Documentatie',
      blog: 'Blog',
      newsletter: 'Nieuwsbrief',
      legal: 'Juridisch',
    },
    items: {
      about: 'Over',
      contactUs: 'Neem contact op',
      features: 'Functies',
      changelog: 'Wijzigingslogboek',
      roadmap: 'Roadmap',
      demo: 'Demo',
      status: 'Status',
      getStarted: 'Aan de slag',
      localInstall: 'Lokale installatie',
      remoteInstall: 'Remote installatie',
      blog: 'Blog',
      blogAuthors: 'Blogauteurs',
      subscribe: 'Abonneren',
      unsubscribe: 'Afmelden',
      termsOfService: 'Servicevoorwaarden',
      privacyPolicy: 'Privacybeleid',
      cookiePolicy: 'Cookiebeleid',
    },
  },
  toolkit: {
    credentials: {
      generate: 'Referenties genereren',
      regenerate: 'Opnieuw genereren',
      generateAria: 'Nieuwe referenties genereren',
      regenerateAria: 'Referenties opnieuw genereren',
      regionAria: 'Gegenereerde referenties',
      copy: 'Kopiëren',
      copying: 'Kopiëren...',
      copied: 'Gekopieerd',
      copyFailed: 'Kopiëren mislukt',
      copyAria: '{label} kopiëren',
      valueAria: '{label}-waarde',
      copyAll: 'Alles kopiëren als .env',
      copiedAll: 'Gekopieerd naar klembord!',
      copyAllAria: 'Alle referenties kopiëren als .env-blok',
      allCopiedStatus: 'Alle 5 referenties gekopieerd als KEY=value-formaat',
      allCopyFailedStatus:
        'Kopiëren naar klembord mislukt. Selecteer en kopieer de waarden handmatig.',
      emptyPrefix:
        'Klik op de knop hierboven om veilige willekeurige referenties te genereren voor je',
      emptySuffix: 'bestand.',
      hints: {
        CREDS_KEY: 'Versleutelingssleutel voor opgeslagen referenties',
        CREDS_IV: 'Initialisatievector voor versleuteling',
        JWT_SECRET: 'Geheim voor het ondertekenen van toegangstokens',
        JWT_REFRESH_SECRET: 'Geheim voor het ondertekenen van vernieuwingstokens',
        MEILI_KEY: 'MeiliSearch-mastersleutel',
      },
    },
    yaml: {
      dropFile: 'Zet YAML-bestand hier neer',
      placeholder: 'Plak hier je librechat.yaml-inhoud, of sleep een bestand hierheen...',
      empty: 'Validatieresultaten verschijnen hier zodra je YAML plakt of neerzet.',
      valid: 'YAML is geldig!',
      clear: 'Wissen',
      clearAria: 'Editor wissen',
      badIndentation:
        'Onjuiste inspringing op regel {line}. Elke YAML-vermelding moet correct ingesprongen zijn.',
      errorAtLine: '{reason} op regel {line}',
      unknownError: 'Onbekende YAML-fout',
    },
  },
  home: {
    metaTitle: 'LibreChat - Het open-source AI-platform',
    metaDescription:
      'LibreChat brengt al je AI-gesprekken samen in één uniforme, aanpasbare interface.',
    starOnGitHub: 'Ster geven op GitHub',
    starAria: 'Geef LibreChat een ster op GitHub — {count} sterren',
    heroTitleTop: 'Het open-source',
    heroTitleBottom: 'AI-platform',
    heroSubtitle:
      'LibreChat brengt al je AI-gesprekken samen in één uniforme, aanpasbare interface',
    getStarted: 'Aan de slag',
    getStartedAria: 'Aan de slag met de LibreChat-documentatie',
    tryDemo: 'Demo proberen',
    tryDemoAria: 'Probeer de LibreChat-demo',
    desktopLightAlt: 'LibreChat desktopinterface in lichte modus',
    desktopDarkAlt: 'LibreChat desktopinterface in donkere modus',
    mobileLightAlt: 'LibreChat mobiele interface in lichte modus',
    mobileDarkAlt: 'LibreChat mobiele interface in donkere modus',
    trustedBy: 'Vertrouwd door bedrijven wereldwijd',
    featuresHeading: 'Alles wat je nodig hebt',
    featuresSubtitle: 'Een compleet platform voor AI-gestuurde gesprekken',
    primaryActionsAria: 'Primaire acties',
    features: {
      agents: {
        title: 'Agents',
        description: 'Geavanceerde agents met bestandsverwerking, code-interpretatie en API-acties',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: 'Voer code in meerdere talen veilig uit zonder installatie',
      },
      models: {
        title: 'Modellen',
        description: 'AI-modelselectie met Anthropic, AWS, OpenAI, Azure en meer',
      },
      artifacts: {
        title: 'Artefacten',
        description: 'Maak React-code, HTML en Mermaid-diagrammen in de chat',
      },
      search: {
        title: 'Zoeken',
        description: 'Zoek direct naar berichten, bestanden en codefragmenten',
      },
      mcp: {
        title: 'MCP',
        description:
          'Verbind met elke tool of service met ondersteuning voor Model Context Protocol',
      },
      memory: {
        title: 'Geheugen',
        description: 'Persistente context tussen gesprekken, zodat je AI jou onthoudt',
      },
      webSearch: {
        title: 'Webzoekfunctie',
        description: 'Geef elk model live internettoegang met ingebouwde zoekfunctie en reranking',
      },
      authentication: {
        title: 'Authenticatie',
        description: 'Enterprise-ready SSO met OAuth, SAML, LDAP en tweefactorauthenticatie',
      },
    },
    learnMore: 'Meer informatie',
    communityHeading: 'Open source, community-gedreven',
    communitySubtitle:
      'Sluit je aan bij duizenden ontwikkelaars en organisaties die bouwen met LibreChat',
    githubStars: 'GitHub-sterren',
    dockerPulls: 'Docker-pulls',
    contributors: 'Bijdragers',
    communityLinksAria: 'Communitylinks',
    githubAria: 'LibreChat op GitHub',
    discordAria: 'LibreChat op Discord',
    ctaHeading: 'Begin met bouwen met LibreChat',
    ctaSubtitle: 'Ga in enkele minuten aan de slag met onze snelstartgids',
    quickstartGuide: 'Snelstartgids',
    quickstartAria: 'Lees de snelstartgids',
  },
}
