<template>
  <v-container fluid>
    <div class="wiget-conatiner">
      <h1>Обзор документа</h1>
      <component :is="routeMap[$route.params.incOut]"></component>
    </div>
  </v-container>
</template>


<script>
import DocIncView from "@/components/DocIncView.vue";
import DocOutgoingView from "@/components/DocOutgoingView.vue";
import DocHistoryView from "@/components/DocHistoryView.vue";

import { shallowRef } from 'vue'

export default {
  components: {
    DocIncView, 
    DocOutgoingView,
    DocHistoryView
  },
  data() {
    return {
      routeMap: {
        incoming: shallowRef(DocIncView),
        outgoing: shallowRef(DocOutgoingView),
        history: shallowRef(DocHistoryView),
      }
    }
  },
}
</script>


<style></style>