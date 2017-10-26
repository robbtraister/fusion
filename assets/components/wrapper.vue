<template>
  <div>
    <banner />
    <div style="margin: 66px 30px 30px">
      <breaking />
      <app-title />
      <in-the-news />
      <slot />
    </div>
  </div>
</template>

<script>
import Banner from './banner.vue'
import Breaking from './breaking.vue'
import InTheNews from './in-the-news.vue'
import AppTitle from './title.vue'

export default {
  components: {
    Banner,
    Breaking,
    InTheNews,
    AppTitle
  }
}
</script>
