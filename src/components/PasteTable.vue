<template>
  <div id="card">
    <span id="headline"> From clipboard: </span>
    <v-text-field
      label="Paste table here"
      outlined
      @paste="log"
    ></v-text-field>
  </div>
</template>

<script>
export default {
  methods: {
    log(event) {
      const paste = (event.clipboardData || window.clipboardData)
        .getData("text")
        .split("\n")
        .map(line => line.split("\t"))
        .map(res => ({ q: res[0], a: res[1] }))
        .filter(({ q, a }) => !!q && !!a && a.length > 0 && q.length > 0);
      this.$emit("input", { data: paste });
      event.preventDefault();
    }
  }
};
</script>

<style lang="scss" scoped>
div#card {
  box-shadow: 0 0.2px 0.4px rgba(0, 0, 0, 0.014),
    0 0.4px 0.9px rgba(0, 0, 0, 0.02), 0 0.8px 1.6px rgba(0, 0, 0, 0.025),
    0 1.3px 2.9px rgba(0, 0, 0, 0.03), 0 2.5px 5.4px rgba(0, 0, 0, 0.036),
    0 6px 13px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 20px 20px;
  display: flex;
  align-content: center;
  justify-content: space-between;
  flex-direction: row;
  flex-wrap: wrap;

  #headline {
    font-size: 16px;
    font-weight: bold;
    align-self: center;
    margin-right: 30px;
    color: #383838;
  }
}
</style>
