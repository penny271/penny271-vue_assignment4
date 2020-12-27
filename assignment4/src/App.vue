<template>
  <div id="app">
    <div :class="{ overlay: isActive }"></div>
    <img src="./assets/logo.png" alt="" />

    <router-view></router-view>
    <Copyright />
  </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import db from './firebaseInit';
import Copyright from './components/Copyright';
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState('mypage', ['overlayState']),
    isActive() {
      return this.overlayState;
    },
  },
  methods: {
    ...mapActions('userInfo', ['checkUserState']),
  },
  mounted() {
    this.checkUserState();
  },
  components: {
    Copyright,
  },
};
</script>

<style scoped>
div {
  text-align: center;
}
table {
  margin: 0;
}
img {
  margin: 2rem 0;
  width: 150px;
}
/* Mypage.vueでwallet関連のボタンを
押したときに適用するCSS */
.overlay {
  z-index: 1;

  /*画面全体を覆う設定*/
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
