<script setup lang="ts">
import {AccessReport} from "../analytics.ts";
import {getCountryName} from "../common.ts";
import {ref} from "vue";
import IPDetailDialog from "./IPDetailDialog.vue";

const props = defineProps({
  reports: Map<string, AccessReport>,
  humanUuids: Set<string>,
})

const ipDetail = ref("")
const ipDetailShow = ref(0)

function change() {
  localStorage.setItem('ipLookupQueryString', (document.getElementById('ip-query-string') as HTMLInputElement).value)
}

document.addEventListener("DOMContentLoaded", () => {
  (document.getElementById('ip-query-string') as HTMLInputElement).value = localStorage.getItem('ipLookupQueryString')
})
</script>

<template>
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2" for="ip-query-string">IP Lookup Query String (URL with %s
      in place of query)</label>
    <input
        id="ip-query-string"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="https://api.ipgeolocation.io/ipgeo?apiKey=API_KEY&ip=%s" type="text"
        @change="change()">
  </div>
  <IPDetailDialog :ip="ipDetail" :trigger="ipDetailShow"></IPDetailDialog>
  <table>
    <thead>
    <tr>
      <th scope="col">Timestamp (UTC) / Your Time</th>
      <th scope="col">Region</th>
      <th scope="col">UUID</th>
      <th scope="col">Source IP</th>
      <th scope="col">User Agent</th>
      <th scope="col">Deploy ID</th>
      <th scope="col">Target</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="report of Array.from(props.reports.values()).reverse()"
        :style="[humanUuids.has(report.uuid)?'':'color: gray']">
      <td>{{ report.timestamp }}<br/>{{ new Date(report.time).toString() }}</td>
      <td>{{ getCountryName(report.country) }}</td>
      <td style="font-size: 80%">{{ report.uuid }}</td>
      <td style="font-size: 80%" @click="ipDetail = report.source_ip; ipDetailShow++">{{ report.source_ip }}</td>
      <td style="font-size: 50%; max-width: 10vw">{{ report.user_agent }}</td>
      <td>{{ report.deploy_time }}</td>
      <td>{{ report.target }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>