<template>
  <div id="card" v-if="hasStored && !ignore">
    <span id="headline">Restore previous file?</span>
    <v-btn id="button1" @click="restore()">yes</v-btn>
    <v-btn id="button2" flat @click="reset()">no</v-btn>
  </div>
</template>

<script>
export default {
  name: "Restore",
  prop: ["value"],
  data() {
    return {
      loading: false,
      ignore: false
    };
  },
  computed: {
    hasStored() {
      try {
        this.parse("repeat");
        this.parse("penalty");
        this.parse("batchsize");
        this.parse("vocs");
        this.parse("time");

        return true;
      } catch (error) {
        window.localStorage.clear();
        return false;
      }
    }
  },
  methods: {
    parse(s) {
      return JSON.parse(window.localStorage.getItem(s)).data;
    },
    reset() {
      window.localStorage.clear();
      this.ignore = true;
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
  box-shadow: 0 0.2px 0.4px rgba(0, 0, 0, 0.014),
    0 0.4px 0.9px rgba(0, 0, 0, 0.02), 0 0.8px 1.6px rgba(0, 0, 0, 0.025),
    0 1.3px 2.9px rgba(0, 0, 0, 0.03), 0 2.5px 5.4px rgba(0, 0, 0, 0.036),
    0 6px 13px rgba(0, 0, 0, 0.05);
  border-radius: 4px;

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
