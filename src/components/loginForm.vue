<template>
  <div class="main-container">
    <v-form class="form-container" fast-fail @submit.prevent @submit="logIn">
      <v-text-field
        v-model="login"
        label="Логин"
        :rules="loginRules"
      ></v-text-field>

      <v-text-field
        v-model="password"
        label="Пароль"
        :rules="passwordRules"
      ></v-text-field>

      <v-btn type="submit" block class="mt-2">Войти</v-btn>
    </v-form>
  </div>
</template>


<script>
import { useUserStore } from "@/store/user";

export default {
  setup(props) {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
  data() {
    return {
      login: "",
      password: "",
      loginRules: [
        (value) => {
          return true;
        },
      ],
      passwordRules: [
        (value) => {
          return true;
        },
      ],
    };
  },
  methods: {
    async logIn() {
      const requestBody = {
        username: this.login,
        password: this.password,
      };
      const response = await this.userStore.loginUser(requestBody);
      if (response.statusText === "OK") {
        this.$router.push({ name: "home" });
      } else {
        console.log(response.response.data.detail);
        let instance = this.$toast.open({
          message: response.response.data.detail,
          position: 'top-right',
          type: 'error',
          // all of other options may go here
        });
      }
    },
  },
};
</script>


<style>
.form-container {
  width: 500px;
  margin: auto;
}
</style>