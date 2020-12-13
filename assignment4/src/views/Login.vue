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
export default {
  name: 'login',
  data() {
    return {
      email: '',
      password: '',
    };
  },
  props: ['user'],
  methods: {
    login() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(user => {
          alert(`You are logged in as ${this.email}`);
          this.$router.push('/mypage');
        })
        .catch(error => {
          alert(error.message);
        });
    },
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
