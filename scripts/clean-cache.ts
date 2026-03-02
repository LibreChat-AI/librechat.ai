const { execSync } = require('child_process')
const os = require('os')

function cleanCache() {
  const isWindows = os.platform() === 'win32'
  const npmCommand = 'pnpm next-sitemap'
  const removeCacheCommand = isWindows ? 'rmdir /s /q .next\\cache' : 'rm -rf .next/cache'

  try {
    execSync(`${npmCommand} && ${removeCacheCommand}`, { stdio: 'inherit', shell: true })
  } catch (error) {
    console.error('Error cleaning cache:', error)
    process.exit(1)
  }
}

cleanCache()
