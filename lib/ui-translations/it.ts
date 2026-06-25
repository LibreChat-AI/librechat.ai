import type { UIStrings } from '@/lib/ui-i18n'

export const it: UIStrings = {
  nav: {
    docs: 'Documentazione',
    blog: 'Blog',
    changelog: 'Registro modifiche',
    discord: 'Discord',
    joinDiscord: 'Unisciti a Discord',
  },
  pageActions: {
    copyMarkdown: 'Copia Markdown',
    copyMarkdownAria: 'Copia la pagina come Markdown',
    open: 'Apri',
    openAria: 'Apri la pagina in strumenti esterni',
    openInGitHub: 'Apri in GitHub',
    openInLibreChat: 'Apri in LibreChat',
    openInChatGPT: 'Apri in ChatGPT',
    openInClaude: 'Apri in Claude',
    openInGemini: 'Apri in Gemini',
    openInPerplexity: 'Apri in Perplexity',
    openInCursor: 'Apri in Cursor',
  },
  feedback: {
    question: 'Com’è questa guida?',
    good: 'Buona',
    bad: 'Scarsa',
    thanks: 'Grazie per il feedback!',
    submitAgain: 'Invia di nuovo',
    placeholder: 'Altri commenti? (facoltativo)',
    submit: 'Invia',
    additionalAria: 'Feedback aggiuntivo',
  },
  version: {
    label: 'Versione',
    aria: 'Seleziona la versione della documentazione',
  },
  logoMenu: {
    openNewTab: 'Apri in una nuova scheda',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Logo documentazione (png)',
    docsLogoSvg: 'Logo documentazione (svg)',
  },
  common: {
    learnMore: 'Scopri di più',
    getStarted: 'Inizia',
    readDocs: 'Leggi la documentazione',
    viewFullGuide: 'Vedi la guida completa',
    recommended: 'Consigliato',
    prerequisites: 'Prerequisiti',
    commands: 'Comandi',
    explore: 'Esplora',
    resources: 'Risorse',
  },
  resources: {
    changelog: { title: 'Registro modifiche', description: 'Ultime versioni' },
    roadmap: { title: 'Roadmap 2026', description: 'Cosa è pianificato' },
    discord: { title: 'Discord', description: 'Ottieni aiuto' },
  },
  docsHub: {
    sections: {
      deploy: 'Distribuisci',
      configure: 'Configura',
      use: 'Usa',
      contribute: 'Contribuisci',
    },
    items: {
      quickStart: { title: 'Avvio rapido', description: 'Configurazione Docker in 5 minuti' },
      local: { title: 'Installazione locale', description: 'Docker, npm e Helm Chart' },
      remote: { title: 'Hosting remoto', description: 'DigitalOcean, Railway e altro' },
      configuration: {
        title: 'Configurazione',
        description: 'Variabili di ambiente, YAML e autenticazione',
      },
      customEndpoints: {
        title: 'Endpoint personalizzati',
        description: 'Connetti Ollama, Deepseek, Groq e altro',
      },
      features: { title: 'Funzionalità', description: 'MCP, agenti, Code Interpreter, artefatti' },
      userGuides: {
        title: 'Guide utente',
        description: 'Preset, consigli e buone pratiche',
      },
      development: {
        title: 'Sviluppo',
        description: 'Contributi, architettura e debug',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Guide di avvio rapido',
    methods: {
      docker: {
        tag: 'Consigliato',
        time: '~5 min',
        description:
          'Tutto incluso — MongoDB, MeiliSearch e RAG API vengono eseguiti automaticamente.',
        steps: ['Clona il repository', 'Copia .env.example in .env', 'Esegui docker compose up'],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 min',
        description:
          'Configurazione manuale con Node.js. Richiede istanze separate di MongoDB e MeiliSearch.',
        steps: [
          'Clona e installa le dipendenze',
          'Configura .env e avvia MongoDB',
          'Esegui npm run backend',
        ],
        prereqs: ['Node.js v20.19+', 'Istanza MongoDB'],
      },
      railway: {
        tag: 'Un clic',
        time: '~3 min',
        description:
          'Distribuisci subito nel cloud. Nessuna configurazione locale, niente Docker, nessun server da gestire.',
        steps: [
          'Fai clic sul pulsante di distribuzione',
          'Collega GitHub',
          'Imposta le variabili di ambiente',
        ],
        prereqs: ['Account Railway', 'Account GitHub'],
      },
    },
    afterInstallationHeading: "Dopo l'installazione",
    connectProviders: {
      title: 'Connetti provider AI',
      description:
        'Aggiungi OpenRouter, Ollama, Deepseek, Groq e altri servizi compatibili con OpenAI',
    },
    exploreFeatures: {
      title: 'Funzionalità',
      description: 'Agenti, MCP, ricerca web, RAG, artefatti, generazione immagini e altro',
    },
    exploreUserGuides: {
      title: 'Guide utente',
      description: "Scopri come usare preset, provider AI e navigare all'interno dell'interfaccia",
    },
  },
  featuresHub: {
    ariaLabel: 'Navigazione funzionalità',
    featuredHeading: 'In evidenza',
    coreFeaturesHeading: 'Funzionalità principali',
    hero: {
      title: 'Model Context Protocol',
      description:
        'Connetti i modelli AI a qualsiasi strumento o servizio esterno tramite MCP — lo standard aperto per integrare strumenti AI',
    },
    highlights: {
      agents: {
        title: 'Agenti',
        description:
          'Crea assistenti AI personalizzati con strumenti, gestione file, esecuzione di codice e azioni API — senza programmare.',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description:
          'Esegui Python, JavaScript, Go, Rust e altro — in modo sicuro in sandbox e senza configurazione.',
      },
      artifacts: {
        title: 'Artefatti',
        description:
          'Genera componenti React, pagine HTML e diagrammi Mermaid direttamente nella chat.',
      },
      memory: {
        title: 'Memoria',
        description:
          'Contesto persistente tra le conversazioni, così la tua AI ricorda preferenze e cronologia.',
      },
      webSearch: {
        title: 'Ricerca web',
        description:
          'Dai a qualsiasi modello accesso live a internet con ricerca e reranking integrati.',
      },
      authentication: {
        title: 'Autenticazione',
        description:
          'SSO pronto per aziende con OAuth2, SAML, LDAP e autenticazione a due fattori.',
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Ricerca e conoscenza',
        items: {
          webSearch: {
            title: 'Ricerca web',
            description: 'Accesso live a internet con ricerca e reranking integrati',
          },
          search: {
            title: 'Ricerca',
            description: 'Trova messaggi e conversazioni con Meilisearch',
          },
          ragApi: {
            title: 'RAG API',
            description: 'Chatta con i file usando retrieval-augmented generation',
          },
          memory: { title: 'Memoria', description: 'Contesto persistente tra conversazioni' },
          ocr: { title: 'OCR', description: 'Estrai testo da immagini e documenti' },
        },
      },
      media: {
        title: 'Media',
        items: {
          imageGen: {
            title: 'Generazione immagini',
            description: 'Crea immagini con GPT-Image-1, DALL-E, Stable Diffusion e Flux',
          },
          uploadAsText: {
            title: 'Carica come testo',
            description: 'Carica ed elabora file come input testuale',
          },
        },
      },
      chat: {
        title: 'Chat',
        items: {
          fork: { title: 'Fork', description: 'Dividi le conversazioni in più thread' },
          importConvos: {
            title: 'Importa conversazioni',
            description: 'Importa chat da ChatGPT e altre piattaforme',
          },
          shareableLinks: {
            title: 'Link condivisibili',
            description: 'Condividi conversazioni tramite link pubblici',
          },
          temporaryChat: {
            title: 'Chat temporanea',
            description: 'Conversazioni private che non vengono salvate nella cronologia',
          },
          urlQuery: {
            title: 'Parametri query URL',
            description: 'Configura le chat dinamicamente tramite URL',
          },
          resumableStreams: {
            title: 'Stream ripristinabili',
            description: 'Riconnessione automatica e ripresa delle risposte interrotte',
          },
        },
      },
      security: {
        title: 'Sicurezza',
        items: {
          authentication: {
            title: 'Autenticazione',
            description: 'Autenticazione multiutente con OAuth2, SAML, LDAP e altro',
          },
          adminPanel: {
            title: 'Pannello amministratore',
            description: 'UI browser per utenti, ruoli e override di configurazione',
          },
          passwordReset: {
            title: 'Reimpostazione password',
            description: 'Recupero password via email',
          },
          moderation: {
            title: 'Sistema di moderazione',
            description: 'Moderazione dei contenuti e controlli di sicurezza',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Incluso con Docker',
    bundledNote:
      'Docker Compose gestisce tutte le dipendenze. Con npm o Helm, installi e configuri questi servizi separatamente.',
    chooseMethodHeading: 'Scegli un metodo',
    difficulty: {
      Beginner: 'Principiante',
      Intermediate: 'Intermedio',
      Advanced: 'Avanzato',
    },
    externalServicesRequired: 'Servizi esterni richiesti',
    methods: {
      docker: {
        description:
          'Tutto gira in container. MongoDB, MeiliSearch, RAG API e Vector DB sono inclusi automaticamente.',
      },
      npm: {
        description:
          'Esegui LibreChat direttamente con Node.js. Gestisci tu servizi esterni come MongoDB e MeiliSearch.',
      },
      helm: {
        description:
          'Distribuisci su Kubernetes usando Helm. Ideale per cluster di produzione e workflow infrastructure-as-code.',
      },
    },
    notRunningLocallyHeading: 'Non lo esegui in locale?',
    remoteHosting: {
      title: 'Hosting remoto',
      description: 'DigitalOcean, Railway, Azure e altro',
    },
    envConfig: {
      title: 'Configurazione .env',
      description: 'Guida approfondita alle variabili di ambiente',
    },
  },
  footer: {
    headings: {
      about: 'Informazioni',
      resources: 'Risorse',
      documentation: 'Documentazione',
      blog: 'Blog',
      newsletter: 'Newsletter',
      legal: 'Note legali',
    },
    items: {
      about: 'Informazioni',
      contactUs: 'Contattaci',
      features: 'Funzionalità',
      changelog: 'Registro modifiche',
      roadmap: 'Roadmap',
      demo: 'Demo',
      status: 'Stato',
      getStarted: 'Inizia',
      localInstall: 'Installazione locale',
      remoteInstall: 'Installazione remota',
      blog: 'Blog',
      blogAuthors: 'Autori del blog',
      subscribe: 'Iscriviti',
      unsubscribe: 'Annulla iscrizione',
      termsOfService: 'Termini di servizio',
      privacyPolicy: 'Informativa sulla privacy',
      cookiePolicy: 'Informativa sui cookie',
    },
  },
  toolkit: {
    credentials: {
      generate: 'Genera credenziali',
      regenerate: 'Rigenera credenziali',
      generateAria: 'Genera nuove credenziali',
      regionAria: 'Credenziali generate',
      copy: 'Copia',
      copied: 'Copiato',
      copyAria: 'Copia {label}',
      valueAria: 'Valore {label}',
      copyAll: 'Copia tutto come .env',
      copiedAll: 'Copiato negli appunti!',
      copyAllAria: 'Copia tutte le credenziali come blocco .env',
      allCopiedStatus: 'Tutte e 5 le credenziali copiate nel formato KEY=value',
      emptyPrefix: 'Fai clic sul pulsante sopra per generare credenziali casuali sicure per il tuo',
      emptySuffix: 'file.',
      hints: {
        CREDS_KEY: 'Chiave di crittografia per le credenziali salvate',
        CREDS_IV: 'Vettore di inizializzazione per la crittografia',
        JWT_SECRET: 'Segreto per firmare i token di accesso',
        JWT_REFRESH_SECRET: 'Segreto per firmare i token di aggiornamento',
        MEILI_KEY: 'Chiave master di MeiliSearch',
      },
    },
    yaml: {
      dropFile: 'Rilascia qui il file YAML',
      placeholder: 'Incolla qui il contenuto di librechat.yaml oppure trascina un file...',
      empty: 'I risultati della validazione appariranno qui dopo aver incollato o rilasciato YAML.',
      valid: 'YAML valido!',
      clear: 'Cancella',
      clearAria: "Cancella l'editor",
      badIndentation:
        'Indentazione errata alla riga {line}. Ogni voce YAML deve essere indentata correttamente.',
      errorAtLine: '{reason} alla riga {line}',
      unknownError: 'Errore YAML sconosciuto',
    },
  },
  home: {
    metaTitle: 'LibreChat - La piattaforma AI open-source',
    metaDescription:
      'LibreChat riunisce tutte le tue conversazioni AI in un’unica interfaccia personalizzabile.',
    starOnGitHub: 'Aggiungi una stella su GitHub',
    starAria: 'Aggiungi una stella a LibreChat su GitHub — {count} stelle',
    heroTitleTop: 'La piattaforma',
    heroTitleBottom: 'AI open-source',
    heroSubtitle:
      'LibreChat riunisce tutte le tue conversazioni AI in un’unica interfaccia personalizzabile',
    getStarted: 'Inizia',
    getStartedAria: 'Inizia con la documentazione di LibreChat',
    tryDemo: 'Prova la demo',
    tryDemoAria: 'Prova la demo di LibreChat',
    desktopLightAlt: 'Interfaccia desktop di LibreChat in modalità chiara',
    desktopDarkAlt: 'Interfaccia desktop di LibreChat in modalità scura',
    mobileLightAlt: 'Interfaccia mobile di LibreChat in modalità chiara',
    mobileDarkAlt: 'Interfaccia mobile di LibreChat in modalità scura',
    trustedBy: 'Scelto da aziende in tutto il mondo',
    featuresHeading: 'Tutto ciò che ti serve',
    featuresSubtitle: 'Una piattaforma completa per conversazioni basate su AI',
    primaryActionsAria: 'Azioni principali',
    features: {
      agents: {
        title: 'Agenti',
        description: 'Agenti avanzati con gestione file, interpretazione codice e azioni API',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: 'Esegui codice in più linguaggi in modo sicuro e senza configurazione',
      },
      models: {
        title: 'Modelli',
        description: 'Selezione di modelli AI inclusi Anthropic, AWS, OpenAI, Azure e altri',
      },
      artifacts: {
        title: 'Artefatti',
        description: 'Crea codice React, HTML e diagrammi Mermaid nella chat',
      },
      search: {
        title: 'Ricerca',
        description: 'Cerca messaggi, file e frammenti di codice in un istante',
      },
      mcp: {
        title: 'MCP',
        description:
          'Connettiti a qualsiasi strumento o servizio con supporto Model Context Protocol',
      },
      memory: {
        title: 'Memoria',
        description: 'Contesto persistente tra conversazioni, così la tua AI si ricorda di te',
      },
      webSearch: {
        title: 'Ricerca web',
        description:
          'Dai a qualsiasi modello accesso live a internet con ricerca e reranking integrati',
      },
      authentication: {
        title: 'Autenticazione',
        description: 'SSO pronto per aziende con OAuth, SAML, LDAP e autenticazione a due fattori',
      },
    },
    learnMore: 'Scopri di più',
    communityHeading: 'Open source, guidato dalla community',
    communitySubtitle:
      'Unisciti a migliaia di sviluppatori e organizzazioni che costruiscono con LibreChat',
    githubStars: 'Stelle GitHub',
    dockerPulls: 'Download Docker',
    contributors: 'Contributori',
    communityLinksAria: 'Link della community',
    githubAria: 'LibreChat su GitHub',
    discordAria: 'LibreChat su Discord',
    ctaHeading: 'Inizia a costruire con LibreChat',
    ctaSubtitle: 'Configura tutto in pochi minuti con la nostra guida di avvio rapido',
    quickstartGuide: 'Guida di avvio rapido',
    quickstartAria: 'Leggi la guida di avvio rapido',
  },
}
