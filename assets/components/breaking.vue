<template>
  <div v-if="breaking" class="alert alert-secondary alert-dismissible" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    <strong>Breaking News:</strong> {{breaking}}
  </div>
</template>

<script>
module.exports = {
  data () {
    (typeof window !== 'undefined') &&
      window.fetch(`/_content/breaking-news`)
        .then(response => response.json())
        .then(json => {
          this.$set(this, 'breaking', json.content)
        })

    return {breaking: null}
  }
}
</script>
