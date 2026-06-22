import { MT_BANNER } from '@/lib/i18n'

export function MachineTranslatedBanner({
  locale,
  englishHref,
  githubHref,
}: {
  locale: string
  englishHref: string
  githubHref: string
}) {
  const strings = MT_BANNER[locale]
  if (!strings) return null

  return (
    <aside
      role="note"
      className="mb-6 rounded-lg border border-fd-border bg-fd-muted/50 px-4 py-3 text-sm text-fd-muted-foreground"
    >
      <p className="m-0">
        {strings.notice}{' '}
        <a href={englishHref} className="font-medium underline">
          {strings.original}
        </a>
        {' · '}
        <a href={githubHref} className="font-medium underline" target="_blank" rel="noreferrer">
          {strings.improve}
        </a>
      </p>
    </aside>
  )
}
