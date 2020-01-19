<template>
  <div @dragover="$event.preventDefault()" @drop="handleDrop($event)">
    <span id="headline">Drag a .xlsx file here</span>
    <span id="or">or</span>
    <v-btn
      color="primary"
      text
      label="Select Image"
      @click="pickFile"
      x-large
      prepend-icon="attach_file"
    >
      select a file</v-btn
    >
    <input
      type="file"
      loading="loading"
      style="display: none"
      ref="file"
      accept=".xlsx"
      @change="onFilePicked"
    />
  </div>
</template>

<script>
import XLSX from "xlsx";
export default {
  name: "FileUpload",
  props: ["value"],
  data() {
    return {
      workbook: {},
      loading: false
    };
  },
  mounted() {
    this.workbook = {};
  },
  methods: {
    async handleDrop(e) {
      this.loading = true;
      e.stopPropagation();
      e.preventDefault();

      const files = e.dataTransfer.files;
      const f = files[0];
      const reader = new FileReader();

      reader.onload = e =>
        this.setWorkbook(
          XLSX.read(new Uint8Array(e.target.result), { type: "array" })
        );

      reader.readAsArrayBuffer(f);
    },
    setWorkbook(workbook) {
      const sheet = workbook.Sheets[workbook.Props.SheetNames[0]];
      delete sheet["!ref"];
      this.workbook = JSON.parse(JSON.stringify(sheet));
      this.loading = false;
      this.done();
    },
    pickFile() {
      this.$refs.file.click();
    },
    onFilePicked(e) {
      e.dataTransfer = { files: e.target.files };
      this.handleDrop(e);
    },
    done() {
      const length = Object.keys(this.workbook)
        .filter(
          key => key.startsWith("B") && this.workbook[key.replace("B", "A")]
        )
        .map(k => parseInt(k.substring(1)))
        .reduce((max, curr) => (curr > max ? curr : max), 0);

      const vocs = new Array(length)
        .fill(null)
        .map((_, idx) => {
          if (
            !this.workbook["A" + (idx + 1)] ||
            !this.workbook["B" + (idx + 1)]
          ) {
            return;
          }
          return {
            q: this.workbook["A" + (idx + 1)].v,
            a: this.workbook["B" + (idx + 1)].v
          };
        })
        .filter(v => !!v);

      this.value.data = vocs;
      this.$emit("input", this.value);
    }
  }
};
</script>

<style lang="scss" scoped>
div {
  box-shadow: 2px 3px 6px #0000002e;
  padding: 1vh 20px;
  height: 30vh;
  display: grid;

  grid-template-areas:
    "header"
    "or"
    "button";
  grid-template-rows: 10vh 10vh auto;
  span#headline {
    grid-area: header;
    margin: auto;
    font-size: 20px;
  }
  span#or {
    grid-area: or;
    margin: auto;
  }
  .v-btn {
    grid-area: button;
    margin: auto;
    color: white !important;
    font-weight: bold;
    background: orange !important;
  }
}
</style>
