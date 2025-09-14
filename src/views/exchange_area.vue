<template>
  <div>
    <!-- 共通ナビメニュー -->
    <nav class="main-nav">
      <ul>
        <li><router-link to="/top">ホーム</router-link></li>
        <li><router-link to="/employee_infoshow">基本情報</router-link></li>
        <li v-if="permissionsLevel=='2'"><router-link to="/employee_skillmap">スキル分析</router-link></li>
        <li v-if="permissionsLevel=='2'"><router-link to="/employee_search">人材管理</router-link></li>
        <li><router-link to="/itexchange_area">技術交流モジュール</router-link></li>
        <li><router-link to="/exchange_area">交流エリア</router-link></li>
        <li class="logout"><a href="#" @click.prevent="logout">ログアウト</a></li>
      </ul>
    </nav>

    <!-- 交流エリア -->
    <div class="container">
      <h1>交流エリア</h1>
      <p class="description">社員同士で自由に情報交換・意見共有できるコミュニティです。</p>

      <!-- 投稿フォーム -->
      <section class="post-form">
        <h2>新しい投稿</h2>
        <form @submit.prevent="addPost">
          <input type="text" v-model="newPost.name" placeholder="お名前" required />
          <textarea v-model="newPost.message" placeholder="メッセージを入力してください" rows="3" required></textarea>

          <div class="form-row">
            <select v-model="newPost.tag">
              <option disabled value="">タグを選択</option>
              <option>技術</option>
              <option>趣味</option>
              <option>お知らせ</option>
            </select>

            <input type="file" @change="onFileChange" />
          </div>

          <button type="submit">投稿</button>
        </form>
      </section>

      <!-- 検索フォーム -->
      <section class="search-form">
        <input type="text" v-model="searchQuery" placeholder="🔍 キーワードで検索" />
        <select v-model="filterTag">
          <option value="">すべてのタグ</option>
          <option>技術</option>
          <option>趣味</option>
          <option>お知らせ</option>
        </select>
      </section>

      <!-- 投稿一覧 -->
      <section class="post-list">
        <h2>投稿一覧</h2>
        <div v-if="filteredPosts.length === 0" class="no-posts">
          投稿が見つかりません。
        </div>
        <div v-for="(post, index) in filteredPosts" :key="index" class="post-card">
          <div class="post-header">
            <h3>{{ post.name }}</h3>
            <span class="tag">#{{ post.tag }}</span>
          </div>

          <p class="post-message">{{ post.message }}</p>

          <img v-if="post.image" :src="post.image" alt="投稿画像" class="post-image" />

          <small class="post-date">{{ post.date }}</small>

          <div class="actions">
            <button @click="likePost(index)">👍 {{ post.likes }}</button>
            <button @click="toggleComments(index)">💬 コメント ({{ post.comments.length }})</button>
            <button v-if="isAdmin" @click="deletePost(index)" class="delete-btn">🗑️ 削除</button>
          </div>

          <!-- コメント表示 -->
          <div v-if="post.showComments" class="comments">
            <div v-for="(comment, cIndex) in post.comments" :key="cIndex" class="comment">
              <strong>{{ comment.name }}</strong>: {{ comment.text }}
            </div>
            <form @submit.prevent="addComment(index)">
              <input v-model="post.newComment" placeholder="コメントを入力" />
              <button type="submit">送信</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { logoutAndRedirect } from '@/utils/auth'
