<template>
  <div>
    <h1>新規登録画面</h1>
    <table>
      <tr>
        <th>ユーザ名</th>
        <td>
          <input type="text" placeholder="ユーザ名" v-model="user_name" />
        </td>
      </tr>
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

    <button @click="createUserAccount">新規登録</button>
    <router-link to="/" tag="p">ログインはこちらから</router-link>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import db from '../firebaseInit';
import { mapActions } from 'vuex';

export default {
  name: 'signup',
  data() {
    return {};
  },
  computed: {
    user_name: {
      get() {
        return this.$store.state.userInfo.user_name;
      },
      set(value) {
        this.$store.commit('userInfo/inputUserName', value);
      },
    },
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
    ...mapActions('signup',['createUserAccount']),
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
