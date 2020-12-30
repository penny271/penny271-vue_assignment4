import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import db from '../../firebaseInit';
import router from '../../router';

const state = {
  users: [],
  loggedInUser: [],
  loginUserBalance: '',
  selectedBalance: '',
  amountToRemit: '',
  recipientDoc: '',
  recipientFields: '',
  overlayState: false,

  // TODO 戻り値用
  returnSenderBalance: '',
  returnRecipientBalance: '',
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
  //! ログインユーザーが自分に送金すると、送金された金額が
  //! そのまま残高に足されてしまう。
  // TODO async削除 await db. 削除
  async _remitMoney({ state, rootState, commit }) {
    const sender = db
      .collection('activeUsers')
      .doc(rootState.userInfo.user.uid);

    // recipient === db.collection('activeUsers').doc(eachUserID);
    const recipient = state.recipientDoc;

    await db.runTransaction(async transaction => {
      if (
        typeof state.amountToRemit === 'number' &&
        state.loginUserBalance >= state.amountToRemit &&
        state.amountToRemit >= 0
      ) {
        await transaction.get(sender);
        await transaction.get(recipient);

        // TODO 検証_20201230
        const senderData = await transaction.update(sender, {
          balance: state.loginUserBalance - state.amountToRemit,
        });

        console.log('senderBalance',senderData);

        this.returnSenderBalance = await sender.get().then(doc => {
          return doc.data().balance;
        });

        // TODO 検証_20201230
        const recipientData = await transaction.update(recipient, {
          balance: state.recipientFields.balance + state.amountToRemit,
        });

        console.log('recipientBalance', recipientData);

        this.returnRecipientBalance = await recipient.get().then(doc => {
          return doc.data().balance;
        });

        commit('clearAmountToRemit');
      } else {
        commit('clearAmountToRemit');
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
