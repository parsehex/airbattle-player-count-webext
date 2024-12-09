import { onMessage } from 'webext-bridge/background'
// import type { Tabs } from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

// remove or turn this off if you don't use side panel
const USE_SIDE_PANEL = false

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  // @ts-expect-error missing types
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error))
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

// let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
// browser.tabs.onActivated.addListener(async ({ tabId }) => {
//   if (!previousTabId) {
//     previousTabId = tabId
//     return
//   }

//   let tab: Tabs.Tab

//   try {
//     tab = await browser.tabs.get(previousTabId)
//     previousTabId = tabId
//   }
//   catch {
//     return
//   }

//   // eslint-disable-next-line no-console
//   console.log('previous tab', tab)
//   sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
// })

const liveEndpoint = 'https://airbattle-ws.clickagain.xyz/'
// const devEndpoint = 'http://127.0.0.1:3501/'

const green = '#11DD11'
const orange = '#FFA500'
const red = '#FF0000'
async function updateBadge() {
  try {
    const response = await fetch(liveEndpoint)
    const data = await response.json()
    let players = data.players
    const bots = data.bots
    players = players - bots

    // store response in storage (as `lastData`)
    await browser.storage.local.set({ lastData: data })

    await browser.action.setBadgeText({ text: players.toString() })
    await browser.action.setBadgeBackgroundColor({
      color: players > 0 ? green : orange,
    })
  }
  catch (error) {
    await browser.action.setBadgeText({ text: '--' })
    await browser.action.setBadgeBackgroundColor({ color: red })
    throw new Error(`Failed to fetch data: ${error}`)
  }
}

// Set up alarm for periodic updates (every 1 minute)
browser.alarms.create('updateBadge', {
  periodInMinutes: 1,
})

// Listen for alarm
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateBadge')
    updateBadge()
})

// Initial update
updateBadge()

// Handle manual update requests
onMessage('update-data', () => {
  updateBadge()
})

// Optional: Clean up on extension uninstall/disable
browser.runtime.onSuspend.addListener(() => {
  browser.alarms.clear('updateBadge')
})
