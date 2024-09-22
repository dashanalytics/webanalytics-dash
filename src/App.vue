<script lang="ts" setup>
import {ref} from "vue";
import {AccessReport, FetchAccessReportsByRecentDays, FilterBotReports, Server, SortTimestamps} from "./analytics.ts";
import Dashboard from "./components/Dashboard.vue";

const statusText = ref('')
const statusTextStyle = ref('')

const showDashboard = ref(false)

const reports = ref(new Map<string, AccessReport>())

const start = ref('')
const end = ref('')

function insight() {
  const host = (document.getElementById('server') as HTMLInputElement).value
  const accessToken = (document.getElementById('access_token') as HTMLInputElement).value
  const dataRange = +(document.getElementById('data_range') as HTMLInputElement).value

  if (host.length == 0) {
    return
  }

  statusTextStyle.value = ''
  statusText.value = ''

  const server = {
    host: host,
    accessToken: accessToken,
  }

  statusTextStyle.value = 'font-bold text-blue-700'
  statusText.value = 'Fetching statistics...'

  showDashboard.value = false

  FetchAccessReportsByRecentDays(server as Server, dataRange).then((result) => {

    if ((document.getElementById('do-filter-bot') as HTMLInputElement).checked) {
      result = FilterBotReports(result)
    }

    let timestamps = []
    for (const [timestamp,] of result) {
      timestamps.push(timestamp)
    }
    SortTimestamps(timestamps)

    start.value = timestamps[0]
    end.value = timestamps[timestamps.length - 1]

    reports.value = result

    statusTextStyle.value = 'font-bold text-green-500'
    statusText.value = 'Success.'

    showDashboard.value = true

    setTimeout(() => document.getElementById('dashboard')!.scrollIntoView({behavior: 'smooth'}), 500)

  }).catch((err) => {
    statusTextStyle.value = 'font-bold text-red-700 bold'

    if (!(err instanceof Response)) {
      statusText.value = 'Check error in DevTools.'

      console.log(err)
      return
    }

    const resp = err as Response

    if (resp.status == undefined) {
      statusText.value = 'Check error in DevTools.'
      return
    }

    switch (resp.status) {
      case 403:
        statusText.value = '403: Forbidden - Authentication failure.'
        break
      case 404:
        statusText.value = '404: Not Found - API not supported.'
        break
      case 500:
        statusText.value = '500: Internal Server Error'
        break
      case 502:
        statusText.value = '502: Bad Gateway'
        break
      default:
        statusText.value = `${resp.status} ${resp.statusText}`
    }
  })
}

function share() {
  const host = (document.getElementById('server') as HTMLInputElement).value
  const accessToken = (document.getElementById('access_token') as HTMLInputElement).value
  const dataRange = (document.getElementById('data_range') as HTMLInputElement).value

  const params = new URLSearchParams()
  params.set('server', host)
  params.set('access_token', accessToken)
  params.set('data_range', dataRange)

  navigator.clipboard.writeText(`${location.protocol}//${location.host}/?${params.toString()}`)

  statusTextStyle.value = ''
  statusText.value = 'Copied to clipboard.'
}

document.body.onload = () => {
  const params = new URLSearchParams(window.location.search);

  const host = document.getElementById('server') as HTMLInputElement
  const accessToken = document.getElementById('access_token') as HTMLInputElement
  const dataRange = document.getElementById('data_range') as HTMLInputElement

  host.value = params.get('server')
  accessToken.value = params.get('access_token')
  dataRange.value = params.get('data_range') || '7'
}
</script>

<template>
  <div class="flex flex-col lg:flex-row items-center justify-center h-screen gap-y-1 gap-x-48">
    <div class="m-10"><img alt="logo" class="" src="./assets/dashanalytics.svg"/></div>
    <div class="w-full max-w-xl">
      <form class="m-5 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
            Server
          </label>
          <input
              id="server"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Server" type="text">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
            Access Token
          </label>
          <input
              id="access_token"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Access Token" type="password">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Data Range from Now (days)
          </label>
          <input
              id="data_range"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Days" type="number">
        </div>
        <div class="flex items-center mb-4">
          <input id="do-filter-bot" type="checkbox" checked
                 class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
          <label for="do-filter-bot" class="ms-2 text-sm font-bold">Filter Reports from Bots</label>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-row gap-2">
            <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                @click="insight()">
              Insight
            </button>
            <button
                class="bg-white hover:bg-gray-400 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                @click="share()">
              Share
            </button>
          </div>
          <p :class="statusTextStyle">{{ statusText }}</p>
        </div>
      </form>
      <p class="text-center text-gray-500 text-xs">
        <a href="https://jellyterra.com" target="_blank">&copy;2024 Jelly Terra. All rights reserved.</a>
      </p>
    </div>
  </div>
  <div id="dashboard" :class="{ hidden: !showDashboard }" class="flex flex-col items-center justify-center">
    <Dashboard :reports="reports" :start="start" :end="end"></Dashboard>
  </div>
</template>

<style scoped>
</style>
