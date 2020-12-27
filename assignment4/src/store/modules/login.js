import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import router from '../../router';

const state = {};
const getters = {};
const mutations = {};
const actions = {
  login({ state, rootState, commit }) {
    firebase
      .auth()
      .signInWithEmailAndPassword(
        rootState.userInfo.email,
        rootState.userInfo.password
      )
      .then(user => {
        console.log(`You are logged in as ${rootState.userInfo.email}`);
        // ログアウト後にログイン画面のメールアドレスとパスワードを空欄にする動作
        commit('userInfo/clearInputEmail', null, { root: true });
        commit('userInfo/clearInputPassword', null, { root: true });
        router.push('/mypage');
      })
      .catch(error => {
        console.error(error.name + ': ' + error.message);
      });
  },
};
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
