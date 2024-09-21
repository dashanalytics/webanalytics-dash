<script setup lang="ts">
import {AccessReport} from "../analytics.ts";
import {countryName} from "../common.ts";

const props = defineProps({
  reports: Map<string, AccessReport>,
})
</script>

<template>
  <table>
    <thead>
    <tr>
      <th scope="col">Timestamp (UTC)</th>
      <th scope="col">Country / Region</th>
      <th scope="col">UUID</th>
      <th scope="col">Source IP</th>
      <th scope="col">User Agent</th>
      <th scope="col">Deploy Time</th>
      <th scope="col">Target</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="[timestamp, report] of props.reports" :style="[report.user_agent.includes('bot')?'color: gray':'']">
      <td>{{ timestamp }}</td>
      <td>{{ countryName.of(report.country) }}</td>
      <td style="font-size: 80%">{{ report.uuid }}</td>
      <td style="font-size: 80%">{{ report.source_ip }}</td>
      <td style="font-size: 50%; max-width: 10vw">{{ report.user_agent }}</td>
      <td>{{ report.deploy_time }}</td>
      <td>{{ report.target }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>