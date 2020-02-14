<template>
  <div @drop.prevent="handleDrop" :class="{ drag, isMobile }" v-cloak>
    <span id="headline">
      <span class="bold">From file:</span>
      <span v-if="!isMobile">Drag a .xlsx file here</span>
    </span>
    <span v-if="!isMobile" id="or">or</span>
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
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      workbook: {},
      loading: false,
      drag: false,
      resetTimer: undefined
    };
  },
  mounted() {
    document.body.addEventListener("dragover", this.style);
    this.workbook = {};
  },
  methods: {
    handleDrop(e) {
      this.drag = false;
      this.loading = true;
      const files = e.dataTransfer.files;
      if (!files) return;
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
    },

    style(e) {
      if (e.dataTransfer.types[0] === "Files") {
        e.stopPropagation();
        e.preventDefault();

        if (e.type == "dragover") {
          this.drag = true;
          if (this.resetTimer) {
            clearTimeout(this.resetTimer);
          }
        } else if (e.type == "dragleave") {
          this.resetTimer = window.setTimeout(() => (this.drag = false), 70);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
div {
  box-shadow: 0 0.2px 0.4px rgba(0, 0, 0, 0.014),
    0 0.4px 0.9px rgba(0, 0, 0, 0.02), 0 0.8px 1.6px rgba(0, 0, 0, 0.025),
    0 1.3px 2.9px rgba(0, 0, 0, 0.03), 0 2.5px 5.4px rgba(0, 0, 0, 0.036),
    0 6px 13px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
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
    font-size: 20px;
    text-shadow: 4px 4px 7px white;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .bold {
      font-size: 16px;
      font-weight: bold;
      color: #383838;
    }
    span:not(.bold) {
      flex: 1 1 100%;
      text-align: center;
    }
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
  .drag {
    background-color: #ffffff;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 800'%3E%3Cdefs%3E%3CradialGradient id='a' cx='400' cy='400' r='50%25' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%23ffffff'/%3E%3C/radialGradient%3E%3CradialGradient id='b' cx='400' cy='400' r='70%25' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%23b09774'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='800' height='800'/%3E%3Cg fill-opacity='0.42'%3E%3Cpath fill='url(%23b)' d='M998.7 439.2c1.7-26.5 1.7-52.7 0.1-78.5L401 399.9c0 0 0-0.1 0-0.1l587.6-116.9c-5.1-25.9-11.9-51.2-20.3-75.8L400.9 399.7c0 0 0-0.1 0-0.1l537.3-265c-11.6-23.5-24.8-46.2-39.3-67.9L400.8 399.5c0 0 0-0.1-0.1-0.1l450.4-395c-17.3-19.7-35.8-38.2-55.5-55.5l-395 450.4c0 0-0.1 0-0.1-0.1L733.4-99c-21.7-14.5-44.4-27.6-68-39.3l-265 537.4c0 0-0.1 0-0.1 0l192.6-567.4c-24.6-8.3-49.9-15.1-75.8-20.2L400.2 399c0 0-0.1 0-0.1 0l39.2-597.7c-26.5-1.7-52.7-1.7-78.5-0.1L399.9 399c0 0-0.1 0-0.1 0L282.9-188.6c-25.9 5.1-51.2 11.9-75.8 20.3l192.6 567.4c0 0-0.1 0-0.1 0l-265-537.3c-23.5 11.6-46.2 24.8-67.9 39.3l332.8 498.1c0 0-0.1 0-0.1 0.1L4.4-51.1C-15.3-33.9-33.8-15.3-51.1 4.4l450.4 395c0 0 0 0.1-0.1 0.1L-99 66.6c-14.5 21.7-27.6 44.4-39.3 68l537.4 265c0 0 0 0.1 0 0.1l-567.4-192.6c-8.3 24.6-15.1 49.9-20.2 75.8L399 399.8c0 0 0 0.1 0 0.1l-597.7-39.2c-1.7 26.5-1.7 52.7-0.1 78.5L399 400.1c0 0 0 0.1 0 0.1l-587.6 116.9c5.1 25.9 11.9 51.2 20.3 75.8l567.4-192.6c0 0 0 0.1 0 0.1l-537.3 265c11.6 23.5 24.8 46.2 39.3 67.9l498.1-332.8c0 0 0 0.1 0.1 0.1l-450.4 395c17.3 19.7 35.8 38.2 55.5 55.5l395-450.4c0 0 0.1 0 0.1 0.1L66.6 899c21.7 14.5 44.4 27.6 68 39.3l265-537.4c0 0 0.1 0 0.1 0L207.1 968.3c24.6 8.3 49.9 15.1 75.8 20.2L399.8 401c0 0 0.1 0 0.1 0l-39.2 597.7c26.5 1.7 52.7 1.7 78.5 0.1L400.1 401c0 0 0.1 0 0.1 0l116.9 587.6c25.9-5.1 51.2-11.9 75.8-20.3L400.3 400.9c0 0 0.1 0 0.1 0l265 537.3c23.5-11.6 46.2-24.8 67.9-39.3L400.5 400.8c0 0 0.1 0 0.1-0.1l395 450.4c19.7-17.3 38.2-35.8 55.5-55.5l-450.4-395c0 0 0-0.1 0.1-0.1L899 733.4c14.5-21.7 27.6-44.4 39.3-68l-537.4-265c0 0 0-0.1 0-0.1l567.4 192.6c8.3-24.6 15.1-49.9 20.2-75.8L401 400.2c0 0 0-0.1 0-0.1L998.7 439.2z'/%3E%3C/g%3E%3C/svg%3E");
    background-size: cover;
    cursor: grabbing;
  }
  .isMobile {
    height: 20vh;
    grid-template-areas:
      "header"
      "button";
    grid-template-rows: 6vh auto;
  }
}
</style>
