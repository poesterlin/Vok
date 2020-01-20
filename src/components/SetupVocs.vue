<template>
  <div>
    <Restore v-if="!workbookSet" v-model="config" />
    <FilePicker v-if="!workbookSet" v-model="config" />
    <GooglePicker v-if="!workbookSet" v-model="config" />
    <ExpImage v-if="!workbookSet"></ExpImage>
    <TableSelect v-if="workbookSet" v-model="config" />
  </div>
</template>

<script>
export default {
  name: "FileUpload",
  components: {
    ExpImage: () => import("@/components/Image.vue"),
    FilePicker: () => import("@/components/FilePicker.vue"),
    GooglePicker: () => import("@/components/GooglePicker.vue"),
    Restore: () => import("@/components/Restore.vue"),
    TableSelect: () => import("@/components/TableSelect.vue")
  },
  data() {
    return {
      config: {
        data: [],
        penalty: 1,
        batchsize: 5,
        time: 0,
        repeat: 5
      }
    };
  },
  methods: {
    parse(s) {
      return JSON.parse(window.localStorage.getItem(s)).data;
    }
  },
  watch: {
    config: function(newval) {
      this.config.penalty = this.config.penalty || 1;
      this.config.batchsize = this.config.batchsize || 5;
      this.config.time = this.config.time || 0;
      this.config.repeat = this.config.repeat || 5;
      if (newval.done) {
        window.location.hash = "";
        this.$emit("done", this.config);
      }
    }
  },
  computed: {
    workbookSet() {
      return this.config.data && this.config.data[0] && this.config.data[0].q;
    }
  }
};
</script>

<style scoped lang="scss">
div {
  width: 85vw;
  max-width: 800px;
  margin: 25px auto;
}
</style>
