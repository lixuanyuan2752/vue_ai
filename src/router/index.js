import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录 - Spring AI RAG' }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/rag-chat',
    children: [
      {
        path: 'rag-chat',
        name: 'RagChat',
        component: () => import('../views/RagChat.vue'),
        meta: { title: 'RAG 智能问答' }
      },
      {
        path: 'direct-chat',
        name: 'DirectChat',
        component: () => import('../views/DirectChat.vue'),
        meta: { title: 'AI 对话' }
      },
      {
        path: 'documents',
        name: 'Documents',
        component: () => import('../views/DocumentManage.vue'),
        meta: { title: '文档管理' }
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('../views/SearchPage.vue'),
        meta: { title: '相似度检索' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录跳转到登录页
router.beforeEach((to, from, next) => {
  const isLoggedIn = sessionStorage.getItem('loggedIn')
  if (to.path !== '/login' && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/rag-chat')
  } else {
    next()
  }
})

export default router
