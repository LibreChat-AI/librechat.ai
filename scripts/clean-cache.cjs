const { execFileSync, execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

function cleanCache() {
  const isWindows = os.platform() === 'win32'
  // Invoke the locally installed next-sitemap binary directly instead of
  // `pnpm next-sitemap`. A nested bare `pnpm` can escape Corepack /
  // packageManager pinning and resolve a different major on PATH (observed on
  // local builds: pnpm 10.x on Node 20 while the outer build used 9.15.9).
  // Vercel happens not to hit this, but the resolution is still unpinned there.
  const nextSitemapBin = path.join(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    isWindows ? 'next-sitemap.cmd' : 'next-sitemap',
  )

  if (!fs.existsSync(nextSitemapBin)) {
    console.error(
      `next-sitemap binary not found at ${nextSitemapBin}. Run the package manager install first.`,
    )
    process.exit(1)
  }

  const removeCacheCommand = isWindows ? 'rmdir /s /q .next\\cache' : 'rm -rf .next/cache'

  try {
    // A .cmd shim can only be launched through cmd.exe, but passing the path as
    // an argument (rather than interpolating it into a shell string) lets Node
    // quote it, so a checkout path containing a space still resolves. POSIX
    // needs no shell at all: the shim carries a #!/bin/sh shebang.
    if (isWindows) {
      execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', nextSitemapBin], {
        stdio: 'inherit',
      })
    } else {
      execFileSync(nextSitemapBin, [], { stdio: 'inherit' })
    }
    // Cache removal keeps the platform-specific shell command.
    execSync(removeCacheCommand, { stdio: 'inherit' })
  } catch (error) {
    console.error('Error cleaning cache:', error)
    process.exit(1)
  }
}

cleanCache()
