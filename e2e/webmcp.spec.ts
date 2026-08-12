import { expect, test } from '@playwright/test'

interface WebMCPTestState {
  tools: WebMCPToolDefinition[]
  abortedTools: string[]
}

test('registers WebMCP tools on page load through document.modelContext', async ({ page }) => {
  await page.addInitScript(() => {
    const state: WebMCPTestState = { tools: [], abortedTools: [] }
    const modelContext: WebMCPModelContext = {
      registerTool(tool, options) {
        state.tools.push(tool)
        options?.signal?.addEventListener('abort', () => state.abortedTools.push(tool.name), {
          once: true,
        })
      },
    }

    Object.defineProperty(window, '__webMCPTestState', { value: state, configurable: true })
    Object.defineProperty(document, 'modelContext', { value: modelContext, configurable: true })
  })

  await page.goto('/')

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as {
              __webMCPTestState: WebMCPTestState
            }
          ).__webMCPTestState.tools.length,
      ),
    )
    .toBe(3)

  const metadata = await page.evaluate(() =>
    (
      window as unknown as {
        __webMCPTestState: WebMCPTestState
      }
    ).__webMCPTestState.tools.map(({ name, description, inputSchema, execute }) => ({
      name,
      description,
      inputSchema,
      hasExecute: typeof execute === 'function',
    })),
  )

  expect(metadata.map(({ name }) => name)).toEqual([
    'search_librechat_docs',
    'navigate_librechat_site',
    'get_librechat_doc',
  ])
  for (const tool of metadata) {
    expect(tool.description).not.toBe('')
    expect(tool.inputSchema).toMatchObject({ type: 'object' })
    expect(tool.hasExecute).toBe(true)
  }

  await page.evaluate(async () => {
    const { tools } = (
      window as unknown as {
        __webMCPTestState: WebMCPTestState
      }
    ).__webMCPTestState
    const navigationTool = tools.find(({ name }) => name === 'navigate_librechat_site')
    if (!navigationTool) throw new Error('Navigation tool was not registered')
    await navigationTool.execute({ path: '/about' })
  })

  await expect(page).toHaveURL(/\/about$/)
})
