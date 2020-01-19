<template>
  <div>
    <v-card elevation-3>
      <p class="display-1 text--primary">Restore previous file?</p>
      <v-card-actions>
        <v-btn color="primary" @click="restore">yes</v-btn>
        <v-btn color="primary" flat @click="reset">no</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Restore",
  prop: ["value"],
  data() {
    return {
      loading: false,
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
  },
};
</script>

<style scoped lang="scss"></style>
