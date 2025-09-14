<template>
  <div class="register-container">
    <h2>新規登録</h2>
    <form @submit.prevent="onSubmit">
      <div class="input-group">
        <input
          type="text"
          placeholder="ユーザー名"
          v-model.trim="username"
          required
        />
      </div>
      <div class="input-group">
        <input
          type="email"
          placeholder="メールアドレス"
          v-model.trim="email"
          required
        />
      </div>
      <div class="input-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          placeholder="パスワード"
          v-model="password"
          required
        />
        <span class="toggle-password" @click="showPassword = !showPassword">
          👁️
        </span>
      </div>
      <div class="input-group">
        <input
          :type="showConfirm ? 'text' : 'password'"
          placeholder="パスワード確認"
          v-model="confirm"
          required
        />
        <span class="toggle-password" @click="showConfirm = !showConfirm">
          👁️
        </span>
      </div>

      <div class="input-group">
        <label style="margin-bottom: 5px;">権限</label><br />
        <label style="margin-right: 10px;">
          <input type="radio" value="2" v-model="role" /> 管理者
        </label>
        <label>
          <input type="radio" value="1" v-model="role" /> 一般ユーザー
        </label>
      </div>

      <div class="error-message" v-if="showError">
        {{ errorMessage }}
      </div>

      <button type="submit">登録</button>
      <button type="button" @click="onCancel">取消</button>
    </form>
    <div class="footer">© 2025 Your Company</div>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  data() {
    return {
      username: '',
      email: 'placeholder@example.com',
      password: '',
      confirm: '',
      role: '',
      showPassword: false,
      showConfirm: false,
      showError: false,
      errorMessage: ''
    };
  },
  methods: {
    async onSubmit() {
      localStorage.removeItem('token')

      // 前端校验失败的情况
      if (
          !this.username ||
          !this.email ||
          !this.password ||
          this.password !== this.confirm ||
          !this.role
      ) {
        this.showError = true;
        this.errorMessage = 'すべての項目を正しく入力してください。'
        return;
      }

      this.showError = false;

      try {
        await request.post('/auth/register', {
          username: this.username,
         // email: this.email,
          password: this.password,
          role: this.role
        })

        alert('登録成功！ログインしてください')
        this.$router.push('/login')

      } catch (err) {
        console.log('登録失敗エラー:', err)
        this.showError = true
        this.errorMessage = err?.response?.data?.message || '登録に失敗しました'
      }
    },
    onCancel() {
      this.$router.push('/login')
    },
  },
};
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
:root {
  --main-bg: linear-gradient(135deg, #e0eafc, #cfdef3);
  --form-bg: #ffffffee;
  --primary: #4a90e2;
  --border-radius: 12px;
  --input-height: 42px;
  --input-width: 240px;
  --font: "Segoe UI", "Helvetica Neue", sans-serif;
}

.register-container {
  background: var(--form-bg);
  padding: 40px 30px;
  border-radius: var(--border-radius);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 340px;
  font-family: var(--font);
  margin: 40px auto;
}

h2 {
  color: #333;
  font-size: 22px;
  margin-bottom: 25px;
}

.input-group {
  margin-left: 30px; /* 右へ移動 */
  position: relative;
  margin-bottom: 18px;
  text-align: left;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: var(--input-width);
  height: var(--input-height);
  padding: 0 38px 0 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f8f8f8;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: var(--primary);
  outline: none;
  background-color: #fff;
}

.toggle-password {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  cursor: pointer;
  color: #888;
  user-select: none;
}

button {
  width: 100px; /* ← 好きなpx数に変更可能 */
  margin: 0 auto; /* 中央寄せ */
  background: var(--primary);
  color:#fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 10px;
  margin-right: 10px;
  background-color: #5290d7;
}

button:hover {
  background: #3452ac;
}

.error-message {
  color: #d00;
  font-size: 12px;
  margin-bottom: 10px;
}

.footer {
  font-size: 11px;
  color: #999;
  margin-top: 25px;
}

@media (max-width: 400px) {
  .register-container {
    padding: 30px 20px;
  }

  input,
  button {
    width: 100% !important;
  }
}
</style>