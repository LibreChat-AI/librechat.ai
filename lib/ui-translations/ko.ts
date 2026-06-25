import type { UIStrings } from '@/lib/ui-i18n'

export const ko: UIStrings = {
  nav: {
    docs: '문서',
    blog: '블로그',
    changelog: '변경 기록',
    discord: 'Discord',
    joinDiscord: 'Discord 참여',
  },
  pageActions: {
    copyMarkdown: 'Markdown 복사',
    copyMarkdownAria: '페이지를 Markdown으로 복사',
    open: '열기',
    openAria: '외부 도구에서 페이지 열기',
    openInGitHub: 'GitHub에서 열기',
    openInLibreChat: 'LibreChat에서 열기',
    openInChatGPT: 'ChatGPT에서 열기',
    openInClaude: 'Claude에서 열기',
    openInGemini: 'Gemini에서 열기',
    openInPerplexity: 'Perplexity에서 열기',
    openInCursor: 'Cursor에서 열기',
  },
  feedback: {
    question: '이 가이드는 어떤가요?',
    good: '좋음',
    bad: '나쁨',
    thanks: '피드백 감사합니다!',
    submitAgain: '다시 제출',
    placeholder: '추가 피드백이 있나요? (선택 사항)',
    submit: '제출',
    additionalAria: '추가 피드백',
  },
  version: {
    label: '버전',
    aria: '문서 버전 선택',
  },
  logoMenu: {
    openNewTab: '새 탭에서 열기',
    logoPng: '로고 (png)',
    logoSvg: '로고 (svg)',
    docsLogoPng: '문서 로고 (png)',
    docsLogoSvg: '문서 로고 (svg)',
  },
  common: {
    learnMore: '자세히 알아보기',
    getStarted: '시작하기',
    readDocs: '문서 읽기',
    viewFullGuide: '전체 가이드 보기',
    recommended: '추천',
    prerequisites: '사전 요구 사항',
    commands: '명령',
    explore: '살펴보기',
    resources: '리소스',
  },
  resources: {
    changelog: { title: '변경 기록', description: '최신 릴리스' },
    roadmap: { title: '2026 로드맵', description: '계획된 내용' },
    discord: { title: 'Discord', description: '도움 받기' },
  },
  docsHub: {
    sections: {
      deploy: '배포',
      configure: '구성',
      use: '사용',
      contribute: '기여',
    },
    items: {
      quickStart: { title: '빠른 시작', description: '5분 Docker 설정' },
      local: { title: '로컬 설치', description: 'Docker, npm, Helm Chart' },
      remote: { title: '원격 호스팅', description: 'DigitalOcean, Railway 등' },
      configuration: {
        title: '구성',
        description: '환경 변수, YAML, 인증',
      },
      customEndpoints: {
        title: '사용자 지정 엔드포인트',
        description: 'Ollama, Deepseek, Groq 등을 연결',
      },
      features: { title: '기능', description: 'MCP, 에이전트, Code Interpreter, 아티팩트' },
      userGuides: {
        title: '사용자 가이드',
        description: '프리셋, 팁, 모범 사례',
      },
      development: {
        title: '개발',
        description: '기여, 아키텍처, 디버깅',
      },
    },
  },
  quickStartHub: {
    ariaLabel: '빠른 시작 가이드',
    methods: {
      docker: {
        tag: '추천',
        time: '~5분',
        description:
          '모든 것이 포함되어 있습니다 — MongoDB, MeiliSearch, RAG API가 자동으로 실행됩니다.',
        steps: ['저장소 복제', '.env.example을 .env로 복사', 'docker compose up 실행'],
        prereqs: ['Docker Desktop'],
      },
      npm: {
        tag: '',
        time: '~20분',
        description:
          'Node.js를 사용한 수동 설정입니다. 별도의 MongoDB 및 MeiliSearch 인스턴스가 필요합니다.',
        steps: ['복제하고 의존성 설치', '.env 구성 및 MongoDB 시작', 'npm run backend 실행'],
        prereqs: ['Node.js v20.19+', 'MongoDB 인스턴스'],
      },
      railway: {
        tag: '원클릭',
        time: '~3분',
        description: '클라우드에 즉시 배포합니다. 로컬 설정, Docker, 관리할 서버가 필요 없습니다.',
        steps: ['배포 버튼 클릭', 'GitHub 연결', '환경 변수 설정'],
        prereqs: ['Railway 계정', 'GitHub 계정'],
      },
    },
    afterInstallationHeading: '설치 후',
    connectProviders: {
      title: 'AI 제공자 연결',
      description: 'OpenRouter, Ollama, Deepseek, Groq 및 기타 OpenAI 호환 서비스를 추가',
    },
    exploreFeatures: {
      title: '기능',
      description: '에이전트, MCP, 웹 검색, RAG, 아티팩트, 이미지 생성 등',
    },
    exploreUserGuides: {
      title: '사용자 가이드',
      description: '프리셋과 AI 제공자를 사용하고 인터페이스를 탐색하는 방법을 알아보기',
    },
  },
  featuresHub: {
    ariaLabel: '기능 탐색',
    featuredHeading: '추천',
    coreFeaturesHeading: '핵심 기능',
    hero: {
      title: 'Model Context Protocol',
      description:
        'MCP를 통해 AI 모델을 외부 도구나 서비스에 연결합니다 — AI 도구 통합을 위한 개방형 표준',
    },
    highlights: {
      agents: {
        title: '에이전트',
        description:
          '도구, 파일 처리, 코드 실행, API 작업을 갖춘 사용자 지정 AI 어시스턴트를 코딩 없이 만듭니다.',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: 'Python, JavaScript, Go, Rust 등을 안전한 샌드박스에서 설정 없이 실행합니다.',
      },
      artifacts: {
        title: '아티팩트',
        description:
          'React 컴포넌트, HTML 페이지, Mermaid 다이어그램을 채팅 안에서 바로 생성합니다.',
      },
      memory: {
        title: '메모리',
        description: '대화 간 지속 컨텍스트로 AI가 선호도와 기록을 기억합니다.',
      },
      webSearch: {
        title: '웹 검색',
        description: '내장 검색과 reranking으로 모든 모델에 실시간 인터넷 접근을 제공합니다.',
      },
      authentication: {
        title: '인증',
        description: 'OAuth2, SAML, LDAP 및 2단계 인증을 갖춘 기업용 SSO.',
      },
    },
    categories: {
      searchKnowledge: {
        title: '검색 및 지식',
        items: {
          webSearch: {
            title: '웹 검색',
            description: '내장 검색과 reranking을 통한 실시간 인터넷 접근',
          },
          search: {
            title: '검색',
            description: 'Meilisearch로 메시지와 대화를 찾기',
          },
          ragApi: {
            title: 'RAG API',
            description: 'retrieval-augmented generation으로 파일과 채팅',
          },
          memory: { title: '메모리', description: '대화 간 지속 컨텍스트' },
          ocr: { title: 'OCR', description: '이미지와 문서에서 텍스트 추출' },
        },
      },
      media: {
        title: '미디어',
        items: {
          imageGen: {
            title: '이미지 생성',
            description: 'GPT-Image-1, DALL-E, Stable Diffusion, Flux로 이미지 생성',
          },
          uploadAsText: {
            title: '텍스트로 업로드',
            description: '파일을 텍스트 입력으로 업로드하고 처리',
          },
        },
      },
      chat: {
        title: '채팅',
        items: {
          fork: { title: 'Fork', description: '대화를 여러 스레드로 분할' },
          importConvos: {
            title: '대화 가져오기',
            description: 'ChatGPT 및 다른 플랫폼의 채팅 가져오기',
          },
          shareableLinks: {
            title: '공유 가능한 링크',
            description: '공개 링크로 대화 공유',
          },
          temporaryChat: {
            title: '임시 채팅',
            description: '기록에 저장되지 않는 비공개 대화',
          },
          urlQuery: {
            title: 'URL 쿼리 매개변수',
            description: 'URL을 통해 채팅을 동적으로 구성',
          },
          resumableStreams: {
            title: '재개 가능한 스트림',
            description: '자동 재연결 및 중단된 응답 재개',
          },
        },
      },
      security: {
        title: '보안',
        items: {
          authentication: {
            title: '인증',
            description: 'OAuth2, SAML, LDAP 등을 사용한 다중 사용자 인증',
          },
          adminPanel: {
            title: '관리자 패널',
            description: '사용자, 역할, 구성 오버라이드를 위한 브라우저 UI',
          },
          passwordReset: {
            title: '비밀번호 재설정',
            description: '이메일 기반 비밀번호 복구',
          },
          moderation: {
            title: '모더레이션 시스템',
            description: '콘텐츠 모더레이션 및 안전 제어',
          },
        },
      },
    },
  },
  localInstallHub: {
    bundledHeading: 'Docker에 포함',
    bundledNote:
      'Docker Compose가 모든 의존성을 처리합니다. npm 또는 Helm을 사용하면 이러한 서비스를 별도로 설치하고 구성합니다.',
    chooseMethodHeading: '방법 선택',
    difficulty: {
      Beginner: '초급',
      Intermediate: '중급',
      Advanced: '고급',
    },
    externalServicesRequired: '외부 서비스 필요',
    methods: {
      docker: {
        description:
          '모든 것이 컨테이너에서 실행됩니다. MongoDB, MeiliSearch, RAG API, Vector DB가 자동으로 포함됩니다.',
      },
      npm: {
        description:
          'Node.js로 LibreChat을 직접 실행합니다. MongoDB, MeiliSearch 같은 외부 서비스를 직접 관리합니다.',
      },
      helm: {
        description:
          'Helm을 사용해 Kubernetes에 배포합니다. 프로덕션 클러스터와 infrastructure-as-code 워크플로에 적합합니다.',
      },
    },
    notRunningLocallyHeading: '로컬에서 실행하지 않나요?',
    remoteHosting: {
      title: '원격 호스팅',
      description: 'DigitalOcean, Railway, Azure 등',
    },
    envConfig: {
      title: '.env 구성',
      description: '환경 변수에 대한 심층 가이드',
    },
  },
  footer: {
    headings: {
      about: '소개',
      resources: '리소스',
      documentation: '문서',
      blog: '블로그',
      newsletter: '뉴스레터',
      legal: '법적 고지',
    },
    items: {
      about: '소개',
      contactUs: '문의하기',
      features: '기능',
      changelog: '변경 기록',
      roadmap: '로드맵',
      demo: '데모',
      status: '상태',
      getStarted: '시작하기',
      localInstall: '로컬 설치',
      remoteInstall: '원격 설치',
      blog: '블로그',
      blogAuthors: '블로그 작성자',
      subscribe: '구독',
      unsubscribe: '구독 취소',
      termsOfService: '서비스 약관',
      privacyPolicy: '개인정보 처리방침',
      cookiePolicy: '쿠키 정책',
    },
  },
  toolkit: {
    credentials: {
      generate: '자격 증명 생성',
      regenerate: '다시 생성',
      generateAria: '새 자격 증명 생성',
      regionAria: '생성된 자격 증명',
      copy: '복사',
      copied: '복사됨',
      copyAria: '{label} 복사',
      valueAria: '{label} 값',
      copyAll: '.env로 모두 복사',
      copiedAll: '클립보드에 복사됨!',
      copyAllAria: '모든 자격 증명을 .env 블록으로 복사',
      allCopiedStatus: '5개 자격 증명이 모두 KEY=value 형식으로 복사됨',
      emptyPrefix: '위 버튼을 클릭해 다음을 위한 안전한 임의 자격 증명을 생성하세요:',
      emptySuffix: '파일.',
      hints: {
        CREDS_KEY: '저장된 자격 증명 암호화 키',
        CREDS_IV: '암호화 초기화 벡터',
        JWT_SECRET: '액세스 토큰 서명용 비밀',
        JWT_REFRESH_SECRET: '리프레시 토큰 서명용 비밀',
        MEILI_KEY: 'MeiliSearch 마스터 키',
      },
    },
    yaml: {
      dropFile: 'YAML 파일을 여기에 놓으세요',
      placeholder: 'librechat.yaml 내용을 여기에 붙여넣거나 파일을 끌어다 놓으세요...',
      empty: 'YAML을 붙여넣거나 놓으면 검증 결과가 여기에 표시됩니다.',
      valid: 'YAML이 유효합니다!',
      clear: '지우기',
      clearAria: '편집기 지우기',
      badIndentation:
        '{line}행의 들여쓰기가 잘못되었습니다. 각 YAML 항목은 올바르게 들여써야 합니다.',
      errorAtLine: '{line}행의 {reason}',
      unknownError: '알 수 없는 YAML 오류',
    },
  },
  home: {
    metaTitle: 'LibreChat - 오픈소스 AI 플랫폼',
    metaDescription:
      'LibreChat은 모든 AI 대화를 하나의 통합되고 사용자 지정 가능한 인터페이스로 모읍니다.',
    starOnGitHub: 'GitHub에서 스타 주기',
    starAria: 'GitHub에서 LibreChat에 스타 주기 — {count}개 스타',
    heroTitleTop: '오픈소스',
    heroTitleBottom: 'AI 플랫폼',
    heroSubtitle:
      'LibreChat은 모든 AI 대화를 하나의 통합되고 사용자 지정 가능한 인터페이스로 모읍니다',
    getStarted: '시작하기',
    getStartedAria: 'LibreChat 문서로 시작하기',
    tryDemo: '데모 사용',
    tryDemoAria: 'LibreChat 데모 사용',
    desktopLightAlt: '라이트 모드의 LibreChat 데스크톱 인터페이스',
    desktopDarkAlt: '다크 모드의 LibreChat 데스크톱 인터페이스',
    mobileLightAlt: '라이트 모드의 LibreChat 모바일 인터페이스',
    mobileDarkAlt: '다크 모드의 LibreChat 모바일 인터페이스',
    trustedBy: '전 세계 기업들이 신뢰합니다',
    featuresHeading: '필요한 모든 것',
    featuresSubtitle: 'AI 기반 대화를 위한 종합 플랫폼',
    primaryActionsAria: '주요 작업',
    features: {
      agents: {
        title: '에이전트',
        description: '파일 처리, 코드 해석, API 작업을 갖춘 고급 에이전트',
      },
      codeInterpreter: {
        title: 'Code Interpreter',
        description: '여러 언어의 코드를 안전하게 설정 없이 실행',
      },
      models: {
        title: '모델',
        description: 'Anthropic, AWS, OpenAI, Azure 등을 포함한 AI 모델 선택',
      },
      artifacts: {
        title: '아티팩트',
        description: '채팅에서 React, HTML 코드와 Mermaid 다이어그램 생성',
      },
      search: {
        title: '검색',
        description: '메시지, 파일, 코드 조각을 즉시 검색',
      },
      mcp: {
        title: 'MCP',
        description: 'Model Context Protocol을 지원하는 모든 도구나 서비스에 연결',
      },
      memory: {
        title: '메모리',
        description: '대화 간 지속 컨텍스트로 AI가 사용자를 기억합니다',
      },
      webSearch: {
        title: '웹 검색',
        description: '내장 검색과 reranking으로 모든 모델에 실시간 인터넷 접근 제공',
      },
      authentication: {
        title: '인증',
        description: 'OAuth, SAML, LDAP 및 2단계 인증을 갖춘 기업용 SSO',
      },
    },
    learnMore: '자세히 알아보기',
    communityHeading: '오픈소스, 커뮤니티 중심',
    communitySubtitle: 'LibreChat으로 구축하는 수천 명의 개발자와 조직에 합류하세요',
    githubStars: 'GitHub 스타',
    dockerPulls: 'Docker Pull',
    contributors: '기여자',
    communityLinksAria: '커뮤니티 링크',
    githubAria: 'GitHub의 LibreChat',
    discordAria: 'Discord의 LibreChat',
    ctaHeading: 'LibreChat으로 구축 시작',
    ctaSubtitle: '빠른 시작 가이드로 몇 분 안에 실행하세요',
    quickstartGuide: '빠른 시작 가이드',
    quickstartAria: '빠른 시작 가이드 읽기',
  },
}
