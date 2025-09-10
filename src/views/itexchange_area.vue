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

    <!-- 技術交流モジュール -->
    <div class="container">
      <h1>💡 技術交流モジュール</h1>
      <p class="description">
        学習・技術コミュニケーション・研修の3エリアで知識を共有・交流できます。
      </p>

      <!-- タブ切り替え -->
      <div class="tabs">
        <button :class="{ active: activeTab==='learning' }" @click="activeTab='learning'">📘 学習エリア</button>
        <button :class="{ active: activeTab==='qa' }" @click="activeTab='qa'">💬 技術Q&A</button>
        <button :class="{ active: activeTab==='training' }" @click="activeTab='training'">🎓 研修エリア</button>
      </div>

      <!-- 学習エリア -->
      <section v-if="activeTab==='learning'" class="card">
        <h2>📘 学習成果・資料共有</h2>
        <form @submit.prevent="addLearning" class="form-box">
          <input v-model="newLearning.title" placeholder="資料タイトル" required />
          <input v-model="newLearning.link" placeholder="URLまたは説明" required />
          <button type="submit">追加</button>
        </form>
        <div v-if="learningList.length===0" class="no-data">📂 まだ資料がありません</div>
        <ul class="list">
          <li v-for="(item, idx) in learningList" :key="idx" class="list-card">
            <a :href="item.link" target="_blank">{{ item.title }}</a>
          </li>
        </ul>
      </section>

      <!-- 技術Q&A -->
      <section v-if="activeTab==='qa'" class="card">
        <h2>💬 技術の質問・回答</h2>
        <form @submit.prevent="addQuestion" class="form-box">
          <input v-model="newQuestion.title" placeholder="質問内容" required />
          <button type="submit">質問する</button>
        </form>
        <div v-if="questions.length===0" class="no-data">❓ まだ質問がありません</div>
        <div v-for="(q, idx) in questions" :key="idx" class="qa-card">
          <p class="question"><strong>Q:</strong> {{ q.title }}</p>
          <ul>
            <li v-for="(a, aidx) in q.answers" :key="aidx" class="answer">💡 {{ a }}</li>
          </ul>
          <form @submit.prevent="addAnswer(idx)" class="answer-form">
            <input v-model="q.newAnswer" placeholder="回答を入力" />
            <button type="submit">回答</button>
          </form>
        </div>
      </section>

      <!-- 研修エリア -->
      <section v-if="activeTab==='training'" class="card">
        <h2>🎓 社内研修</h2>
        <form @submit.prevent="addTraining" class="form-box">
          <input v-model="newTraining.title" placeholder="研修タイトル" required />
          <input v-model="newTraining.date" placeholder="日付 (例: 2025-08-30)" required />
          <button type="submit">登録</button>
        </form>
        <div v-if="trainingList.length===0" class="no-data">📅 研修情報がまだ登録されていません</div>
        <ul class="list">
          <li v-for="(t, idx) in trainingList" :key="idx" class="list-card">
            <span class="date">{{ t.date }}</span> - <span class="title">{{ t.title }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "TechExchange",
  data() {
    return {
      activeTab: "learning",
      // 学習エリア
      learningList: [],
      newLearning: { title: "", link: "" },
      // Q&A
      questions: [],
      newQuestion: { title: "" },
      // 研修
      trainingList: [],
      newTraining: { title: "", date: "" },
      permissionsLevel: localStorage.getItem("permissionsLevel") || ''
    };
  },
  methods: {
    addLearning() {
      this.learningList.unshift({ ...this.newLearning });
      this.newLearning = { title: "", link: "" };
    },
    addQuestion() {
      this.questions.unshift({ title: this.newQuestion.title, answers: [], newAnswer: "" });
      this.newQuestion.title = "";
    },
    addAnswer(index) {
      if (this.questions[index].newAnswer.trim()) {
        this.questions[index].answers.push(this.questions[index].newAnswer);
        this.questions[index].newAnswer = "";
      }
    },
    addTraining() {
      this.trainingList.unshift({ ...this.newTraining });
      this.newTraining = { title: "", date: "" };
    },
       logout() {
      // デバッグ用ログ
      console.log("✅ logout() が呼ばれました");

      // メッセージ表示
      alert("ログアウトしました");

      // 保存している認証情報を削除（必要に応じて調整）
      localStorage.clear();
      sessionStorage.removeItem("token");

      // ログイン画面へ遷移
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
/* 共通ナビ */
.main-nav {
  width: 100%; background: #1a4f9c; position: fixed; top: 0; left: 0; z-index: 999;
}
.main-nav ul { display: flex; list-style: none; margin: 0; padding: 0; }
.main-nav a {
  display: flex; align-items: center; justify-content: center;
  height: 48px; padding: 0 22px; color: #fff; text-decoration: none; font-weight: 600;
}
.main-nav a:hover { background: #143a6e; }
.logout { margin-left: auto; }
.logout a { background: #d9534f; }
.logout a:hover { background: #b52b27; }

/* 背景・コンテナ */
body { background: linear-gradient(135deg,#f2f9ff 0%,#e0efff 100%); }
.container {
  max-width: 950px; margin: 100px auto 40px; padding: 20px;
  background: #ffffffcc; border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
}
h1 { text-align: center; color: #1a4f9c; margin-bottom: 8px; }
.description { text-align: center; margin-bottom: 24px; color: #555; }

/* タブ */
.tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
.tabs button {
  padding: 10px 18px; border-radius: 20px; border: 2px solid #1a4f9c;
  cursor: pointer; background: #fff; font-weight: bold; color: #1a4f9c;
  transition: all 0.2s;
}
.tabs button.active { background: #1a4f9c; color: #fff; box-shadow: 0 3px 8px rgba(0,0,0,0.2); }

/* カード */
.card {
  background: #f9fbff;
  border: 1.8px solid #c7dbff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.card h2 {
  border-left: 5px solid #1a4f9c;
  padding-left: 10px;
  margin-bottom: 16px;
  color: #143a6e;
}

/* フォーム */
.form-box { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.form-box input {
  padding: 10px; border: 1.5px solid #9ab8f8; border-radius: 8px; flex: 1;
}
.form-box button {
  background: #1a4f9c; color: #fff; border: none;
  border-radius: 8px; padding: 10px 16px; cursor: pointer;
}
.form-box button:hover { background: #143a6e; }

/* リスト */
.list { list-style: none; padding: 0; margin: 0; }
.list-card {
  background: #f2f6ff; border: 1px solid #d0e0ff; padding: 10px 12px;
  border-radius: 8px; margin-bottom: 8px;
}
.list-card a { color: #1a4f9c; font-weight: bold; text-decoration: none; }
.list-card a:hover { text-decoration: underline; }

/* Q&A */
.qa-card {
  background: #eef4ff; padding: 12px; margin-bottom: 12px;
  border-radius: 10px; border: 1.5px solid #c7dbff;
}
.question { font-weight: bold; margin-bottom: 6px; }
.answer { margin-left: 12px; color: #333; }
.answer-form { display: flex; gap: 10px; margin-top: 8px; }
.answer-form input {
  flex: 1; padding: 8px; border: 1.5px solid #9ab8f8; border-radius: 8px;
}
.answer-form button {
  background: #1a4f9c; color: #fff; border: none;
  border-radius: 8px; padding: 6px 12px; cursor: pointer;
}
.answer-form button:hover { background: #143a6e; }

/* 共通 */
.no-data {
  text-align: center;
  padding: 12px;
  color: #777;
  font-style: italic;
}
.date { font-weight: bold; color: #1a4f9c; }
.title { color: #333; }
</style>
