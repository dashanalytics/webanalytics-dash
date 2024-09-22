<script setup lang="ts">
import * as echarts from 'echarts'
import {AccessReport, GetReportsByUniqueIP, GetReportsByUniqueVisitor} from "../analytics.ts"
import {watch} from "vue"

const props = defineProps({
  reports: Map<string, AccessReport[]>,
  title: String,
  id: String,
})

let chart = null

watch(props, () => {
  let times: string[] = []
  let counts: number[] = []
  let uniqueVisitors: number[] = []
  let uniqueIPs: number[] = []

  for (const [timeText, reports] of props.reports!) {
    times.push(timeText)
    counts.push(reports.length)
    uniqueVisitors.push(GetReportsByUniqueVisitor(reports).size)
    uniqueIPs.push(GetReportsByUniqueIP(reports).size)
  }

  chart?.dispose()
  chart = echarts.init(document.getElementById(props.id!), {})

  chart.setOption({
    title: {
      text: props.title!
    },
    tooltip: {},
    legend: {
      data: ['Access', 'Unique Visitors', 'Unique IPs']
    },
    xAxis: {
      data: times
    },
    yAxis: {},
    series: [
      {
        name: 'Access',
        type: 'bar',
        data: counts,
      },
      {
        name: 'Unique Visitors',
        type: 'bar',
        data: uniqueVisitors,
      },
      {
        name: 'Unique IPs',
        type: 'bar',
        data: uniqueIPs,
      }
    ]
  })
})
</script>

<template>
  <div :id="props.id" class="m-10" style="overflow: auto; width: 80vw; height: 60vh"></div>
</template>

<style scoped>

</style>