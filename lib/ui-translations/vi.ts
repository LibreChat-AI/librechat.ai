import type { UIStrings } from '@/lib/ui-i18n'

export const vi: UIStrings = {
  nav: {
    docs: 'Tài liệu',
    blog: 'Blog',
    changelog: 'Nhật ký thay đổi',
    discord: 'Discord',
    joinDiscord: 'Tham gia Discord',
  },
  pageActions: {
    copyMarkdown: 'Sao chép Markdown',
    copying: 'Đang sao chép...',
    copied: 'Đã sao chép!',
    copyFailed: 'Sao chép thất bại',
    copyMarkdownAria: 'Sao chép trang dưới dạng Markdown',
    open: 'Mở',
    openAria: 'Mở trang trong công cụ bên ngoài',
    openInGitHub: 'Mở trong GitHub',
    openInLibreChat: 'Mở trong LibreChat',
    openInChatGPT: 'Mở trong ChatGPT',
    openInClaude: 'Mở trong Claude',
    openInGemini: 'Mở trong Gemini',
    openInPerplexity: 'Mở trong Perplexity',
    openInCursor: 'Mở trong Cursor',
  },
  feedback: {
    question: 'Hướng dẫn này thế nào?',
    good: 'Tốt',
    bad: 'Chưa tốt',
    thanks: 'Cảm ơn phản hồi của bạn!',
    submitAgain: 'Gửi lại',
    placeholder: 'Có phản hồi bổ sung nào không? (tùy chọn)',
    submit: 'Gửi',
    additionalAria: 'Phản hồi bổ sung',
  },
  version: {
    label: 'Phiên bản',
    aria: 'Chọn phiên bản tài liệu',
  },
  logoMenu: {
    openNewTab: 'Mở trong tab mới',
    logoPng: 'Logo (png)',
    logoSvg: 'Logo (svg)',
    docsLogoPng: 'Logo tài liệu (png)',
    docsLogoSvg: 'Logo tài liệu (svg)',
  },
  common: {
    learnMore: 'Tìm hiểu thêm',
    getStarted: 'Bắt đầu',
    readDocs: 'Đọc tài liệu',
    viewFullGuide: 'Xem hướng dẫn đầy đủ',
    recommended: 'Được khuyến nghị',
    prerequisites: 'Điều kiện tiên quyết',
    commands: 'Lệnh',
    explore: 'Khám phá',
    resources: 'Tài nguyên',
  },
  resources: {
    changelog: { title: 'Nhật ký thay đổi', description: 'Bản phát hành mới nhất' },
    roadmap: { title: 'Lộ trình 2026', description: 'Những gì đã được lên kế hoạch' },
    discord: { title: 'Discord', description: 'Nhận trợ giúp' },
  },
  docsHub: {
    sections: {
      deploy: 'Triển khai',
      configure: 'Cấu hình',
      use: 'Sử dụng',
      contribute: 'Đóng góp',
    },
    items: {
      quickStart: { title: 'Bắt đầu nhanh', description: 'Thiết lập Docker trong 5 phút' },
      local: { title: 'Cài đặt cục bộ', description: 'Docker, npm và Helm Chart' },
      remote: { title: 'Lưu trữ từ xa', description: 'DigitalOcean, Railway và hơn thế nữa' },
      configuration: {
        title: 'Cấu hình',
        description: 'Biến môi trường, YAML và xác thực',
      },
      customEndpoints: {
        title: 'Endpoint tùy chỉnh',
        description: 'Kết nối Ollama, Deepseek, Groq và hơn thế nữa',
      },
      features: { title: 'Tính năng', description: 'MCP, tác nhân, Code Interpreter, artifact' },
      userGuides: {
        title: 'Hướng dẫn người dùng',
        description: 'Preset, mẹo và thực hành tốt nhất',
      },
      development: {
        title: 'Phát triển',
        description: 'Đóng góp, kiến trúc và gỡ lỗi',
      },
    },
  },
  quickStartHub: {
    ariaLabel: 'Hướng dẫn bắt đầu nhanh',
    methods: {
      docker: {
        tag: 'Được khuyến nghị',
        time: '~5 phút',
        description: 'Đã bao gồm mọi thứ — MongoDB, MeiliSearch và RAG API tự động chạy.',
        steps: ['Clone repository', 'Sao chép .env.example thành .env', 'Chạy docker compose up'],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20 phút',
        description:
          'Thiết lập thủ công với Node.js. Cần các phiên bản MongoDB và MeiliSearch riêng.',
        steps: [
          'Clone và cài đặt dependency',
          'Cấu hình .env và khởi động MongoDB',
          'Chạy npm run backend',
        ],
        prereqs: ['Node.js v20.19+', 'Phiên bản MongoDB'],
      },
      railway: {
        tag: 'Một cú nhấp',
        time: '~3 phút',
        description:
          'Triển khai lên đám mây ngay lập tức. Không cần thiết lập cục bộ, không Docker, không máy chủ cần quản lý.',
        steps: ['Nhấp nút triển khai', 'Kết nối GitHub', 'Đặt biến môi trường'],
        prereqs: ['Tài khoản Railway', 'Tài khoản GitHub'],
      },
    },
    afterInstallationHeading: 'Sau khi cài đặt',
    connectProviders: {
      title: 'Kết nối nhà cung cấp AI',
      description: 'Thêm OpenRouter, Ollama, Deepseek, Groq và các dịch vụ tương thích OpenAI khác',
    },
    exploreFeatures: {
      title: 'Tính năng',
      description: 'Tác nhân, MCP, tìm kiếm web, RAG, artifact, tạo ảnh và hơn thế nữa',
    },
    exploreUserGuides: {
      title: 'Hướng dẫn người dùng',
      description: 'Tìm hiểu cách dùng preset, nhà cung cấp AI và điều hướng giao diện',
    },
  },
  featuresHub: {
    ariaLabel: 'Điều hướng tính năng',
    featuredHeading: 'Nổi bật',
    coreFeaturesHeading: 'Tính năng cốt lõi',
    hero: {
      title: 'Model Context Protocol',
      description:
        'Kết nối mô hình AI với bất kỳ công cụ hoặc dịch vụ bên ngoài nào qua MCP — tiêu chuẩn mở cho tích hợp công cụ AI',
    },
    highlights: {
      agents: {
        title: 'Tác nhân',
        description:
          'Tạo trợ lý AI tùy chỉnh với công cụ, xử lý tệp, thực thi mã và hành động API — không cần lập trình.',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description:
          'Chạy Python, JavaScript, Go, Rust và hơn thế nữa — an toàn trong sandbox và không cần thiết lập.',
      },
      artifacts: {
        title: 'Artifact',
        description: 'Tạo component React, trang HTML và sơ đồ Mermaid trực tiếp trong chat.',
      },
      memory: {
        title: 'Bộ nhớ',
        description:
          'Ngữ cảnh bền vững giữa các cuộc trò chuyện để AI ghi nhớ tùy chọn và lịch sử.',
      },
      webSearch: {
        title: 'Tìm kiếm web',
        description:
          'Cho bất kỳ mô hình nào truy cập internet trực tiếp với tìm kiếm và reranking tích hợp.',
      },
      authentication: {
        title: 'Xác thực',
        description: 'SSO sẵn sàng cho doanh nghiệp với OAuth2, SAML, LDAP và xác thực hai yếu tố.',
      },
    },
    categories: {
      searchKnowledge: {
        title: 'Tìm kiếm và tri thức',
        items: {
          webSearch: {
            title: 'Tìm kiếm web',
            description: 'Truy cập internet trực tiếp với tìm kiếm và reranking tích hợp',
          },
          search: {
            title: 'Tìm kiếm',
            description: 'Tìm tin nhắn và cuộc trò chuyện bằng Meilisearch',
          },
          ragApi: {
            title: 'RAG API',
            description: 'Chat với tệp bằng retrieval-augmented generation',
          },
          memory: { title: 'Bộ nhớ', description: 'Ngữ cảnh bền vững giữa các cuộc trò chuyện' },
          ocr: { title: 'OCR', description: 'Trích xuất văn bản từ hình ảnh và tài liệu' },
        },
      },
      media: {
        title: 'Đa phương tiện',
        items: {
          imageGen: {
            title: 'Tạo ảnh',
            description: 'Tạo ảnh với GPT-Image-1, DALL-E, Stable Diffusion và Flux',
          },
          uploadAsText: {
            title: 'Tải lên dưới dạng văn bản',
            description: 'Tải lên và xử lý tệp làm đầu vào văn bản',
          },
        },
      },
      chat: {
        title: 'Chat',
        items: {
          fork: { title: 'Fork', description: 'Tách cuộc trò chuyện thành nhiều luồng' },
          importConvos: {
            title: 'Nhập cuộc trò chuyện',
            description: 'Nhập chat từ ChatGPT và các nền tảng khác',
          },
          shareableLinks: {
            title: 'Liên kết chia sẻ',
            description: 'Chia sẻ cuộc trò chuyện qua liên kết công khai',
          },
          temporaryChat: {
            title: 'Chat tạm thời',
            description: 'Cuộc trò chuyện riêng tư không được lưu vào lịch sử',
          },
          urlQuery: {
            title: 'Tham số truy vấn URL',
            description: 'Cấu hình chat động qua URL',
          },
          resumableStreams: {
            title: 'Luồng có thể tiếp tục',
            description: 'Tự động kết nối lại và tiếp tục phản hồi bị gián đoạn',
          },
        },
      },
      security: {
        title: 'Bảo mật',
        items: {
          authentication: {
            title: 'Xác thực',
            description: 'Xác thực nhiều người dùng với OAuth2, SAML, LDAP và hơn thế nữa',
          },
          adminPanel: {
            title: 'Bảng quản trị',
            description: 'UI trình duyệt cho người dùng, vai trò và ghi đè cấu hình',
          },
          passwordReset: {
            title: 'Đặt lại mật khẩu',
            description: 'Khôi phục mật khẩu qua email',
          },
          moderation: {
            title: 'Hệ thống kiểm duyệt',
            description: 'Kiểm duyệt nội dung và kiểm soát an toàn',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Đi kèm với Docker',
    bundledNote:
      'Docker Compose xử lý mọi dependency. Với npm hoặc Helm, bạn cài đặt và cấu hình các dịch vụ này riêng.',
    chooseMethodHeading: 'Chọn phương thức',
    difficulty: {
      Beginner: 'Người mới',
      Intermediate: 'Trung cấp',
      Advanced: 'Nâng cao',
    },
    externalServicesRequired: 'Yêu cầu dịch vụ bên ngoài',
    methods: {
      docker: {
        description:
          'Mọi thứ chạy trong container. MongoDB, MeiliSearch, RAG API và Vector DB đều được bao gồm tự động.',
      },
      npm: {
        description:
          'Chạy LibreChat trực tiếp với Node.js. Bạn tự quản lý dịch vụ bên ngoài như MongoDB và MeiliSearch.',
      },
      helm: {
        description:
          'Triển khai trên Kubernetes bằng Helm. Phù hợp nhất cho cụm production và workflow infrastructure-as-code.',
      },
    },
    notRunningLocallyHeading: 'Không chạy cục bộ?',
    remoteHosting: {
      title: 'Hosting từ xa',
      description: 'DigitalOcean, Railway, Azure và hơn thế nữa',
    },
    envConfig: {
      title: 'Cấu hình .env',
      description: 'Hướng dẫn chuyên sâu về biến môi trường',
    },
  },
  footer: {
    headings: {
      about: 'Giới thiệu',
      resources: 'Tài nguyên',
      documentation: 'Tài liệu',
      blog: 'Blog',
      newsletter: 'Bản tin',
      legal: 'Pháp lý',
    },
    items: {
      about: 'Giới thiệu',
      contactUs: 'Liên hệ',
      features: 'Tính năng',
      changelog: 'Nhật ký thay đổi',
      roadmap: 'Lộ trình',
      demo: 'Demo',
      status: 'Trạng thái',
      getStarted: 'Bắt đầu',
      localInstall: 'Cài đặt cục bộ',
      remoteInstall: 'Cài đặt từ xa',
      blog: 'Blog',
      blogAuthors: 'Tác giả blog',
      subscribe: 'Đăng ký',
      unsubscribe: 'Hủy đăng ký',
      termsOfService: 'Điều khoản dịch vụ',
      privacyPolicy: 'Chính sách bảo mật',
      cookiePolicy: 'Chính sách cookie',
    },
  },
  toolkit: {
    credentials: {
      generate: 'Tạo thông tin xác thực',
      regenerate: 'Tạo lại',
      generateAria: 'Tạo thông tin xác thực mới',
      regenerateAria: 'Tạo lại thông tin xác thực',
      regionAria: 'Thông tin xác thực đã tạo',
      copy: 'Sao chép',
      copying: 'Đang sao chép...',
      copied: 'Đã sao chép',
      copyFailed: 'Sao chép thất bại',
      copyAria: 'Sao chép {label}',
      valueAria: 'Giá trị {label}',
      copyAll: 'Sao chép tất cả dưới dạng .env',
      copiedAll: 'Đã sao chép vào clipboard!',
      copyAllAria: 'Sao chép tất cả thông tin xác thực dưới dạng khối .env',
      allCopiedStatus: 'Đã sao chép cả 5 thông tin xác thực theo định dạng KEY=value',
      allCopyFailedStatus:
        'Sao chép vào clipboard thất bại. Hãy chọn và sao chép các giá trị theo cách thủ công.',
      emptyPrefix: 'Nhấp nút ở trên để tạo thông tin xác thực ngẫu nhiên an toàn cho',
      emptySuffix: 'tệp của bạn.',
      hints: {
        CREDS_KEY: 'Khóa mã hóa cho thông tin xác thực đã lưu',
        CREDS_IV: 'Vector khởi tạo cho mã hóa',
        JWT_SECRET: 'Bí mật để ký access token',
        JWT_REFRESH_SECRET: 'Bí mật để ký refresh token',
        MEILI_KEY: 'Khóa master của MeiliSearch',
      },
    },
    yaml: {
      dropFile: 'Thả tệp YAML vào đây',
      placeholder: 'Dán nội dung librechat.yaml vào đây hoặc kéo thả tệp...',
      empty: 'Kết quả xác thực sẽ xuất hiện ở đây sau khi bạn dán hoặc thả YAML.',
      valid: 'YAML hợp lệ!',
      clear: 'Xóa',
      clearAria: 'Xóa trình soạn thảo',
      badIndentation: 'Thụt lề không đúng ở dòng {line}. Mỗi mục trong YAML cần được thụt lề đúng.',
      errorAtLine: '{reason} tại dòng {line}',
      unknownError: 'Lỗi YAML không xác định',
    },
  },
  home: {
    metaTitle: 'LibreChat - Nền tảng AI open-source',
    metaDescription:
      'LibreChat gom tất cả cuộc trò chuyện AI của bạn vào một giao diện thống nhất, có thể tùy chỉnh.',
    starOnGitHub: 'Gắn sao trên GitHub',
    starAria: 'Gắn sao LibreChat trên GitHub — {count} sao',
    heroTitleTop: 'Nền tảng',
    heroTitleBottom: 'AI open-source',
    heroSubtitle:
      'LibreChat gom tất cả cuộc trò chuyện AI của bạn vào một giao diện thống nhất, có thể tùy chỉnh',
    getStarted: 'Bắt đầu',
    getStartedAria: 'Bắt đầu với tài liệu LibreChat',
    tryDemo: 'Thử demo',
    tryDemoAria: 'Thử demo LibreChat',
    desktopLightAlt: 'Giao diện desktop LibreChat ở chế độ sáng',
    desktopDarkAlt: 'Giao diện desktop LibreChat ở chế độ tối',
    mobileLightAlt: 'Giao diện mobile LibreChat ở chế độ sáng',
    mobileDarkAlt: 'Giao diện mobile LibreChat ở chế độ tối',
    trustedBy: 'Được các công ty trên toàn thế giới tin dùng',
    featuresHeading: 'Mọi thứ bạn cần',
    featuresSubtitle: 'Một nền tảng toàn diện cho các cuộc trò chuyện dùng AI',
    primaryActionsAria: 'Hành động chính',
    features: {
      agents: {
        title: 'Tác nhân',
        description: 'Tác nhân nâng cao với xử lý tệp, diễn giải mã và hành động API',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: 'Thực thi mã trong nhiều ngôn ngữ một cách an toàn, không cần thiết lập',
      },
      models: {
        title: 'Mô hình',
        description: 'Lựa chọn mô hình AI gồm Anthropic, AWS, OpenAI, Azure và hơn thế nữa',
      },
      artifacts: {
        title: 'Artifact',
        description: 'Tạo mã React, HTML và sơ đồ Mermaid trong chat',
      },
      search: {
        title: 'Tìm kiếm',
        description: 'Tìm tin nhắn, tệp và đoạn mã ngay lập tức',
      },
      mcp: {
        title: 'MCP',
        description: 'Kết nối với bất kỳ công cụ hoặc dịch vụ nào hỗ trợ Model Context Protocol',
      },
      memory: {
        title: 'Bộ nhớ',
        description: 'Ngữ cảnh bền vững giữa các cuộc trò chuyện để AI ghi nhớ bạn',
      },
      webSearch: {
        title: 'Tìm kiếm web',
        description:
          'Cho bất kỳ mô hình nào truy cập internet trực tiếp với tìm kiếm và reranking tích hợp',
      },
      authentication: {
        title: 'Xác thực',
        description: 'SSO sẵn sàng cho doanh nghiệp với OAuth, SAML, LDAP và xác thực hai yếu tố',
      },
    },
    learnMore: 'Tìm hiểu thêm',
    communityHeading: 'Open source, do cộng đồng dẫn dắt',
    communitySubtitle:
      'Tham gia cùng hàng nghìn nhà phát triển và tổ chức đang xây dựng với LibreChat',
    githubStars: 'Sao GitHub',
    dockerPulls: 'Lượt kéo Docker',
    contributors: 'Người đóng góp',
    communityLinksAria: 'Liên kết cộng đồng',
    githubAria: 'LibreChat trên GitHub',
    discordAria: 'LibreChat trên Discord',
    ctaHeading: 'Bắt đầu xây dựng với LibreChat',
    ctaSubtitle: 'Thiết lập trong vài phút với hướng dẫn bắt đầu nhanh của chúng tôi',
    quickstartGuide: 'Hướng dẫn bắt đầu nhanh',
    quickstartAria: 'Đọc hướng dẫn bắt đầu nhanh',
  },
}
