<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索文本">
          <el-input
            v-model="query"
            placeholder="输入要检索的文本..."
            style="width: 400px"
            clearable
            @keydown.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="返回数量">
          <el-input-number v-model="topK" :min="1" :max="20" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="searching">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
        </el-form-item>
      </el-form>
      <div class="search-tip">
        <el-icon><InfoFilled /></el-icon>
        基于向量相似度检索，返回与查询文本语义最相近的文档
      </div>
    </el-card>

    <!-- 搜索结果 -->
    <el-card shadow="never" class="result-card" v-if="searched">
      <template #header>
        <span>
          <el-icon><List /></el-icon>
          搜索结果：<strong>{{ query }}</strong>
          <el-tag type="info" style="margin-left: 10px">共 {{ results.length }} 条</el-tag>
        </span>
      </template>

      <div v-if="results.length === 0">
        <el-empty description="未找到相关文档" />
      </div>

      <div v-else class="result-list">
        <div v-for="(doc, index) in results" :key="doc.id || index" class="result-item">
          <div class="result-header">
            <div class="result-rank">
              <el-tag :type="index === 0 ? 'danger' : index < 3 ? 'warning' : 'info'" effect="dark" round>
                #{{ index + 1 }}
              </el-tag>
            </div>
            <div class="result-title">
              <h3>{{ doc.title || '无标题' }}</h3>
              <div class="result-meta">
                <span v-if="doc.similarity !== undefined">
                  相似度：<el-tag size="small">{{ (doc.similarity * 100).toFixed(2) }}%</el-tag>
                </span>
                <span v-if="doc.id">ID: {{ doc.id }}</span>
              </div>
            </div>
          </div>
          <div class="result-content">
            {{ doc.content || '无内容' }}
          </div>
          <el-divider v-if="index < results.length - 1" />
        </div>
      </div>
    </el-card>

    <!-- 初始状态 -->
    <el-card shadow="never" v-else>
      <el-empty description="输入检索文本并点击搜索，查找相似文档" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { searchSimilar } from '../api/index.js'

const query = ref('')
const topK = ref(5)
const results = ref([])
const searching = ref(false)
const searched = ref(false)

async function handleSearch() {
  if (!query.value.trim()) return

  searching.value = true
  searched.value = true
  try {
    const data = await searchSimilar(query.value.trim(), topK.value)
    results.value = Array.isArray(data) ? data : (data.records || data.data || [])
  } catch {
    results.value = []
  } finally {
    searching.value = false
  }
}
</script>

<style scoped>
.search-page {
  max-width: 1000px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.search-tip {
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.result-card {
  min-height: 300px;
}

.result-list {
  padding: 10px 0;
}

.result-item {
  padding: 10px 0;
}

.result-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 10px;
}

.result-rank {
  flex-shrink: 0;
  padding-top: 2px;
}

.result-title h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 6px;
}

.result-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.result-content {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
  padding-left: 44px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
