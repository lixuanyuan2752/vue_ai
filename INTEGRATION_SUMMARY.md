# 前后端接口对接联调完成总结

## 项目概述

### 前端项目
- **路径**: `D:\vue_ai\vue_code`
- **技术栈**: Vue 3 + Vite + Element Plus + Vue Router + Axios
- **开发端口**: 3000

### 后端项目
- **路径**: `D:\AI code`
- **技术栈**: Spring Boot + Spring AI + PostgreSQL + PGVector
- **服务端口**: 8090

## 接口对接详情

### 1. API 配置更新

#### Vite 代理配置 (`vite.config.js`)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8090',  // 更新为后端实际端口
    changeOrigin: true,
    rewrite: (path) => path
  }
}
```

#### API 基础配置 (`src/api/index.js`)
- **Base URL**: `/api/rag`
- **超时时间**: 30000ms
- **响应拦截器**: 统一错误处理

### 2. API 接口映射

| 前端方法 | 后端接口 | 方法 | 说明 |
|---------|---------|------|------|
| `ragAnswer(question, topK)` | `/api/rag/answer` | POST | RAG 智能问答 |
| `ragChat(message)` | `/api/rag/chat` | POST | AI 直接对话 |
| `saveDocument(data)` | `/api/rag/document` | POST | 保存文档 |
| `getDocuments()` | `/api/rag/documents` | GET | 获取所有文档 |
| `getDocumentById(id)` | `/api/rag/document/{id}` | GET | 根据 ID 获取文档 |
| `deleteDocument(id)` | `/api/rag/document/{id}` | DELETE | 删除文档 |
| `searchSimilar(query, topK)` | `/api/rag/search` | GET | 相似度检索 |

### 3. 数据格式转换

#### RAG 问答响应
```javascript
// 后端返回: { question, answer }
// 前端转换为: { question, answer, retrievedDocs: [] }
```

#### AI 对话响应
```javascript
// 后端返回: String
// 前端转换为: { answer, response }
```

#### 文档对象
```javascript
// 后端返回: { id, title, content, createdAt, updatedAt, metadata, deleted }
// 前端使用: { id, title, content, createdAt, updatedAt }
```

#### 相似度检索结果
```javascript
// 后端返回: Spring AI Document[] (包含 metadata, content)
// 前端转换为: [{ id, title, content, score }]
```

## 页面功能对接

### 1. 登录页面 (`Login.vue`)
- **状态**: 模拟登录（无需后端接口）
- **功能**: 三种登录方式（手机号、扫码、账号密码）
- **跳转**: 登录成功后跳转到 `/rag-chat`

### 2. RAG 智能问答 (`RagChat.vue`)
- **接口**: `ragAnswer(question, topK)`
- **功能**: 
  - 输入问题并设置检索文档数量
  - 显示 AI 回答
  - 显示检索到的相关文档（如后端支持）

### 3. AI 对话 (`DirectChat.vue`)
- **接口**: `ragChat(message)`
- **功能**: 
  - 直接与 AI 对话，不使用知识库
  - 支持多轮对话
  - Markdown 格式渲染

### 4. 文档管理 (`DocumentManage.vue`)
- **接口**: 
  - `getDocuments()` - 获取文档列表
  - `saveDocument(data)` - 保存文档
  - `getDocumentById(id)` - 查看文档详情
  - `deleteDocument(id)` - 删除文档
- **功能**: 
  - 文档列表展示
  - 添加新文档
  - 查看文档详情
  - 删除文档

### 5. 相似度检索 (`SearchPage.vue`)
- **接口**: `searchSimilar(query, topK)`
- **功能**: 
  - 基于向量相似度检索文档
  - 显示相似度分数
  - 显示文档元数据

## 启动说明

### 后端启动
```bash
cd "D:\AI code"
# 确保 PostgreSQL 已启动
# 确保 OpenAI API Key 已配置
mvn spring-boot:run
```
后端将在 `http://localhost:8090` 启动

### 前端启动
```bash
cd "D:\vue_ai\vue_code"
npm install  # 首次运行需要安装依赖
npm run dev
```
前端将在 `http://localhost:3000` 启动

## 测试步骤

### 1. 环境检查
- [ ] PostgreSQL 数据库已启动
- [ ] OpenAI API Key 已配置
- [ ] 后端服务运行在 8090 端口
- [ ] 前端服务运行在 3000 端口

### 2. 功能测试

#### 文档管理测试
1. 访问 `http://localhost:3000`
2. 登录后进入"文档管理"
3. 点击"添加文档"，输入标题和内容
4. 保存后验证文档是否显示在列表中
5. 点击"查看"验证文档详情
6. 点击"删除"验证删除功能

#### RAG 问答测试
1. 进入"RAG 智能问答"页面
2. 输入问题，设置检索数量
3. 点击"提交问题"
4. 验证 AI 回答是否正确显示
5. 验证检索到的文档是否显示

#### AI 对话测试
1. 进入"AI 对话"页面
2. 输入消息并发送
3. 验证 AI 回复是否正确显示
4. 进行多轮对话测试

#### 相似度检索测试
1. 进入"相似度检索"页面
2. 输入检索文本
3. 设置返回数量
4. 点击"搜索"
5. 验证搜索结果是否按相似度排序
6. 验证相似度分数是否正确显示

## 注意事项

### 1. 跨域问题
- 后端已配置 `@CrossOrigin(origins = "*")`
- 前端使用 Vite 代理，无需额外配置

### 2. 数据格式
- 后端返回的日期格式为 `LocalDateTime`
- 前端直接使用字符串格式显示

### 3. 错误处理
- API 拦截器统一处理错误
- 使用 Element Plus 的 `ElMessage` 显示错误信息

### 4. 性能优化
- API 请求超时设置为 30 秒
- 大文本内容使用 `show-overflow-tooltip` 截断显示

## 后续优化建议

1. **分页功能**: 文档列表和搜索结果添加分页
2. **加载状态**: 所有 API 请求添加 loading 状态
3. **错误重试**: 网络错误时提供重试机制
4. **数据缓存**: 文档列表等数据可考虑缓存
5. **实时更新**: 文档变更后实时更新列表
6. **导出功能**: 支持文档导出
7. **批量操作**: 支持批量删除文档
8. **搜索优化**: 添加搜索历史和热门搜索

## 技术支持

如有问题，请检查：
1. 后端日志：`D:\AI code\src\main\resources\application.yml` 中的日志配置
2. 浏览器控制台：查看前端错误信息
3. 网络请求：使用浏览器开发者工具查看 API 请求详情

## 完成状态

✅ Vite 配置更新  
✅ API 接口对接  
✅ 数据格式转换  
✅ 页面功能集成  
✅ 错误处理完善  
✅ 跨域问题解决  

**前后端接口对接联调已完成！**
