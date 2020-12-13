import Vue from 'vue';
import VueRouter from 'vue-router';
import Signup from './views/Signup.vue';
import Login from './views/Login.vue';
import Mypage from './views/Mypage';

//-NavigationGurad適用▼
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '*',
      redirect: 'login',
    },
    /*ここから新規追加*/
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: Mypage,
      meta: { requiresAuth: true },
    },
  ],
});

//Nav Guards
router.beforeEach((to, from, next) => {

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!firebase.auth().currentUser) {
      next({
        path: '/login',
        query: {
          redirect: to.fullPath,
        },
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresGuest)) {
    //-ログインしてる場合:
    if (firebase.auth().currentUser) {
      next({
        name: 'mypage',
        query: {
          redirect: to.fullPath,
        },
      });
    } else {
      next();
    }
  }
  else {
    next();
  }
});

export default router;
