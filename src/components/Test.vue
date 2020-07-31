<template>
  <div>
    <span v-if="processing">Processing...</span>
    <div v-if="isDone">
      <v-card id="done">
        <h1>You are done</h1>
        <br />
        <v-btn color="orange" @click="$emit('again')">test again</v-btn>
      </v-card>
      <br />
      <Report :result="results"></Report>
    </div>

    <v-card elevation-3 id="card" v-else-if="!processing && currVoc && currVoc.voc">
      <v-card-title primary-title id="test">
        <div id="counter">
          <span>Correct: {{ currVoc.right }}/{{ repeat }}</span>
          <span v-if="time > 0 && !reveal">{{ timeLeft }}</span>
          <span>Total: {{ done.length }}/{{ all.length }}</span>
        </div>

        <div id="question">{{ currVoc.voc.q }}</div>
        <div id="answer" :class="{ hide: !reveal }">
          <b>A:</b>
          {{ currVoc.voc.a }}
        </div>
      </v-card-title>
      <v-card-actions>
        <div id="btns">
          <v-btn
            v-if="!reveal"
            color="orange lighten-2"
            round
            :ripple="false"
            @click="reveal = true"
          >Reveal</v-btn>
          <v-btn v-if="reveal" color="green lighten-1" depressed @click="next(true)">right</v-btn>
          <v-btn v-if="reveal" color="red lighten-1" depressed @click="next(false)">wrong</v-btn>
          <v-btn
            v-if="reveal"
            color="orange"
            flat
            @click="
              skip();
              setRes({ skipped: true });
            "
          >skip</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { Clusterer } from "k-medoids";
export default {
  name: "test",
  props: ["vocs"],
  components: {
    Report: () => import("@/components/Report.vue")
  },
  data() {
    return {
      currentbatch: [],
      batchIndex: 0,
      index: 0,
      notSeen: [],
      done: [],
      reveal: false,
      timeout: null,
      startTime: Date.now(),
      currentTime: Date.now(),
      results: [],
      processing: true
    };
  },
  mounted() {
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
      return;
    });

    this.notSeen = this.all.filter(t => !!t).slice(0);
    this.sort(this.notSeen).then(sorted => (this.notSeen = sorted));
    this.results = this.all
      .filter(t => !!t)
      .map(voc => {
        return { voc: voc.q, answer: voc.a, wrong: 0, skipped: 0, right: 0 };
      });
    this.currentbatch = new Array(
      Math.min(this.batchLength, this.notSeen.length)
    )
      .fill(null)
      .map(this.getRandom);

    document.onvisibilitychange = this.checkVisible;

    setInterval(() => (this.currentTime = Date.now()), 1000);
    this.skip();


  },
  methods: {
    async sort(data) {
      if (data.length > 100 || data.length < 10) {
        this.processing = false;
        return data;
      }
      await new Promise(res => setTimeout(res, 200));
      await Promise.resolve();
      const hammingDistance = (a, b) => {
        let distance = 0;
        const aA = a.split(" ");
        const bA = b.split(" ");
        for (let i = 0; i < Math.max(aA.length, bA.length); i += 1) {
          const w1 = aA[i] || "";
          const w2 = bA[i] || "";
          for (let j = 0; j < Math.max(w1.length, w2.length); j += 1) {
            if (w1[j] !== w2[j]) {
              distance += 1;
            } else {
              distance -= 3;
            }
          }
        }
        return Math.max(0, distance);
      };

      const n = Math.floor(6);
      const clusterer = Clusterer.getInstance(data, n, (a, b) =>
        hammingDistance(a.q + a.a, b.q + b.a)
      );
      const clusteredData = clusterer.getClusteredData();
      this.processing = false;
      return clusteredData.reduce((acc, val) => acc.concat(val), []);
    },
    next(correct) {
      if (this.isDone) {
        return;
      }
      if (correct) {
        const cv = this.currentbatch[this.batchIndex];
        cv.right += 1;
        this.setRes({ right: true });
        if (cv.right >= this.repeat) {
          this.done.push(this.currentbatch.splice(this.batchIndex, 1));
        }
      } else {
        const cv = this.currentbatch[this.batchIndex];
        this.setRes({ wrong: true });
        if (this.penalty <= 0) {
          cv.right = 0;
        } else {
          cv.right = cv.right < 1 ? 0 : cv.right - this.penalty;
        }
      }

      if (
        this.currentbatch.length < this.batchLength &&
        this.notSeen.length > 0
      ) {
        this.currentbatch.unshift(this.getRandom());
      }
      this.skip();
    },
    skip() {
      if (this.isDone) {
        return;
      }
      this.reveal = false;
      this.batchIndex =
        (this.batchIndex + 1) %
        Math.min(this.batchLength, this.currentbatch.length);

      if (this.time > 0) {
        this.startTime = Date.now();
        this.currentTime = Date.now();
        clearTimeout(this.timeout);
        this.timeout = setTimeout(
          () => this.reveal || this.next(false),
          this.time * 1000
        );
      }
    },
    getRandom() {
      const voc = this.notSeen.splice(0, 1)[0];
      return { voc, right: 0 };
    },
    checkVisible() {
      if (location.href.includes("localhost")) {
        if (document.visibilityState === "hidden") {
          const audio = new Audio("doit.mp3");
          audio.play();
        }
      }
    },
    setRes({ wrong, skipped, right }) {
      const cv = this.currentbatch[this.batchIndex].voc;
      const res = this.results.find(c => c.voc === cv.q && c.answer === cv.a);
      res.wrong += wrong ? 1 : 0;
      res.skipped += skipped ? 1 : 0;
      res.right += right ? 1 : 0;
    }
  },
  computed: {
    isDone() {
      return this.done.length === this.all.length;
    },
    currVoc() {
      if (this.isDone || this.currentbatch.length === 0) {
        return undefined;
      }
      const val = this.currentbatch[this.batchIndex];
      if (!val) {
        this.skip();
      }
      return val;
    },
    all() {
      return this.vocs.data;
    },
    penalty() {
      return this.vocs.penalty;
    },
    batchLength() {
      return this.vocs.batchsize;
    },
    repeat() {
      return this.vocs.repeat;
    },
    time() {
      return this.vocs.time;
    },
    timeLeft() {
      return Math.floor((this.startTime - this.currentTime) / 1000) + this.time;
    }
  }
};
</script>