export default {
  name: "ExchangeArea",
  data() {
    return {
      newPost: { name: "", message: "", tag: "", image: null },
      posts: [],
      searchQuery: "",
      filterTag: "",
      isAdmin: true,
      permissionsLevel: localStorage.getItem("permissionsLevel") || ''
    };
  },
  computed: {
    filteredPosts() {
      return this.posts.filter(post => {
        const matchesTag = this.filterTag ? post.tag === this.filterTag : true;
        const matchesQuery =
          post.message.includes(this.searchQuery) ||
          post.name.includes(this.searchQuery);
        return matchesTag && matchesQuery;
      });
    }
  },
  methods: {
    addPost() {
      const now = new Date();
      this.posts.unshift({
        name: this.newPost.name,
        message: this.newPost.message,
        tag: this.newPost.tag,
        image: this.newPost.image,
        date: now.toLocaleString(),
        likes: 0,
        comments: [],
        newComment: "",
        showComments: false
      });
      this.newPost = { name: "", message: "", tag: "", image: null };
    },
    likePost(index) {
      this.posts[index].likes++;
    },
    toggleComments(index) {
      this.posts[index].showComments = !this.posts[index].showComments;
    },
    addComment(index) {
      if (this.posts[index].newComment.trim() !== "") {
        this.posts[index].comments.push({ name: "匿名", text: this.posts[index].newComment });
        this.posts[index].newComment = "";
      }
    },
    deletePost(index) {
      this.posts.splice(index, 1);
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) this.newPost.image = URL.createObjectURL(file);
    },
    /*logout() {
      // デバッグ用ログ
      console.log("✅ logout() が呼ばれました");

      // メッセージ表示
      alert("ログアウトしました");

      // 保存している認証情報を削除（必要に応じて調整）
      localStorage.clear();
      sessionStorage.removeItem("token");

      // ログイン画面へ遷移
      this.$router.push("/login");
    }*/
    logout() { logoutAndRedirect(this.$router) }
  }
};
</script>

<style scoped>
/* --- 共通ナビ --- */
.main-nav {
  width: 100%;
  background-color: #1a4f9c;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}
.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}
.main-nav li {
  margin: 0;
}
.main-nav a {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 22px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}
.main-nav a:hover { background-color: #143a6e; }

/* ログアウトだけ右端に寄せる＋色を赤に */
.main-nav .logout { margin-left: auto; }
.main-nav .logout a { background: #d9534f; }
.main-nav .logout a:hover { background: #b52b27; }

/* --- コンテナ --- */
body { background: linear-gradient(135deg,#f2f9ff 0%,#e0efff 100%); }
.container {
  max-width: 900px;
  margin: 100px auto 40px;
  padding: 20px;
  background: #ffffffcc;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
h1 { text-align: center; color: #1a4f9c; }
.description { text-align: center; color: #555; margin-bottom: 20px; }

/* --- 投稿フォーム --- */
.post-form form { display: flex; flex-direction: column; gap: 12px; }
.post-form input, .post-form textarea, .post-form select {
  padding: 10px; border: 1.8px solid #9ab8f8; border-radius: 10px; background: #f8fbff;
}
.post-form button {
  padding: 12px; background: #1a4f9c; color: #fff; border: none; border-radius: 10px;
  font-weight: bold; cursor: pointer;
}
.post-form button:hover { background: #143a6e; }
.form-row { display: flex; gap: 10px; flex-wrap: wrap; }

/* --- 検索 --- */
.search-form { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
.search-form input, .search-form select {
  padding: 8px; border: 1.5px solid #9ab8f8; border-radius: 8px;
}

/* --- 投稿カード --- */
.post-card {
  background: #f2f6ff;
  border: 1px solid #d0e0ff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 16px;
}
.post-header { display: flex; justify-content: space-between; align-items: center; }
.post-message { margin: 8px 0; color: #333; }
.post-image { max-width: 100%; margin-top: 10px; border-radius: 8px; }
.post-date { display: block; margin-top: 5px; font-size: 12px; color: #777; }
.tag {
  background: #e0ecff; color: #1a4f9c; font-size: 12px; padding: 2px 8px; border-radius: 6px;
}

/* --- アクションボタン --- */
.actions { margin-top: 8px; }
.actions button {
  margin-right: 8px; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer;
}
.actions button:hover { opacity: 0.8; }
.delete-btn { background: #f55; color: white; }

/* --- コメント --- */
.comments {
  margin-top: 12px; background: #f9faff; padding: 10px; border-radius: 8px;
}
.comment { font-size: 14px; margin-bottom: 6px; }
.comments input {
  width: 100%; padding: 8px; border: 1.5px solid #9ab8f8; border-radius: 8px;
}
.comments button {
  margin-top: 6px; padding: 6px 12px; background: #1a4f9c; color: #fff; border: none; border-radius: 6px;
}
</style>
