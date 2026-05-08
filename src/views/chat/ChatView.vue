<template>
  <div class="chat-container">
    <!-- 왼쪽: 채팅 목록 -->
    <aside class="chat-list">
      <header class="chat-list-header">
        <span>채팅</span>
        <button class="new-chat-btn" @click="openNewChatModal">＋ 새 채팅</button>
      </header>

      <div class="chat-items">
        <div
          v-for="room in chatRooms"
          :key="room.chatPartner"
          class="chat-item"
          @click="openRoom(room)"
          :class="{ active: currentReceiver === room.chatPartner }"
        >
          <img
            :src="room.partnerProfileImgUrl || defaultProfile"
            @error="e => e.target.src = defaultProfile"
            class="chat-profile"
            :alt="`${room.chatPartnerNickname || room.chatPartner}님의 프로필 이미지`"
          />

          <div class="chat-info">
            <div class="chat-top">
              <span class="chat-name">{{ room.chatPartnerNickname || room.chatPartner }}</span>
              <span class="chat-time">{{ formatTime(room.timestamp) }}</span>
            </div>

            <div class="chat-bottom">
              <span class="chat-preview">{{ room.lastMessage }}</span>
              <span v-if="room.unreadCount > 0" class="chat-unread">{{ room.unreadCount }}</span>
            </div>
          </div>
        </div>

        <div v-if="chatRooms.length === 0" class="empty-rooms">아직 채팅방이 없어요.</div>
      </div>
    </aside>

    <!-- 오른쪽: 채팅 영역 -->
    <section class="chat-room">
      <header class="chat-room-header">
        <span>{{ currentReceiverNickname || "대화 상대를 선택하세요" }}</span>
      </header>

      <div class="messages" ref="messagesBox">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['message', msg.sender === myId ? 'sent' : 'received']"
        >
          <div class="bubble">{{ msg.content }}</div>
          <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>

      <footer class="chat-input-box">
        <input
          v-model="messageInput"
          @keyup.enter="sendMessage"
          :disabled="!currentReceiver"
          placeholder="메시지를 입력하세요"
        />
        <button @click="sendMessage" :disabled="!currentReceiver">전송</button>
      </footer>
    </section>

    <!-- 새 채팅 모달 -->
    <div v-if="showNewChatModal" class="modal-backdrop" @click.self="closeNewChatModal">
      <div class="modal">
        <h3>새 채팅 시작</h3>
        <input v-model="newChatPartnerId" placeholder="상대방 ID를 입력하세요" />
        <div class="modal-actions">
          <button @click="closeNewChatModal">취소</button>
          <button @click="startNewChat">시작하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { chatApi } from "@/apis/chatApi";
import { Stomp } from "@stomp/stompjs";

const route = useRoute();
const auth = useAuthStore();

const myId = auth.user.id;
const token = auth.token;

const defaultProfile =
  "https://pjtbucket.s3.ap-northeast-2.amazonaws.com/profile/profileblack.png";

const chatRooms = ref([]);
const messages = ref([]);

const currentReceiver = ref(null);
const currentReceiverNickname = ref("");

const messageInput = ref("");
const messagesBox = ref(null);

let stompClient = null;

const showNewChatModal = ref(false);
const newChatPartnerId = ref("");

// 시간 포맷 : 오늘/어제/올해/그 외
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const iso = timestamp.replace(" ", "T");
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const isToday =
    d.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() === d.toDateString();

  const hh = d.getHours();
  const ampm = hh < 12 ? "오전" : "오후";
  const h = hh % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  const timeText = `${ampm} ${h}:${m}`;

  if (isToday) return timeText;
  if (isYesterday) return `어제 ${timeText}`;

  if (d.getFullYear() === new Date().getFullYear())
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${timeText}`;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${timeText}`;
};

