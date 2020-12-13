<template>
  <div id="mypage">
    <div class="mypage-container">
      <div class="head-container">
        <span>{{ user.displayName }}さんようこそ！！</span>
        <span
          >残高 : {{ loginUserBalance
          }}<button @click="logout" id="logout">ログアウト</button></span
        >
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
            あなたの残高: <span>{{ loginUserBalance }}</span>
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
export default {
  name: 'mypage',
  props: ['user'],
  data() {
    return {
      users: [],
      loggedInUser: [],
      loginUserBalance: '',
      isWalletClicked: false,
      isSendClicked: false,
      selectedUser: '',
      selectedBalance: '',
      amountToRemit: '',
      receipientDoc: '',
      receipientFields: '',
    };
  },
  mounted() {
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
          this.users.push(data);
        });
      });

    //- ログインしているユーザーの残高を取ってくる処理
    db.collection('activeUsers')
      .doc(this.user.uid)
      .onSnapshot(doc => {
        if (doc.exists) {
          this.loginUserBalance = doc.data().balance;
        } else {
          alert('No such document!');
        }
      });
  },
  methods: {
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          alert('Logout!');
          this.$router.push({ name: 'login' });
        });
    },
    //-残高を表示させる処理
    checkBalance(eachUser) {
      this.selectedUser = eachUser.user_name;
      this.isWalletClicked = true;

      //-選択された残高を取得
      db.collection('activeUsers')
        .where('id', '==', eachUser.id)
        .get()
        .then(querySnapshot =>
          querySnapshot.forEach(
            doc => (this.selectedBalance = doc.data().balance)
          )
        );

      this.$emit('activateOverlay');
    },
    closeWallet() {
      this.isWalletClicked = !this.isWalletClicked;
      this.$emit('activateOverlay');
    },
    //- 送金処理するウィンドウを表示
    openSendWindow(eachUser, eachUserID) {
      this.selectedUser = this.user.displayName;
      this.isSendClicked = true;

      //-選択された残高を取得
      db.collection('activeUsers')
        .where('id', '==', eachUser.id)
        .onSnapshot(querySnapshot =>
          querySnapshot.forEach(
            doc => (this.selectedBalance = doc.data().balance)
          )
        );

      //-送金を受け取る人のdocumentを取得
      this.receipientDoc = db.collection('activeUsers').doc(eachUserID);

      //-送金を受け取る人のdocumentのフィールド一覧を取得
      db.collection('activeUsers')
        .doc(eachUserID)
        .onSnapshot(doc => {
          if (doc.exists) {
            this.receipientFields = doc.data();
          } else {
            alert('No such document!');
          }
        });
      this.$emit('activateOverlay');
    },

    closeSendWindow() {
      this.isSendClicked = !this.isSendClicked;
      this.$emit('activateOverlay');
    },

    //-送金処理
    remitMoney() {
      this.closeSendWindow();
      if (
        typeof this.amountToRemit === 'number' &&
        this.loginUserBalance >= this.amountToRemit &&
        this.amountToRemit >= 0
      ) {
        let sender = db.collection('activeUsers').doc(this.user.uid);
        sender
          .update({
            balance: this.loginUserBalance - this.amountToRemit,
          })
          .then(() => {
            db.collection('activeUsers');
            this.receipientDoc.update({
              balance: this.receipientFields.balance + this.amountToRemit,
            });
            this.amountToRemit = '';
          });
      } else {
        this.amountToRemit = '';
        alert('Error. Input correct number');
      }
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
