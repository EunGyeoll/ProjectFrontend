import { createRouter, createWebHistory } from 'vue-router';

import MainPage from '@/views/MainPage/MainPage.vue';
import Login from "@/views/Authentication/Login.vue";
import Join from "@/views/Authentication/SignUp.vue";

const routes = [
  { path: '/', name: 'MainPage', component: MainPage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/join', name: "Join", component: Join},
  {
    path: '/mypage/:memberId',
    name: 'MyPage',
    component: () => import('@/views/MyPage.vue'), // 예시
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

export default router;
