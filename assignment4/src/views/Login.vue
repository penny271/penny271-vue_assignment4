<template>
  <div>
    <h1>ログイン画面</h1>
    <table>
      <tr>
        <th>メールアドレス</th>
        <td>
          <input type="email" placeholder="E-mail" v-model="email" />
        </td>
      </tr>
      <tr></tr>
      <tr>
        <th>パスワード</th>
        <td>
          <input type="password" placeholder="Password" v-model="password" />
        </td>
      </tr>
      <tr></tr>
      <br />
    </table>

    <button @click="login">ログイン</button>
    <router-link :to="{ name: 'signup' }" tag="p"
      >新規登録はこちらから</router-link
    >
  </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import store from '../store/index';
import router from '../router';

import { mapState, mapActions } from 'vuex';

export default {
  name: 'login',
  data() {
    return {};
  },
  computed: {
    email: {
      get() {
        return this.$store.state.userInfo.email;
      },
      set(value) {
        this.$store.commit('userInfo/inputEmail', value);
      },
    },
    password: {
      get() {
        return this.$store.state.userInfo.password;
      },
      set(value) {
        this.$store.commit('userInfo/inputPassword', value);
      },
    },
  },
  methods: {
    ...mapActions('login', [
      'login', //also supports payload `this.nameOfAction(amount)`
    ]),
    // login() {
    //   this.$store.dispatch('login/login');
    // },
  },
  beforeRouteEnter(to, from, next) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        next({ name: 'mypage' });
      } else {
        next();
      }
    });
  },
};
</script>

<style scoped>
div {
  text-align: center;
}
table {
  margin: auto;
}
p {
  margin: 0;
  color: #138dd3;
  cursor: pointer;
}
button {
  font-size: 1.4rem;
  border-radius: 5px;
  padding: 5px 20px;
  color: #138dd3;
  border: 1px solid;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.5s;
}
button:hover {
  background-color: rgb(14, 68, 247);
  color: aliceblue;
}
</style>
