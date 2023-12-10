<template>
  <v-container>
    <div class="wiget-conatiner">
      <h1>Обзор документа</h1>
      <component :is="routeMap[$route.params.incOut]"></component>
    </div>
  </v-container>
</template>


<script>
import DocIncView from "@/components/DocIncView.vue";
import DocOutgoingView from "@/components/DocOutgoingView.vue";
import { shallowRef } from 'vue'

export default {
  components: {
    DocIncView, 
    DocOutgoingView
  },
  data() {
    return {
      routeMap: {
        incoming: shallowRef(DocIncView),
        outgoing: shallowRef(DocOutgoingView)
      }
    }
  },
}
</script>


<style></style>