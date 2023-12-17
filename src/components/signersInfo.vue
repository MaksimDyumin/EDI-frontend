<template>
  <div class="pl-4 pr-4">
    <h2>Информация о подписях</h2>
    <v-card v-for="signer in signers" :key="signer" class="pa-2 mt-2 cards-container" elevation="2">
    <h3><b> Владелец:</b> {{ signer.owner }}</h3>
    <h3 class="mt-2"><b>Издатель:</b> {{ signer.issuer }}</h3>
    <h3 class="mt-2"> <b>Дата начала действия:</b> {{ new Date(signer.validFrom).toLocaleDateString() }}</h3>
    <h3 class="mt-2"><b>Дата окончания действия:</b> {{ new Date(signer.validTo).toLocaleDateString() }}</h3>
    <h3 class="mt-2"><b>Серийный номер:</b> {{ signer.serialNumber }}</h3>
  </v-card>
  </div>
  
</template>


<script>
import { useCertificateStore } from "@/store/certificate"

export default {
  setup(props) {
    const certificateStore = useCertificateStore()

    return { 
      certificateStore 
    }
  },
  props: {
    signers: {
      type: Array,
      default: () => []
    }
  },
}
</script>


<style>
  .cards-container{
    max-height: 600px;
    min-width: 360px;
    max-width: 450px;
    overflow: auto;
  }
  h3{
    font-weight: normal;
  }
</style>