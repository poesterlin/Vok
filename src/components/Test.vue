<template>
  <div>

    <v-card elevation-3 id="card">
      <v-card-title primary-title id="test">
          <div id="counter">
            <span>Correct: {{currentbatch[batchIndex].right}}/{{repeat}}</span>
            <span>Total: {{done.length}}/{{all.length}}</span>
          </div>
          <div id="question">{{currentbatch[batchIndex].voc.q}}</div>
          <div id="answer" :class="{hide: !reveal}"> 
            <b>A:</b> {{currentbatch[batchIndex].voc.a}}
          </div>
      </v-card-title>
      <v-card-actions>
        <div id="btns">
          <v-btn v-if="!reveal" color="orange lighten-2" round :ripple="false" @click="reveal = true">Reveal</v-btn>
          <v-btn v-if="reveal" color="green lighten-1" depressed @click="next(true)">right</v-btn>
          <v-btn v-if="reveal" color="red lighten-1" depressed @click="next(false)">wrong</v-btn>
          <v-btn v-if="reveal" color="orange" flat @click="skip()">skip</v-btn>
        </div>
      </v-card-actions>
    </v-card>

  </div>
</template>

<script>
export default {
  name: "test",
  props: ["vocs"],
  data() {
    return {
      currentbatch: [],
      batchIndex: 0,
      index: 0,
      notSeen: [],
      done: [],
      reveal: false
    };
  },
  mounted() {
    this.notSeen = JSON.parse(JSON.stringify(this.all));
    this.currentbatch = new Array(this.batchLength)
      .fill(null)
      .map(() => this.getRandom());
  },
  methods: {
    next(correct) {
      if (correct) {
        const cv = this.currentbatch[this.batchIndex];
        cv.right += 1;
        if (cv.right === this.repeat) {
          this.done.push(this.currentbatch.splice(this.batchIndex, 1));
        }
      } else {
        const cv = this.currentbatch[this.batchIndex];
        if (this.penalty <= 0) {
          cv.right = 0;
        } else {
          cv.right = cv.right < 1 ? 0 : cv.right--;
        }
      }

      if (
        this.currentbatch.length < this.batchLength &&
        this.notSeen.length > 0
      ) {
        this.currentbatch.push(this.getRandom());
      }
      this.skip();
    },
    skip() {
      this.reveal = false;
      this.batchIndex = (this.batchIndex + 1) % this.batchLength;
    },
    getRandom() {
      const randIdx = Math.floor(Math.random() * this.notSeen.length) + 1;
      const voc = this.notSeen.splice(randIdx, 1)[0];
      return { voc, right: 0 };
    }
  },
  computed: {
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
    }
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

#card {
  width: 90vw;
  max-width: 800px;
  margin: auto;
}
</style>
