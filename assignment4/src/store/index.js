import Vue from 'vue';
import Vuex from 'vuex';

//- 各moduleをimport
import userInfo from './modules/userInfo';
import signup from './modules/signup';
import login from './modules/login';
import mypage from './modules/mypage';

Vue.use(Vuex);

// export default new Vuex.Store({
const store = new Vuex.Store({
  modules: {
    userInfo,
    signup,
    login,
    mypage,
  },
});

export default store;
