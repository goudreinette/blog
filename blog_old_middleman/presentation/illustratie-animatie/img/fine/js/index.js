new Vue({
  el: '.center',
  data: {
      clientX: 0
  },
  mounted () {
    window.onmousemove = ({clientX}) => this.clientX = clientX
  },
  computed: {
    pos () {
      var x =  (this.clientX / window.innerWidth)
      console.log(x)
      return x
    }
  }
})