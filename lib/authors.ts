export interface AuthorSocial {
  label: string
  url: string
}

export interface Author {
  id: string
  name: string
  subtitle: string
  bio: string
  avatar: string
  socials: AuthorSocial[]
}

export const authors: Author[] = [
  {
    id: 'danny',
    name: 'Danny Avila',
    subtitle: 'Founder and Maintainer of LibreChat',
    bio: "Danny Avila is a software engineer passionate about AI and web development. His expertise in automating processes and data analysis has been applied across many roles, from operations to accounting. Danny's work demonstrates a commitment to meaningful technology and community-driven innovation.",
    avatar: '/images/people/danny.webp',
    socials: [
      { label: 'GitHub', url: 'https://github.com/danny-avila' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/danny-avila/' },
      { label: 'X', url: 'https://x.com/lgtm_hbu' },
      { label: 'Email', url: 'mailto:danny@librechat.ai' },
    ],
  },
  {
    id: 'berry',
    name: 'Berry',
    subtitle: 'Collaborator for LibreChat',
    bio: '// TODO: Become a software engineer !self_taught++; // Debugging life, coding solutions',
    avatar: '/images/people/berry.png',
    socials: [
      { label: 'GitHub', url: 'https://github.com/Berry-13' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/marco-beretta-berry/' },
      { label: 'X', url: 'https://x.com/berry13000' },
      { label: 'Email', url: 'mailto:berry@librechat.ai' },
    ],
  },
  {
    id: 'fuegovic',
    name: 'Fuegovic',
    subtitle: 'Collaborator for LibreChat',
    bio: 'Fuegovic is a versatile artist known for creating captivating music across genres and actively contributing to open-source projects on GitHub.',
    avatar: '/images/people/fuegovic.png',
    socials: [
      { label: 'GitHub', url: 'https://github.com/fuegovic' },
      { label: 'Spotify', url: 'https://open.spotify.com/artist/3ZfaxdODbE1NrfQYsGO92R' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/fuegovic/' },
      { label: 'Email', url: 'mailto:fuegovic@librechat.ai' },
    ],
  },
  {
    id: 'rubent',
    name: 'RubenT',
    subtitle: 'Collaborator for LibreChat',
    bio: "I'm a self-taught programmer",
    avatar: '/images/people/rubent.png',
    socials: [
      { label: 'GitHub', url: 'https://github.com/rubentalstra' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/rubentalstra/' },
    ],
  },
  {
    id: 'librechat',
    name: 'LibreChat',
    subtitle: 'Every AI, For Everyone',
    bio: 'LibreChat is a free, open-source AI chat platform that empowers you to harness the capabilities of cutting-edge language models from multiple providers in a unified interface.',
    avatar: '/images/people/librechat.png',
    socials: [
      { label: 'GitHub', url: 'https://github.librechat.ai' },
      { label: 'LinkedIn', url: 'https://linkedin.librechat.ai/' },
      { label: 'X', url: 'https://x.com/LibreChatAI' },
      { label: 'Discord', url: 'https://discord.librechat.ai' },
      { label: 'YouTube', url: 'https://www.youtube.com/@LibreChat' },
      { label: 'Status Page', url: 'https://status.librechat.ai' },
      { label: 'Email', url: 'mailto:contact@librechat.ai' },
    ],
  },
  {
    id: 'anon',
    name: 'Anon',
    subtitle: '(>_<)',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla litora ridiculus magna et etiam mi. Dolor etiam id elit morbi ipsum mauris. Non dapibus urna platea elementum fusce vulputate.',
    avatar: '/images/people/anon.png',
    socials: [{ label: 'Email', url: 'mailto:contact@librechat.ai' }],
  },
]

export function getAuthorById(id: string): Author | undefined {
  return authors.find((author) => author.id === id)
}

export function getAllAuthorIds(): string[] {
  return authors.map((author) => author.id)
}
