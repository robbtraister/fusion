<template>
  <li class="nav-item">
    <a :class="classes" :href="computedHref">{{label}}</a>
  </li>
</template>

<script>
export default {
  props: ['label', 'href'],
  data () {
    const computedHref = this.href || `/${this.label.replace(' ', '-').toLowerCase()}`
    const active = (typeof window === 'undefined')
      ? false
      : (() => {
        const location = window.location
        const uri = location.pathname
        return uri ? (new RegExp(`^${computedHref}(\\?|#|$)`)).test(uri) : false
      })()

    return {
      classes: `nav-link${active ? ' active' : ''}`,
      computedHref
    }
  }
}
</script>
