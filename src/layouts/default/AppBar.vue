<template>
  <v-app-bar color="primary" density="compact">
    <!-- <template v-slot:prepend>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template> -->

    <v-app-bar-title @click="$router.push({name: 'home'})" style="cursor: pointer;">ЭДО Максима</v-app-bar-title>

    <template v-slot:append>
      <v-btn v-if="!userStore?.isLoggin" @click="toLogin" icon="mdi-login"></v-btn>
      <v-btn v-if="userStore?.isLoggin" @click="logout" icon="mdi-logout"></v-btn>
    </template>
  </v-app-bar>

  <v-navigation-drawer permanent elevation="2" location="left">
    <template v-slot:prepend>
      <v-list-item lines="two" 
        :prepend-avatar="userStore?.user?.avatarUrl" 
        :title="userStore?.user?.first_name + ' ' + userStore?.user?.last_name"
        :subtitle="userStore?.user?.job_title"
      >
    </v-list-item>
    </template>

    <v-divider></v-divider>

    <v-list density="compact" nav>

      <v-list-item @click="$router.push({ name: 'incoming' })" prepend-icon="mdi-arrow-bottom-left" title="Входящие"
        value="incoming">
      </v-list-item>
      <v-list-item @click="$router.push({ name: 'outgoing' })" prepend-icon="mdi-arrow-top-right" title="Исходящие"
        value="outgoing">
      </v-list-item>
      <v-list-item @click="$router.push({ name: 'history' })" prepend-icon="mdi-history" title="История" value="history">
      </v-list-item>

    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router';

const isLoggin = ref(false)
const userStore = useUserStore()
const router = useRouter();

onMounted(async () => {
  await userStore.getProfile()
});

async function logout() {
  await userStore.logout()
  router.push({ name: 'login' })
}

function toLogin() {
  router.push({ name: 'login' })
}

</script>
