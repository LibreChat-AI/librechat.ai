/**
 * Nextra compatibility shim for `nextra/context`.
 * Provides stub implementations so existing pages/ components
 * can resolve their imports during the migration to Fumadocs.
 *
 * Components like ChangelogHeader use:
 *   const pages = getPagesUnderRoute('/changelog');
 *   const page = pages.find(p => p.route === router.pathname);
 *   const { title } = page.frontMatter;
 *
 * We return a Proxy-based array that always matches .find() calls,
 * returning a safe stub page with empty frontMatter defaults.
 */

const safeFrontMatter: Record<string, any> = new Proxy(
  {
    title: '',
    description: '',
    date: new Date().toISOString(),
    ogImage: '',
    ogVideo: '',
    gif: undefined,
    authorid: '',
    author: '',
    version: '',
    tags: [],
    category: '',
    featured: false,
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop as string]
      return ''
    },
  },
)

function createStubPage(route: string): any {
  return {
    name: route.split('/').pop() || 'stub',
    route,
    kind: 'MdxPage',
    frontMatter: safeFrontMatter,
    meta: { title: '' },
    children: [],
  }
}

/**
 * Returns a proxy array that intercepts .find() calls to always return
 * a valid stub page, preventing undefined access errors.
 */
export function getPagesUnderRoute(route: string): any[] {
  const stubArray: any[] = []

  return new Proxy(stubArray, {
    get(target, prop, receiver) {
      if (prop === 'find') {
        return (_predicate: any) => createStubPage(route)
      }
      if (prop === 'filter') {
        return (_predicate: any) => []
      }
      if (prop === 'sort') {
        return (_compareFn: any) => receiver
      }
      if (prop === 'slice') {
        return () => []
      }
      if (prop === 'map') {
        return (_mapFn: any) => []
      }
      if (prop === 'flatMap') {
        return (_mapFn: any) => []
      }
      if (prop === 'length') {
        return 0
      }
      if (prop === Symbol.iterator) {
        return function* () {}
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

/**
 * Stub for useConfig - returns a config object with empty frontMatter.
 */
export function useConfig(): any {
  return {
    title: '',
    frontMatter: safeFrontMatter,
  }
}
