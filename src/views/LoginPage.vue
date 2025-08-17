<template>
  <div class="login-container">
    <h2>ログイン</h2>
    <form @submit.prevent="handleLogin">
      <div class="input-group">
        <input v-model="username" type="text" placeholder="ユーザー名" required />
      </div>
      <div class="input-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="パスワード"
          required
        />
        <span class="toggle-password" @click="togglePassword">👁️</span>
      </div>
      <div class="options">
        <label><input type="checkbox" v-model="rememberMe" /> ログイン保持</label>
        <a href="#">パスワードを忘れた？</a>
      </div>
      <div class="error-message" v-if="showError">{{ errorMessage }}</div>

      <!-- ✅ 通常位置にボタン配置 -->
      <div class="form-buttons">
        <button type="submit" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログイン' }}
        </button>
        <button type="button" @click="goToRegister">新規登録</button>
      </div>
    </form>

    <div class="footer">© 2025 Your Company</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const showError = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  localStorage.removeItem('token')
  if (!username.value || !password.value) {
    showError.value = true
    errorMessage.value = 'ユーザー名とパスワードを入力してください。'
    return
  }

  showError.value = false
  loading.value = true

  try {
    const data = await request.post('/auth/login', {
      username: username.value,
      password: password.value
    })

    const token =data.token  // ここを必ずresponseに合わせてください
    localStorage.setItem('token', token)

    alert('ログイン成功')
-   router.push('/dashboard')
+   router.push('/top')
  } catch (err) {
    showError.value = true
    errorMessage.value = err.response?.data?.message || 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: "Segoe UI", sans-serif;

  /* 背景をグラデーション＋画像に */
  background: linear-gradient(135deg, rgba(74,144,226,0.6), rgba(255,182,193,0.6)),
              url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f') no-repeat center center fixed;
  background-size: cover;
}
.login-container {
  background: #ffffffee;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 320px;
  margin: 60px auto;
  font-family: "Segoe UI", sans-serif;
}

h2 {
  color: #333;
  font-size: 22px;
  margin-bottom: 25px;
}

.input-group {
  position: relative;
  margin-bottom: 18px;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  height: 42px;
  padding: 0 35px 0 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f8f8f8;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus {
  border-color: #4a90e2;
  background-color: #fff;
  outline: none;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  cursor: pointer;
  color: #888;
}

.options {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 20px;
  font-size: 12px;
  color: #666;
}

.options input {
  margin-right: 5px;
}

.error-message {
  color: #d00;
  font-size: 12px;
  margin-bottom: 10px;
}

/* ✅ ボタン表示位置 */
.form-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.form-buttons button {
  width: 200px; /* ← 好きなpx数に変更可能 */
  margin: 0 auto; /* 中央寄せ */
  height: 42px;
  background: #4a90e2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.form-buttons button:hover {
  background: #357ac8;
}

.footer {
  font-size: 11px;
  color: #999;
  margin-top: 30px;
}
</style>
