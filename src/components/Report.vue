<template>
  <div>
    <h1>Report</h1>
    <br />
    <table>
      <thead>
        <td>Vok</td>
        <td>wrong</td>
      </thead>
      <tr v-for="(res, index) in results" :key="index">
        <td :title="res.answer">{{res.voc}}</td>
        <td :style="{ background: `rgba(214, 5, 5, ${res.wrong / max})` }">{{res.wrong}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  probs: ["result"],
  mounted() {
    this.$attrs.result = this.$attrs.result.sort((r1, r2) => r2.wrong - r1.wrong);
  },
  computed: {
    results() {
      return this.$attrs.result
    },
    max() {
      return Math.max(...this.results.map(r => r.wrong))
    }
  }
}
</script>

<style lang="scss" scoped>
h1 {
  margin-top: 60px;
}
table {
  width: 80vw;
  max-width: 800px;
  margin: auto;
  border: 2px solid rgba(28, 31, 51, 0.26);
  border-spacing: 0;
  thead {
    font-size: 115%;
    font-weight: bold;
  }
  & > *:nth-child(odd) {
    background: lightgray;
  }
}
</style>
