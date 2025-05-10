import { createRouter, createWebHistory } from 'vue-router';

import MainPage from '@/views/MainPage/MainPage.vue';
import Login from "@/views/authentication/Login.vue";
import Join from "@/views/authentication/SignUp.vue";

const routes = [
  { path: '/', name: 'MainPage', component: MainPage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/join', name: "Join", component: Join},
  {
    path: '/mypage/:memberId',
    name: 'MyPage',
    component: () => import('@/views/authentication/MyPage.vue'), // 예시
    meta: { requiresAuth: true }
  },
  {
    path: '/items',
    name: 'Items',
    component: () => import('@/views/item/ItemView.vue')
  },
  {
    path: '/items/new',
    name: 'ItemCreate',
    component: () => import('@/views/item/ItemForm.vue'),
    meta: { requiresAuth: true } // 로그인한 사용자만 접근 가능하게
  },
  {
    path: '/items/:id',
    name: 'ItemDetail',
    component: () => import('@/views/item/ItemDetail.vue'),
  },  
  {
    path: '/posts',
    name: 'Posts',
    component: () => import('@/views/post/PostView.vue'),
    meta: { requiresAuth: true } // 로그인한 사용자만 접근 가능하게
  },
  {
    path: '/posts/new',
    name: 'PostCreate',
    component: () => import('@/views/post/PostForm.vue'),
    meta: { requiresAuth: true } // 로그인한 사용자만 접근 가능하게
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import('@/views/post/postDetail.vue')
  }
  
  
  
];

const router = createRouter({
  history: createWebHistory(), // ✅ 일반적으로 이렇게 설정
  // history: createWebHistory('/'),
  routes,
});

export default router;
