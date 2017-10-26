<template>
  <nav class="navbar fixed-top navbar-expand navbar-dark bg-dark">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon" />
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <nav-item v-for="label in sections" :key="label" :label="label" />
      </ul>
    </div>
  </nav>
</template>

<script>
const NavItem = require('./nav-item.vue')

module.exports = {
  components: {
    NavItem
  },
  data: () => ({
    sections: [
      'Politics',
      'Opinions',
      'Sports',
      'Local',
      'National',
      'World',
      'Vue'
    ]
  })
}
</script>
