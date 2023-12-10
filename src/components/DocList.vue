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
  data() {
    return {
      CAPICOM_CURRENT_USER_STORE: 2,
      CAPICOM_MY_STORE: "My",
      CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED: 2
    }
  },
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
    async SignCreate(certSubjectName, dataToSign) {
      var oStore = await cadesplugin.CreateObjectAsync("CAdESCOM.Store");
      await oStore.Open(
        this.CAPICOM_CURRENT_USER_STORE, 
        this.CAPICOM_MY_STORE, 
        this.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
      )
      var oStoreCerts = await oStore.Certificates;

      let selectInner = ''
      for (let i = 1; i < await oStoreCerts.Count + 1; i++) {
        console.log(i)
        const itemI = await oStoreCerts.Item(i)
        console.log(itemI)
        console.log(await itemI.GetInfo(0))

        const certName = await itemI.GetInfo(0)
        selectInner += `<option value="${certName}">${certName}</option>`
      }
    },
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