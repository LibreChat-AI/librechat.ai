/**
 * Renders one or more JSON-LD (schema.org) objects into a page as a
 * `<script type="application/ld+json">` tag. Server-rendered so the structured
 * data is present in the initial HTML for crawlers.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data)
  return (
    <script
      type="application/ld+json"
      // Escape `<` to prevent the JSON payload from terminating the <script> tag.
      dangerouslySetInnerHTML={{ __html: json.replaceAll('<', '\\u003c') }}
    />
  )
}
