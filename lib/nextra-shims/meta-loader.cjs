/**
 * Webpack loader that replaces Nextra _meta.ts file content with a
 * dummy React component default export. This prevents Next.js from
 * failing during build optimization when it expects all files in
 * pages/ to export a React component.
 *
 * This shim is temporary and will be removed once all pages/ content
 * is migrated to the Fumadocs app/ directory.
 */
/* eslint-env node */
module.exports = function metaLoader() {
  return `
    export default function MetaPlaceholder() { return null; }
    export const getStaticProps = () => ({ notFound: true });
  `;
};
