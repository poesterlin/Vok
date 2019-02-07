<template>
  <div>
    <div v-if="isDone">
      <v-card id="done">
        <h1>You are done</h1>
        <br>
        <v-btn color="orange" @click="$emit('again')">test again</v-btn>
      </v-card>
      <br>
      <Report :result="results"></Report>
    </div>

    <v-card elevation-3 id="card" v-else-if="currVoc && currVoc.voc">
      <v-card-title primary-title id="test">
        <div id="counter">
          <span>Correct: {{currVoc.right}}/{{repeat}}</span>
          <span v-if="time > 0 && !reveal">{{timeLeft}}</span>
          <span>Total: {{done.length}}/{{all.length}}</span>
        </div>

        <div id="question">{{currVoc.voc.q}}</div>
        <div id="answer" :class="{hide: !reveal}">
          <b>A:</b>
          {{currVoc.voc.a}}
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
          <v-btn v-if="reveal" color="orange" flat @click="skip(); setRes({ skipped: true });">skip</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "test",
  props: ["vocs"],
  components: {
    'Report': () => import('@/components/Report.vue')
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
    };
  },
  mounted() {
    this.notSeen = this.all.slice(0);
    this.results = this.all.map(voc => { return { voc: voc.q, answer: voc.a, wrong: 0, skipped: 0, right: 0 } })
    this.currentbatch = new Array(Math.min(this.batchLength, this.notSeen.length))
      .fill(null)
      .map(this.getRandom);

    // eslint-disable-next-line
    console.log(this.vocs);

    document.onvisibilitychange = this.checkVisible;

    setInterval(() => (this.currentTime = Date.now()), 1000);
    this.skip();
  },
  methods: {
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
        this.timeout = setTimeout(() => this.reveal || this.next(false), this.time * 1000);
      }
    },
    getRandom() {
      const randIdx = Math.min(
        Math.floor(Math.random() * this.notSeen.length) + 1,
        this.notSeen.length - 1
      );
      const voc = this.notSeen.splice(randIdx, 1)[0];
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
    },
  }
};
</script>

<style scoped lang="scss">
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
  width: 90vw;
  max-width: 800px;
  margin: auto;
  min-height: 100px;
  h1 {
    padding-top: 35px;
  }
}
</style>
