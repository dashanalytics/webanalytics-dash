<script lang="ts" setup>
import {AccessReport, GetCountryReports, GetReportsInRange} from "../analytics.ts"
import {ref, watch} from "vue"
import GeoJSON from 'ol/format/GeoJSON.js'
import * as ol from 'ol'
import {Feature} from 'ol'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import View from 'ol/View.js'
import {Fill, Style} from "ol/style"
import {colorGradient, getCountryName, MapValues, RGB} from "../common.ts"

const props = defineProps({
  reports: Map<string, AccessReport>,
  start: String,
  end: String,
})

let tooltipCountryName = ref('')
let tooltipRequestCount = ref('')

let map = null

watch(props, () => {
  const reports = GetReportsInRange(props.reports!, props.start!, props.end!)

  const countryReports = GetCountryReports(MapValues(reports))

  let countryCounts: number[] = []
  for (const [, reports] of countryReports) {
    countryCounts.push(reports.length)
  }
  countryCounts.sort((a, b) => a - b)

  const max = countryCounts[countryCounts.length - 1]
  const base = 1 / max

  const source = new VectorSource({
    url: 'https://openlayersbook.github.io/openlayers_book_samples/assets/data/countries.geojson',
    format: new GeoJSON(),
  })

  const vectorLayer = new VectorLayer({
    background: '#fff',
    source: source,
    style: (feature: Feature) => {
      let color = '#cecece'

      const countryCode = feature.get('iso_a2')

      if (countryReports.has(countryCode)) {
        color = colorGradient(new RGB(0xce, 0xce, 0xce), new RGB(0x22, 0x5d, 0xb0), countryReports.get(countryCode)!.length * base)
      }

      return new Style({
        fill: new Fill({
          color: color
        })
      })
    },
  })

  map?.dispose()
  map = new ol.Map({
    layers: [vectorLayer],
    target: 'map',
    view: new View({
      center: [0, 0],
      zoom: 1,
    }),
  })

  const featureOverlay = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: {
      'stroke-color': 'rgba(255, 255, 255, 0.7)',
      'stroke-width': 2,
    },
  })

  let highlight
  const displayFeatureInfo = function (evt, pixel) {
    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
      return feature
    })

    const tooltipElement = document.getElementById('map-tooltip')!

    const countryCode = feature.get('iso_a2')

    tooltipCountryName.value = getCountryName(countryCode)
    tooltipRequestCount.value = `${countryReports.get(countryCode)?.length || 'N/A'}`

    tooltipElement!.style.left = `${evt.originalEvent.clientX - tooltipElement.clientWidth / 2}px`
    tooltipElement!.style.top = `${window.scrollY + evt.originalEvent.clientY - tooltipElement.clientHeight - 10}px`

    if (feature !== highlight) {
      if (highlight) {
        tooltipElement.style.display = 'none'
        featureOverlay.getSource()!.removeFeature(highlight)
      }
      if (feature) {
        tooltipElement.style.display = 'block'
        featureOverlay.getSource()!.addFeature(feature)
      }
      highlight = feature
    }
  }

  map.on('pointermove', function (evt) {
    if (evt.dragging) {
      return
    }

    const pixel = map.getEventPixel(evt.originalEvent)
    displayFeatureInfo(evt, pixel)
  })
})
</script>

<template>
  <div id="map-tooltip"
       style="position: absolute; background-color: black; color: white; padding: 5px 10px; z-index: 10; opacity: 0.8; border-radius: 8px; user-select: none; display: none">
    {{ tooltipCountryName }}: <span style="font-weight: bold">{{ tooltipRequestCount }}</span> requests
  </div>
  <div id="map" style="width: 80vw; height: 60vh"></div>
</template>

<style scoped>

</style>