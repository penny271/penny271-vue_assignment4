import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import db from '../../firebaseInit';
import router from '../../router';
import userInfo from './userInfo';

const state = {
  users: [],
  loggedInUser: [],
  loginUserBalance: '',
  selectedBalance: '',
  amountToRemit: '',
  recipientDoc: '',
  recipientFields: '',
  overlayState: false,
};
const getters = {};

const mutations = {
  pushUsers(state, user) {
    state.users.push(user);
  },
  getRecipientDoc(state, recipientDoc) {
    state.recipientDoc = recipientDoc;
  },
  getSelectedBalance(state, selectedBalance) {
    state.selectedBalance = selectedBalance;
  },
  getRecipientFields(state, recipientFields) {
    state.recipientFields = recipientFields;
  },
  toggleOverlay(state) {
    state.overlayState = !state.overlayState;
  },
  remitAmount(state, value) {
    state.amountToRemit = value;
  },
  clearAmountToRemit() {
    state.amountToRemit = '';
  },
};
const actions = {
  displayUsers({ state, commit, rootState }) {
    db.collection('activeUsers')
      .orderBy('user_name')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data = {
            id: doc.id,
            user_name: doc.data().user_name,
            balance: doc.data().balance,
            email: doc.data().email,
          };
          commit('pushUsers', data);
        });
      });

    //- ログインしているユーザーの残高を取ってくる処理
    db.collection('activeUsers')
      .doc(rootState.userInfo.user.uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          state.loginUserBalance = doc.data().balance;
        } else {
          console.log('No such document!');
        }
      });

    db.collection('activeUsers')
      .doc(rootState.userInfo.user.uid)
      .onSnapshot(doc => {
        if (doc.exists) {
          state.loginUserBalance = doc.data().balance;
        } else {
          console.log('No such document!');
        }
      });
  },

  signout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('Logout!');
        router.push({ name: 'login' });
      });
  },

  getBalance({ commit }, eachUser) {
    //-選択された残高を取得
    db.collection('activeUsers')
      .where('id', '==', eachUser.id)
      .get()
      .then(querySnapshot =>
        querySnapshot.forEach(doc =>
          commit('getSelectedBalance', doc.data().balance)
        )
      );
  },

  _openSendWindow({ state, commit }, { eachUser, eachUserID }) {
    //-選択された残高を取得
    db.collection('activeUsers')
      .where('id', '==', eachUser.id)
      .onSnapshot(querySnapshot =>
        querySnapshot.forEach(doc =>
          commit('getSelectedBalance', doc.data().balance)
        )
      );

    //-送金を受け取る人のdocumentを取得
    const recipientDoc = db.collection('activeUsers').doc(eachUserID);
    commit('getRecipientDoc', recipientDoc);

    //-送金を受け取る人のdocumentのフィールド一覧を取得
    db.collection('activeUsers')
      .doc(eachUserID)
      .onSnapshot(doc => {
        if (doc.exists) {
          commit('getRecipientFields', doc.data());
        } else {
          console.error('No such document!');
        }
      });
  },

  //- 送金処理
  async _remitMoney({ state, rootState, commit }) {
    const sender = db
      .collection('activeUsers')
      .doc(rootState.userInfo.user.uid);
    const senderID = await sender.get().then(doc => {
      return doc.data().id;
    });

    const recipient = await state.recipientDoc;
    const recipientID = await recipient.get().then(doc => {
      return doc.data().id;
    });

    db.runTransaction(async transaction => {
      if (senderID === recipientID) {
        commit('clearAmountToRemit');
      } else if (
        typeof state.amountToRemit === 'number' &&
        state.loginUserBalance >= state.amountToRemit &&
        state.amountToRemit >= 0
      ) {
        // const recipientDoc = db.collection('activeUsers').doc(eachUserID);
        await transaction.get(sender);
        await transaction.get(recipient);

        await transaction.update(sender, {
          balance: state.loginUserBalance - state.amountToRemit,
        });

        await db
          .collection('activeUsers')
          // 修正した箇所 vuexから取得可能にした。
          .doc(userInfo.state.eachUserID)
          .onSnapshot(doc => {
            if (doc.exists) {
              commit('getRecipientFields', doc.data());
            } else {
              console.error('No such document!');
            }
          });

        await transaction.update(recipient, {
          balance: state.recipientFields.balance + state.amountToRemit,
        });
        commit('clearAmountToRemit');
      } else {
        commit('clearAmountToRemit');
        console.error('Error. Input correct number');
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
