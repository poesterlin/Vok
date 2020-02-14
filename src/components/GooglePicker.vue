<template>
  <div id="card" v-cloak>
    <span id="headline">
      <span class="bold">From Google Sheet:</span>
      <small>or any public csv table</small>
    </span>
    <div id="button">
      <v-text-field
        label="Public Sheet URL"
        hint="Only works with published sheets"
        :rules="[rules.valid, rules.https, rules.sheet]"
        prepend-icon="help"
        outlined
        @click:prepend="help"
        v-model="sheetUrl"
        persistent-hint
      ></v-text-field>
      <v-btn color="orange" flat @click="loadGoogleSheet">Load</v-btn>
      <v-btn color="orange" flat @click="copyUrl" v-if="isSheet">Share</v-btn>
    </div>
    <span v-if="message && sheetUrl" class="error msg">{{ message }}</span>
    <span v-if="copied" class="msg">Share Url was copied to clipboard</span>
  </div>
</template>

<script>
import Papa from "papaparse";
export default {
  name: "GooglePicker",
  prop: ["value"],
  data() {
    return {
      sheetUrl: "",
      loading: false,
      message: "",
      copied: false,
      rules: {
        valid: () =>
          (this.url.set &&
            this.url.valid &&
            this.url.hostname !== "localhost") ||
          "invalid url",
        https: () =>
          (this.url.set && this.url.protocol !== "https") ||
          "only https allowed",
        sheet: () => !this.isSheet || "Google Sheet Url detected"
      }
    };
  },
  mounted() {
    if (window.location.hash) {
      this.sheetUrl = `https://docs.google.com/spreadsheets/d/e/${window.location.hash.substring(
        1
      )}/pub?output=csv`;
      this.loadGoogleSheet();
    }
  },
  methods: {
    setCharAt(str, index, chr) {
      if (index > str.length - 1) return str;
      return str.substr(0, index - 1) + chr + str.substr(index + 1);
    },
    async loadGoogleSheet() {
      let url = this.sheetUrl;
      if (this.isSheet) {
        const outputType = this.url.searchObject.output;
        if (
          url.includes("/pub") ||
          (outputType !== undefined && outputType !== "csv")
        ) {
          url = url.slice(0, url.lastIndexOf("/"));
        }
        url += "/pub?output=csv";
      }

      this.sheetUrl = url;
      this.error = this.rules.valid() !== true || this.rules.https() !== true;
      if (this.error) {
        this.message = "Check Url";
        return;
      }

      this.loading = true;
      let str;
      try {
        const req = await fetch(url);
        if (req.status !== 200) {
          throw 404;
        }
        str = await req.text();
      } catch (e) {
        this.error = true;
        // eslint-disable-next-line
        console.log(e);
        this.message = "could not load file";
        return;
      } finally {
        this.loading = false;
      }

      const data = Papa.parse(str /* { worker: true } */)
        .data.map(res => ({ q: res[0], a: res[1] }))
        .filter(({ q, a }) => !!q && !!a && a !== "" && q !== "");
      this.$emit("input", { data });
    },
    copyUrl() {
      const share = this.url.pathname
        .replace("/spreadsheets/d/e/", "")
        .replace(/\/.*/, "");
      const base = window.location.href;
      this.copyTextToClipboard(base + "#" + share);
      this.copied = true;
    },
    fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      document.execCommand("copy");
      document.body.removeChild(textArea);
    },
    copyTextToClipboard(text) {
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text);
        return;
      }
      navigator.clipboard.writeText(text);
    },
    help() {
      window.open(
        "https://support.google.com/docs/answer/183965#publishcharts",
        "_blank"
      );
    }
  },
  computed: {
    isSheet() {
      return this.sheetUrl.includes("docs.google.com/spreadsheets");
    },
    sec() {
      return this.timed ? this.time : 0;
    },
    url() {
      const url = this.sheetUrl;
      const parser = document.createElement("a"),
        searchObject = {};
      parser.href = url;
      let queries = parser.search.replace(/^\?/, "").split("&");
      for (let i = 0; i < queries.length; i++) {
        let split = queries[i].split("=");
        searchObject[split[0]] = split[1];
      }
      return {
        valid: /^(ftp|http|https):\/\/[^ "]+$/.test(url),
        set: !!url,
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname || "",
        search: parser.search,
        searchObject,
        hash: parser.hash
      };
    }
  }
};
</script>

<style scoped lang="scss">
small {
  font-size: 10px;
  color: darkgray;
}
div#card {
  box-shadow: 0 0.2px 0.4px rgba(0, 0, 0, 0.014),
    0 0.4px 0.9px rgba(0, 0, 0, 0.02), 0 0.8px 1.6px rgba(0, 0, 0, 0.025),
    0 1.3px 2.9px rgba(0, 0, 0, 0.03), 0 2.5px 5.4px rgba(0, 0, 0, 0.036),
    0 6px 13px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 10px 20px;
  height: 20vh;
  min-height: 190px;

  display: grid;
  grid-template-areas:
    "header"
    "button";
  grid-template-rows: 10vh auto;

  span#headline {
    grid-area: header;
    font-size: 20px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .bold {
      font-size: 16px;
      font-weight: bold;
      color: #383838;
    }
    small {
      flex: 1 1 100%;
    }
  }
  #button {
    grid-area: button;
    display: flex;
    align-items: center;
    justify-items: center;
    .v-input {
      width: calc(80% - 30px);
    }
    button {
      width: 30px;
    }
  }
}
.error {
  color: red !important;
}
.msg {
  margin: 0 auto;
  color: darkgray;
}
</style>
