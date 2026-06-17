<template>
  <div class="rag-chat">
    <!-- RAG 流程说明 -->
    <el-alert
      title="RAG 流程：问题向量化 → 相似度检索 → 构建上下文 → 生成回答"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    />

    <el-row :gutter="20">
      <!-- 左侧：输入区 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span><el-icon><EditPen /></el-icon> 提问</span>
          </template>
          <el-form :model="form" label-width="80px">
            <el-form-item label="问题">
              <el-input
                v-model="form.question"
                type="textarea"
                :rows="4"
                placeholder="请输入你的问题..."
              />
            </el-form-item>
            <el-form-item label="检索数量">
              <el-slider v-model="form.topK" :min="1" :max="10" show-input :show-input-controls="false" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAsk" :loading="loading" style="width: 100%">
                <el-icon><Promotion /></el-icon> 提交问题
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 检索到的文档 -->
        <el-card shadow="never" style="margin-top: 16px" v-if="result.retrievedDocs && result.retrievedDocs.length">
          <template #header>
            <span><el-icon><DocumentCopy /></el-icon> 检索到的相关文档 (Top {{ form.topK }})</span>
          </template>
          <div v-for="(doc, index) in result.retrievedDocs" :key="index" class="retrieved-doc">
            <el-tag type="success" size="small" style="margin-bottom: 6px">文档 #{{ index + 1 }}</el-tag>
            <div class="doc-title"><strong>{{ doc.title }}</strong></div>
            <div class="doc-content">{{ doc.content?.substring(0, 200) }}{{ doc.content?.length > 200 ? '...' : '' }}</div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：回答区 -->
      <el-col :span="16">
        <el-card shadow="never" class="answer-card">
          <template #header>
            <span><el-icon><ChatLineSquare /></el-icon> 回答</span>
          </template>
          <div v-if="loading" class="loading-area">
            <el-skeleton :rows="6" animated />
            <div class="loading-text">正在检索相关文档并生成回答，请稍候...</div>
          </div>
          <div v-else-if="result.answer" class="answer-area">
            <div class="question-label">Q: {{ result.question }}</div>
            <el-divider />
            <div class="answer-content markdown-body" v-html="renderedAnswer"></div>
          </div>
          <el-empty v-else description="输入问题并提交，获取 AI 增强回答" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ragAnswer } from '../api/index.js'

const form = reactive({
  question: '',
  topK: 3
})

const loading = ref(false)
const result = reactive({
  question: '',
  answer: '',
  retrievedDocs: []
})

// 简单的 Markdown 渲染（处理换行和代码块）
const renderedAnswer = computed(() => {
  if (!result.answer) return ''
  return result.answer
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
})

async function handleAsk() {
  if (!form.question.trim()) {
    ElMessage.warning('请输入问题')
    return
  }
  loading.value = true
  result.answer = ''
  result.question = ''
  result.retrievedDocs = []
  try {
    const data = await ragAnswer(form.question.trim(), form.topK)
    result.question = data.question || form.question
    result.answer = data.answer || '未获取到回答'
    result.retrievedDocs = data.retrievedDocs || data.documents || []
  } catch {
    // 拦截器已处理错误提示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.rag-chat {
  max-width: 1200px;
}

.answer-card {
  min-height: 400px;
}

.loading-area {
  text-align: center;
  padding: 40px 20px;
}

.loading-text {
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.answer-area {
  padding: 10px 0;
}

.question-label {
  font-weight: 600;
  color: #409eff;
  font-size: 15px;
  margin-bottom: 10px;
}

.answer-content {
  line-height: 1.8;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}

.answer-content :deep(pre) {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
}

.answer-content :deep(code) {
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: #e83e8c;
}

.answer-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #303133;
}

.retrieved-doc {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.retrieved-doc:last-child {
  border-bottom: none;
}

.doc-title {
  font-size: 14px;
  margin-bottom: 4px;
  color: #303133;
}

.doc-content {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}
</style>
