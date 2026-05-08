import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router'; // 라우터 가져오기

import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import 'bootstrap'; // Bootstrap JS

import '@/assets/styles/global.css'

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import {  faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import {
  faUser as farUser,
  faComment as farComment,
} from '@fortawesome/free-regular-svg-icons';
const app = createApp(App);

// 아이콘 등록
library.add(fasHeart, farHeart, faMagnifyingGlass, farUser, farComment);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(createPinia()); // Pinia 등록
app.use(router);
app.mount('#app');


window.global = window;

