<template>
  <div class="login-page">
    <!-- 四角动态光晕 -->
    <div class="glow-orb glow-top-left"></div>
    <div class="glow-orb glow-top-right"></div>
    <div class="glow-orb glow-bottom-left"></div>
    <div class="glow-orb glow-bottom-right"></div>
    <!-- 中心大光晕 -->
    <div class="glow-orb glow-center"></div>

    <!-- Three.js 画布 -->
    <canvas ref="canvas" class="three-canvas"></canvas>

    <!-- 脉冲光波 -->
    <div class="pulse-wave"></div>
    <div class="pulse-wave pulse-wave-2"></div>

    <!-- 登录卡片 -->
    <div class="login-card-wrapper">
      <div class="login-card">
        <!-- 顶部光晕遮罩 -->
        <div class="card-top-glow"></div>

        <!-- AI 大脑图标 -->
        <div class="ai-icon">
          <svg viewBox="0 0 100 100" class="brain-svg">
            <defs>
              <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f3ff" />
                <stop offset="50%" stop-color="#a855f7" />
                <stop offset="100%" stop-color="#ff3b7f" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path d="M50 15 C30 15 12 28 15 45 C17 32 25 28 30 35 C33 22 45 18 50 28 C55 18 67 22 70 35 C75 28 83 32 85 45 C88 28 70 15 50 15Z" fill="url(#brainGrad)" filter="url(#glow)" opacity="0.95" />
            <path d="M30 48 C25 42 18 45 20 52 C22 60 30 58 35 52 C30 60 32 68 38 65 C42 62 40 55 42 48 C44 42 50 40 50 40 C50 40 56 42 58 48 C60 55 58 62 62 65 C68 68 70 60 65 52 C70 58 78 60 80 52 C82 45 75 42 70 48" fill="none" stroke="url(#brainGrad)" stroke-width="3.5" filter="url(#glow)" />
            <text x="50" y="80" text-anchor="middle" fill="url(#brainGrad)" font-size="15" font-weight="bold" filter="url(#glow)" font-family="Arial">A I</text>
          </svg>
        </div>

        <h2 class="login-title">AI KNOWLEDGE</h2>
        <p class="login-subtitle">Spring AI RAG · 检索增强生成 · 智能知识问答</p>

        <!-- === Tab 切换 === -->
        <div class="tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="switchTab(tab.key)"
          >
            <span class="tab-icon" v-html="tab.icon"></span>
            <span>{{ tab.label }}</span>
          </button>
          <div class="tab-indicator" :style="indicatorStyle"></div>
        </div>

        <!-- ==================== 面板1：手机号登录 ==================== -->
        <Transition name="panel-fade">
          <div v-if="activeTab === 'phone'" class="login-panel" key="phone">
            <div class="input-group" :class="{ 'has-error': phoneError }">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" stroke-linecap="round" />
                </svg>
              </div>
              <input v-model="phoneForm.phone" type="tel" placeholder="请输入手机号" class="glow-input" maxlength="11" @input="validatePhone" />
              <span v-if="phoneForm.phone && !phoneError && phoneTouched" class="input-check">✓</span>
              <span v-if="phoneError" class="input-err-msg">{{ phoneError }}</span>
            </div>

            <CaptchaCanvas ref="captchaPhoneRef" @verified="onCaptchaPhoneVerified" />

            <div class="sms-row">
              <div class="input-group sms-input">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13 2 4" />
                  </svg>
                </div>
                <input v-model="phoneForm.smsCode" type="text" placeholder="短信验证码" class="glow-input" maxlength="6" />
              </div>
              <button class="sms-btn" :disabled="!smsEnabled || countdown > 0" @click="sendSms">
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>

            <button class="flow-button" :class="{ loading: phoneLogging }" :disabled="!canPhoneLogin || phoneLogging" @click="handlePhoneLogin">
              <span class="btn-text">{{ phoneLogging ? '登录中...' : '登 录' }}</span>
              <span class="btn-shine"></span>
            </button>
          </div>
        </Transition>

        <!-- ==================== 面板2：扫码登录 ==================== -->
        <Transition name="panel-fade">
          <div v-if="activeTab === 'qrcode'" class="login-panel" key="qrcode">
            <div class="qr-grid">
              <button class="qr-option" @click="handleWechatDirect">
                <div class="qr-icon wechat-bg">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                    <path d="M8.5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM3 8.5C3 5.46 6.24 3 10.24 3c3.89 0 7.04 2.53 7.04 5.64 0 3.11-3.15 5.64-7.04 5.64-.66 0-1.3-.07-1.9-.2a.97.97 0 0 0-.77.17l-1.63 1.05c-.1.06-.22.01-.18-.13l.27-1.37a.8.8 0 0 0-.28-.76C4.09 12.13 3 10.43 3 8.5z"/>
                  </svg>
                </div>
                <span class="qr-label">微信登录</span>
              </button>
              <button class="qr-option" @click="handleAlipayDirect">
                <div class="qr-icon alipay-bg">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 7h-2.75c-.32 0-.58.26-.58.58v1.17h3.33v1.5h-3.33v3.5h-1.5v-3.5H8.34v-1.5h3.33V9.58c0-.32-.26-.58-.58-.58H8.5v-1.5h3.33V6h1.5v2.08H17v1.5h-.5z"/>
                  </svg>
                </div>
                <span class="qr-label">支付宝登录</span>
              </button>
              <button class="qr-option" @click="showQrCode('wechat')">
                <div class="qr-icon qr-mini wechat-bg">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                    <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="14" y="14" width="2" height="2" rx="0.5" /><rect x="18" y="14" width="2" height="2" rx="0.5" /><rect x="14" y="18" width="2" height="2" rx="0.5" /><rect x="18" y="18" width="2" height="2" rx="0.5" />
                  </svg>
                </div>
                <span class="qr-label">微信扫码</span>
              </button>
              <button class="qr-option" @click="showQrCode('alipay')">
                <div class="qr-icon qr-mini alipay-bg">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                    <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="14" y="14" width="2" height="2" rx="0.5" /><rect x="18" y="14" width="2" height="2" rx="0.5" /><rect x="14" y="18" width="2" height="2" rx="0.5" /><rect x="18" y="18" width="2" height="2" rx="0.5" />
                  </svg>
                </div>
                <span class="qr-label">支付宝扫码</span>
              </button>
            </div>
            <Transition name="qr-expand">
              <div v-if="qrVisible" class="qr-display">
                <div class="qr-scan-line"></div>
                <div class="qr-code-box">
                  <canvas ref="qrCanvas" width="160" height="160"></canvas>
                  <div class="qr-cover" v-if="qrScanning">
                    <div class="qr-scan-beam"></div>
                  </div>
                </div>
                <p class="qr-title">{{ qrType === 'wechat' ? '微信扫码登录' : '支付宝扫码登录' }}</p>
                <p class="qr-hint">请使用{{ qrType === 'wechat' ? '微信' : '支付宝' }}扫描二维码</p>
                <button class="qr-sim-btn" @click="handleQrSimLogin">模拟授权登录</button>
              </div>
            </Transition>
          </div>
        </Transition>

        <!-- ==================== 面板3：账号密码登录 ==================== -->
        <Transition name="panel-fade">
          <div v-if="activeTab === 'password'" class="login-panel" key="password">
            <div class="input-group">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </div>
              <input v-model="pwdForm.username" type="text" placeholder="用户名 / 邮箱" class="glow-input" autocomplete="username" />
            </div>
            <div class="input-group">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input v-model="pwdForm.password" :type="pwdVisible ? 'text' : 'password'" placeholder="请输入密码" class="glow-input" autocomplete="current-password" />
              <button class="pwd-toggle" type="button" @click="pwdVisible = !pwdVisible">
                <svg v-if="pwdVisible" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>

            <CaptchaCanvas ref="captchaPwdRef" @verified="onCaptchaPwdVerified" />

            <label class="remember-row">
              <span class="remember-checkbox" :class="{ checked: pwdForm.remember }" @click="pwdForm.remember = !pwdForm.remember">
                <span v-if="pwdForm.remember" class="check-mark">✓</span>
              </span>
              <span class="remember-text">记住密码</span>
            </label>

            <button class="flow-button" :class="{ loading: pwdLogging }" :disabled="!canPwdLogin || pwdLogging" @click="handlePwdLogin">
              <span class="btn-text">{{ pwdLogging ? '登录中...' : '登 录' }}</span>
              <span class="btn-shine"></span>
            </button>
          </div>
        </Transition>

        <div class="login-footer">
          <span>基于 Spring AI + PGVector + OpenAI</span>
        </div>
      </div>
    </div>

    <div class="bottom-line"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as THREE from 'three'

