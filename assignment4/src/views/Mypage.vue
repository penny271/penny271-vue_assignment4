<template>
  <div id="mypage">
    <div class="mypage-container">
      <div class="head-container">
        <span>{{ user.displayName }}さんようこそ！！</span>
        <span>
          残高 : {{ loginUserBalance }}
          <!--
          <br>
          Sender残高 : {{ returnSenderBalance }}
          <br>
          Recipient残高 : {{ returnRecipientBalance }}
          <br>
           -->
          <button @click="logout" id="logout">ログアウト</button>
        </span>
      </div>
      <h1>ユーザ一覧</h1>
      <table>
        <tr>
          <th>ユーザ名</th>
          <td></td>
        </tr>
        <tr v-for="eachUser in users" :key="eachUser.id">
          <th class="th-thin">{{ eachUser.user_name }}</th>

          <td>
            <button @click="checkBalance(eachUser)">
              walletを見る</button
            ><button @click="openSendWindow(eachUser, eachUser.id)">
              送る
            </button>
            <button>{{ selectedBalance }}</button>
          </td>
        </tr>
      </table>

      <!-- //-クリック時に残高を表示 -->
      <transition name="fade">
        <div v-if="isWalletClicked" class="showModal">
          <p class="p-1">{{ selectedUser }}さんの残高</p>
          <p class="p-1">{{ selectedBalance }}</p>
          <div class="close-container">
            <button class="close" @click="closeWallet">close</button>
          </div>
        </div>
      </transition>

      <!-- //-クリック時に送金画面を表示 -->
      <transition name="fade">
        <div v-if="isSendClicked" class="showModal" @submit="remitMoney">
          <p>
            あなたの残高:
            <span>{{ loginUserBalance }}</span>
          </p>
          <p>送る金額</p>
          <input type="text" v-model.number="amountToRemit" />
          <div class="send-container">
            <button class="send" @click="remitMoney">送信</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import db from '../firebaseInit';
import { mapState, mapActions, mapMutations } from 'vuex';

export default {
  name: 'mypage',
  computed: {
    ...mapState('mypage', [
      'loginUserBalance',
      'selectedBalance',
      'users',
      // TODO 戻り値用
      'returnSenderBalance',
      'returnRecipientBalance',
    ]),
    ...mapState('userInfo', ['user']),
    amountToRemit: {
      get() {
        return this.$store.state.mypage.amountToRemit;
      },
      set(value) {
        this.$store.commit('mypage/remitAmount', value);
      },
    },
  },
  data() {
    return {
      isWalletClicked: false,
      isSendClicked: false,
      selectedUser: '',
    };
  },
  mounted() {
    //下記のようにしないとコードの変更の際にdispathが走り、
    //users.pushでv-for部分が重複してブラウザに表示されるので、
    //それを防ぐためのif文処理
    if (this.$store.state.mypage.users.length === 0) {
      this.$store.dispatch('mypage/displayUsers');
    }
  },
  methods: {
    ...mapActions('mypage', [
      'getBalance',
      'signout',
      '_openSendWindow',
      '_remitMoney',
    ]),

    ...mapMutations('mypage', ['toggleOverlay']),
    logout() {
      this.signout();
    },
    //-残高を表示させる処理
    checkBalance(eachUser) {
      this.selectedUser = eachUser.user_name;
      this.isWalletClicked = true;
      this.getBalance(eachUser);
      this.toggleOverlay();
    },
    closeWallet() {
      this.isWalletClicked = !this.isWalletClicked;
      this.toggleOverlay();
    },
    //- 送金処理するウィンドウを表示
    openSendWindow(eachUser, eachUserID) {
      this.$store.commit('userInfo/createEachUserID', eachUserID);
      this.selectedUser = this.user.displayName;
      this.isSendClicked = true;
      this._openSendWindow({ eachUser: eachUser, eachUserID: eachUserID });
      this.toggleOverlay();
    },

    closeSendWindow() {
      this.isSendClicked = !this.isSendClicked;
      this.toggleOverlay();
    },

    //-送金処理
    remitMoney() {
      this.closeSendWindow();
      this._remitMoney();
    },
  },
};
</script>

<style scoped>
body {
  margin: 0;
}
.mypage-container {
  margin: auto;
  max-width: 90%;
}
.head-container {
  display: flex;
  justify-content: space-between;
  margin: 0 4rem 2rem;
}
h1,
h2,
h3,
h4 {
  margin: 5px;
}
#logout {
  margin-left: 1rem;
  color: #0c9ab3;
  border: 1px solid;
  background-color: #ffffff;
}
#logout:hover {
  background-color: rgb(14, 68, 247);
  color: #f0eaea;
}
table {
  width: 100%;
}
.th-thin {
  font-weight: normal;
}
th {
}
button {
  border-radius: 5px;
  padding: 5px 10px;
  font-weight: 100;
  color: #f0eaea;
  border: 1px solid;
  background-color: rgb(12, 154, 179);
  cursor: pointer;
  transition: all 0.5s;
}
button:hover {
  background-color: rgb(14, 68, 247);
}
.showModal {
  z-index: 2;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.911);
  padding-top: 0.5rem;
  left: 50%;
  bottom: 0px;
  width: 100%;
  max-width: 200px;
  transform: translate(-50%, -50%);
  position: relative;
  position: absolute;
  border-radius: 5px;
}
.close-container,
.send-container {
  background-color: rgba(77, 75, 75, 0.5);
  position: relative;
  height: 100%;
  padding: 0.5rem;
}
.close,
.send {
  background-color: red;
  display: inline-block;
  text-align: right;
  margin-right: -100%;
  transform: translate(-50%, 0%);
  padding: 8px 15px;
  position: relative;
}
.close:hover,
.send:hover {
  background-color: rgb(255, 136, 0);
}
input {
  border: 1px solid rgb(1, 102, 197);
  padding: 5px;
  margin: 10px 0;
}
p {
  margin: 0;
}
.p-1 {
  padding-bottom: 1rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
