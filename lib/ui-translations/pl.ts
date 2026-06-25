import type { UIStrings } from '@/lib/ui-i18n'

export const pl: UIStrings = {
  nav: {
    docs: 'Dokumentacja',
    blog: 'Blog',
    changelog: 'Dziennik zmian',
    discord: 'Discord',
    joinDiscord: 'Dołącz do Discorda',
  },
  pageActions: {
    copyMarkdown: 'Kopiuj Markdown',
    copyMarkdownAria: 'Kopiuj stronę jako Markdown',
    open: 'Otwórz',
    openAria: 'Otwórz stronę w zewnętrznych narzędziach',
    openInGitHub: 'Otwórz w GitHub',
    openInLibreChat: 'Otwórz w LibreChat',
    openInChatGPT: 'Otwórz w ChatGPT',
    openInClaude: 'Otwórz w Claude',
    openInGemini: 'Otwórz w Gemini',
    openInPerplexity: 'Otwórz w Perplexity',
    openInCursor: 'Otwórz w Cursor',
  },
  feedback: {
    question: 'Jaka jest ta instrukcja?',
    good: 'Dobra',
    bad: 'Słaba',
    thanks: 'Dziękujemy za opinię!',
    submitAgain: 'Wyślij ponownie',
    placeholder: 'Dodatkowe uwagi? (opcjonalnie)',
    submit: 'Wyślij',
    additionalAria: 'Dodatkowa opinia',
  },
  version: {
    label: 'Wersja',
    aria: 'Wybierz wersję dokumentacji',
  },
  logoMenu: {
    openNewTab: 'Otwórz w nowej karcie',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Logo dokumentacji (png)',
    docsLogoSvg: 'Logo dokumentacji (svg)',
  },
  common: {
    learnMore: 'Dowiedz się więcej',
    getStarted: 'Zacznij',
    readDocs: 'Czytaj dokumentację',
    viewFullGuide: 'Zobacz pełny przewodnik',
    recommended: 'Zalecane',
    prerequisites: 'Wymagania wstępne',
    commands: 'Polecenia',
    explore: 'Odkrywaj',
    resources: 'Zasoby',
  },
  resources: {
    changelog: { title: 'Dziennik zmian', description: 'Najnowsze wydania' },
    roadmap: { title: 'Roadmap 2026', description: 'Co jest planowane' },
    discord: { title: 'Discord', description: 'Uzyskaj pomoc' },
  },
  docsHub: {
    sections: {
      deploy: 'Wdróż',
      configure: 'Skonfiguruj',
      use: 'Używaj',
      contribute: 'Współtwórz',
    },
    items: {
      quickStart: { title: 'Szybki start', description: 'Konfiguracja Docker w 5 minut' },
      local: { title: 'Instalacja lokalna', description: 'Docker, npm i Helm Chart' },
      remote: { title: 'Hosting zdalny', description: 'DigitalOcean, Railway i więcej' },
      configuration: {
        title: 'Konfiguracja',
        description: 'Zmienne środowiskowe, YAML i uwierzytelnianie',
      },
      customEndpoints: {
        title: 'Niestandardowe endpointy',
        description: 'Połącz Ollama, Deepseek, Groq i więcej',
      },
      features: { title: 'Funkcje', description: 'MCP, agenci, Code Interpreter, artefakty' },
      userGuides: {
        title: 'Przewodniki użytkownika',
        description: 'Presety, wskazówki i dobre praktyki',
      },
      development: {
        title: 'Rozwój',
        description: 'Współtworzenie, architektura i debugowanie',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Przewodniki szybkiego startu',
    methods: {
      docker: {
        tag: 'Zalecane',
        time: '~5 min',
        description:
          'Wszystko w zestawie — MongoDB, MeiliSearch i RAG API uruchamiają się automatycznie.',
        steps: [
          'Sklonuj repozytorium',
          'Skopiuj .env.example do .env',
          'Uruchom docker compose up',
        ],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 min',
        description:
          'Ręczna konfiguracja z Node.js. Wymaga osobnych instancji MongoDB i MeiliSearch.',
        steps: [
          'Sklonuj i zainstaluj zależności',
          'Skonfiguruj .env i uruchom MongoDB',
          'Uruchom npm run backend',
        ],
        prereqs: ['Node.js v20.19+', 'Instancja MongoDB'],
      },
      railway: {
        tag: 'Jedno kliknięcie',
        time: '~3 min',
        description:
          'Wdróż natychmiast w chmurze. Bez konfiguracji lokalnej, bez Docker, bez serwerów do zarządzania.',
        steps: ['Kliknij przycisk wdrożenia', 'Połącz GitHub', 'Ustaw zmienne środowiskowe'],
        prereqs: ['Konto Railway', 'Konto GitHub'],
      },
    },
    afterInstallationHeading: 'Po instalacji',
    connectProviders: {
      title: 'Połącz dostawców AI',
      description: 'Dodaj OpenRouter, Ollama, Deepseek, Groq i inne usługi zgodne z OpenAI',
    },
    exploreFeatures: {
      title: 'Funkcje',
      description:
        'Agenci, MCP, wyszukiwanie w sieci, RAG, artefakty, generowanie obrazów i więcej',
    },
    exploreUserGuides: {
      title: 'Przewodniki użytkownika',
      description: 'Dowiedz się, jak używać presetów, dostawców AI i poruszać się po interfejsie',
    },
  },
  featuresHub: {
    ariaLabel: 'Nawigacja funkcji',
    featuredHeading: 'Wyróżnione',
    coreFeaturesHeading: 'Główne funkcje',
    hero: {
      title: 'Model Context Protocol',
      description:
        'Połącz modele AI z dowolnym zewnętrznym narzędziem lub usługą przez MCP — otwarty standard integracji narzędzi AI',
    },
    highlights: {
      agents: {
        title: 'Agenci',
        description:
          'Twórz niestandardowych asystentów AI z narzędziami, obsługą plików, wykonywaniem kodu i akcjami API — bez programowania.',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description:
          'Uruchamiaj Python, JavaScript, Go, Rust i więcej — bezpiecznie w sandboxie i bez konfiguracji.',
      },
      artifacts: {
        title: 'Artefakty',
        description:
          'Generuj komponenty React, strony HTML i diagramy Mermaid bezpośrednio w czacie.',
      },
      memory: {
        title: 'Pamięć',
        description: 'Trwały kontekst między rozmowami, aby AI pamiętała preferencje i historię.',
      },
      webSearch: {
        title: 'Wyszukiwanie w sieci',
        description:
          'Daj dowolnemu modelowi dostęp do internetu na żywo z wbudowanym wyszukiwaniem i rerankingiem.',
      },
      authentication: {
        title: 'Uwierzytelnianie',
        description:
          'SSO gotowe dla firm z OAuth2, SAML, LDAP i uwierzytelnianiem dwuskładnikowym.',
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Wyszukiwanie i wiedza',
        items: {
          webSearch: {
            title: 'Wyszukiwanie w sieci',
            description: 'Dostęp do internetu na żywo z wbudowanym wyszukiwaniem i rerankingiem',
          },
          search: {
            title: 'Wyszukiwanie',
            description: 'Znajduj wiadomości i rozmowy dzięki Meilisearch',
          },
          ragApi: {
            title: 'RAG API',
            description: 'Czatuj z plikami przy użyciu retrieval-augmented generation',
          },
          memory: { title: 'Pamięć', description: 'Trwały kontekst między rozmowami' },
          ocr: { title: 'OCR', description: 'Wyodrębniaj tekst z obrazów i dokumentów' },
        },
      },
      media: {
        title: 'Media',
        items: {
          imageGen: {
            title: 'Generowanie obrazów',
            description: 'Twórz obrazy z GPT-Image-1, DALL-E, Stable Diffusion i Flux',
          },
          uploadAsText: {
            title: 'Prześlij jako tekst',
            description: 'Przesyłaj i przetwarzaj pliki jako dane tekstowe',
          },
        },
      },
      chat: {
        title: 'Czat',
        items: {
          fork: { title: 'Fork', description: 'Podziel rozmowy na wiele wątków' },
          importConvos: {
            title: 'Import rozmów',
            description: 'Importuj czaty z ChatGPT i innych platform',
          },
          shareableLinks: {
            title: 'Linki do udostępniania',
            description: 'Udostępniaj rozmowy przez publiczne linki',
          },
          temporaryChat: {
            title: 'Czat tymczasowy',
            description: 'Prywatne rozmowy, które nie są zapisywane w historii',
          },
          urlQuery: {
            title: 'Parametry zapytania URL',
            description: 'Konfiguruj czaty dynamicznie przez URL',
          },
          resumableStreams: {
            title: 'Wznawialne strumienie',
            description: 'Automatycznie łącz ponownie i wznawiaj przerwane odpowiedzi',
          },
        },
      },
      security: {
        title: 'Bezpieczeństwo',
        items: {
          authentication: {
            title: 'Uwierzytelnianie',
            description: 'Uwierzytelnianie wielu użytkowników z OAuth2, SAML, LDAP i więcej',
          },
          adminPanel: {
            title: 'Panel administratora',
            description: 'Interfejs w przeglądarce dla użytkowników, ról i nadpisań konfiguracji',
          },
          passwordReset: {
            title: 'Reset hasła',
            description: 'Odzyskiwanie hasła przez email',
          },
          moderation: {
            title: 'System moderacji',
            description: 'Moderacja treści i kontrolki bezpieczeństwa',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'W pakiecie z Docker',
    bundledNote:
      'Docker Compose obsługuje wszystkie zależności. Z npm lub Helm instalujesz i konfigurujesz te usługi osobno.',
    chooseMethodHeading: 'Wybierz metodę',
    difficulty: {
      Beginner: 'Początkujący',
      Intermediate: 'Średni',
      Advanced: 'Zaawansowany',
    },
    externalServicesRequired: 'Wymagane usługi zewnętrzne',
    methods: {
      docker: {
        description:
          'Wszystko działa w kontenerach. MongoDB, MeiliSearch, RAG API i Vector DB są dołączone automatycznie.',
      },
      npm: {
        description:
          'Uruchom LibreChat bezpośrednio z Node.js. Samodzielnie zarządzasz usługami zewnętrznymi, takimi jak MongoDB i MeiliSearch.',
      },
      helm: {
        description:
          'Wdróż na Kubernetes za pomocą Helm. Najlepsze dla klastrów produkcyjnych i workflow infrastructure-as-code.',
      },
    },
    notRunningLocallyHeading: 'Nie uruchamiasz lokalnie?',
    remoteHosting: {
      title: 'Hosting zdalny',
      description: 'DigitalOcean, Railway, Azure i więcej',
    },
    envConfig: {
      title: 'Konfiguracja .env',
      description: 'Szczegółowy przewodnik po zmiennych środowiskowych',
    },
  },
  footer: {
    headings: {
      about: 'O projekcie',
      resources: 'Zasoby',
      documentation: 'Dokumentacja',
      blog: 'Blog',
      newsletter: 'Newsletter',
      legal: 'Informacje prawne',
    },
    items: {
      about: 'O projekcie',
      contactUs: 'Kontakt',
      features: 'Funkcje',
      changelog: 'Dziennik zmian',
      roadmap: 'Roadmap',
      demo: 'Demo',
      status: 'Status',
      getStarted: 'Zacznij',
      localInstall: 'Instalacja lokalna',
      remoteInstall: 'Instalacja zdalna',
      blog: 'Blog',
      blogAuthors: 'Autorzy bloga',
      subscribe: 'Subskrybuj',
      unsubscribe: 'Anuluj subskrypcję',
      termsOfService: 'Warunki korzystania',
      privacyPolicy: 'Polityka prywatności',
      cookiePolicy: 'Polityka plików cookie',
    },
  },
  toolkit: {
    credentials: {
      generate: 'Generuj dane uwierzytelniające',
      regenerate: 'Wygeneruj ponownie',
      generateAria: 'Generuj nowe dane uwierzytelniające',
      regionAria: 'Wygenerowane dane uwierzytelniające',
      copy: 'Kopiuj',
      copied: 'Skopiowano',
      copyAria: 'Kopiuj {label}',
      valueAria: 'Wartość {label}',
      copyAll: 'Kopiuj wszystko jako .env',
      copiedAll: 'Skopiowano do schowka!',
      copyAllAria: 'Kopiuj wszystkie dane uwierzytelniające jako blok .env',
      allCopiedStatus: 'Wszystkie 5 danych uwierzytelniających skopiowano w formacie KEY=value',
      emptyPrefix:
        'Kliknij przycisk powyżej, aby wygenerować bezpieczne losowe dane uwierzytelniające dla',
      emptySuffix: 'pliku.',
      hints: {
        CREDS_KEY: 'Klucz szyfrowania zapisanych danych uwierzytelniających',
        CREDS_IV: 'Wektor inicjalizacyjny szyfrowania',
        JWT_SECRET: 'Sekret do podpisywania tokenów dostępu',
        JWT_REFRESH_SECRET: 'Sekret do podpisywania tokenów odświeżania',
        MEILI_KEY: 'Klucz główny MeiliSearch',
      },
    },
    yaml: {
      dropFile: 'Upuść plik YAML tutaj',
      placeholder: 'Wklej tutaj zawartość librechat.yaml albo przeciągnij i upuść plik...',
      empty: 'Wyniki walidacji pojawią się tutaj po wklejeniu lub upuszczeniu YAML.',
      valid: 'YAML jest poprawny!',
      clear: 'Wyczyść',
      clearAria: 'Wyczyść edytor',
      badIndentation:
        'Nieprawidłowe wcięcie w wierszu {line}. Każdy wpis YAML powinien być odpowiednio wcięty.',
      errorAtLine: '{reason} w wierszu {line}',
      unknownError: 'Nieznany błąd YAML',
    },
  },
  home: {
    metaTitle: 'LibreChat - Open-source platforma AI',
    metaDescription:
      'LibreChat łączy wszystkie rozmowy AI w jednym ujednoliconym, konfigurowalnym interfejsie.',
    starOnGitHub: 'Dodaj gwiazdkę na GitHub',
    starAria: 'Dodaj gwiazdkę LibreChat na GitHub — {count} gwiazdek',
    heroTitleTop: 'Open-source',
    heroTitleBottom: 'platforma AI',
    heroSubtitle:
      'LibreChat łączy wszystkie rozmowy AI w jednym ujednoliconym, konfigurowalnym interfejsie',
    getStarted: 'Zacznij',
    getStartedAria: 'Rozpocznij z dokumentacją LibreChat',
    tryDemo: 'Wypróbuj demo',
    tryDemoAria: 'Wypróbuj demo LibreChat',
    desktopLightAlt: 'Interfejs desktop LibreChat w trybie jasnym',
    desktopDarkAlt: 'Interfejs desktop LibreChat w trybie ciemnym',
    mobileLightAlt: 'Interfejs mobilny LibreChat w trybie jasnym',
    mobileDarkAlt: 'Interfejs mobilny LibreChat w trybie ciemnym',
    trustedBy: 'Zaufany przez firmy na całym świecie',
    featuresHeading: 'Wszystko, czego potrzebujesz',
    featuresSubtitle: 'Kompletna platforma do rozmów wspieranych przez AI',
    primaryActionsAria: 'Główne akcje',
    features: {
      agents: {
        title: 'Agenci',
        description: 'Zaawansowani agenci z obsługą plików, interpretacją kodu i akcjami API',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: 'Uruchamiaj kod w wielu językach bezpiecznie i bez konfiguracji',
      },
      models: {
        title: 'Modele',
        description: 'Wybór modeli AI, w tym Anthropic, AWS, OpenAI, Azure i więcej',
      },
      artifacts: {
        title: 'Artefakty',
        description: 'Twórz kod React, HTML i diagramy Mermaid w czacie',
      },
      search: {
        title: 'Wyszukiwanie',
        description: 'Błyskawicznie wyszukuj wiadomości, pliki i fragmenty kodu',
      },
      mcp: {
        title: 'MCP',
        description: 'Połącz dowolne narzędzie lub usługę z obsługą Model Context Protocol',
      },
      memory: {
        title: 'Pamięć',
        description: 'Trwały kontekst między rozmowami, aby AI pamiętała użytkownika',
      },
      webSearch: {
        title: 'Wyszukiwanie w sieci',
        description:
          'Daj dowolnemu modelowi dostęp do internetu na żywo z wbudowanym wyszukiwaniem i rerankingiem',
      },
      authentication: {
        title: 'Uwierzytelnianie',
        description: 'SSO gotowe dla firm z OAuth, SAML, LDAP i uwierzytelnianiem dwuskładnikowym',
      },
    },
    learnMore: 'Dowiedz się więcej',
    communityHeading: 'Open source, tworzone przez społeczność',
    communitySubtitle: 'Dołącz do tysięcy deweloperów i organizacji budujących z LibreChat',
    githubStars: 'Gwiazdki GitHub',
    dockerPulls: 'Pobrania Docker',
    contributors: 'Współtwórcy',
    communityLinksAria: 'Linki społeczności',
    githubAria: 'LibreChat na GitHub',
    discordAria: 'LibreChat na Discord',
    ctaHeading: 'Zacznij budować z LibreChat',
    ctaSubtitle: 'Uruchom wszystko w kilka minut dzięki naszemu przewodnikowi szybkiego startu',
    quickstartGuide: 'Przewodnik szybkiego startu',
    quickstartAria: 'Przeczytaj przewodnik szybkiego startu',
  },
}
