<template>
  <div class="page-root">
    <nav class="main-nav">
      <ul>
        <li><router-link to="/top">ホーム</router-link></li>
        <li><router-link to="/employee_infoshow">基本情報</router-link></li>
        <li v-if="permissionsLevel=='2'"><router-link to="/employee_skillmap">スキル分析</router-link></li>
        <li v-if="permissionsLevel=='2'"><router-link to="/employee_search">人材管理</router-link></li> 
        <li><router-link to="/itexchange_area">技談広場</router-link></li>
        <li><router-link to="/exchange_area">縁談広場</router-link></li>
        <li class="logout"><a href="#" @click.prevent="logout">ログアウト</a></li>
      </ul>
    </nav>
    <!-- Main -->
    <div class="container">
      <main class="page">
        <section class="paper">
          <h1 class="title">交流エリア</h1>
          <p class="subtitle">社員同士で自由に情報交換・意見共有できるコミュニティです。</p>
          <!-- New Post -->
          <h2 class="section-h2">新しい投稿</h2>
          <!-- Message -->
          <textarea class="input textarea" rows="3" placeholder="メッセージを入力してください" v-model="newPost.message"
            maxlength="255"></textarea>
          <!-- Upload Row -->
          <div class="row gap">
            <label class="file">
              <input type="file" accept="image/*" @change="onFileChange" />
              <span>ファイルの選択</span>
            </label>
            <span class="file-name">{{ fileName || 'ファイルが選択されていません' }}</span>
          </div>
          <div v-if="previewUrl" class="row">
            <img :src="previewUrl" alt="preview" class="post-img" />
          </div>
          <!-- Full width Submit Button (on its own line) -->
          <div class="row">
            <button class="btn primary full" @click="submitPost" :disabled="submitting">
              {{ submitting ? '投稿中...' : '投稿' }}
            </button>
          </div>
          <!-- Search Row (button on right, same line) -->
          <div class="row search-row">
            <input class="input" type="text" placeholder="キーワードで検索" v-model="keyword" @keyup.enter="search" />
            <button class="btn primary" @click="search">検索</button>
            <button class="btn" v-if="filterKeyword" @click="keyword = ''; filterKeyword = ''">クリア</button>
          </div>
          <!-- List -->
          <div class="card list">
            <h2>投稿一覧</h2>
            <div v-if="loading" class="empty">読み込み中...</div>
            <div v-else-if="filteredPosts.length === 0" class="empty">投稿が見つかりません。</div>
            <!-- 帖子列表：含评论功能 -->
            <article v-for="p in filteredPosts" :key="p.id" class="post" v-else>
              <div class="post-text">{{ p.content }}</div>
              <!-- 图片展示 -->
              <div v-if="Array.isArray(p.imageUrls) && p.imageUrls.length" class="images">
                <img v-for="img in p.imageUrls" :key="img" class="post-img" :src="img" />
              </div>
              <!-- 操作区：点赞+删除+评论按钮 -->
              <div class="post-actions">
                <button class="btn like-btn" @click="like(p.id)">❤ {{ p.likes || 0 }}</button>
                <button class="btn delete-btn" @click="deletePost(p.id)">削除</button>
                <button class="btn comment-btn" @click="p.showComments = !p.showComments">
                  💬 {{ p.commentCount || 0 }} コメント
                </button>
              </div>

              <!-- 评论输入框（展开时显示） -->
              <div v-if="p.showComments" class="comment-input-area">
                <textarea 
                  class="input comment-textarea" 
                  rows="2" 
                  placeholder="コメントを入力してください" 
                  v-model="commentContent[p.id]"
                  maxlength="512"></textarea>
                <button 
                  class="btn primary comment-submit" 
                  @click="addPostComment(p.id)"
                  :disabled="!commentContent[p.id]?.trim()">
                  コメント投稿
                </button>
              </div>

              <!-- 评论列表（展开时显示） -->
              <div v-if="p.showComments && p.postComments?.length" class="comment-list">
                <div v-for="comment in p.postComments" :key="comment.id" class="comment-item">
                  <div class="comment-content">{{ comment.content }}</div>
                  <div class="comment-meta">
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                    <button 
                      class="btn comment-delete" 
                      @click="deletePostComment(comment.id)">
                      削除
                    </button>
                  </div>
                </div>
              </div>
              <!-- 无评论提示 -->
              <div v-if="p.showComments && !p.postComments?.length" class="empty comment-empty">
                コメントがありません。最初のコメントを投稿しましょう！
              </div>
            </article>
            <!-- Pagination -->
            <div class="pager" v-if="totalPages > 0">
              <button class="btn" :disabled="page <= 0" @click="prev">前へ</button>
              <span class="page-indicator">{{ page + 1 }} / {{ totalPages }}</span>
              <button class="btn" :disabled="page + 1 >= totalPages" @click="next">次へ</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "ExchangeAreaMerged",
  data() {
    return {
      newPost: { message: "" },
      file: null,
      previewUrl: null,
      posts: [],
      keyword: "",
      filterKeyword: "",
      page: 0,
      pageSize: 3,
      totalElements: 0,
      loading: false,
      submitting: false,
      fileName: "",
      permissionsLevel: localStorage.getItem("permissionsLevel") || '',
      // 存储每个帖子的评论输入内容（key: 帖子ID，value: 评论内容）
      commentContent: {},
    };
  },
  computed: {
    totalPages() {
      const size = Math.max(1, Number(this.pageSize) || 3);
      const total = Math.max(0, Number(this.totalElements) || 0);
      return total > 0 ? Math.ceil(total / size) : 0;
    },
    filteredPosts() {
      const kw = (this.filterKeyword || "").toLowerCase();
      if (!kw) return this.posts;
      return this.posts.filter(p =>
        p?.content && String(p.content).toLowerCase().includes(kw)
      );
    },
  },
  mounted() {
    // 1019test
    console.log("exchange_area 界面已挂载，准备加载帖子"); // 新增日志
    // 1019test
    this.fetchList();
  },
  methods: {
    // 获取帖子列表
    async fetchList() {
      // 1019test
      console.log("开始调用 fetchList，当前页码：", this.page); // 新增日志
      // 1019test
      try {
        this.loading = true;
        // 1019test
        console.log("准备发起接口请求：/api/exchange/posts"); // 新增日志
        // 1019test
        const res = await axios.get("/api/exchange/posts", {
          params: {
            page: Math.max(0, Number(this.page) || 0),
            pageSize: Math.max(1, Number(this.pageSize) || 10),
          },
        });
        // 1019test
        console.log("接口请求成功，返回数据：", res.data); // 新增日志
        const data = res && res.data ? res.data : {};
        // 给每个帖子初始化“评论展开状态”
        const postsWithCommentStatus = (Array.isArray(data.content) ? data.content : []).map(post => ({
          ...post,
          showComments: false // 默认不展开评论
        }));
        this.posts = postsWithCommentStatus;
        this.totalElements = Number.isFinite(data.totalElements) ? data.totalElements : 0;
      } catch (e) {
        console.error("fetchList error", e);
        this.posts = [];
        this.totalElements = 0;
      } finally {
        this.loading = false;
      }
    },
    // 发表帖子
    async submitPost() {
      if (!this.newPost.message && !this.file) return;
      try {
        this.submitting = true;
        let imageUrls = [];
        if (this.file) {
          const fd = new FormData();
          fd.append("files", this.file);
          const uploadRes = await axios.post("/api/exchange/upload/images", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const resp = (uploadRes && uploadRes.data) ? uploadRes.data : {};
          imageUrls = Array.isArray(resp.urls) ? resp.urls : [];
        }
        await axios.post("/api/exchange/posts", {
          content: this.newPost.message,
          imageUrls,
        });
        // 重置UI
        this.newPost.message = "";
        this.file = null;
        this.previewUrl = null;
        this.fileName = "";
        // 刷新列表（回到第一页）
        this.page = 0;
        await this.fetchList();
      } catch (e) {
        console.error("submitPost error", e);
        alert("投稿に失敗しました");
      } finally {
        this.submitting = false;
      }
    },
    // 选择图片预览
    onFileChange(e) {
      const f = e.target.files && e.target.files[0];
      this.file = f || null;
      this.fileName = f ? f.name : "";
      // 生成预览链接（避免内存泄漏，可在组件销毁时释放）
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
      this.previewUrl = f ? URL.createObjectURL(f) : null;
    },
    // 点赞
    async like(id) {
      try {
        await axios.post(`/api/exchange/posts/${id}/like`);
        await this.fetchList();
      } catch (e) {
        console.error("like error", e);
        alert("いいねに失敗しました");
      }
    },
    // 删除帖子
    async deletePost(postId) {
      if (!confirm("この投稿を削除しますか？削除後は元に戻せません。")) {
        return;
      }
      try {
        await axios.delete(`/api/exchange/posts/${postId}`);
        await this.fetchList();
      } catch (e) {
        console.error("deletePost error", e);
        alert("削除に失敗しました");
      }
    },
    // 发表评论
    async addPostComment(postId) {
      const content = this.commentContent[postId]?.trim();
      if (!content) return;
      try {
        await axios.post(`/api/exchange/posts/${postId}/post-comments`, { content });
        // 清空当前帖子的评论输入框
        this.commentContent[postId] = "";
        // 刷新列表显示新评论
        await this.fetchList();
      } catch (e) {
        console.error("addPostComment error", e);
        alert(e.response?.data?.msg || "コメント投稿に失敗しました");
      }
    },
    // 删除评论
    async deletePostComment(commentId) {
      if (!confirm("このコメントを削除しますか？")) {
        return;
      }
      try {
        await axios.delete(`/api/exchange/post-comments/${commentId}`);
        await this.fetchList();
      } catch (e) {
        console.error("deletePostComment error", e);
        alert(e.response?.data?.msg || "コメント削除に失敗しました");
      }
    },
    // 格式化时间（如：2025-10-17 16:45）
    formatTime(timeStr) {
      if (!timeStr) return "";
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    // 上一页
    async prev() {
      const p = Math.max(0, Number(this.page) || 0);
      if (p > 0) {
        this.page = p - 1;
        await this.fetchList();
      }
    },
    // 下一页
    async next() {
      const p = Math.max(0, Number(this.page) || 0);
      const tp = Math.max(1, Number(this.totalPages) || 1);
      if (p + 1 < tp) {
        this.page = p + 1;
        await this.fetchList();
      }
    },
    // 搜索
    async search() {
      this.filterKeyword = (this.keyword || "").trim().toLowerCase();
      // 搜索时回到第一页
      this.page = 0;
      await this.fetchList();
    },
    // 退出登录
    logout() {
      localStorage.removeItem("permissionsLevel");
      this.$router.push("/login");
    },
    // 组件销毁时释放预览链接（避免内存泄漏）
    beforeUnmount() {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
    }
  },
};
</script>

<style scoped>
/* --- 基础样式 --- */
.container {
  max-width: 900px;
  margin: 100px auto 40px;
  padding: 20px;
  background: #ffffffcc;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
:root {
  --page-max: 980px;
}
.page-root {
  min-height: 100vh;
  background: #f6f8fb;
}

/* --- 导航栏样式 --- */
.main-nav {
  width: 100%;
  background-color: #1a4f9c;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.main-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.main-nav li {
  margin: 0;
}
.main-nav a,
.main-nav a.router-link-active {
  display: block;
  padding: 16px 24px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.3s ease;
  height: 20px;
}
.main-nav a:hover {
  background-color: #143a6e;
}
.main-nav .logout {
  margin-left: auto;
}
.main-nav .logout a {
  background-color: #d9534f;
}
.main-nav .logout a:hover {
  background-color: #b52b27;
}

/* --- 主体内容样式 --- */
.page {
  display: flex;
  justify-content: center;
}
.paper {
  width: 100%;
  max-width: var(--page-max);
  background: #fff;
  margin: 24px 16px;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.04);
}
.title {
  text-align: center;
  color: #154a8a;
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 800;
}
.subtitle {
  text-align: center;
  color: #667085;
  margin: 0 0 24px;
}
.section-h2 {
  margin: 12px 0 12px;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

/* --- 输入框样式 --- */
.input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.textarea {
  resize: vertical;
  min-height: 84px;
  background: #f8fbff;
  margin-bottom: 12px;
}

/* --- 行容器样式 --- */
.row {
  display: flex;
  align-items: center;
}
.row.gap {
  gap: 12px;
  margin-bottom: 12px;
}
.full {
  width: 100%;
  margin: 4px 0 16px;
}

/* --- 文件上传样式 --- */
.file {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  background: #fff;
}
.file input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.file-name {
  color: #64748b;
  font-size: 14px;
}

/* --- 搜索行样式 --- */
.search-row {
  gap: 12px;
  margin: 8px 0 16px;
}
.search-row .input {
  flex: 1;
}
.search-row .btn {
  white-space: nowrap;
}

/* --- 按钮样式 --- */
.btn {
  border: 1px solid transparent;
  background: #eff4ff;
  color: #154a8a;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.btn.primary {
  background: #174ea6;
  color: #fff;
}
.btn.primary:disabled,
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- 帖子列表样式 --- */
.card.list {
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  background: #fff;
}
.empty {
  color: #64748b;
  font-size: 14px;
  padding: 12px 0;
}
.post {
  padding: 10px 0 16px;
  border-bottom: 1px dashed #e2e8f0;
}
.post:last-child {
  border-bottom: none;
}
.post-text {
  margin-bottom: 8px;
}
.post-img {
  max-width: 100%;
  border-radius: 8px;
  margin: 6px 0;
}
.images {
  margin: 8px 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

/* --- 帖子操作区样式（点赞+删除+评论） --- */
.post-actions {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.like-btn {
  background: #0f4c81;
  color: #fff;
}
.delete-btn {
  background-color: #d9534f;
  color: #fff;
}
.delete-btn:hover {
  background-color: #b52b27;
}
.comment-btn {
  background: #eff6ff;
  color: #2563eb;
}

/* --- 评论相关样式 --- */
.comment-input-area {
  margin-top: 12px;
  margin-bottom: 8px;
}
.comment-textarea {
  min-height: 60px;
  margin-bottom: 8px;
  background: #f8fbff;
}
.comment-submit {
  padding: 6px 16px;
  font-size: 13px;
}
.comment-list {
  margin-top: 8px;
  padding-left: 8px;
  border-left: 2px solid #e2e8f0;
}
.comment-item {
  padding: 8px 0;
  border-bottom: 1px dashed #f0f2f5;
}
.comment-content {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}
.comment-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}
.comment-delete {
  padding: 2px 8px;
  font-size: 12px;
  background: #fef2f2;
  color: #d9534f;
}
.comment-empty {
  margin-top: 8px;
  padding-left: 8px;
  font-size: 13px;
}

/* --- 分页样式 --- */
.pager {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding-top: 12px;
}
.page-indicator {
  color: #0f172a;
}
</style>