<style scoped lang="scss">
* {
  text-align: center;
}
#test {
  padding: 30px;
  #question,
  #answer {
    width: 100%;
    font-size: 160%;
    max-height: 30vh;
    overflow: auto;
    vertical-align: middle;
  }
  #question {
    min-height: 80px;
    font-weight: bold;
  }
  #answer {
    min-height: 200px;
    text-align: left;
  }
  .hide {
    color: white;
    user-select: none;
  }
}

#counter {
  margin-top: -10px;
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

#btns {
  margin: auto;
}

#done,
#card {
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 800'%3E%3Cdefs%3E%3CradialGradient id='a' cx='400' cy='400' r='50%25' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%23ffffff'/%3E%3C/radialGradient%3E%3CradialGradient id='b' cx='400' cy='400' r='70%25' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%23b09774'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='800' height='800'/%3E%3Cg fill-opacity='0.42'%3E%3Cpath fill='url(%23b)' d='M998.7 439.2c1.7-26.5 1.7-52.7 0.1-78.5L401 399.9c0 0 0-0.1 0-0.1l587.6-116.9c-5.1-25.9-11.9-51.2-20.3-75.8L400.9 399.7c0 0 0-0.1 0-0.1l537.3-265c-11.6-23.5-24.8-46.2-39.3-67.9L400.8 399.5c0 0 0-0.1-0.1-0.1l450.4-395c-17.3-19.7-35.8-38.2-55.5-55.5l-395 450.4c0 0-0.1 0-0.1-0.1L733.4-99c-21.7-14.5-44.4-27.6-68-39.3l-265 537.4c0 0-0.1 0-0.1 0l192.6-567.4c-24.6-8.3-49.9-15.1-75.8-20.2L400.2 399c0 0-0.1 0-0.1 0l39.2-597.7c-26.5-1.7-52.7-1.7-78.5-0.1L399.9 399c0 0-0.1 0-0.1 0L282.9-188.6c-25.9 5.1-51.2 11.9-75.8 20.3l192.6 567.4c0 0-0.1 0-0.1 0l-265-537.3c-23.5 11.6-46.2 24.8-67.9 39.3l332.8 498.1c0 0-0.1 0-0.1 0.1L4.4-51.1C-15.3-33.9-33.8-15.3-51.1 4.4l450.4 395c0 0 0 0.1-0.1 0.1L-99 66.6c-14.5 21.7-27.6 44.4-39.3 68l537.4 265c0 0 0 0.1 0 0.1l-567.4-192.6c-8.3 24.6-15.1 49.9-20.2 75.8L399 399.8c0 0 0 0.1 0 0.1l-597.7-39.2c-1.7 26.5-1.7 52.7-0.1 78.5L399 400.1c0 0 0 0.1 0 0.1l-587.6 116.9c5.1 25.9 11.9 51.2 20.3 75.8l567.4-192.6c0 0 0 0.1 0 0.1l-537.3 265c11.6 23.5 24.8 46.2 39.3 67.9l498.1-332.8c0 0 0 0.1 0.1 0.1l-450.4 395c17.3 19.7 35.8 38.2 55.5 55.5l395-450.4c0 0 0.1 0 0.1 0.1L66.6 899c21.7 14.5 44.4 27.6 68 39.3l265-537.4c0 0 0.1 0 0.1 0L207.1 968.3c24.6 8.3 49.9 15.1 75.8 20.2L399.8 401c0 0 0.1 0 0.1 0l-39.2 597.7c26.5 1.7 52.7 1.7 78.5 0.1L400.1 401c0 0 0.1 0 0.1 0l116.9 587.6c25.9-5.1 51.2-11.9 75.8-20.3L400.3 400.9c0 0 0.1 0 0.1 0l265 537.3c23.5-11.6 46.2-24.8 67.9-39.3L400.5 400.8c0 0 0.1 0 0.1-0.1l395 450.4c19.7-17.3 38.2-35.8 55.5-55.5l-450.4-395c0 0 0-0.1 0.1-0.1L899 733.4c14.5-21.7 27.6-44.4 39.3-68l-537.4-265c0 0 0-0.1 0-0.1l567.4 192.6c8.3-24.6 15.1-49.9 20.2-75.8L401 400.2c0 0 0-0.1 0-0.1L998.7 439.2z'/%3E%3C/g%3E%3C/svg%3E");
  background-size: cover;
  padding: 45px;
  margin-top: 50px;
  width: 90vw;
  max-width: 800px;
  margin: auto;
  min-height: 100px;
  h1 {
    padding-top: 35px;
  }
}
</style>
