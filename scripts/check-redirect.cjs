const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()

  const startUrl = 'http://localhost:3333/docs/configuration/librechat_yaml/setup'
  const expectedBase = '/docs/configuration/librechat_yaml'

  console.log('Navigating to:', startUrl)

  const response = await page.goto(startUrl, { waitUntil: 'networkidle', timeout: 30000 })

  const finalUrl = page.url()
  const title = await page.title()

  console.log('Final URL:', finalUrl)
  console.log('Page title:', title)
  console.log('HTTP status (initial):', response?.status())

  const finalPath = new URL(finalUrl).pathname
  const redirectWorked = finalPath === expectedBase || finalPath === expectedBase + '/'

  if (redirectWorked) {
    console.log('RESULT: PASS - redirect worked correctly')
  } else {
    console.log('RESULT: FAIL - did not redirect to expected path')
    console.log('  Expected path:', expectedBase)
    console.log('  Actual path:  ', finalPath)
  }

  const screenshotPath = path.resolve('e2e/redirect-check.png')
  await page.screenshot({ path: screenshotPath, fullPage: false })
  console.log('Screenshot saved to:', screenshotPath)

  await browser.close()
})()