const router = useRouter()

// ===================== Tab =====================
const activeTab = ref('phone')
const tabs = [
  { key: 'phone', label: '手机号登录', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>' },
  { key: 'qrcode', label: '扫码登录', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/></svg>' },
  { key: 'password', label: '账号密码', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>' }
]
const indicatorStyle = ref({})
function updateIndicator() { const idx = tabs.findIndex(t => t.key === activeTab.value); indicatorStyle.value = { left: `${(idx / tabs.length) * 100}%`, width: `${100 / tabs.length}%` } }
onMounted(updateIndicator)
watch(activeTab, () => nextTick(updateIndicator))
function switchTab(key) { activeTab.value = key; qrVisible.value = false }

// ===================== 手机号登录 =====================
const phoneForm = reactive({ phone: '', smsCode: '' })
const phoneTouched = ref(false)
const phoneLogging = ref(false)
const smsEnabled = ref(false)
const countdown = ref(0)
let ct = null
const phoneError = computed(() => phoneForm.phone && !/^1\d{10}$/.test(phoneForm.phone) ? '请输入正确的手机号' : '')
const canPhoneLogin = computed(() => phoneForm.phone && !phoneError.value && phoneForm.smsCode.length >= 4 && smsEnabled.value)
function validatePhone() { if (phoneForm.phone.length > 0) phoneTouched.value = true; phoneForm.phone = phoneForm.phone.replace(/\D/g, '') }
function onCaptchaPhoneVerified() { smsEnabled.value = true }
function sendSms() { if (!smsEnabled.value || countdown.value > 0) return; ElMessage.success('验证码已发送（演示：123456）'); countdown.value = 60; ct = setInterval(() => { countdown.value--; if (countdown.value <= 0) { clearInterval(ct); ct = null } }, 1000) }
async function handlePhoneLogin() { if (!canPhoneLogin.value) return; phoneLogging.value = true; await new Promise(r => setTimeout(r, 800)); phoneLogging.value = false; if (phoneForm.smsCode === '123456') { sessionStorage.setItem('loggedIn', 'true'); ElMessage.success('手机号登录成功！'); router.push('/rag-chat') } else ElMessage.error('验证码错误（演示：123456）') }

// ===================== 扫码登录 =====================
const qrVisible = ref(false); const qrType = ref('wechat'); const qrScanning = ref(true); const qrCanvas = ref(null)
function showQrCode(type) { if (qrVisible.value && qrType.value === type) { qrVisible.value = false; return } qrType.value = type; qrVisible.value = true; qrScanning.value = true; nextTick(drawQrCode) }
function drawQrCode() { const cv = qrCanvas.value; if (!cv) return; const ctx = cv.getContext('2d'); const s = 160; const m = 25; const cs = s / m; ctx.fillStyle = '#1e1e40'; ctx.fillRect(0, 0, s, s); function fd(x, y) { ctx.fillStyle = '#00f3ff'; ctx.fillRect(x, y, cs * 7, cs * 7); ctx.fillStyle = '#1e1e40'; ctx.fillRect(x + cs, y + cs, cs * 5, cs * 5); ctx.fillStyle = '#00f3ff'; ctx.fillRect(x + cs * 2, y + cs * 2, cs * 3, cs * 3) } fd(0, 0); fd(s - cs * 7, 0); fd(0, s - cs * 7); const bs = 5; const bx = s - cs * (bs + 3); const by = s - cs * (bs + 3); ctx.fillStyle = '#00f3ff'; ctx.fillRect(bx, by, cs * bs, cs * bs); ctx.fillStyle = '#1e1e40'; ctx.fillRect(bx + cs, by + cs, cs * (bs - 2), cs * (bs - 2)); ctx.fillStyle = '#ff3b7f'; for (let i = 0; i < 200; i++) { const col = Math.floor(Math.random() * m); const row = Math.floor(Math.random() * m); if ((col < 8 && row < 8) || (col > 16 && row < 8) || (col < 8 && row > 16)) continue; if (col > m - 9 && row > m - 9) continue; ctx.fillRect(col * cs + 1, row * cs + 1, cs - 2, cs - 2) } }
function handleWechatDirect() { ElMessage.success('微信授权成功'); doQrLogin() }
function handleAlipayDirect() { ElMessage.success('支付宝授权成功'); doQrLogin() }
function handleQrSimLogin() { qrScanning.value = false; ElMessage.success('授权成功，登录完成'); doQrLogin() }
function doQrLogin() { sessionStorage.setItem('loggedIn', 'true'); setTimeout(() => router.push('/rag-chat'), 500) }

// ===================== 账号密码登录 =====================
const pwdForm = reactive({ username: '', password: '', remember: false })
const pwdVisible = ref(false); const pwdLogging = ref(false); const captchaPwdOk = ref(false)
function onCaptchaPwdVerified() { captchaPwdOk.value = true }
const canPwdLogin = computed(() => pwdForm.username.trim() && pwdForm.password.trim() && captchaPwdOk.value)
async function handlePwdLogin() { if (!canPwdLogin.value) return; pwdLogging.value = true; await new Promise(r => setTimeout(r, 800)); pwdLogging.value = false; sessionStorage.setItem('loggedIn', 'true'); ElMessage.success('账号密码登录成功'); router.push('/rag-chat') }

// ===================== Three.js 粒子球（亮度强化版） =====================
const canvas = ref(null)
let rid, scene, camera, renderer, particlesMesh, glowSprite

function initThree() {
  const el = canvas.value; if (!el) return
  const w = el.clientWidth; const h = el.clientHeight
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100); camera.position.z = 3.5
  renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true }); renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const sg = new THREE.SphereGeometry(1.4, 72, 54)
  const pos = sg.attributes.position.array; const pc = pos.length / 3
  const inner = 1500; const total = pc + inner
  const geo = new THREE.BufferGeometry(); const pa = new Float32Array(total * 3); const ca = new Float32Array(total * 3)

  // 球面粒子 — 亮色
  for (let i = 0; i < pc; i++) {
    const idx = i * 3; pa[idx] = pos[idx]; pa[idx + 1] = pos[idx + 1]; pa[idx + 2] = pos[idx + 2]
    const t = (pos[idx + 1] + 1.4) / 2.8
    ca[idx] = 0.25 + t * 0.55; ca[idx + 1] = 0.5 + t * 0.4; ca[idx + 2] = 0.7 + t * 0.3
  }
  // 内部粒子 — 亮青 + 亮粉
  for (let i = 0; i < inner; i++) {
    const r = 0.25 + Math.random() * 1.35
    const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1)
    const idx = (pc + i) * 3
    pa[idx] = r * Math.sin(phi) * Math.cos(theta); pa[idx + 1] = r * Math.sin(phi) * Math.sin(theta); pa[idx + 2] = r * Math.cos(phi)
    const kind = Math.random()
    if (kind < 0.3) { ca[idx] = 0; ca[idx + 1] = 0.95; ca[idx + 2] = 1 }       // 亮青 #00f3ff
    else if (kind < 0.5) { ca[idx] = 1; ca[idx + 1] = 0.23; ca[idx + 2] = 0.5 }  // 亮粉 #ff3b7f
    else if (kind < 0.65) { ca[idx] = 1; ca[idx + 1] = 0.85; ca[idx + 2] = 0.1 } // 金色
    else { ca[idx] = 0.35 + Math.random() * 0.55; ca[idx + 1] = 0.45 + Math.random() * 0.45; ca[idx + 2] = 0.7 + Math.random() * 0.3 }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pa, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(ca, 3))

  // 更大更亮的贴图
  const c2 = document.createElement('canvas'); c2.width = 56; c2.height = 56
  const ctx2 = c2.getContext('2d')
  const g = ctx2.createRadialGradient(28, 28, 0, 28, 28, 28)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.06, 'rgba(0,243,255,0.95)')
  g.addColorStop(0.3, 'rgba(168,85,247,0.55)'); g.addColorStop(0.65, 'rgba(0,114,255,0.1)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx2.fillStyle = g; ctx2.fillRect(0, 0, 56, 56); const tex = new THREE.CanvasTexture(c2)

  particlesMesh = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.05, map: tex, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true, transparent: true, opacity: 0.95 }))
  scene.add(particlesMesh)

  // 中心光晕
  const g2 = document.createElement('canvas'); g2.width = 256; g2.height = 256
  const ctx3 = g2.getContext('2d'); const gr = ctx3.createRadialGradient(128, 128, 0, 128, 128, 128)
  gr.addColorStop(0, 'rgba(0,243,255,0.5)'); gr.addColorStop(0.15, 'rgba(168,85,247,0.25)'); gr.addColorStop(0.4, 'rgba(0,114,255,0.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
  ctx3.fillStyle = gr; ctx3.fillRect(0, 0, 256, 256)
  const st = new THREE.CanvasTexture(g2); const sm = new THREE.SpriteMaterial({ map: st, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.65 })
  glowSprite = new THREE.Sprite(sm); glowSprite.scale.set(2.4, 2.4, 1); scene.add(glowSprite)

  scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00f3ff })))
  animate()
}

