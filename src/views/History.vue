<template>
  <div class="wiget-conatiner">
    <h1>История</h1>
    <DocList :docs="documentStore.parsedHistoryList"></DocList>
  </div>
</template>

<script>
import DocList from "@/components/DocList.vue";
import { useDocumentStore } from "@/store/document";

export default {
  setup() {
    const documentStore = useDocumentStore()
    return {
      documentStore
    }
  },
  async mounted() {
    await this.documentStore.getCompleteDocuments()
  },
  components: {
    DocList
  },
  data() {
    return {
    }
  },
}
</script>


<style lang="">
  
</style>