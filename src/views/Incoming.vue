<template>
  <div class="wiget-conatiner">
    <h1>Входищие документы</h1>
    <DocList :docs="documentStore.parsedInboxList"></DocList>
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
  components: {
    DocList
  },
  async mounted() {
    await this.documentStore.getInboxDocuments()
  },
}
</script>


<style lang="">
  
</style>