<template>
  <div class="wiget-conatiner">
    <h1>Исходящие документы</h1>
    <LineWithButtons></LineWithButtons>
    <DocList :docs="documentStore.parsedSentList"></DocList>
  </div>
</template>


<script>
import DocList from "@/components/DocList.vue";
import LineWithButtons from '@/components/LineWithButtons.vue'
import { useDocumentStore } from "@/store/document";

export default {
  setup() {
    const documentStore = useDocumentStore()
    return {
      documentStore
    }
  },
  async mounted() {
    await this.documentStore.getSentDocuments()
  },
  components: {
    DocList,
    LineWithButtons
  },
  data() {
    return {
    }
  },
}
</script>


<style>
  
</style>