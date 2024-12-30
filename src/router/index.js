import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '@/views/MainPage/MainPage.vue';

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage, // MainPage 컴포넌트를 기본 경로로 설정
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
