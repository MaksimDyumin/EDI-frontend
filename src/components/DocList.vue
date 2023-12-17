<template>
  <div class="main-container">
    <v-card
      @click="$router.push({name: 'overview', params: {docId: doc.id, incOut: $route.name}})" 
      class="doc-card" 
      v-for="doc in docs" :key="doc.id"
    >
      <v-card-title>
        <div class="d-flex flex-column">
          <span class="doc-title">Название документа: {{ doc.name }}</span>
          <span class="doc-title"> Отправитель: {{ creatoreFullname(doc) }}</span>
          <span class="doc-status"> Статус: {{ doc.status }}</span>
          <span class="doc-date"> Дата: {{ new Date(doc.updated_at).toLocaleString() }}</span>
        </div>

      </v-card-title>
    </v-card>
  </div>
</template>


<script>
export default {
  props: {
    docs: {
      type: Array,
      default: () => []
    }
  },
  async mounted() {
    // await new Promise(r => setTimeout(r, 500));
    // await this.SignCreate('test', 'dataToSign')
  },
  methods: {
    
    creatoreFullname(doc) {
      const creator = doc.creator
      return creator?.first_name + " " + creator?.last_name
    },
  },
  computed: {
    // isComplete() {
    //   const status = this.documentStore.parsedDocument.status
    //   if (status === 'Отклонен' || status === 'Завершен') {
    //     return true
    //   }
    //   return false
    // }
  },
}
</script>


<style>
.doc-card {
  cursor: pointer;
}
.doc-card + .doc-card {
  margin-top: 10px;
}
.doc-status {
  /* color: gray; */
  font-size: 17px;
}
.doc-date {
  color: gray;
  font-size: 15px;
}
</style>