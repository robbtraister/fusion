'use strict'

import Vue from 'vue'

const Section = Vue.extend({
  render (h) {
    console.log(this.content)
    return h('div', this.content)
  }
})

export default Section
export { Section }
