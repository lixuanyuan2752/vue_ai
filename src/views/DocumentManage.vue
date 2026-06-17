<template>
  <div class="document-manage">
    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon> 添加文档
      </el-button>
      <el-button @click="fetchDocuments" :loading="loading">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
      <span class="total-count" v-if="documents.length">共 {{ documents.length }} 篇文档</span>
    </div>

    <!-- 文档列表 -->
    <el-card shadow="never">
      <el-table :data="documents" stripe v-loading="loading" empty-text="暂无文档，请添加">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content?.substring(0, 100) }}{{ row.content?.length > 100 ? '...' : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.createdAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-popconfirm
              title="确定要删除这篇文档吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button link type="danger" size="small">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加文档对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加文档" width="600px" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="rules" ref="addFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="addForm.title" placeholder="请输入文档标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="addForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入文档内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="adding">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看文档对话框 -->
    <el-dialog v-model="viewDialogVisible" title="文档详情" width="650px">
      <div v-if="viewDoc">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ viewDoc.id }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ viewDoc.title }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ viewDoc.createdAt || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ viewDoc.updatedAt || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">
            <div class="view-content">{{ viewDoc.content }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDocuments, saveDocument, getDocumentById, deleteDocument } from '../api/index.js'

const loading = ref(false)
const adding = ref(false)
const documents = ref([])
const addDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const viewDoc = ref(null)
const addFormRef = ref(null)

const addForm = reactive({
  title: '',
  content: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

async function fetchDocuments() {
  loading.value = true
  try {
    const data = await getDocuments()
    documents.value = Array.isArray(data) ? data : (data.records || data.data || [])
  } catch {
    // 拦截器已处理
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  addForm.title = ''
  addForm.content = ''
  addDialogVisible.value = true
}

async function handleAdd() {
  const valid = await addFormRef.value?.validate().catch(() => false)
  if (!valid) return

  adding.value = true
  try {
    await saveDocument({ title: addForm.title, content: addForm.content })
    ElMessage.success('文档保存成功')
    addDialogVisible.value = false
    fetchDocuments()
  } catch {
    // 拦截器已处理
  } finally {
    adding.value = false
  }
}

async function openViewDialog(row) {
  try {
    viewDoc.value = await getDocumentById(row.id)
  } catch {
    viewDoc.value = row
  }
  viewDialogVisible.value = true
}

async function handleDelete(id) {
  try {
    await deleteDocument(id)
    ElMessage.success('删除成功')
    fetchDocuments()
  } catch {
    // 拦截器已处理
  }
}

onMounted(() => {
  fetchDocuments()
})
</script>

<style scoped>
.document-manage {
  max-width: 1100px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.total-count {
  margin-left: auto;
  color: #909399;
  font-size: 14px;
}

.view-content {
  white-space: pre-wrap;
  line-height: 1.8;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 14px;
}
</style>
