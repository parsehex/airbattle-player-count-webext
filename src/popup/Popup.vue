<script setup lang="ts">
import { sendMessage } from 'webext-bridge/popup'

const playersList = ref<{ id: number, name: string }[]>([])

onMounted(async () => {
  const lastData = await browser.storage.local.get('lastData')
  playersList.value = (lastData as any).lastData?.playersList ?? []
})

browser.storage.onChanged.addListener((changes) => {
  for (const [key, { newValue }] of Object.entries(changes)) {
    if (key === 'lastData') {
      playersList.value = (newValue as any).playersList
    }
  }
})
</script>

<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <h1 class="text-2xl font-bold mb-4">
      Airbattle Players List
    </h1>
    <ul>
      <li v-for="player in playersList" :key="player.id">
        {{ player.name }}
      </li>
    </ul>
    <p v-if="playersList.length === 0">
      No players found ☹️
    </p>
    <button
      class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="sendMessage('update-data', null)"
    >
      Refresh
    </button>
  </main>
</template>
