import type { UIStrings } from '@/lib/ui-i18n'

export const fr: UIStrings = {
  nav: {
    docs: 'Documentation',
    blog: 'Blog',
    changelog: 'Journal des modifications',
    discord: 'Discord',
    joinDiscord: 'Rejoindre Discord',
  },
  pageActions: {
    copyMarkdown: 'Copier le Markdown',
    copyMarkdownAria: 'Copier la page au format Markdown',
    open: 'Ouvrir',
    openAria: 'Ouvrir la page dans des outils externes',
    openInGitHub: 'Ouvrir dans GitHub',
    openInLibreChat: 'Ouvrir dans LibreChat',
    openInChatGPT: 'Ouvrir dans ChatGPT',
    openInClaude: 'Ouvrir dans Claude',
    openInGemini: 'Ouvrir dans Gemini',
    openInPerplexity: 'Ouvrir dans Perplexity',
    openInCursor: 'Ouvrir dans Cursor',
  },
  feedback: {
    question: 'Que pensez-vous de ce guide ?',
    good: 'Bien',
    bad: 'Mauvais',
    thanks: 'Merci pour votre retour !',
    submitAgain: 'Envoyer à nouveau',
    placeholder: 'Un commentaire supplémentaire ? (facultatif)',
    submit: 'Envoyer',
    additionalAria: 'Commentaire supplémentaire',
  },
  version: {
    label: 'Version',
    aria: 'Sélectionner la version de la documentation',
  },
  logoMenu: {
    openNewTab: 'Ouvrir dans un nouvel onglet',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Logo de la documentation (png)',
    docsLogoSvg: 'Logo de la documentation (svg)',
  },
  common: {
    learnMore: 'En savoir plus',
    getStarted: 'Commencer',
    readDocs: 'Lire la documentation',
    viewFullGuide: 'Voir le guide complet',
    recommended: 'Recommandé',
    prerequisites: 'Prérequis',
    commands: 'Commandes',
    explore: 'Explorer',
    resources: 'Ressources',
  },
  // Shared resource cards used by both DocsHub and QuickStartHub.
  resources: {
    changelog: { title: 'Journal des modifications', description: 'Dernières versions' },
    roadmap: { title: 'Feuille de route 2026', description: 'Ce qui est prévu' },
    discord: { title: 'Discord', description: "Obtenir de l'aide" },
  },
  docsHub: {
    sections: {
      deploy: 'Déployer',
      configure: 'Configurer',
      use: 'Utiliser',
      contribute: 'Contribuer',
    },
    items: {
      quickStart: { title: 'Démarrage rapide', description: 'Installation Docker en 5 minutes' },
      local: { title: 'Installation locale', description: 'Docker, npm et Helm Chart' },
      remote: { title: 'Hébergement distant', description: 'DigitalOcean, Railway et plus encore' },
      configuration: {
        title: 'Configuration',
        description: "Variables d'environnement, YAML et authentification",
      },
      customEndpoints: {
        title: 'Points de terminaison personnalisés',
        description: 'Connecter Ollama, Deepseek, Groq et plus encore',
      },
      features: {
        title: 'Fonctionnalités',
        description: 'MCP, Agents, Interpréteur de code, Artefacts',
      },
      userGuides: {
        title: 'Guides utilisateur',
        description: 'Préréglages, astuces et bonnes pratiques',
      },
      development: {
        title: 'Développement',
        description: 'Contribution, architecture et débogage',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Guides de démarrage rapide',
    methods: {
      docker: {
        tag: 'Recommandé',
        time: '~5 min',
        description:
          "Tout est inclus — MongoDB, MeiliSearch et RAG API s'exécutent automatiquement.",
        steps: ['Cloner le dépôt', 'Copier .env.example vers .env', 'Exécuter docker compose up'],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 min',
        description:
          'Installation manuelle avec Node.js. Nécessite des instances distinctes de MongoDB et MeiliSearch.',
        steps: [
          'Cloner et installer les dépendances',
          'Configurer .env et démarrer MongoDB',
          'Exécuter npm run backend',
        ],
        prereqs: ['Node.js v20.19+', 'Instance MongoDB'],
      },
      railway: {
        tag: 'En un clic',
        time: '~3 min',
        description:
          'Déployez dans le cloud instantanément. Aucune installation locale, aucun Docker, aucun serveur à gérer.',
        steps: [
          'Cliquer sur le bouton de déploiement',
          'Connecter votre GitHub',
          "Définir les variables d'environnement",
        ],
        prereqs: ['Compte Railway', 'Compte GitHub'],
      },
    },
    afterInstallationHeading: "Après l'installation",
    connectProviders: {
      title: 'Connecter des fournisseurs IA',
      description:
        'Ajoutez OpenRouter, Ollama, Deepseek, Groq et autres services compatibles OpenAI',
    },
    exploreFeatures: {
      title: 'Fonctionnalités',
      description: "Agents, MCP, recherche web, RAG, artefacts, génération d'images et plus encore",
    },
    exploreUserGuides: {
      title: 'Guides utilisateur',
      description:
        "Apprenez à utiliser les préréglages, les fournisseurs IA et à naviguer dans l'interface",
    },
  },
  featuresHub: {
    ariaLabel: 'Navigation des fonctionnalités',
    featuredHeading: 'À la une',
    coreFeaturesHeading: 'Fonctionnalités principales',
    hero: {
      title: 'Model Context Protocol',
      description:
        "Connectez des modèles IA à n'importe quel outil ou service externe via MCP — la norme ouverte pour l'intégration d'outils IA",
    },
    highlights: {
      agents: {
        title: 'Agents',
        description:
          'Créez des assistants IA personnalisés avec outils, gestion de fichiers, exécution de code et actions API — sans aucun code requis.',
      },
      codeInterpreter: {
        title: 'Interpréteur de code',
        description:
          'Exécutez du Python, JavaScript, Go, Rust et plus encore — dans un bac à sable sécurisé, sans aucune configuration.',
      },
      artifacts: {
        title: 'Artefacts',
        description:
          'Générez des composants React, des pages HTML et des diagrammes Mermaid directement dans le chat.',
      },
      memory: {
        title: 'Mémoire',
        description:
          'Contexte persistant entre les conversations pour que votre IA se souvienne de vos préférences et de votre historique.',
      },
      webSearch: {
        title: 'Recherche web',
        description:
          "Donnez à n'importe quel modèle un accès à Internet en temps réel grâce à la recherche et au reclassement intégrés.",
      },
      authentication: {
        title: 'Authentification',
        description:
          "SSO prêt pour l'entreprise avec OAuth2, SAML, LDAP et authentification à deux facteurs.",
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Recherche et connaissances',
        items: {
          webSearch: {
            title: 'Recherche web',
            description: 'Accès à Internet en temps réel avec recherche et reclassement intégrés',
          },
          search: {
            title: 'Recherche',
            description: 'Trouvez des messages et des conversations avec Meilisearch',
          },
          ragApi: {
            title: 'RAG API',
            description:
              'Discutez avec vos fichiers grâce à la génération augmentée par récupération',
          },
          memory: { title: 'Mémoire', description: 'Contexte persistant entre les conversations' },
          ocr: { title: 'OCR', description: "Extrayez du texte à partir d'images et de documents" },
        },
      },
      media: {
        title: 'Médias',
        items: {
          imageGen: {
            title: "Génération d'images",
            description: 'Créez des images avec GPT-Image-1, DALL-E, Stable Diffusion et Flux',
          },
          uploadAsText: {
            title: 'Importer en tant que texte',
            description: 'Importez et traitez des fichiers comme entrée textuelle',
          },
        },
      },
      chat: {
        title: 'Chat',
        items: {
          fork: { title: 'Bifurquer', description: 'Divisez les conversations en plusieurs fils' },
          importConvos: {
            title: 'Importer des conversations',
            description: "Importez des conversations depuis ChatGPT et d'autres plateformes",
          },
          shareableLinks: {
            title: 'Liens partageables',
            description: 'Partagez des conversations via des liens publics',
          },
          temporaryChat: {
            title: 'Chat temporaire',
            description: "Conversations privées qui ne sont pas enregistrées dans l'historique",
          },
          urlQuery: {
            title: "Paramètres de requête d'URL",
            description: 'Configurez les conversations dynamiquement via une URL',
          },
          resumableStreams: {
            title: 'Flux reprenables',
            description: 'Reconnexion automatique et reprise des réponses interrompues',
          },
        },
      },
      security: {
        title: 'Sécurité',
        items: {
          authentication: {
            title: 'Authentification',
            description:
              'Authentification multi-utilisateurs avec OAuth2, SAML, LDAP et plus encore',
          },
          adminPanel: {
            title: 'Panneau d’administration',
            description:
              'Interface web pour les utilisateurs, les rôles et les remplacements de configuration',
          },
          passwordReset: {
            title: 'Réinitialisation du mot de passe',
            description: 'Récupération du mot de passe par e-mail',
          },
          moderation: {
            title: 'Système de modération',
            description: 'Modération du contenu et contrôles de sécurité',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Inclus avec Docker',
    bundledNote:
      'Docker Compose gère toutes les dépendances. Avec npm ou Helm, vous installez et configurez ces services séparément.',
    chooseMethodHeading: 'Choisir une méthode',
    difficulty: {
      Beginner: 'Débutant',
      Intermediate: 'Intermédiaire',
      Advanced: 'Avancé',
    },
    externalServicesRequired: 'Services externes requis',
    methods: {
      docker: {
        description:
          "Tout s'exécute dans des conteneurs. MongoDB, MeiliSearch, RAG API et Vector DB sont tous inclus automatiquement.",
      },
      npm: {
        description:
          'Exécutez LibreChat directement avec Node.js. Vous gérez vous-même les services externes comme MongoDB et MeiliSearch.',
      },
      helm: {
        description:
          'Déployez sur Kubernetes avec Helm. Idéal pour les clusters de production et les workflows infrastructure-as-code.',
      },
    },
    notRunningLocallyHeading: "Pas d'exécution en local ?",
    remoteHosting: {
      title: 'Hébergement distant',
      description: 'DigitalOcean, Railway, Azure et plus encore',
    },
    envConfig: {
      title: 'Configuration .env',
      description: "Guide détaillé pour les variables d'environnement",
    },
  },
  footer: {
    headings: {
      about: 'À propos',
      resources: 'Ressources',
      documentation: 'Documentation',
      blog: 'Blog',
      newsletter: 'Newsletter',
      legal: 'Mentions légales',
    },
    items: {
      about: 'À propos',
      contactUs: 'Nous contacter',
      features: 'Fonctionnalités',
      changelog: 'Journal des modifications',
      roadmap: 'Feuille de route',
      demo: 'Démo',
      status: 'Statut',
      getStarted: 'Commencer',
      localInstall: 'Installation locale',
      remoteInstall: 'Installation distante',
      blog: 'Blog',
      blogAuthors: 'Auteurs du blog',
      subscribe: "S'abonner",
      unsubscribe: 'Se désabonner',
      termsOfService: "Conditions d'utilisation",
      privacyPolicy: 'Politique de confidentialité',
      cookiePolicy: 'Politique relative aux cookies',
    },
  },
  home: {
    metaTitle: 'LibreChat - La plateforme IA open source',
    metaDescription:
      'LibreChat réunit toutes vos conversations IA dans une seule interface unifiée et personnalisable.',
    starOnGitHub: 'Mettre une étoile sur GitHub',
    starAria: 'Mettre une étoile à LibreChat sur GitHub — {count} étoiles',
    heroTitleTop: 'La plateforme IA',
    heroTitleBottom: 'open source',
    heroSubtitle:
      'LibreChat réunit toutes vos conversations IA dans une seule interface unifiée et personnalisable',
    getStarted: 'Commencer',
    getStartedAria: 'Commencer avec la documentation de LibreChat',
    tryDemo: 'Essayer la démo',
    tryDemoAria: 'Essayer la démo de LibreChat',
    desktopLightAlt: 'Interface bureau de LibreChat en mode clair',
    desktopDarkAlt: 'Interface bureau de LibreChat en mode sombre',
    mobileLightAlt: 'Interface mobile de LibreChat en mode clair',
    mobileDarkAlt: 'Interface mobile de LibreChat en mode sombre',
    trustedBy: 'Approuvé par des entreprises du monde entier',
    featuresHeading: 'Tout ce dont vous avez besoin',
    featuresSubtitle: "Une plateforme complète pour des conversations propulsées par l'IA",
    primaryActionsAria: 'Actions principales',
    features: {
      agents: {
        title: 'Agents',
        description:
          'Agents avancés avec gestion de fichiers, interprétation de code et actions API',
      },
      codeInterpreter: {
        title: 'Interpréteur de code',
        description:
          'Exécutez du code dans plusieurs langages en toute sécurité, sans configuration',
      },
      models: {
        title: 'Modèles',
        description:
          'Sélection de modèles IA incluant Anthropic, AWS, OpenAI, Azure et plus encore',
      },
      artifacts: {
        title: 'Artefacts',
        description: 'Créez du code React, HTML et des diagrammes Mermaid dans le chat',
      },
      search: {
        title: 'Recherche',
        description: 'Recherchez des messages, des fichiers et des extraits de code en un instant',
      },
      mcp: {
        title: 'MCP',
        description:
          "Connectez-vous à n'importe quel outil ou service grâce à la prise en charge de Model Context Protocol",
      },
      memory: {
        title: 'Mémoire',
        description:
          'Contexte persistant entre les conversations pour que votre IA se souvienne de vous',
      },
      webSearch: {
        title: 'Recherche web',
        description:
          "Donnez à n'importe quel modèle un accès à Internet en temps réel avec recherche et reclassement intégrés",
      },
      authentication: {
        title: 'Authentification',
        description:
          "SSO prêt pour l'entreprise avec OAuth, SAML, LDAP et authentification à deux facteurs",
      },
    },
    learnMore: 'En savoir plus',
    communityHeading: 'Open source, porté par la communauté',
    communitySubtitle:
      "Rejoignez des milliers de développeurs et d'organisations qui construisent avec LibreChat",
    githubStars: 'Étoiles GitHub',
    dockerPulls: 'Téléchargements Docker',
    contributors: 'Contributeurs',
    communityLinksAria: 'Liens de la communauté',
    githubAria: 'LibreChat sur GitHub',
    discordAria: 'LibreChat sur Discord',
    ctaHeading: 'Commencez à construire avec LibreChat',
    ctaSubtitle: 'Soyez opérationnel en quelques minutes grâce à notre guide de démarrage rapide',
    quickstartGuide: 'Guide de démarrage rapide',
    quickstartAria: 'Lire le guide de démarrage rapide',
  },
}