// STOMP 연결
const connectStomp = () => {
  if (!token) return;

  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${location.host}/ws/chat?token=${token}`);

  stompClient = Stomp.over(socket);
  stompClient.debug = () => {};

  stompClient.connect({}, () => {
    console.log("STOMP 연결 성공")  

    stompClient.subscribe(`/sub/chat/private/${myId}`, (frame) => {
      const data = JSON.parse(frame.body);

      if (
        data.sender === currentReceiver.value ||
        data.receiver === currentReceiver.value
      ) {
        messages.value.push(data);
        scrollToBottom();
      }

      loadChatRooms();
    });
  });

  stompClient.onWebSocketClose = () => {
    console.warn("⚠ WebSocket 끊김 — 3초 후 재연결");
    setTimeout(connectStomp, 3000);
  };

  stompClient.onStompError = err => console.error("STOMP ERROR:", err);

};



// 채팅방 목록
const loadChatRooms = async () => {
  try {
    const res = await chatApi.getChatRooms(myId);
    chatRooms.value = res.data.content;
  } catch (e) {
    console.error(e);
  }
};

// 채팅방 열기
const openRoom = async (room) => {
  currentReceiver.value = room.chatPartner;
  currentReceiverNickname.value = room.chatPartnerNickname || room.chatPartner;
  room.unreadCount = 0;
  await loadHistory();
};

// 히스토리 로드
const loadHistory = async () => {
  if (!currentReceiver.value) return;
  const res = await chatApi.getChatHistory(myId, currentReceiver.value);
  messages.value = res.data.content;
  scrollToBottom();
};

// 메시지 전송
const sendMessage = () => {
  if (!messageInput.value.trim() || !currentReceiver.value) return;
  if (!stompClient || !stompClient.connected) return;

  const msg = {
    sender: myId,
    receiver: currentReceiver.value,
    content: messageInput.value.trim(),
  };

  stompClient.send("/pub/chat/message", {}, JSON.stringify(msg));
  messages.value.push({ ...msg, timestamp: new Date().toISOString() });
  messageInput.value = "";
  scrollToBottom();
};

// 스크롤 아래로
const scrollToBottom = () =>
  nextTick(() => (messagesBox.value.scrollTop = messagesBox.value.scrollHeight));

// 새 채팅
const openNewChatModal = () => (newChatPartnerId.value = "", showNewChatModal.value = true);
const closeNewChatModal = () => (showNewChatModal.value = false);

const startNewChat = () => {
  const target = newChatPartnerId.value.trim();
  if (!target) return;

  let room = chatRooms.value.find((r) => r.chatPartner === target);
  if (!room) {
    room = {
      chatPartner: target,
      chatPartnerNickname: route.query.nickname || target,
      lastMessage: "",
      timestamp: null,
      partnerProfileImgUrl: null,
      unreadCount: 0,
    };
    chatRooms.value.unshift(room);
  }

  openRoom(room);
  closeNewChatModal();
};

// 초기 로딩
onMounted(async () => {
  await loadChatRooms();

  const target = route.query.user;
  const nickname = route.query.nickname;

  if (target) {
    let room = chatRooms.value.find((r) => r.chatPartner === target);
    if (!room) {
      room = {
        chatPartner: target,
        chatPartnerNickname: nickname || target,
        lastMessage: "",
        timestamp: null,
        partnerProfileImgUrl: null,
        unreadCount: 0,
      };
      chatRooms.value.unshift(room);
    }
    currentReceiverNickname.value = nickname || target;
    await openRoom(room);
  }

  // auth.token 변경 시 WebSocket 자동 연결
  watch(() => auth.token, (val) => {
    if (val) connectStomp();
  });

  // 로그인 유지된 상태라면 즉시 연결
  if (auth.token) connectStomp();
});
</script>


<style scoped>
/* 전체 레이아웃 */
.chat-container {
  display: flex;
  height: 90vh;
  border: 1px solid #ddd;
  background: #fff;
}

/* 왼쪽 리스트 */
.chat-list {
  width: 30%;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  min-width: 260px;
}

.chat-list-header {
  padding: 12px;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.new-chat-btn {
  border: none;
  background: #f2f2f2;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
}

.chat-items {
  overflow-y: auto;
  flex: 1;
}

.chat-item {
  display: flex;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.1s;
}

.chat-item:hover {
  background: #fafafa;
}

.chat-item.active {
  background: #e8f0ff;
}

.chat-profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.chat-info {
  flex: 1;
}

.chat-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.chat-name {
  font-weight: 600;
}

.chat-time {
  font-size: 12px;
  color: #999;
}

.chat-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-preview {
  color: #666;
  font-size: 13px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-unread {
  background: #ff5959;
  color: white;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 12px;
}

.empty-rooms {
  padding: 15px;
  color: #888;
  font-size: 13px;
}

/* 오른쪽 채팅방 */
.chat-room {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-room-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  background: #f7f7f9;
}

.message {
  margin: 5px 0;
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.message.sent {
  align-self: flex-end;
  text-align: right;
}

.message.received {
  align-self: flex-start;
  text-align: left;
}

.bubble {
  padding: 8px 12px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px #00000010;
  font-size: 14px;
}

.sent .bubble {
  background: #007bff;
  color: white;
}

.timestamp {
  font-size: 11px;
  margin-top: 3px;
  color: #777;
}

/* 입력창 */
.chat-input-box {
  display: flex;
  padding: 10px 12px;
  border-top: 1px solid #ddd;
  background: #fff;
}

.chat-input-box input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 18px;
  font-size: 14px;
}

.chat-input-box button {
  margin-left: 10px;
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
}

/* 새 채팅 모달 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: #00000055;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 18px;
  border-radius: 12px;
  width: 280px;
}

.modal h3 {
  margin-bottom: 10px;
  font-size: 16px;
}

.modal input {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-actions button {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    height: 100vh;
  }

  .chat-list {
    width: 100%;
    height: 260px;
  }

  .chat-room {
    flex: 1;
  }
}
</style>
