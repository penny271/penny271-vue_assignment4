import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import db from '../../firebaseInit';

const state = {};
const getters = {};
const mutations = {};
const actions = {
  createUserAccount({ state, rootState }) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(
        rootState.userInfo.email,
        rootState.userInfo.password
      )
      .then(userCredentials => {
        return userCredentials.user
          .updateProfile({
            displayName: rootState.userInfo.user_name,
          })
          .then(() => {
            db.collection('activeUsers')
              .doc(rootState.userInfo.user.uid)
              .set({
                id: rootState.userInfo.user.uid,
                user_name: rootState.userInfo.user_name,
                balance: rootState.userInfo.balance,
                email: rootState.userInfo.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .catch(error => console.error(error.name + ': ' + error.message));
          });
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
