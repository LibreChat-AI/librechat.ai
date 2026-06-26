import type { UIStrings } from '@/lib/ui-i18n'

export const id: UIStrings = {
  nav: {
    docs: 'Dokumentasi',
    blog: 'Blog',
    changelog: 'Log perubahan',
    discord: 'Discord',
    joinDiscord: 'Gabung Discord',
  },
  pageActions: {
    copyMarkdown: 'Salin Markdown',
    copying: 'Menyalin...',
    copied: 'Tersalin!',
    copyFailed: 'Gagal menyalin',
    copyMarkdownAria: 'Salin halaman sebagai Markdown',
    open: 'Buka',
    openAria: 'Buka halaman di alat eksternal',
    openInGitHub: 'Buka di GitHub',
    openInLibreChat: 'Buka di LibreChat',
    openInChatGPT: 'Buka di ChatGPT',
    openInClaude: 'Buka di Claude',
    openInGemini: 'Buka di Gemini',
    openInPerplexity: 'Buka di Perplexity',
    openInCursor: 'Buka di Cursor',
  },
  feedback: {
    question: 'Bagaimana panduan ini?',
    good: 'Baik',
    bad: 'Buruk',
    thanks: 'Terima kasih atas masukan Anda!',
    submitAgain: 'Kirim lagi',
    placeholder: 'Ada masukan tambahan? (opsional)',
    submit: 'Kirim',
    additionalAria: 'Masukan tambahan',
  },
  version: {
    label: 'Versi',
    aria: 'Pilih versi dokumentasi',
  },
  logoMenu: {
    openNewTab: 'Buka di tab baru',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Logo dokumentasi (png)',
    docsLogoSvg: 'Logo dokumentasi (svg)',
  },
  common: {
    learnMore: 'Pelajari lebih lanjut',
    getStarted: 'Mulai',
    readDocs: 'Baca dokumentasi',
    viewFullGuide: 'Lihat panduan lengkap',
    recommended: 'Direkomendasikan',
    prerequisites: 'Prasyarat',
    commands: 'Perintah',
    explore: 'Jelajahi',
    resources: 'Sumber daya',
  },
  resources: {
    changelog: { title: 'Log perubahan', description: 'Rilis terbaru' },
    roadmap: { title: 'Roadmap 2026', description: 'Yang direncanakan' },
    discord: { title: 'Discord', description: 'Dapatkan bantuan' },
  },
  docsHub: {
    sections: {
      deploy: 'Deploy',
      configure: 'Konfigurasi',
      use: 'Gunakan',
      contribute: 'Berkontribusi',
    },
    items: {
      quickStart: { title: 'Mulai cepat', description: 'Pengaturan Docker dalam 5 menit' },
      local: { title: 'Instalasi lokal', description: 'Docker, npm, dan Helm Chart' },
      remote: { title: 'Hosting remote', description: 'DigitalOcean, Railway, dan lainnya' },
      configuration: {
        title: 'Konfigurasi',
        description: 'Variabel lingkungan, YAML, dan autentikasi',
      },
      customEndpoints: {
        title: 'Endpoint kustom',
        description: 'Hubungkan Ollama, Deepseek, Groq, dan lainnya',
      },
      features: { title: 'Fitur', description: 'MCP, agen, Code Interpreter, artefak' },
      userGuides: {
        title: 'Panduan pengguna',
        description: 'Preset, tips, dan praktik terbaik',
      },
      development: {
        title: 'Pengembangan',
        description: 'Kontribusi, arsitektur, dan debugging',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Panduan mulai cepat',
    methods: {
      docker: {
        tag: 'Direkomendasikan',
        time: '~5 mnt',
        description:
          'Semuanya sudah termasuk — MongoDB, MeiliSearch, dan RAG API berjalan otomatis.',
        steps: ['Clone repository', 'Salin .env.example ke .env', 'Jalankan docker compose up'],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 mnt',
        description:
          'Pengaturan manual dengan Node.js. Membutuhkan instance MongoDB dan MeiliSearch terpisah.',
        steps: [
          'Clone dan instal dependensi',
          'Konfigurasikan .env dan mulai MongoDB',
          'Jalankan npm run backend',
        ],
        prereqs: ['Node.js v20.19+', 'Instance MongoDB'],
      },
      railway: {
        tag: 'Sekali klik',
        time: '~3 mnt',
        description:
          'Deploy ke cloud secara instan. Tanpa pengaturan lokal, tanpa Docker, tanpa server untuk dikelola.',
        steps: ['Klik tombol deploy', 'Hubungkan GitHub Anda', 'Atur variabel lingkungan'],
        prereqs: ['Akun Railway', 'Akun GitHub'],
      },
    },
    afterInstallationHeading: 'Setelah instalasi',
    connectProviders: {
      title: 'Hubungkan penyedia AI',
      description:
        'Tambahkan OpenRouter, Ollama, Deepseek, Groq, dan layanan lain yang kompatibel dengan OpenAI',
    },
    exploreFeatures: {
      title: 'Fitur',
      description: 'Agen, MCP, pencarian web, RAG, artefak, pembuatan gambar, dan lainnya',
    },
    exploreUserGuides: {
      title: 'Panduan pengguna',
      description: 'Pelajari cara menggunakan preset, penyedia AI, dan menavigasi antarmuka',
    },
  },
  featuresHub: {
    ariaLabel: 'Navigasi fitur',
    featuredHeading: 'Unggulan',
    coreFeaturesHeading: 'Fitur inti',
    hero: {
      title: 'Model Context Protocol',
      description:
        'Hubungkan model AI ke alat atau layanan eksternal apa pun melalui MCP — standar terbuka untuk integrasi alat AI',
    },
    highlights: {
      agents: {
        title: 'Agen',
        description:
          'Buat asisten AI kustom dengan alat, penanganan file, eksekusi kode, dan aksi API — tanpa perlu coding.',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description:
          'Jalankan Python, JavaScript, Go, Rust, dan lainnya — aman dalam sandbox tanpa pengaturan.',
      },
      artifacts: {
        title: 'Artefak',
        description:
          'Buat komponen React, halaman HTML, dan diagram Mermaid langsung di dalam chat.',
      },
      memory: {
        title: 'Memori',
        description: 'Konteks persisten antar percakapan agar AI mengingat preferensi dan riwayat.',
      },
      webSearch: {
        title: 'Pencarian web',
        description:
          'Beri model apa pun akses internet langsung dengan pencarian dan reranking bawaan.',
      },
      authentication: {
        title: 'Autentikasi',
        description: 'SSO siap perusahaan dengan OAuth2, SAML, LDAP, dan autentikasi dua faktor.',
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Pencarian dan pengetahuan',
        items: {
          webSearch: {
            title: 'Pencarian web',
            description: 'Akses internet langsung dengan pencarian dan reranking bawaan',
          },
          search: {
            title: 'Pencarian',
            description: 'Temukan pesan dan percakapan dengan Meilisearch',
          },
          ragApi: {
            title: 'RAG API',
            description: 'Chat dengan file menggunakan retrieval-augmented generation',
          },
          memory: { title: 'Memori', description: 'Konteks persisten antar percakapan' },
          ocr: { title: 'OCR', description: 'Ekstrak teks dari gambar dan dokumen' },
        },
      },
      media: {
        title: 'Media',
        items: {
          imageGen: {
            title: 'Pembuatan gambar',
            description: 'Buat gambar dengan GPT-Image-1, DALL-E, Stable Diffusion, dan Flux',
          },
          uploadAsText: {
            title: 'Unggah sebagai teks',
            description: 'Unggah dan proses file sebagai input teks',
          },
        },
      },
      chat: {
        title: 'Chat',
        items: {
          fork: { title: 'Fork', description: 'Pisahkan percakapan menjadi beberapa thread' },
          importConvos: {
            title: 'Impor percakapan',
            description: 'Impor chat dari ChatGPT dan platform lain',
          },
          shareableLinks: {
            title: 'Tautan yang dapat dibagikan',
            description: 'Bagikan percakapan melalui tautan publik',
          },
          temporaryChat: {
            title: 'Chat sementara',
            description: 'Percakapan privat yang tidak disimpan ke riwayat',
          },
          urlQuery: {
            title: 'Parameter query URL',
            description: 'Konfigurasi chat secara dinamis melalui URL',
          },
          resumableStreams: {
            title: 'Stream yang dapat dilanjutkan',
            description: 'Sambung ulang otomatis dan lanjutkan respons yang terputus',
          },
        },
      },
      security: {
        title: 'Keamanan',
        items: {
          authentication: {
            title: 'Autentikasi',
            description: 'Autentikasi multi-pengguna dengan OAuth2, SAML, LDAP, dan lainnya',
          },
          adminPanel: {
            title: 'Panel admin',
            description: 'UI browser untuk pengguna, peran, dan override konfigurasi',
          },
          passwordReset: {
            title: 'Reset kata sandi',
            description: 'Pemulihan kata sandi berbasis email',
          },
          moderation: {
            title: 'Sistem moderasi',
            description: 'Moderasi konten dan kontrol keamanan',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Disertakan dengan Docker',
    bundledNote:
      'Docker Compose menangani semua dependensi. Dengan npm atau Helm, Anda menginstal dan mengonfigurasi layanan ini secara terpisah.',
    chooseMethodHeading: 'Pilih metode',
    difficulty: {
      Beginner: 'Pemula',
      Intermediate: 'Menengah',
      Advanced: 'Lanjutan',
    },
    externalServicesRequired: 'Layanan eksternal diperlukan',
    methods: {
      docker: {
        description:
          'Semuanya berjalan dalam container. MongoDB, MeiliSearch, RAG API, dan Vector DB disertakan otomatis.',
      },
      npm: {
        description:
          'Jalankan LibreChat langsung dengan Node.js. Anda mengelola layanan eksternal seperti MongoDB dan MeiliSearch sendiri.',
      },
      helm: {
        description:
          'Deploy di Kubernetes menggunakan Helm. Cocok untuk cluster produksi dan workflow infrastructure-as-code.',
      },
    },
    notRunningLocallyHeading: 'Tidak berjalan secara lokal?',
    remoteHosting: {
      title: 'Hosting remote',
      description: 'DigitalOcean, Railway, Azure, dan lainnya',
    },
    envConfig: {
      title: 'Konfigurasi .env',
      description: 'Panduan mendalam untuk variabel lingkungan',
    },
  },
  footer: {
    headings: {
      about: 'Tentang',
      resources: 'Sumber daya',
      documentation: 'Dokumentasi',
      blog: 'Blog',
      newsletter: 'Newsletter',
      legal: 'Legal',
    },
    items: {
      about: 'Tentang',
      contactUs: 'Hubungi kami',
      features: 'Fitur',
      changelog: 'Log perubahan',
      roadmap: 'Roadmap',
      demo: 'Demo',
      status: 'Status',
      getStarted: 'Mulai',
      localInstall: 'Instal lokal',
      remoteInstall: 'Instal remote',
      blog: 'Blog',
      blogAuthors: 'Penulis blog',
      subscribe: 'Berlangganan',
      unsubscribe: 'Berhenti berlangganan',
      termsOfService: 'Ketentuan layanan',
      privacyPolicy: 'Kebijakan privasi',
      cookiePolicy: 'Kebijakan cookie',
    },
  },
  toolkit: {
    credentials: {
      generate: 'Buat kredensial',
      regenerate: 'Buat ulang',
      generateAria: 'Buat kredensial baru',
      regenerateAria: 'Buat ulang kredensial',
      regionAria: 'Kredensial yang dibuat',
      copy: 'Salin',
      copying: 'Menyalin...',
      copied: 'Disalin',
      copyFailed: 'Gagal menyalin',
      copyAria: 'Salin {label}',
      valueAria: 'Nilai {label}',
      copyAll: 'Salin semua sebagai .env',
      copiedAll: 'Disalin ke clipboard!',
      copyAllAria: 'Salin semua kredensial sebagai blok .env',
      allCopiedStatus: 'Semua 5 kredensial disalin dalam format KEY=value',
      allCopyFailedStatus: 'Gagal menyalin ke clipboard. Pilih dan salin nilai secara manual.',
      emptyPrefix: 'Klik tombol di atas untuk membuat kredensial acak yang aman untuk',
      emptySuffix: 'file Anda.',
      hints: {
        CREDS_KEY: 'Kunci enkripsi untuk kredensial tersimpan',
        CREDS_IV: 'Vektor inisialisasi untuk enkripsi',
        JWT_SECRET: 'Rahasia untuk menandatangani access token',
        JWT_REFRESH_SECRET: 'Rahasia untuk menandatangani refresh token',
        MEILI_KEY: 'Kunci master MeiliSearch',
      },
    },
    yaml: {
      dropFile: 'Letakkan file YAML di sini',
      placeholder: 'Tempel konten librechat.yaml di sini, atau seret dan lepas file...',
      empty: 'Hasil validasi akan muncul di sini setelah Anda menempel atau melepas YAML.',
      valid: 'YAML valid!',
      clear: 'Bersihkan',
      clearAria: 'Bersihkan editor',
      badIndentation:
        'Indentasi salah pada baris {line}. Setiap entri YAML harus diindentasi dengan benar.',
      errorAtLine: '{reason} pada baris {line}',
      unknownError: 'Kesalahan YAML tidak diketahui',
    },
  },
  home: {
    metaTitle: 'LibreChat - Platform AI open-source',
    metaDescription:
      'LibreChat menyatukan semua percakapan AI Anda dalam satu antarmuka terpadu yang dapat disesuaikan.',
    starOnGitHub: 'Beri bintang di GitHub',
    starAria: 'Beri bintang LibreChat di GitHub — {count} bintang',
    heroTitleTop: 'Platform',
    heroTitleBottom: 'AI open-source',
    heroSubtitle:
      'LibreChat menyatukan semua percakapan AI Anda dalam satu antarmuka terpadu yang dapat disesuaikan',
    getStarted: 'Mulai',
    getStartedAria: 'Mulai dengan dokumentasi LibreChat',
    tryDemo: 'Coba demo',
    tryDemoAria: 'Coba demo LibreChat',
    desktopLightAlt: 'Antarmuka desktop LibreChat dalam mode terang',
    desktopDarkAlt: 'Antarmuka desktop LibreChat dalam mode gelap',
    mobileLightAlt: 'Antarmuka mobile LibreChat dalam mode terang',
    mobileDarkAlt: 'Antarmuka mobile LibreChat dalam mode gelap',
    trustedBy: 'Dipercaya oleh perusahaan di seluruh dunia',
    featuresHeading: 'Semua yang Anda butuhkan',
    featuresSubtitle: 'Platform lengkap untuk percakapan bertenaga AI',
    primaryActionsAria: 'Aksi utama',
    features: {
      agents: {
        title: 'Agen',
        description: 'Agen lanjutan dengan penanganan file, interpretasi kode, dan aksi API',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: 'Jalankan kode dalam berbagai bahasa dengan aman tanpa pengaturan',
      },
      models: {
        title: 'Model',
        description: 'Pilihan model AI termasuk Anthropic, AWS, OpenAI, Azure, dan lainnya',
      },
      artifacts: {
        title: 'Artefak',
        description: 'Buat kode React, HTML, dan diagram Mermaid di chat',
      },
      search: {
        title: 'Pencarian',
        description: 'Cari pesan, file, dan potongan kode seketika',
      },
      mcp: {
        title: 'MCP',
        description:
          'Hubungkan ke alat atau layanan apa pun dengan dukungan Model Context Protocol',
      },
      memory: {
        title: 'Memori',
        description: 'Konteks persisten antar percakapan agar AI mengingat Anda',
      },
      webSearch: {
        title: 'Pencarian web',
        description:
          'Beri model apa pun akses internet langsung dengan pencarian dan reranking bawaan',
      },
      authentication: {
        title: 'Autentikasi',
        description: 'SSO siap perusahaan dengan OAuth, SAML, LDAP, dan autentikasi dua faktor',
      },
    },
    learnMore: 'Pelajari lebih lanjut',
    communityHeading: 'Open source, digerakkan komunitas',
    communitySubtitle:
      'Bergabunglah dengan ribuan pengembang dan organisasi yang membangun dengan LibreChat',
    githubStars: 'Bintang GitHub',
    dockerPulls: 'Tarikan Docker',
    contributors: 'Kontributor',
    communityLinksAria: 'Tautan komunitas',
    githubAria: 'LibreChat di GitHub',
    discordAria: 'LibreChat di Discord',
    ctaHeading: 'Mulai membangun dengan LibreChat',
    ctaSubtitle: 'Siapkan dalam hitungan menit dengan panduan mulai cepat kami',
    quickstartGuide: 'Panduan mulai cepat',
    quickstartAria: 'Baca panduan mulai cepat',
  },
}
