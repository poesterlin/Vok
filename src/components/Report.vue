<template>
  <div>
    <h1>Report</h1>
    <br>
    <table>
      <thead>
        <td>Vok</td>
        <td>right</td>
        <td>wrong</td>
        <td>skipped</td>
      </thead>
      <tr v-for="(res, index) in results" :key="index">
        <td :title="res.answer">{{res.voc}}</td>
        <td>{{res.right}}</td>
        <td>{{res.wrong}}</td>
        <td>{{res.skipped}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  probs: ["result"],
  computed: {
    results() {
      return this.$attrs.result;
    }
  }
}
</script>

<style lang="scss" scoped>
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
  tr {
    & > *:nth-child(2) {
      background: rgba(0, 128, 0, 0.637);
    }
    & > *:nth-child(3) {
      background: rgba(255, 0, 0, 0.452);
    }
    & > *:nth-child(4) {
      background: #ffbf008a;
    }
  }
}
</style>
