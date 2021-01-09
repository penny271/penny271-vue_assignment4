import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const state = {
  //▼プロジェクト全体で共有するstate
  user: '',
  user_name: '',
  balance: 1000,
  email: '',
  password: '',
  eachUserID:'',
};
const getters = {};

const mutations = {
  getUser(state, user) {
    state.user = user; //firebaseが返したユーザー情報
  },
  inputUserName(state, value) {
    state.user_name = value;
  },
  inputEmail(state, value) {
    state.email = value;
  },
  inputPassword(state, value) {
    state.password = value;
  },
  clearInputEmail(state) {
    state.email = '';
  },
  clearInputPassword(state) {
    state.password = '';
  },
  createEachUserID(state, eachUserID) {
    state.eachUserID = eachUserID;
  },
};

const actions = {
  checkUserState({ commit }) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        commit('getUser', user);
      }
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
