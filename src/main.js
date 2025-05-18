import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router'; // 라우터 가져오기

import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import 'bootstrap'; // Bootstrap JS

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

const app = createApp(App);

// 아이콘 등록
library.add(fasHeart, farHeart)

app.use(createPinia()); // Pinia 등록
app.use(router);
app.mount('#app');

app.component('font-awesome-icon', FontAwesomeIcon)

