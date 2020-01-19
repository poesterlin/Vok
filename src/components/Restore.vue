<template>
  <div id="card">
    <span id="headline">Restore previous file?</span>
    <v-btn id="button1" @click="restore">yes</v-btn>
    <v-btn id="button2" flat @click="reset">no</v-btn>
  </div>
</template>

<script>
export default {
  name: "Restore",
  prop: ["value"],
  data() {
    return {
      loading: false
    };
  },
  methods: {
    parse(s) {
      return JSON.parse(window.localStorage.getItem(s)).data;
    },
    reset() {
      window.localStorage.clear();
    },
    restore() {
      const repeat = this.parse("repeat");
      const penalty = this.parse("penalty");
      const batchsize = this.parse("batchsize");
      const data = this.parse("vocs");
      const time = this.parse("time");

      this.emit({ data, penalty, batchsize, repeat, time });
    },
    emit({ data, penalty, batchsize, repeat, time }) {
      this.$emit("input", { data, penalty, batchsize, repeat, time });
    }
  }
};
</script>

<style scoped lang="scss">
div#card {
  box-shadow: 2px 3px 6px #0000002e;
  padding: 20px;
  height: 9vh;
  display: grid;

  grid-template-areas: "header button1 button2";
  grid-template-columns: auto 140px 140px;

  @media (max-width: 728px) {
    span#header {
      font-size: 18px !important;
      margin: auto auto !important;
    }
    padding: 5px;
    height: 16vh;
    grid-template-areas:
      "header header"
      "button1 button2";
    grid-template-columns: 50% 50%;
    grid-template-rows: 50% 50%;
  }

  span#headline {
    grid-area: header;
    margin: auto;
    font-size: 20px;
    text-align: center;
  }
  #button1 {
    grid-area: button1;
    color: white !important;
    font-weight: bold;
    background: #ffa600 !important;
    margin: auto;
  }
  #button2 {
    grid-area: button2;
    margin: auto;
  }
}
</style>
