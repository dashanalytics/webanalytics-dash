<script setup lang="ts">
import {AccessReport, GetDailyReports, GetHourlyReports, GetHumanUuids} from "../analytics.ts"
import {ref, watch} from "vue"
import AccessCountChart from "./AccessCountChart.vue";
import VisitorGeoMap from "./VisitorGeoMap.vue";
import CountryStatisticsChart from "./CountryStatisticsTable.vue";
import RawDataTable from "./RawDataTable.vue";

const recentDaysReports = ref()
const recentHoursReports = ref()

const props = defineProps({
  reports: Map<string, AccessReport>,
  start: String,
  end: String,
})

watch(props, () => {
  recentDaysReports.value = GetDailyReports(props.reports!, props.start!, props.end!)
  recentHoursReports.value = GetHourlyReports(props.reports!, props.start!, props.end!)
})
</script>

<template>
  <AccessCountChart :id="'day-statistics'" :reports="recentDaysReports"
                    :title="'Access Statistics - Daily'"></AccessCountChart>
  <AccessCountChart :id="'hour-statistics'" :reports="recentHoursReports"
                    :title="'Access Statistics - Hourly'"></AccessCountChart>
  <div class="flex md:flex-row">
    <VisitorGeoMap :reports="props.reports" :start="props.start" :end="props.end"></VisitorGeoMap>
    <CountryStatisticsChart :reports="props.reports" :start="props.start"
                            :end="props.end"></CountryStatisticsChart>
  </div>
  <div class="overflow-auto" style="max-width: 90vw">
    <RawDataTable :reports="reports" :humanUuids="GetHumanUuids(reports.values())"></RawDataTable>
  </div>
</template>

<style scoped>

</style>