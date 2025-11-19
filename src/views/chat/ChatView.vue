<template>
  <div class="chat-container">
    <!-- 왼쪽: 채팅방 목록 -->
    <aside class="chat-list">
      <header class="chat-list-header">
        <span>채팅</span>
        <button class="new-chat-btn" @click="openNewChatModal">＋ 새 채팅</button>
      </header>

      <div class="chat-items">
        <div
          v-for="room in chatRooms"
          :key="room.chatPartner"
          @click="openRoom(room)"
          class="chat-item"
          :class="{ active: currentReceiver === room.chatPartner }"
        >
          <img :src="room.partnerProfileImgUrl" class="chat-profile" />

          <div class="chat-info">
            <div class="chat-top">
              <span class="chat-name">
                {{ room.chatPartnerNickname || room.chatPartner }}
              </span>

              <span class="chat-time">{{ formatTime(room.timestamp) }}</span>
            </div>

            <div class="chat-bottom">
              <span class="chat-preview">{{ room.lastMessage }}</span>

              <span v-if="room.unreadCount > 0" class="chat-unread">
                {{ room.unreadCount }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="chatRooms.length === 0" class="empty-rooms">
          아직 채팅방이 없어요.
        </div>
      </div>
    </aside>

    <!-- 오른쪽: 채팅 영역 -->
    <section class="chat-room">
      <header class="chat-room-header">
        <span>
          {{ currentReceiverNickname || "대화 상대를 선택하세요" }}
        </span>
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
        <button @click="sendMessage" :disabled="!currentReceiver">
          전송
        </button>
      </footer>
    </section>

    <!-- 새 채팅 모달 -->
    <div v-if="showNewChatModal" class="modal-backdrop" @click.self="closeNewChatModal">
      <div class="modal">
        <h3>새 채팅 시작</h3>
        <input
          v-model="newChatPartnerId"
          placeholder="상대방 ID를 입력하세요"
        />
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
import { useAuthStore } from "@/stores/authStore";
import { chatApi } from "@/apis/chatApi";
import { Stomp } from "@stomp/stompjs"; // ⭐ 반드시 필요
// import SockJS from "sockjs-client"; // 지금은 사용 안함

const auth = useAuthStore();
const myId = auth.user.id;
const token = auth.token;

const chatRooms = ref([]);
const messages = ref([]);

const currentReceiver = ref(null);
const currentReceiverNickname = ref("");

const messageInput = ref("");
const messagesBox = ref(null);

let stompClient = null; // ⭐ 전역에서 단 하나만 유지

// 새 채팅 모달 상태
const showNewChatModal = ref(false);
const newChatPartnerId = ref("");

// =======================
// 시간 포맷
// =======================
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// =======================
// STOMP 연결
// =======================
const connectStomp = () => {
  if (!token) {
    console.warn("토큰이 없어 STOMP 연결이 불가");
    return;
  }

  const socket = new WebSocket(`ws://localhost:8000/ws/chat?token=${token}`);

  // ⭐ 이 stompClient만 사용함
  stompClient = Stomp.over(socket);

  // 디버그 메시지 제거
  stompClient.debug = () => {};

  stompClient.connect({}, () => {
    console.log("✅ STOMP 연결 성공");

    stompClient.subscribe(`/sub/chat/private/${myId}`, (frame) => {
      const data = JSON.parse(frame.body);

      // 현재 열려 있는 방이면 메시지 표시
      if (
        data.sender === currentReceiver.value ||
        data.receiver === currentReceiver.value
      ) {
        messages.value.push(data);
        scrollToBottom();
      }

      // 채팅방 목록 업데이트
      loadChatRooms();
    });
  });
};

// =======================
// 채팅방 목록 불러오기
// =======================
const loadChatRooms = async () => {
  try {
    const res = await chatApi.getChatRooms(myId);
    chatRooms.value = res.data.content;
  } catch (err) {
    console.error("채팅방 목록 오류", err);
  }
};

// =======================
// 특정 방 열기
// =======================
const openRoom = async (room) => {
  currentReceiver.value = room.chatPartner;
  currentReceiverNickname.value =
    room.chatPartnerNickname || room.chatPartner;

  room.unreadCount = 0; // UI 상에서 임시로만 0

  await loadHistory();
};

// =======================
// 히스토리 불러오기
// =======================
const loadHistory = async () => {
  if (!currentReceiver.value) return;
  try {
    const res = await chatApi.getChatHistory(myId, currentReceiver.value);
    messages.value = res.data.content;
    scrollToBottom();
  } catch (err) {
    console.error("히스토리 오류", err);
  }
};

// =======================
// 메시지 전송
// =======================
const sendMessage = () => {
  if (!messageInput.value.trim()) return;
  if (!currentReceiver.value) {
    alert("대화 상대를 선택하세요.");
    return;
  }

  if (!stompClient || !stompClient.connected) {
    alert("서버와 연결되지 않았습니다.");
    return;
  }

  const msg = {
    sender: myId,
    receiver: currentReceiver.value,
    content: messageInput.value.trim(),
  };

  stompClient.send("/pub/chat/message", {}, JSON.stringify(msg));

  messages.value.push({
    ...msg,
    timestamp: new Date().toISOString(),
  });

  messageInput.value = "";
  scrollToBottom();
};

// =======================
// 스크롤 맨 아래
// =======================
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesBox.value) {
      messagesBox.value.scrollTop = messagesBox.value.scrollHeight;
    }
  });
};

// =======================
// 새 채팅 모달
// =======================
const openNewChatModal = () => {
  newChatPartnerId.value = "";
  showNewChatModal.value = true;
};

const closeNewChatModal = () => {
  showNewChatModal.value = false;
};

const startNewChat = () => {
  const targetId = newChatPartnerId.value.trim();
  if (!targetId) {
    alert("상대방 ID를 입력하세요.");
    return;
  }

  let room = chatRooms.value.find((r) => r.chatPartner === targetId);

  if (!room) {
    room = {
      chatPartner: targetId,
      chatPartnerNickname: targetId,
      lastMessage: "",
      timestamp: null,
      partnerProfileImgUrl: "https://via.placeholder.com/40?text=U",
      unreadCount: 0,
    };
    chatRooms.value.unshift(room);
  }

  openRoom(room);
  closeNewChatModal();
};

// =======================
// 컴포넌트 mount
// =======================
onMounted(() => {
  loadChatRooms();
  connectStomp();
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
