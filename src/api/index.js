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
    .then(response => {
      // 后端返回 { question, answer }
      return {
        question: response.question,
        answer: response.answer,
        retrievedDocs: [] // 如果后端返回检索文档，可以在这里处理
      }
    })
}

/**
 * 直接对话（不使用 RAG）
 * @param {string} message - 消息
 */
export function ragChat(message) {
  return api.post('/chat', null, { params: { message } })
    .then(response => {
      // 后端直接返回字符串
      return {
        answer: response,
        response: response
      }
    })
}

/**
 * 保存文档
 * @param {object} data - { title, content }
 */
export function saveDocument(data) {
  return api.post('/document', data)
    .then(response => {
      // 后端返回 Document 对象
      return {
        id: response.id,
        title: response.title,
        content: response.content,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      }
    })
}

/**
 * 获取所有文档
 */
export function getDocuments() {
  return api.get('/documents')
    .then(response => {
      // 后端返回 Document 列表
      return Array.isArray(response) ? response : []
    })
}

/**
 * 根据 ID 获取文档
 * @param {number} id - 文档 ID
 */
export function getDocumentById(id) {
  return api.get(`/document/${id}`)
    .then(response => {
      // 后端返回 Document 对象
      return {
        id: response.id,
        title: response.title,
        content: response.content,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      }
    })
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
    .then(response => {
      // 后端返回 Spring AI Document 列表
      return Array.isArray(response) ? response.map(doc => ({
        id: doc.metadata?.id,
        title: doc.metadata?.title,
        content: doc.content,
        score: doc.metadata?.score || doc.metadata?.distance
      })) : []
    })
}
