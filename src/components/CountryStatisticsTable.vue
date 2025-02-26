<script setup lang="ts">
import {
  AccessReport,
  GetCountryReports,
  GetReportsByUniqueIP,
  GetReportsByUniqueVisitor,
  GetReportsInRange
} from "../analytics.ts"
import {ref, watch} from "vue"
import {getCountryName, MapValues} from "../common.ts"

const props = defineProps({
  reports: Map<string, AccessReport>,
  start: String,
  end: String,
})

class CountryStatistics {
  public accessCount = 0
  public uniqueVisitorsN = 0
  public uniqueIPsN = 0
}

const statisticsRef = ref(new Map<string, CountryStatistics>())

watch(props, () => {
  const reports = GetReportsInRange(props.reports!, props.start!, props.end!)
  const statistics = new Map<string, CountryStatistics>()

  const countryReports = GetCountryReports(MapValues(reports))

  for (const [country, reports] of countryReports) {
    statistics.set(country, {
      accessCount: reports.length,
      uniqueVisitorsN: GetReportsByUniqueVisitor(reports).size,
      uniqueIPsN: GetReportsByUniqueIP(reports).size,
    } as CountryStatistics)
  }

  statisticsRef.value = statistics
})
</script>

<template>
  <table>
    <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Unique Visitors</th>
      <th scope="col">Unique IPs</th>
      <th scope="col">Access Count</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="[country, statistics] of statisticsRef">
      <td>{{ getCountryName(country) }}</td>
      <td>{{ statistics.uniqueVisitorsN }}</td>
      <td>{{ statistics.uniqueIPsN }}</td>
      <td>{{ statistics.accessCount }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>