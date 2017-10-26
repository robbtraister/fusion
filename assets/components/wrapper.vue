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
const Banner = require('./banner.vue')
const Breaking = require('./breaking.vue')
const InTheNews = require('./in-the-news.vue')
const AppTitle = require('./title.vue')

module.exports = {
  components: {
    Banner,
    Breaking,
    InTheNews,
    AppTitle
  }
}
</script>
