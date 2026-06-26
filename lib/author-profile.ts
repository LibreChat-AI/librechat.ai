import type { Author } from './authors'

export interface AuthorAccent {
  badge: string
  imageRing: string
  wash: string
}

const fallbackAccent: AuthorAccent = {
  badge: 'bg-stone-500/10 text-stone-700 ring-stone-500/20 dark:text-stone-300',
  imageRing: 'ring-stone-500/25',
  wash: 'from-stone-500/15 via-zinc-500/10 to-neutral-500/15',
}

const accentsByAuthor: Record<string, AuthorAccent> = {
  danny: {
    badge: 'bg-cyan-500/10 text-cyan-700 ring-cyan-500/20 dark:text-cyan-300',
    imageRing: 'ring-cyan-500/30',
    wash: 'from-cyan-500/15 via-sky-500/10 to-blue-500/15',
  },
  berry: {
    badge: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    imageRing: 'ring-emerald-500/30',
    wash: 'from-lime-500/15 via-emerald-500/10 to-teal-500/15',
  },
  dustinhealy: {
    badge: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
    imageRing: 'ring-amber-500/30',
    wash: 'from-amber-500/15 via-orange-500/10 to-rose-500/15',
  },
  fuegovic: {
    badge: 'bg-fuchsia-500/10 text-fuchsia-700 ring-fuchsia-500/20 dark:text-fuchsia-300',
    imageRing: 'ring-fuchsia-500/30',
    wash: 'from-fuchsia-500/15 via-pink-500/10 to-orange-500/15',
  },
  rubent: {
    badge: 'bg-teal-500/10 text-teal-700 ring-teal-500/20 dark:text-teal-300',
    imageRing: 'ring-teal-500/30',
    wash: 'from-teal-500/15 via-cyan-500/10 to-sky-500/15',
  },
  librechat: {
    badge: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300',
    imageRing: 'ring-sky-500/30',
    wash: 'from-sky-500/15 via-cyan-500/10 to-lime-500/15',
  },
  anon: {
    badge: 'bg-lime-500/10 text-lime-700 ring-lime-500/20 dark:text-lime-300',
    imageRing: 'ring-lime-500/30',
    wash: 'from-lime-500/15 via-green-500/10 to-emerald-500/15',
  },
}

export function getAuthorAccent(author: Pick<Author, 'id'>): AuthorAccent {
  return accentsByAuthor[author.id] ?? fallbackAccent
}
