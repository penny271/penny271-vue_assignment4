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
// import 'firebase/auth';
// import 'firebase/firestore';
// import firebase from 'firebase';
import db from '../firebaseInit';
export default {
  props: ['user'],
  name: 'signup',
  data() {
    return {
      user_name: '',
      balance: 1000,
      email: '',
      password: '',
    };
  },
  methods: {
    saveUserInfo() {
      db.collection('activeUsers')
        .doc(this.user.uid)
        .set({
          id: this.user.uid,
          user_name: this.user_name,
          balance: this.balance,
          email: this.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .catch(error => alert(`Error: ${error.message}`));
    },
    createUserAccount() {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then(userCredentials => {
          return userCredentials.user
            .updateProfile({
              displayName: this.user_name,
            })
            .then(() => {
              alert(`Account created for ${this.email}`);
              this.saveUserInfo();
              this.$router.push({ name: 'mypage' });
            });
        })
        .catch(error => {
          alert(`Error: ${error.message}`);
        });
    },
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
