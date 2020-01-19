<template>
  <div>
    <table id="arrow">
      <tr>
        <td><span>Question</span></td>
        <td><v-icon dark>arrow_forward</v-icon></td>
        <td><span>Answer</span></td>
      </tr>
    </table>

    <div id="scroller">
      <table id="vocs">
        <tr
          v-for="(row, index) of data"
          :key="index"
          :class="{ del: isIgnored(index) }"
        >
          <td>{{ row[forward ? "q" : "a"] }}</td>
          <td>{{ row[forward ? "a" : "q"] }}</td>
          <td>
            <v-btn icon small text @click="ignoreRow(index)">
              <v-icon v-if="isIgnored(index)">add</v-icon>
              <v-icon v-else>delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </table>
    </div>
    <v-card elevation-0 id="settings">
      <b>Settings:</b>
      <v-layout row wrap justify-center>
        <v-flex md3 xs6 px-2>
          <v-switch label="Forward" color="orange" v-model="forward"></v-switch>
        </v-flex>
        <v-flex md3 xs6 px-2>
          <v-flat-field
            v-model="penalty"
            type="number"
            label="Penalty for wrong answer"
            :rules="[rule.positive]"
          />
        </v-flex>
        <v-flex md3 xs6 px-2>
          <v-text-field
            v-model="repeat"
            type="number"
            label="Repetitions"
            :rules="[rule.one]"
          />
        </v-flex>
        <v-flex md3 xs6 px-2>
          <v-text-field
            v-model="batchsize"
            type="number"
            label="Group size"
            :rules="[rule.one]"
          />
        </v-flex>
        <v-flex md3 xs6 px-2>
          <v-switch label="Timed" color="orange" v-model="timed"></v-switch>
        </v-flex>
        <v-flex md3 xs6 px-2>
          <v-text-field
            v-model="time"
            type="number"
            v-if="timed"
            label="Time in sec"
            :rules="[rule.one]"
          />
        </v-flex>
      </v-layout>
    </v-card>
    <v-layout>
      <v-flex xs12 pa-2>
        <v-btn id="done" large color="orange darken-2" @click="done()"
          >start Test</v-btn
        >
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: "TableSelect",
  props: ["value"],
  data() {
    return {
      data: undefined,
      penalty: undefined,
      batchsize: undefined,
      repeat: undefined,
      time: undefined,
      forward: true,
      ignore: [],
      rule: {
        positive: n => n >= 0 || "has to be 0 or bigger",
        one: n => n >= 1 || "has to be 1 or bigger"
      }
    };
  },
  methods: {
    getCell(frontRow, voc) {
      let row;
      if (frontRow) {
        row = this.forward ? "q" : "a";
      } else {
        row = this.forward ? "a" : "q";
      }
      return voc[row];
    },
    done() {
      let filterd = this.data.filter((_, idx) => !this.ignore[idx + 1]);

      if (!this.forward) {
        filterd = filterd.map(v => ({ q: v.a, a: v.q }));
      }

      this.emit({
        data: filterd,
        penalty: this.penalty,
        batchsize: this.batchsize,
        repeat: this.repeat,
        time: this.sec
      });
    },
    ignoreRow(row) {
      if (this.ignore[row] === true) {
        this.ignore[row] = false;
      } else {
        this.ignore[row] = true;
      }
      this.ignore = this.ignore;
      this.$forceUpdate();
    },
    isIgnored(row) {
      return this.ignore[row];
    },
    store(key, data) {
      const s = JSON.stringify({ data });
      window.localStorage.setItem(key, s);
    },
    emit({ data, penalty, batchsize, repeat, time }) {
      this.store("repeat", repeat);
      this.store("penalty", penalty);
      this.store("batchsize", batchsize);
      this.store("vocs", data);
      this.store("time", time);

      this.$emit("input", {
        data,
        penalty,
        batchsize,
        repeat,
        time,
        done: true
      });
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function(val) {
        this.data = val.data;
        this.penalty = val.penalty;
        this.batchsize = val.batchsize;
        this.repeat = val.repeat;
        this.time = val.se;
      }
    }
  },
  computed: {
    sec() {
      return this.timed ? this.time : 0;
    },
    timed() {
      return this.time > 0;
    }
  }
};
</script>

<style scoped lang="scss">
div.center {
  margin: auto;
  width: 90vw;
  max-width: 800px;
}

div#scroller {
  max-height: 50vh;
  overflow-x: hidden;
  overflow-y: auto;
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
  width: 100%;
  border: 2px solid rgba(28, 31, 51, 0.26);
  border-spacing: 0;
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
