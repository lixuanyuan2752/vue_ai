# Vue API 接口 localhost 对接配置说明

## 当前配置状态 ✅

所有Vue接口已正确配置为使用localhost对接。

## 配置详情

### 1. API 基础配置 (`src/api/index.js`)

```javascript
const api = axios.create({
  baseURL: '/api/rag',  // 使用相对路径
  timeout: 30000
})
```

**说明**：
- 使用相对路径 `/api/rag`
- 不包含域名或IP地址
- 通过Vite代理转发到后端

### 2. Vite 代理配置 (`vite.config.js`)

```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',  // 后端服务地址
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
```

**说明**：
- 前端运行在 `http://localhost:3000`
- 后端运行在 `http://localhost:8090`
- 所有 `/api` 开头的请求都会被代理到后端

## 请求流程

```
前端 (localhost:3000)
    ↓
axios请求: /api/rag/documents
    ↓
Vite开发服务器
    ↓
代理转发: http://localhost:8090/api/rag/documents
    ↓
后端服务 (localhost:8090)
    ↓
返回响应
```

## API 接口映射

| 前端请求 | 代理转发到 | 后端接口 |
|---------|-----------|---------|
| `/api/rag/documents` | `http://localhost:8090/api/rag/documents` | GET 获取所有文档 |
| `/api/rag/document` | `http://localhost:8090/api/rag/document` | POST 保存文档 |
| `/api/rag/document/1` | `http://localhost:8090/api/rag/document/1` | GET/DELETE 文档操作 |
| `/api/rag/answer` | `http://localhost:8090/api/rag/answer` | POST RAG问答 |
| `/api/rag/chat` | `http://localhost:8090/api/rag/chat` | POST AI对话 |
| `/api/rag/search` | `http://localhost:8090/api/rag/search` | GET 相似度检索 |

## 优势

1. **跨域解决**: Vite代理自动处理CORS问题
2. **开发便利**: 使用相对路径，无需硬编码地址
3. **环境统一**: 开发和生产环境可以使用相同的API调用代码
4. **易于维护**: 修改后端地址只需修改vite.config.js

## 验证方法

### 方法1: 浏览器开发者工具
1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签
3. 执行任何API操作
4. 查看请求URL，应该显示 `http://localhost:3000/api/rag/*`
5. 查看响应，确认数据正常返回

### 方法2: 直接测试
```bash
# 启动后端
cd "D:\AI code"
mvn spring-boot:run

# 启动前端
cd "D:\vue_ai\vue_code"
npm run dev

# 访问应用
# 打开 http://localhost:3000
# 登录后测试各个功能
```

### 方法3: 使用测试脚本
```bash
# Windows
cd "D:\AI code"
test_api.bat

# 查看所有接口是否正常响应
```

## 常见问题

### Q1: 为什么不直接使用 `http://localhost:8090`？
**A**: 使用相对路径 + Vite代理的优势：
- 自动处理跨域
- 开发环境统一管理
- 便于切换环境（开发/测试/生产）

### Q2: 生产环境如何配置？
**A**: 生产环境需要配置Nginx反向代理：
```nginx
location /api/ {
    proxy_pass http://localhost:8090/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Q3: 如何临时修改后端地址？
**A**: 修改 `vite.config.js` 中的 `target`：
```javascript
proxy: {
  '/api': {
    target: 'http://192.168.1.100:8090',  // 修改为实际地址
    changeOrigin: true,
    rewrite: (path) => path
  }
}
```

## 配置文件清单

确保以下文件配置正确：

- ✅ `src/api/index.js` - API基础配置
- ✅ `vite.config.js` - Vite代理配置
- ✅ `package.json` - 项目依赖

## 总结

当前配置已完全满足使用localhost对接的要求：
- ✅ 所有API请求使用相对路径
- ✅ Vite代理转发到localhost:8090
- ✅ 跨域问题已解决
- ✅ 开发环境配置完整

无需额外修改，可以直接使用！
