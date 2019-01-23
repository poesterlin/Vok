<template>
  <div>
    <v-card elevation-3 v-if="stored" id="upload" @dragover="$event.preventDefault()" @drop="handleDrop($event)" >
      <br>
      <h2> Restore previous file? </h2>
      <v-card-actions>
        <v-btn color="orange" @click="restore">yes</v-btn>
        <v-btn color="orange" flat @click="reset">no</v-btn>
      </v-card-actions>
    </v-card>
    <v-card elevation-3 v-else-if="!workbook.A1" id="upload" @dragover="$event.preventDefault()" @drop="handleDrop($event)" >
      <v-card-title primary-title>
        <div>
          <h3 class="headline mb-0">Drag a .xlsx file here</h3><br><br>
          or <br><br>
          <v-btn label="Select Image" @click='pickFile' prepend-icon='attach_file'>select a file</v-btn>
					<input type="file" style="display: none" ref="file" accept=".xlsx" @change="onFilePicked"/>
        </div>
      </v-card-title>
    </v-card>
    <div class="center" v-else>
      <table id="arrow">
        <tr>
          <td> <span>Question</span> </td>
          <td> <v-icon dark>arrow_forward</v-icon> </td>
          <td> <span>Answer</span> </td>
        </tr>
      </table>
      <div id="scroller">
        <table id="vocs">
          <tr v-for="row in range.to" :key="row" :class="{del: isIgnored(row)}">
            <td v-if="getCell(true, row) && getCell(false, row)">{{getCell(true, row)}}</td>
            <td v-if="getCell(true, row) && getCell(false, row)">{{getCell(false, row)}}</td>
            <td>
              <v-btn icon small flat @click="ignoreRow(row)">
                <v-icon v-if="isIgnored(row)">add</v-icon>
                <v-icon v-else>delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </table>
      </div>
      <br>
      <v-card elevation-0 id="settings">
        <b>Settings: </b>
        <v-layout row wrap justify-center>
          <v-flex xs6 px-2>
            <v-switch label="Forward" color="orange" v-model="forward"></v-switch>
          </v-flex>
          <v-flex xs6 px-2>
            <v-switch label="Has a headline" color="orange" v-model="headline"></v-switch>
          </v-flex>
          <v-flex md4 xs12 px-2>
            <v-text-field v-model="penalty" type="number" label="Penalty for wrong answer" class="input-group--focused" :rules="[rule.positive]"/>
          </v-flex>
          <v-flex md4 xs12 px-2>
            <v-text-field v-model="repeat" type="number" label="Repetitions" class="input-group--focused" :rules="[rule.one]"/>
          </v-flex>
          <v-flex md4 xs12 px-2>
            <v-text-field v-model="batchsize" type="number" label="Group size" class="input-group--focused" :rules="[rule.one]"/>
          </v-flex>
        </v-layout>
      </v-card>
      <v-layout>
        <v-flex xs12 pa-2>
          <v-btn id="done" large color="orange darken-2" @click="done()">Done</v-btn>
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import XLSX from "xlsx";
export default {
  name: "FileUpload",
  data() {
    return {
      headline: false,
      forward: true,
      penalty: 1,
      range: {},
      workbook: {},
      ignore: [],
      batchsize: 5,
      repeat: 5,
      stored: false,
      rule: {
        positive: n => n >= 0 || "has to be 0 or bigger",
        one: n => n >= 1 || "has to be 1 or bigger"
      }
    };
  },
  mounted() {
    this.stored = this.hasStored();
    console.log(this.stored);
  },
  methods: {
    handleDrop(e) {
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files,
        f = files[0];
      var reader = new FileReader();
      reader.onload = e =>
        this.setWorkbook(
          XLSX.read(new Uint8Array(e.target.result), { type: "array" })
        );

      reader.readAsArrayBuffer(f);
    },
    setWorkbook(workbook) {
      const sheet = workbook.Sheets[workbook.Props.SheetNames[0]];
      const range = sheet["!ref"].split(":");
      this.range = {
        from: parseInt(range[0].substring(1)),
        to: parseInt(range[1].substring(1))
      };
      delete sheet["!ref"];
      this.workbook = JSON.parse(JSON.stringify(sheet));
    },
    getCell(frontRow, idx) {
      const index = this.headline ? idx + 1 : idx;
      let row;
      if (frontRow) {
        row = this.forward ? "A" : "B";
      } else {
        row = this.forward ? "B" : "A";
      }
      const val = this.workbook[row + index];
      if (val && val.t === "s") {
        return val.v;
      }
    },
    pickFile() {
      this.$refs.file.click();
    },
    onFilePicked(e) {
      e.dataTransfer = { files: e.target.files };
      this.handleDrop(e);
    },
    done() {
      this.ignore.forEach((val, idx) => {
        this.workbook["A" + idx + 1] = undefined;
        this.workbook["B" + idx + 1] = undefined;
      });

      if (this.headline) {
        this.workbook.A1 = this.workbook["A" + this.range.to];
        this.workbook.B1 = this.workbook["B" + this.range.to];
      }

      if (!this.forward) {
        for (let idx = this.range.from; idx <= this.range.to; idx++) {
          const before = [this.workbook["B" + idx], this.workbook["A" + idx]];
          [this.workbook["A" + idx], this.workbook["B" + idx]] = before;
        }
      }
      const length = Object.keys(this.workbook).length / 2 + 1;
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

      this.emit({
        data: vocs,
        penalty: this.penalty,
        batchsize: this.batchsize,
        repeat: this.repeat
      });
    },
    ignoreRow(row) {
      if (this.ignore[row] === true) {
        this.ignore[row] = false;
      } else {
        this.ignore[row] = true;
      }
    },
    isIgnored(row) {
      return this.ignore[row];
    },
    hasStored() {
      try {
        const repeat = this.parse("repeat");
        const penalty = this.parse("penalty");
        const batchsize = this.parse("batchsize");
        const vocs = this.parse("vocs");

        return true;
      } catch (error) {
        // window.localStorage.clear();
        return false;
      }
    },
    has(s) {
      return window.localStorage.getItem(s) !== undefined;
    },
    parse(s) {
      return JSON.parse(window.localStorage.getItem(s)).data;
    },
    store(key, data) {
      const s = JSON.stringify({ data });
      window.localStorage.setItem(key, s);
    },
    reset() {
      this.stored = false;
      window.localStorage.clear();
    },
    restore() {
      const repeat = this.parse("repeat");
      const penalty = this.parse("penalty");
      const batchsize = this.parse("batchsize");
      const data = this.parse("vocs");

      this.emit({ data, penalty, batchsize, repeat });
    },
    emit({ data, penalty, batchsize, repeat }) {
      this.store("repeat", repeat);
      this.store("penalty", penalty);
      this.store("batchsize", batchsize);
      this.store("vocs", data);

      this.$emit("done", { data, penalty, batchsize, repeat });
    }
  },
  computed: {}
};
</script>

<style scoped lang="scss">
#upload {
  width: 80vw;
  max-width: 800px;
  height: 300px;
  margin: auto;
  * {
    margin: 20px auto;
  }
}

div.center {
  margin: auto;
  width: 90vw;
  max-width: 800px;
}

div#scroller {
  overflow: auto;
  max-height: 50vh;
}

#arrow {
  width: 100%;
  font-size: 150%;
  color: white;
  background: rgba(0, 0, 0, 0.925);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

table#vocs {
  border: 2px solid rgba(28, 31, 51, 0.26);
  border-spacing: 0;
  .headline {
    font-size: 120%;
    font-weight: bold;
  }
  tr {
    &:nth-child(odd) {
      background: lightgray;
    }
  }
}

#settings {
  text-align: left;
}

b {
  margin: 5px;
}

#done {
  color: rgba(255, 255, 255, 0.925);
  font-weight: bold;
}

.del {
  opacity: 0.7;
  background: rgba(255, 0, 0, 0.247) !important;
}
</style>
