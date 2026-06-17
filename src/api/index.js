import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api/rag',
  timeout: 30000
})

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

/**
 * RAG 问答
 * @param {string} question - 问题
 * @param {number} topK - 检索文档数量
 */
export function ragAnswer(question, topK = 3) {
  return api.post('/answer', null, { params: { question, topK } })
}

/**
 * 直接对话（不使用 RAG）
 * @param {string} message - 消息
 */
export function ragChat(message) {
  return api.post('/chat', null, { params: { message } })
}

/**
 * 保存文档
 * @param {object} data - { title, content }
 */
export function saveDocument(data) {
  return api.post('/document', data)
}

/**
 * 获取所有文档
 */
export function getDocuments() {
  return api.get('/documents')
}

/**
 * 根据 ID 获取文档
 * @param {number} id - 文档 ID
 */
export function getDocumentById(id) {
  return api.get(`/document/${id}`)
}

/**
 * 删除文档
 * @param {number} id - 文档 ID
 */
export function deleteDocument(id) {
  return api.delete(`/document/${id}`)
}

/**
 * 相似度检索
 * @param {string} query - 查询文本
 * @param {number} topK - 返回数量
 */
export function searchSimilar(query, topK = 3) {
  return api.get('/search', { params: { query, topK } })
}
