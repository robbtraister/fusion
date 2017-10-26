<template>
  <div>
    <hr style="margin: 0; border-color: #000; border-width: 4px" />
    <ul class="nav">
      <nav-item v-for="label in items" :key="label" :label="label" />
    </ul>
    <hr style="margin: 0; border-color: #000" />
  </div>
</template>

<script>
import NavItem from './nav-item.vue'

export default {
  components: {
    NavItem
  },
  data () {
    (typeof window !== 'undefined') &&
      window.fetch(`/_content/in-the-news`)
        .then(response => response.json())
        .then(json => {
          this.$set(this, 'items', json.content)
        })

    return {items: []}
  }
}
</script>
