<template>
  <div class="direct-chat">
    <el-alert
      title="直接与 AI 对话，不检索知识库文档"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    />

    <!-- 聊天消息区 -->
    <el-card shadow="never" class="chat-card">
      <div class="chat-messages" ref="chatContainer">
        <div v-if="messages.length === 0" class="empty-chat">
          <el-empty description="开始与 AI 对话吧" />
        </div>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-item', msg.role === 'user' ? 'message-user' : 'message-ai']"
        >
          <div class="message-avatar">
            <el-avatar v-if="msg.role === 'user'" :size="36" icon="UserFilled" />
            <el-avatar v-else :size="36" style="background: #409eff">
              <el-icon :size="20"><CPU /></el-icon>
            </el-avatar>
          </div>
          <div class="message-bubble">
            <div class="message-text markdown-body" v-html="renderContent(msg.content)"></div>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>
        <div v-if="sending" class="message-item message-ai">
          <div class="message-avatar">
            <el-avatar :size="36" style="background: #409eff">
              <el-icon :size="20"><CPU /></el-icon>
            </el-avatar>
          </div>
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 输入区 -->
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="输入消息，按 Ctrl + Enter 发送..."
        @keydown.ctrl.enter="handleSend"
      />
      <div class="input-actions">
        <el-button @click="messages = []" :disabled="messages.length === 0">
          <el-icon><Delete /></el-icon> 清空对话
        </el-button>
        <el-button type="primary" @click="handleSend" :loading="sending" :disabled="!inputMessage.trim()">
          <el-icon><Promotion /></el-icon> 发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ragChat } from '../api/index.js'

const inputMessage = ref('')
const sending = ref(false)
const messages = ref([])
const chatContainer = ref(null)

function renderContent(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function getTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function handleSend() {
  const msg = inputMessage.value.trim()
  if (!msg || sending.value) return

  messages.value.push({
    role: 'user',
    content: msg,
    time: getTime()
  })
  inputMessage.value = ''
  sending.value = true
  scrollToBottom()

  try {
    const data = await ragChat(msg)
    messages.value.push({
      role: 'ai',
      content: data.answer || data.response || data || '未获取到回复',
      time: getTime()
    })
  } catch {
    // 拦截器已处理
  } finally {
    sending.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.direct-chat {
  max-width: 900px;
  margin: 0 auto;
}

.chat-card {
  margin-bottom: 16px;
}

.chat-messages {
  height: 450px;
  overflow-y: auto;
  padding: 10px;
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-bubble {
  max-width: 75%;
}

.message-user .message-bubble {
  text-align: right;
}

.message-text {
  padding: 10px 14px;
  border-radius: 8px;
  line-height: 1.6;
  word-break: break-word;
}

.message-user .message-text {
  background: #409eff;
  color: #fff;
  border-bottom-right-radius: 2px;
}

.message-ai .message-text {
  background: #f0f2f5;
  color: #303133;
  border-bottom-left-radius: 2px;
}

.message-text :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 6px 0;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 13px;
}

.message-ai .message-text :deep(code) {
  color: #e83e8c;
}

.message-time {
  font-size: 11px;
  color: #a8abb2;
  margin-top: 4px;
}

.chat-input {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 14px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}
</style>