function animate() { rid = requestAnimationFrame(animate); if (particlesMesh) { particlesMesh.rotation.y += 0.0015; particlesMesh.rotation.x += 0.0005; particlesMesh.rotation.z += 0.0003 } if (glowSprite) glowSprite.material.opacity = 0.5 + Math.sin(Date.now() * 0.002) * 0.2; renderer.render(scene, camera) }
function onResize() { const el = canvas.value; if (!el || !renderer || !camera) return; const w = el.clientWidth; const h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix() }

onMounted(() => { initThree(); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => { if (rid) cancelAnimationFrame(rid); if (ct) clearInterval(ct); window.removeEventListener('resize', onResize); if (renderer) renderer.dispose(); if (scene) scene.clear() })
</script>

<script>
// ===================== Canvas 图形验证码 =====================
import { ref, onMounted, h, defineComponent } from 'vue'

const CaptchaCanvas = defineComponent({
  name: 'CaptchaCanvas',
  emits: ['verified'],
  setup(props, { emit }) {
    const code = ref(''); const input = ref(''); const error = ref(false); const cvRef = ref(null)

    function generate() {
      const cv = cvRef.value; if (!cv) return
      const ctx = cv.getContext('2d'); const w = cv.width; const h = cv.height
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      let c = ''; for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)]
      code.value = c

      // 亮色背景
      ctx.fillStyle = 'rgba(0,243,255,0.15)'; ctx.fillRect(0, 0, w, h)
      // 网格
      ctx.strokeStyle = 'rgba(0,243,255,0.08)'; ctx.lineWidth = 0.5
      for (let x = 0; x < w; x += 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      for (let y = 0; y < h; y += 10) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      // 噪点
      for (let i = 0; i < 80; i++) { ctx.fillStyle = `rgba(0,243,255,${0.15 + Math.random() * 0.25})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2.5, 2.5) }
      // 贝塞尔曲线
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(Math.random() * w * 0.3, Math.random() * h); ctx.quadraticCurveTo(w * 0.5, Math.random() * h, w * 0.7 + Math.random() * 0.3 * w, Math.random() * h); ctx.strokeStyle = `rgba(255,59,127,${0.3 + Math.random() * 0.2})`; ctx.lineWidth = 1 + Math.random(); ctx.stroke() }
      // 字符
      ctx.textBaseline = 'middle'
      for (let i = 0; i < c.length; i++) {
        const x = 24 + i * 28 + Math.random() * 8 - 4; const y = h / 2 + Math.random() * 12 - 6
        const angle = (Math.random() - 0.5) * 0.55; const size = 28 + Math.random() * 6
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle)
        const hue = Math.random() < 0.5 ? '190, 100%, 60%' : '340, 100%, 62%'
        ctx.font = `bold ${size}px "Courier New", monospace`; ctx.fillStyle = `hsl(${hue})`
        ctx.shadowColor = i % 2 === 0 ? 'rgba(0,243,255,0.7)' : 'rgba(255,59,127,0.7)'; ctx.shadowBlur = 6
        ctx.fillText(c[i], 0, 0); ctx.restore()
      }
      input.value = ''; error.value = false; emit('verified', false)
    }

    function verify() {
      if (input.value.toUpperCase() === code.value) { error.value = false; emit('verified', true) }
      else { error.value = true; emit('verified', false); setTimeout(() => { input.value = ''; generate() }, 800) }
    }

    onMounted(generate)

    return () => h('div', { class: 'captcha-box' }, [
      h('div', { class: 'captcha-img-wrap' }, [ h('canvas', { ref: cvRef, width: 180, height: 56, class: 'captcha-img' }) ]),
      h('div', { class: 'captcha-input-row' }, [
        h('div', { class: ['input-group', 'captcha-input-group', { 'has-error': error.value }] }, [
          h('div', { class: 'input-icon' }, [
            h('svg', { viewBox: '0 0 24 24', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', innerHTML: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>' })
          ]),
          h('input', { type: 'text', placeholder: '请输入验证码', maxlength: 5, class: 'glow-input captcha-input', value: input.value, onInput: (e) => { input.value = e.target.value.toUpperCase(); error.value = false }, onKeydown: (e) => { if (e.key === 'Enter') verify() } }),
          error.value ? h('span', { class: 'input-err-msg' }, '错误') : null
        ]),
        h('button', { class: 'captcha-refresh-btn', onClick: generate, title: '看不清，换一张' }, [
          h('svg', { viewBox: '0 0 24 24', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', class: 'refresh-icon', innerHTML: '<polyline points="1 4 1 10 7 10"/><path d="M4 15a9 9 0 1 0 2.64-6.36L1 10"/>' }),
          h('span', { class: 'refresh-text' }, '换一张')
        ])
      ]),
      input.value.length >= 4 ? h('button', { class: 'captcha-verify-btn', onClick: verify }, '验证') : null
    ])
  }
})
</script>

<style scoped>
/* ===================== 页面容器 ===================== */
.login-page {
  position: relative; width: 100%; height: 100vh;
  overflow: hidden; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 35%, #2d1b69 70%, #1e0a3c 100%);
}
.three-canvas { position: absolute; inset: 0; z-index: 0; }

/* ===================== 五处光晕 ===================== */
.glow-orb {
  position: absolute; z-index: 0; pointer-events: none;
  border-radius: 50%; filter: blur(100px);
}
.glow-top-left     { top: -150px; left: -100px;  width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,243,255,.4), transparent); }
.glow-top-right    { top: -100px; right: -120px;  width: 450px; height: 450px; background: radial-gradient(circle, rgba(255,59,127,.35), transparent); }
.glow-bottom-left  { bottom: -130px; left: -90px; width: 480px; height: 480px; background: radial-gradient(circle, rgba(168,85,247,.35), transparent); }
.glow-bottom-right { bottom: -150px; right: -100px;width: 520px; height: 520px; background: radial-gradient(circle, rgba(0,243,255,.4), transparent); }
.glow-center       { top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,243,255,.12), transparent 60%); }

/* ===================== 脉冲光波 ===================== */
.pulse-wave {
  position: absolute; z-index: 0; pointer-events: none;
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 300px; height: 300px; border-radius: 50%;
  border: 1px solid rgba(0,243,255,.3);
  animation: pulseExpand 4s ease-out infinite;
}
.pulse-wave-2 { animation-delay: 2s; border-color: rgba(255,59,127,.25); }
@keyframes pulseExpand {
  0% { width: 300px; height: 300px; opacity: .6; }
  100% { width: 800px; height: 800px; opacity: 0; }
}

/* ===================== 卡片容器 ===================== */
.login-card-wrapper {
  position: relative; z-index: 1;
  width: 460px; max-width: 92vw;
  border-radius: 20px; padding: 2px;
  background: linear-gradient(135deg, #00f3ff, #a855f7, #ff3b7f, #a855f7, #00f3ff);
  background-size: 400% 400%;
  box-shadow: 0 0 30px rgba(0,243,255,.35), 0 0 60px rgba(168,85,247,.25), 0 0 90px rgba(255,59,127,.1);
  animation: borderGlow 3s ease-in-out infinite, borderRotate 6s linear infinite;
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s;
}
.login-card-wrapper:hover {
  transform: scale(1.015);
  box-shadow: 0 0 45px rgba(0,243,255,.55), 0 0 80px rgba(168,85,247,.4), 0 0 120px rgba(255,59,127,.2);
}
@keyframes borderGlow {
  0%,100% { background-size: 400% 400%; filter: brightness(1); }
  50% { background-size: 400% 400%; filter: brightness(1.3); }
}
@keyframes borderRotate { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

/* ===================== 卡片本体 ===================== */
.login-card {
  position: relative;
  background: rgba(30, 35, 70, 0.88);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-radius: 18px; padding: 36px 34px 26px;
  display: flex; flex-direction: column; align-items: center;
  animation: cardFadeIn 0.9s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes cardFadeIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

.card-top-glow {
  position: absolute; top: 0; left: 8%; right: 8%; height: 2px;
  background: linear-gradient(90deg, transparent, #00f3ff, #a855f7, #ff3b7f, #a855f7, #00f3ff, transparent);
  pointer-events: none; filter: blur(1px);
}

/* ===================== AI 图标 ===================== */
.ai-icon { width: 76px; height: 76px; margin-bottom: 6px; animation: iconFloat 3s ease-in-out infinite, iconFadeIn 0.8s 0.15s both; }
@keyframes iconFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes iconFadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.brain-svg { width:100%;height:100%; animation: brainPulse 2.5s ease-in-out infinite; }
@keyframes brainPulse { 0%,100%{filter:drop-shadow(0 0 10px rgba(0,243,255,.6))} 50%{filter:drop-shadow(0 0 24px rgba(255,59,127,.9))} }

.login-title {
  font-size: 26px; font-weight: 800; letter-spacing: 3px;
  background: linear-gradient(135deg, #fff 0%, #00f3ff 30%, #a855f7 60%, #ff3b7f 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 12px rgba(0,243,255,.5)) drop-shadow(0 0 24px rgba(168,85,247,.3));
  margin: 0 0 6px;
  animation: textFadeIn 0.8s 0.25s both;
}
.login-subtitle {
  font-size: 13px; color: rgba(255,255,255,.75);
  margin: 0 0 26px; padding-bottom: 10px;
  border-bottom: 1px solid rgba(0,243,255,.3);
  letter-spacing: 1.5px;
  animation: textFadeIn 0.8s 0.35s both;
}
@keyframes textFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

/* ===================== Tab ===================== */
.tab-bar {
  position: relative; display: flex;
  width: 100%; background: rgba(255,255,255,.06);
  border-radius: 10px; margin-bottom: 26px; padding: 2px;
  animation: textFadeIn 0.8s 0.4s both;
}
.tab-btn {
  flex: 1; position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 5px; padding: 12px 4px;
  background: none; border: none;
  color: rgba(255,255,255,.4); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
  white-space: nowrap;
}
.tab-btn.active {
  color: #00f3ff;
  text-shadow: 0 0 10px rgba(0,243,255,.5), 0 0 20px rgba(0,243,255,.25);
}
.tab-btn:hover:not(.active) { color: rgba(255,255,255,.7); }
.tab-icon { display: flex; align-items: center; transition: filter 0.3s; }
.tab-btn.active .tab-icon { filter: drop-shadow(0 0 4px rgba(0,243,255,.6)); }

.tab-indicator {
  position: absolute; bottom: 2px; height: 2px;
  background: #00f3ff;
  border-radius: 1px;
  box-shadow: 0 0 14px #00f3ff, 0 0 28px rgba(0,243,255,.6), 0 0 42px rgba(0,243,255,.3);
  transition: left 0.35s cubic-bezier(0.16,1,0.3,1), width 0.35s cubic-bezier(0.16,1,0.3,1);
}

/* ===================== 面板切换 ===================== */
.panel-fade-enter-active { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
.panel-fade-leave-active { transition: all 0.2s ease-in; }
.panel-fade-enter-from { opacity: 0; transform: translateY(10px); }
.panel-fade-leave-to { opacity: 0; transform: translateY(-8px); }
.login-panel { width: 100%; display: flex; flex-direction: column; gap: 16px; }

/* ===================== 输入框（亮度优化） ===================== */
.input-group { position: relative; display: flex; align-items: center; }
.input-icon {
  position: absolute; left: 14px; z-index: 2;
  color: rgba(0,243,255,.7); display: flex; align-items: center;
  transition: color 0.3s, filter 0.3s;
}
.input-group:focus-within .input-icon { color: #00f3ff; filter: drop-shadow(0 0 6px rgba(0,243,255,.5)); }

.glow-input {
  width: 100%; height: 48px;
  padding: 0 14px 0 42px;
  border-radius: 11px;
  border: 1px solid rgba(0,243,255,.5);
  background: rgba(255,255,255,.12);
  color: #fff; font-size: 14px; outline: none;
  transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
}
.glow-input::placeholder { color: rgba(255,255,255,.55); }
.glow-input:focus {
  border-color: #00f3ff;
  background: rgba(255,255,255,.16);
  box-shadow:
    0 0 16px rgba(0,243,255,.45),
    0 0 40px rgba(0,243,255,.2),
    0 0 60px rgba(168,85,247,.1),
    inset 0 0 24px rgba(0,243,255,.06);
}

.input-check { position: absolute; right: 12px; color: #00f3ff; font-size: 18px; font-weight: bold; animation: popIn 0.3s cubic-bezier(0.16,1,0.3,1); text-shadow: 0 0 8px rgba(0,243,255,.5); }
@keyframes popIn { from{transform:scale(0)} to{transform:scale(1)} }
.input-err-msg { position: absolute; right: 12px; color: #ff3b7f; font-size: 11px; white-space: nowrap; }

.has-error .glow-input {
  border-color: rgba(255,59,127,.7);
  box-shadow: 0 0 14px rgba(255,59,127,.35);
  animation: shake 0.5s ease;
}
@keyframes shake {
  0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(6px)}
  45%{transform:translateX(-4px)} 60%{transform:translateX(4px)} 75%{transform:translateX(-2px)}
}

/* ===================== Canvas 验证码 ===================== */
.captcha-box { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.captcha-img-wrap {
  border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(0,243,255,.3);
  box-shadow: 0 0 14px rgba(0,243,255,.15);
  transition: all 0.3s;
}
.captcha-img-wrap:hover { border-color: rgba(0,243,255,.6); box-shadow: 0 0 24px rgba(0,243,255,.25); }
.captcha-img { display: block; width: 100%; height: 56px; }
.captcha-input-row { display: flex; gap: 8px; align-items: center; }
.captcha-input-group { flex: 1; }
.captcha-input { padding-right: 60px; }

.captcha-refresh-btn {
  display: flex; align-items: center; gap: 4px;
  flex-shrink: 0; padding: 0 10px; height: 48px;
  border-radius: 10px;
  border: 1px solid rgba(0,243,255,.4);
  background: rgba(0,243,255,.1);
  color: #00f3ff; font-size: 12px; cursor: pointer;
  transition: all 0.3s; white-space: nowrap;
}
.captcha-refresh-btn:hover {
  border-color: #00f3ff; background: rgba(0,243,255,.2);
  box-shadow: 0 0 20px rgba(0,243,255,.3), 0 0 40px rgba(0,243,255,.1);
  transform: translateY(-1px);
}
.captcha-refresh-btn:hover .refresh-icon { animation: spin 0.6s ease; }
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
.refresh-text { font-size: 11px; }

.captcha-verify-btn {
  align-self: flex-end; padding: 7px 22px;
  border-radius: 8px;
  border: 1px solid rgba(0,243,255,.5);
  background: linear-gradient(135deg, rgba(0,243,255,.2), rgba(168,85,247,.15));
  color: #00f3ff; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.3s;
}
.captcha-verify-btn:hover {
  background: linear-gradient(135deg, rgba(0,243,255,.35), rgba(168,85,247,.25));
  border-color: #00f3ff;
  box-shadow: 0 0 20px rgba(0,243,255,.35);
  transform: translateY(-1px);
}

/* ===================== 短信验证码 ===================== */
.sms-row { display: flex; gap: 10px; align-items: flex-start; }
.sms-input { flex: 1; }
.sms-btn {
  flex-shrink: 0; height: 48px; padding: 0 18px;
  border-radius: 11px;
  border: 1px solid rgba(0,243,255,.5);
  background: rgba(0,243,255,.12);
  color: #00f3ff; font-size: 13px; font-weight: 500; cursor: pointer;
  white-space: nowrap; transition: all 0.3s;
}
.sms-btn:hover:not(:disabled) {
  background: rgba(0,243,255,.25); border-color: #00f3ff;
  box-shadow: 0 0 20px rgba(0,243,255,.35);
  transform: translateY(-1px);
}
.sms-btn:disabled { opacity: .3; cursor: not-allowed; }

/* ===================== 密码可见性 ===================== */
.pwd-toggle {
  position: absolute; right: 10px; z-index: 2;
  background: none; border: none;
  color: rgba(255,255,255,.4); cursor: pointer;
  padding: 6px; display: flex; align-items: center;
  transition: all 0.3s;
}
.pwd-toggle:hover { color: #00f3ff; filter: drop-shadow(0 0 6px rgba(0,243,255,.4)); }

/* ===================== 记住密码 ===================== */
.remember-row { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; animation: textFadeIn 0.8s 0.5s both; }
.remember-checkbox {
  width: 18px; height: 18px; border-radius: 4px;
  border: 1px solid rgba(0,243,255,.5);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}
.remember-checkbox.checked {
  border-color: #00f3ff; background: linear-gradient(135deg, #00f3ff, #a855f7);
  box-shadow: 0 0 10px rgba(0,243,255,.4);
}
.check-mark { color: #fff; font-size: 12px; font-weight: bold; }
.remember-text { font-size: 13px; color: rgba(255,255,255,.6); }

/* ===================== 扫码登录 ===================== */
.qr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.qr-option {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 20px 10px;
  border-radius: 14px;
  border: 1px solid rgba(0,243,255,.15);
  background: rgba(255,255,255,.04);
  cursor: pointer; transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
}
.qr-option:hover {
  border-color: rgba(0,243,255,.5);
  background: rgba(0,243,255,.12);
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0,243,255,.2), 0 0 40px rgba(0,243,255,.08);
}
.qr-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
.qr-option:hover .qr-icon { transform: scale(1.1); }
.qr-mini { width: 48px; height: 48px; }
.wechat-bg { background: linear-gradient(135deg, #07c160, #06ad56); }
.alipay-bg { background: linear-gradient(135deg, #1677ff, #0958d9); }
.qr-label { font-size: 12px; color: rgba(255,255,255,.6); }

.qr-display {
  margin-top: 6px; padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(0,243,255,.35);
  background: rgba(25,30,60,.55);
  display: flex; flex-direction: column; align-items: center;
  position: relative; overflow: hidden;
}
.qr-scan-line {
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #00f3ff, transparent);
  animation: scanLine 2s ease-in-out infinite;
}
@keyframes scanLine { 0%{top:0;opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{top:100%;opacity:0} }
.qr-code-box { width: 160px; height: 160px; border-radius: 12px; overflow: hidden; border: 2px solid rgba(0,243,255,.5); position: relative; box-shadow: 0 0 20px rgba(0,243,255,.2); }
.qr-cover { position: absolute; inset: 0; background: rgba(25,30,60,.65); display: flex; align-items: center; justify-content: center; }
.qr-scan-beam {
  width: 140px; height: 3px;
  background: linear-gradient(90deg, transparent, #00f3ff, #a855f7, #00f3ff, transparent);
  border-radius: 2px;
  animation: scanBeam 1.5s ease-in-out infinite;
}
@keyframes scanBeam { 0%{transform:translateY(-70px)} 100%{transform:translateY(70px)} }
.qr-title { font-size: 14px; color: #fff; margin: 12px 0 4px; font-weight: 600; }
.qr-hint { font-size: 12px; color: rgba(255,255,255,.5); margin: 0 0 14px; }
.qr-sim-btn {
  padding: 8px 28px; border-radius: 20px;
  border: 1px solid rgba(0,243,255,.5);
  background: linear-gradient(135deg, rgba(0,243,255,.2), rgba(168,85,247,.15));
  color: #00f3ff; font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.3s;
}
.qr-sim-btn:hover { background: linear-gradient(135deg, rgba(0,243,255,.35), rgba(168,85,247,.25)); border-color: #00f3ff; box-shadow: 0 0 28px rgba(0,243,255,.35); transform: translateY(-1px); }
.qr-expand-enter-active { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
.qr-expand-leave-active { transition: all 0.25s ease-in; }
.qr-expand-enter-from { opacity: 0; transform: translateY(-10px) scaleY(0.9); }
.qr-expand-leave-to { opacity: 0; transform: translateY(-6px); }

/* ===================== 流光按钮（亮眼渐变） ===================== */
.flow-button {
  position: relative; width: 100%; height: 48px;
  border: none; border-radius: 11px;
  background: linear-gradient(135deg, #00c6ff, #0072ff, #8b5cf6, #d946ef);
  background-size: 300% 300%;
  color: #fff; font-size: 16px; font-weight: 700;
  letter-spacing: 8px; cursor: pointer;
  overflow: hidden; margin-top: 4px;
  box-shadow: 0 4px 20px rgba(0,114,255,.45), 0 0 40px rgba(0,114,255,.2);
  transition: transform 0.25s, box-shadow 0.3s;
  animation: btnBgMove 4s ease infinite;
}
@keyframes btnBgMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

.flow-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 35px rgba(0,198,255,.6), 0 0 60px rgba(0,114,255,.35), 0 0 80px rgba(139,92,246,.2);
}
.flow-button:active:not(:disabled) { transform: translateY(0); }
.flow-button:disabled { cursor: not-allowed; opacity: .45; filter: grayscale(30%); }
.btn-text { position: relative; z-index: 1; text-shadow: 0 0 10px rgba(255,255,255,.3); }

.btn-shine {
  position: absolute; top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), rgba(255,255,255,.55), rgba(255,255,255,.3), transparent);
  transform: skewX(-20deg);
  animation: shineSweep 2.5s ease-in-out infinite;
}
@keyframes shineSweep { 0%{left:-100%} 55%{left:120%} 100%{left:120%} }
.flow-button.loading .btn-shine { animation: shineFast 0.7s ease-in-out infinite; }
@keyframes shineFast { 0%{left:-100%} 100%{left:120%} }

/* ===================== 底部 ===================== */
.login-footer { margin-top: 22px; font-size: 11px; color: rgba(255,255,255,.32); animation: textFadeIn 0.8s 0.55s both; }
.bottom-line {
  position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,243,255,.5), rgba(168,85,247,.6), rgba(0,243,255,.5), transparent);
  z-index: 1; animation: bottomGlow 3s ease-in-out infinite;
}
@keyframes bottomGlow { 0%,100%{opacity:.4} 50%{opacity:.8} }

/* ===================== 响应式 ===================== */
@media (max-width: 480px) {
  .login-card { padding: 28px 16px 18px; }
  .login-title { font-size: 20px; letter-spacing: 2px; }
  .login-subtitle { font-size: 11px; margin-bottom: 18px; }
  .ai-icon { width: 58px; height: 58px; }
  .tab-btn { font-size: 11px; padding: 10px 2px; gap: 3px; }
  .tab-icon { display: none; }
  .glow-input { height: 44px; font-size: 13px; padding-left: 36px; }
  .flow-button { height: 44px; font-size: 15px; letter-spacing: 4px; }
  .qr-grid { gap: 10px; }
  .qr-option { padding: 14px 6px; }
  .qr-icon { width: 44px; height: 44px; }
  .qr-mini { width: 38px; height: 38px; }
  .sms-btn { font-size: 11px; padding: 0 10px; height: 44px; }
  .input-icon { left: 10px; }
  .captcha-refresh-btn { padding: 0 6px; }
  .refresh-text { display: none; }
  .captcha-input { padding-right: 10px; }
  .pulse-wave { display: none; }
}
</style>
