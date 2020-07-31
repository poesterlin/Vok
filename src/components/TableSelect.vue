<template>
  <div>
    <table id="arrow">
      <tr>
        <td>
          <span>Question</span>
        </td>
        <td>
          <v-icon dark>arrow_forward</v-icon>
        </td>
        <td>
          <span>Answer</span>
        </td>
      </tr>
    </table>

    <div id="scroller">
      <table id="vocs">
        <tr v-for="(row, index) of data" :key="index" :class="{ del: isIgnored(index) }">
          <td>{{ row.q }}</td>
          <td>{{ row.a }}</td>
          <td>
            <v-btn icon small text @click="ignoreRow(index)">
              <v-icon v-if="isIgnored(index)">add</v-icon>
              <v-icon v-else>delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </table>
    </div>
    <div class="settings">
      <h3>Select Learing Mode:</h3>
      <button @click="set('first')" :class="{ selected: selected === 'first' }">
        <b>First run trough</b>
        <span>Get to know your vocabulary.</span>
      </button>
      <button @click="set('power')" :class="{ selected: selected === 'power' }">
        <b>Power Learning</b>
        <span>Get it into your longterm memory.</span>
      </button>
      <button @click="set('reverse')" :class="{ selected: selected === 'reverse' }">
        <b>Backwards Power Learning</b>
        <span>Power learning with swapped columns.</span>
      </button>
      <button @click="set('custom')" :class="{ selected: selected === 'custom' }">
        <b>Custom</b>
        <span>Advanced configurations...</span>
      </button>
    </div>
    <v-card elevation-0 id="custom" v-if="selected === 'custom'">
      <b>Settings:</b>
      <v-layout row wrap justify-center>
        <v-flex md3 xs6 px-2>
          <v-switch label="Forward" color="orange" v-model="forward"></v-switch>
        </v-flex>
        <v-flex md3 xs6 px-2>
          <v-text-field
            v-model="penalty"
            type="number"
            label="Penalty for wrong answer"
            :rules="[rule.positive]"
          />
        </v-flex>
        <v-flex md3 xs6 px-2>
          <v-text-field v-model="repeat" type="number" label="Repetitions" :rules="[rule.one]" />
        </v-flex>
        <v-flex md3 xs6 px-2>
          <v-text-field v-model="batchsize" type="number" label="Group size" :rules="[rule.one]" />
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
    <div class="center">
      <v-btn id="done" :disabled="!modeSet" large color="orange darken-2" @click="done()">Start Test</v-btn>
    </div>
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
      modeSet: false,
      selected: "",
      rule: {
        positive: n => n >= 0 || "has to be 0 or bigger",
        one: n => n >= 1 || "has to be 1 or bigger"
      }
    };
  },
  methods: {
    shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
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
      data = this.shuffle(data)
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
    },
    set(mode) {
      this.selected = mode;
      this.modeSet = true;
      if (mode === "first") {
        this.penalty = 1;
        this.batchsize = Math.floor(this.data.length / 3);
        this.repeat = 1;
        this.time = 0;
        this.forward = true;
      }
      if (mode === "power" || mode === 'reverse') {
        this.penalty = 0;
        this.batchsize = 7;
        this.repeat = 3;
        this.time = 30;
        this.forward = true;
      }
      if (mode === "reverse") {
        this.forward = false;
      }
      if (mode === "custom") {
        return;
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function (val) {
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
    timed: {
      get() {
        return this.time > 0;
      },
      set(val) {
        this.time = val ? 30 : 0;
      }
    }
  }
};
</script>

<style scoped lang="scss">
.settings {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  flex-direction: row;
  margin-top: 7vh;
  justify-content: center;

  h3 {
    flex: 1 1 100%;
    font-size: 14px;
    margin-bottom: 5px;
  }

  button {
    border: 1px solid gray;
    border-radius: 8px;
    flex: 1 1 40%;
    max-width: 40%;
    min-width: 220px;
    margin: 5px 3%;
    padding: 10px;
    box-shadow: 2px 2px #f2f2f2;

    &:hover {
      background: #f5891b2e;
    }

    b {
      display: inline-block;
      width: 100%;
      color: #2a2a2a;
    }

    span {
      font-size: 12px;
    }
  }

  button.selected {
    background: #f5881bc2;
  }
}

#custom {
  padding: 15px;
  margin: 10px 0;
}

div#scroller {
  max-height: 30vh;
  overflow-y: auto;
  box-shadow: 2px 2px #f2f2f2;
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

.center {
  display: flex;
  justify-content: center;
  margin: 30px 0;
  #done {
    color: rgba(255, 255, 255, 0.925);
    font-weight: bold;
    margin: auto;
  }
}

.del {
  opacity: 0.7;
  background: rgba(255, 0, 0, 0.247) !important;
}
</style>
