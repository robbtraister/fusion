<template>
  <div>
    <Wrapper>
      {{content}}
    </Wrapper>
  </div>
</template>

<script>
const Wrapper = require('../components/wrapper.vue')

module.exports = {
  components: {
    Wrapper
  }
}
</script>
