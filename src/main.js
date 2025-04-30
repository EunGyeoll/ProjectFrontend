import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router'; // 라우터 가져오기
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import 'bootstrap'; // Bootstrap JS

const app = createApp(App);

app.use(createPinia()); // Pinia 등록
app.use(router);
app.mount('#app');