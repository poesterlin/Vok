<template>
  <div id="card">
    <span id="headline">Load from Google Sheet?</span>
    <div id="button">
      <v-text-field
        label="Public Sheet URL"
        prepend-icon="help"
        @click:prepend="help"
        persistent-hint
        hint="Only works with published sheets"
        outlined
        v-model="sheetUrl"
      ></v-text-field>
      <v-btn color="orange" flat @click="loadGoogleSheet">Load</v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "GooglePicker",
  prop: ["value"],
  data() {
    return {
      sheetUrl: "",
      loading: false
    };
  },
  mounted() {},
  methods: {
    async loadGoogleSheet() {
      /* eslint-disable */
      this.loading = true;
      const req = await fetch(this.sheetUrl);
      const str = await req.text();
      this.loading = false;

      const data = str
        .split("\n")
        .map(line => {
          const [q, a] = line.split(",");
          return { q, a };
        })
        .filter(({ q, a }) => q !== undefined && a !== undefined && a !== "");
      this.$emit("input", { data });
    },
    help() {
      window.open(
        "https://support.google.com/docs/answer/183965#publishcharts",
        "_blank"
      );
    }
  },
  computed: {
    sec() {
      return this.timed ? this.time : 0;
    }
  }
};
</script>

<style scoped lang="scss">
div#card {
  box-shadow: 2px 3px 6px #0000002e;
  padding: 20px;
  height: 30vh;
  display: grid;

  grid-template-areas:
    "header"
    "button";
  grid-template-rows: 10vh auto;
  span#headline {
    grid-area: header;
    margin: auto;
    font-size: 20px;
  }
  #button {
    grid-area: button;
    display: flex;
    align-items: center;
    justify-items: center;
    .v-input {
      width: calc(80% - 30px);
    }
    button {
      width: 30px;
    }
  }
}
</style>
