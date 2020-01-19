<template>
  <div>
    <Restore v-if="stored && !workbookSet" v-model="config" />
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
      },
      stored: false
    };
  },
  methods: {
    parse(s) {
      return JSON.parse(window.localStorage.getItem(s)).data;
    },
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
  mounted() {
    this.stored = this.hasStored();
  },
  watch: {
    config: function(newval) {
      if (newval.done) {
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
  width: 80vw;
  max-width: 800px;
  margin: 25px auto;
}
</style>
