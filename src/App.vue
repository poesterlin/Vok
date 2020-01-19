<template>
  <div id="app">
    <header>
      <h2>Universal Vocabulary Test</h2>
    </header>
    <SetupVocs v-if="mode == 'read'" @done="startTest" />
    <Test :vocs="vocs" v-else @again="mode = 'read'" />
  </div>
</template>

<script>
export default {
  name: "app",
  components: {
    SetupVocs: () => import("@/components/SetupVocs.vue"),
    Test: () => import("@/components/Test.vue")
  },
  data() {
    return {
      mode: "read",
      vocs: {}
    };
  },
  methods: {
    startTest(wb) {
      this.mode = "test";
      this.vocs = wb;
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
header {
  background: #234737;
  color: white;
  height: 60px;
  margin-bottom: 3vh;
  padding: 15px;
  text-align: center;
}
</style>
