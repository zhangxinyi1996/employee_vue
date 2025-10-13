<template>
  <div>
    <!-- 共通ナビメニュー -->
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

    <!-- 技術交流モジュール -->
    <div class="container">
      <header class="page-header">
        <h1>💡 技術交流モジュール</h1>
        <p class="description">
          学習・技術コミュニケーション・研修の3エリアで知識を共有・交流できます。
        </p>
      </header>

      <!-- タブ切り替え -->
      <nav class="tabs" role="tablist">
        <button 
          :class="{ active: activeTab === 'learning' }" 
          @click="switchTab('learning')"
          role="tab"
          :aria-selected="activeTab === 'learning'"
        >
          📘 学習エリア
        </button>
        <button 
          :class="{ active: activeTab === 'qa' }" 
          @click="switchTab('qa')"
          role="tab"
          :aria-selected="activeTab === 'qa'"
        >
          💬 技術Q&A
        </button>
        <button 
          :class="{ active: activeTab === 'training' }" 
          @click="switchTab('training')"
          role="tab"
          :aria-selected="activeTab === 'training'"
        >
          🎓 研修エリア
        </button>
      </nav>

      <!-- 学習エリア -->
      <section v-if="activeTab === 'learning'" class="card" role="tabpanel">
        <h2>📘 学習成果・資料共有</h2>
        
        <!-- フォーム -->
        <form @submit.prevent="addLearning" class="form-box" novalidate>
          <div class="input-group">
            <input 
              v-model.trim="newLearning.title" 
              placeholder="資料タイトル" 
              required 
              maxlength="255"
              :class="{ error: errors.learningTitle }"
            />
            <span v-if="errors.learningTitle" class="error-message">{{ errors.learningTitle }}</span>
          </div>
          <div class="input-group">
            <input 
              v-model.trim="newLearning.link" 
              placeholder="URLまたは説明" 
              required
              :class="{ error: errors.learningLink }"
            />
            <span v-if="errors.learningLink" class="error-message">{{ errors.learningLink }}</span>
          </div>
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? '追加中...' : '追加' }}
          </button>
        </form>

        <!-- データ表示 -->
        <div v-if="learningList.length === 0" class="no-data">
          📂 まだ資料がありません
        </div>
        <ul v-else class="list" role="list">
          <li v-for="item in learningList" :key="item.id" class="list-card">
            <div class="card-content">
              <h3 class="card-title">{{ item.title }}</h3>
              <div class="card-meta">
                <span class="creator">作成者: {{ item.creatorName }}</span>
                <span class="date">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="card-actions">
                <a 
                  v-if="isValidUrl(item.link)" 
                  :href="item.link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="link-btn"
                >
                  🔗 リンクを開く
                </a>
                <span v-else class="description">{{ item.link }}</span>
              </div>
            </div>

          </li>
          
          <!-- -- 分页按钮 -->
            <div class="pagination">
              <button @click="prevPage" :disabled="currentPage === 1">前へ</button>
              <span>{{ currentPage }} / {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages">次へ</button>
            </div>
        </ul>
      </section>

      <!-- 技術Q&A -->
      <section v-if="activeTab === 'qa'" class="card" role="tabpanel">
        <h2>💬 技術の質問・回答</h2>
        
        <!-- 質問フォーム -->
        <form @submit.prevent="addQuestion" class="form-box" novalidate>
          <div class="input-group">
            <textarea 
              v-model.trim="newQuestion.content" 
              placeholder="質問内容を詳しく入力してください" 
              required
              rows="3"
              maxlength="1000"
              :class="{ error: errors.questionTitle }"
            ></textarea>
            <span v-if="errors.questionTitle" class="error-message">{{ errors.questionTitle }}</span>
            <small class="char-count">{{ newQuestion.content.length }}/1000</small>
          </div>
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? '投稿中...' : '質問する' }}
          </button>
        </form>

        <!-- Q&A一覧 -->
        <div v-if="questions.length === 0" class="no-data">
          ❓ まだ質問がありません
        </div>
        <div v-for="question in questions" :key="question.id" class="qa-card">
          <div class="question-header">
            <h3 class="question-title">{{ question.content }}</h3>
            <div class="question-meta">
              <span class="questioner">{{ question.creatorName }}</span>
              <span class="date">{{ formatDate(question.createdAt) }}</span>
              <span :class="['status', question.isResolved ? 'resolved' : 'pending']">
                {{ question.isResolved ? '✅ 解決済み' : '❓ 回答募集中' }}
              </span>
            </div>
          </div>

          <!-- 回答一覧 -->
          <div v-if="question.answers.length > 0" class="answers-section">
            <h4 class="answers-title">💡 回答 ({{ question.answers.length }}件)</h4>
            <ul class="answers-list">
              <li v-for="answer in question.answers" :key="answer.id" class="answer-item">
                <div class="answer-content">{{ answer.content }}</div>
                <div class="answer-meta">
                  <span class="answerer">{{ answer.creatorName }}</span>
                  <span class="date">{{ formatDate(answer.createdAt) }}</span>
                  <button @click="likeAnswer(answer.id)" class="like-btn">
                    👍 {{ answer.likeCount || 0 }}
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <!-- 回答フォーム -->
          <form @submit.prevent="addAnswer(question.id)" class="answer-form">
            <div class="input-group">
              <textarea 
                v-model.trim="question.newAnswer" 
                placeholder="回答を入力してください" 
                rows="2"
                maxlength="500"
              ></textarea>
              <small class="char-count">{{ (question.newAnswer || '').length }}/500</small>
            </div>
            <button type="submit" :disabled="!question.newAnswer?.trim()">
              回答する
            </button>
          </form>
        </div> 
          <!-- -- 分页按钮 -->
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">前へ</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">次へ</button>
          </div>
      </section>

      <!-- 研修エリア -->
      <section v-if="activeTab === 'training'" class="card" role="tabpanel">
        <h2>🎓 社内研修</h2>
        
        <!-- 研修登録フォーム -->
        <form @submit.prevent="addTraining" class="form-box training-form" novalidate>
          <div class="form-row">
            <div class="input-group">
              <input 
                v-model.trim="newTraining.title" 
                placeholder="研修タイトル" 
                required 
                maxlength="255"
                :class="{ error: errors.trainingTitle }"
              />
              <span v-if="errors.trainingTitle" class="error-message">{{ errors.trainingTitle }}</span>
            </div>
            <div class="input-group">
              <input 
                v-model="newTraining.trainingDate" 
                type="date" 
                required 
                :min="today"
                :class="{ error: errors.trainingDate }"
              />
              <span v-if="errors.trainingDate" class="error-message">{{ errors.trainingDate }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="input-group">
              <input 
                v-model.trim="newTraining.instructor" 
                placeholder="講師名（任意）" 
                maxlength="100"
              />
            </div>
            <div class="input-group">
              <input 
                v-model.trim="newTraining.location" 
                placeholder="場所（任意）" 
                maxlength="255"
              />
            </div>
          </div>
          <div class="input-group">
            <textarea 
              v-model.trim="newTraining.description" 
              placeholder="研修の詳細説明（任意）" 
              rows="3"
              maxlength="500"
            ></textarea>
          </div>
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? '登録中...' : '登録' }}
          </button>
        </form>

        <!-- 研修一覧 -->
        <div v-if="trainingList.length === 0" class="no-data">
          📅 研修情報がまだ登録されていません
        </div>
        <ul v-else class="list training-list" role="list">
          <li v-for="training in sortedTrainingList" :key="training.id" class="list-card training-card">
            <div class="training-header">
              <h3 class="training-title">{{ training.title }}</h3>
              <div class="training-date">{{ formatTrainingDate(training.trainingDate) }}</div>
            </div>
            <div v-if="training.description" class="training-description">
              {{ training.description }}
            </div>
            <div class="training-details">
              <div v-if="training.instructor" class="detail-item">
                👨‍🏫 講師: {{ training.instructor }}
              </div>
              <div v-if="training.location" class="detail-item">
                📍 場所: {{ training.location }}
              </div>
              <div class="detail-item">
                👤 作成者: {{ training.creatorName }}
              </div>
            </div>
            <div class="training-actions">
              <span :class="['status', getTrainingStatusClass(training.trainingDate)]">
                {{ getTrainingStatus(training.trainingDate) }}
              </span>
            </div>
          </li>
        </ul>
        
          <!-- -- 分页按钮 -->
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">前へ</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">次へ</button>
          </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import request from '../utils/request'
import { logoutAndRedirect } from '@/utils/auth'
import { useRouter } from 'vue-router'

export default {
  data() {
    return {
      permissionsLevel: localStorage.getItem("permissionsLevel") || '', // ここで初期値を定義
    }
  },
  name: "TechExchange",
  setup() {
    // Reactive data
    const activeTab = ref("learning")
    const isSubmitting = ref(false)
    const router = useRouter()
    // 学習エリア
    const learningList = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const newLearning = reactive({ title: "", link: "" })

    //ユーザー情報
    const employeeId = localStorage.getItem("employeeId") || ''
    const userName =localStorage.getItem("username") || ''

    // Q&A
    const questions = ref([])
    const newQuestion = reactive({ content: "" })
    
    // 研修
    const trainingList = ref([])
    const newTraining = reactive({ 
      title: "", 
      trainingDate: "", 
      instructor: "",
      location: "",
      description: ""
    })
    
    // エラー管理
    const errors = reactive({
      learningTitle: "",
      learningLink: "",
      questionTitle: "",
      trainingTitle: "",
      trainingDate: ""
    })

    // 切换 tab 的方法
    const switchTab = (tabName) => {
      activeTab.value = tabName;
      currentPage.value = 1
      fetchData();
    };

    // Computed properties
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })

    const sortedTrainingList = computed(() => {
      return [...trainingList.value].sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    // Pagination methods for learningList
    function nextPage() {
      if (currentPage.value * pageSize.value < total.value) {
        currentPage.value++
        fetchData()
      }
    }

    function prevPage() {
      if (currentPage.value > 1) {
        currentPage.value--
        fetchData()
      }
    }

    async function fetchData() {
      
      if (activeTab.value === 'learning') {
        
        try {
          const res = await request.get("/learning/show",{
            params: { page: currentPage.value, size: pageSize.value }
          })
          learningList.value = res.records  // 当前页数据
          currentPage.value = res.page      // 当前页数
          total.value = res.total          // 总条数
          totalPages.value = Math.ceil(total.value / pageSize.value) // 总页数
        } catch (error) {
          console.error("请求learning信息失败:", error);
        }

      }else if (activeTab.value === 'training') {
        try {
          const res = await request.get("/training/show",{
            params: { page: currentPage.value, size: pageSize.value }
          })
          trainingList.value = res.records
          currentPage.value = res.page      // 当前页数
          total.value = res.total          // 总条数
          totalPages.value = Math.ceil(total.value / pageSize.value) // 总页数
        } catch (error) {
          console.error("请求training信息失败:", error);
        }
      }else{          
        try {
          const resQa = await request.get("/skillQA/show",{
            params: { page: currentPage.value, size: pageSize.value }
          })
          questions.value = resQa.records  // 当前页数据
          currentPage.value = resQa.page      // 当前页数
          total.value = resQa.total          // 总条数
          totalPages.value = Math.ceil(total.value / pageSize.value) // 总页数
        } catch (error) {
          console.error("请求skill QA失败:", error);
        }
      }
    }

    // Methods
    const clearErrors = () => {
      Object.keys(errors).forEach(key => errors[key] = "")
    }

    const validateLearning = () => {
      clearErrors()
      let isValid = true
      
      if (!newLearning.title.trim()) {
        errors.learningTitle = "タイトルを入力してください"
        isValid = false
      }
      
      if (!newLearning.link.trim()) {
        errors.learningLink = "URLまたは説明を入力してください"
        isValid = false
      }
      
      return isValid
    }

    const validateQuestion = () => {
      clearErrors()
      if (!newQuestion.content.trim()) {
        errors.questionTitle = "質問内容を入力してください"
        return false
      }
      return true
    }

    const validateTraining = () => {
      clearErrors()
      let isValid = true
      
      if (!newTraining.title.trim()) {
        errors.trainingTitle = "研修タイトルを入力してください"
        isValid = false
      }
      
      if (!newTraining.trainingDate) {
        errors.trainingDate = "研修日付を選択してください"
        isValid = false
      } else if (new Date(newTraining.trainingDate) < new Date()) {
        errors.trainingDate = "未来の日付を選択してください"
        isValid = false
      }
      
      return isValid
    }

    const addLearning = async () => {
      if (!validateLearning()) return
      
      isSubmitting.value = true
      try {
        // TODO: API呼び出しをここに実装
        const newItem = {
          id: Date.now(),
          title: newLearning.title,
          link: newLearning.link,
          creatorId:employeeId, // TODO: 実際のユーザー情報
          creatorName:userName, // TODO: 実際のユーザー情報
          createdAt: new Date().toISOString().slice(0, 19)
        }
        
        learningList.value.unshift(newItem)
        if (learningList.value.length % pageSize.value === 1 && learningList.value.length > pageSize.value)  {
            learningList.value.pop(); // 保持总数不变
        }
        Object.assign(newLearning, { title: "", link: "" })

        const learnR = await request.post("/learning/add",newItem)
        newItem.id = learnR.id
        total.value += 1
        totalPages.value = Math.ceil(total.value / pageSize.value) // 总页数
        // 成功メッセージ表示
        //showMessage("学習資料を追加しました", "success")
      } catch (error) {
        //showMessage("追加に失敗しました", "error")
        console.error("学習資料の追加に失敗しました:", error)
      } finally {
        isSubmitting.value = false
      }
    }

    const addQuestion = async () => {
      if (!validateQuestion()) return
      
      isSubmitting.value = true
      try {
        // TODO: API呼び出しをここに実装
        const newQ = {
          id: Date.now(),
          content: newQuestion.content,
          answers: [],
          newAnswer: "",
          creatorId: employeeId, // TODO: 実際のユーザー情報
          creatorName: userName, // TODO: 実際のユーザー情報
          createdAt: new Date().toISOString().slice(0, 19),
          isResolved: 0
        }
        
        questions.value.unshift(newQ)

        if (questions.value.length % pageSize.value === 1 && questions.value.length > pageSize.value)  {
            questions.value.pop(); // 保持总数不变
        }

        newQuestion.content = ""
        if (questions.value.length > pageSize.value)  {
          questions.value.pop(); // 保持总数不变
        }

        const questionsRes = await request.post("/skillQA/add",newQ)
        newQ.id = questionsRes.id
        total.value += 1
        totalPages.value = Math.ceil(total.value / pageSize.value) // 总页数
        //showMessage("質問を投稿しました", "success")
      } catch (error) {
        //showMessage("投稿に失敗しました", "error")
        console.error("質問の追加に失敗しました:", error)
      } finally {
        isSubmitting.value = false
      }
    }

    const addAnswer = async (quId) => {
      const question = questions.value.find(q => q.id === quId)
      if (!question?.newAnswer?.trim()) return
      
      try {
        // TODO: API呼び出しをここに実装
        const newAnswer = {
          id: Date.now(),
          content: question.newAnswer,
          questionId: quId,
          creatorId: employeeId, // TODO: 実際のユーザー情報
          creatorName: userName, // TODO: 実際のユーザー情報
          createdAt: new Date().toISOString().slice(0, 19),
          likeCount: 0
        }
        
        question.answers.push(newAnswer)
        question.newAnswer = ""
        const quRes = await request.post("/skillQA/add",question)
        newAnswer.id = quRes.answers[0].id
        //showMessage("回答を投稿しました", "success")
      } catch (error) {
        //showMessage("回答の投稿に失敗しました", "error")
      }
    }

    const addTraining = async () => {
      if (!validateTraining()) return
      
      isSubmitting.value = true
      try {
        // TODO: API呼び出しをここに実装
        const newT = {
          id: Date.now(),
          title: newTraining.title,
          trainingDate: newTraining.trainingDate,
          instructor: newTraining.instructor,
          location: newTraining.location,
          description: newTraining.description,
          creatorId: employeeId, // TODO: 実際のユーザー情報
          creatorName: userName // TODO: 実際のユーザー情報
        }
        
        trainingList.value.unshift(newT)
        if (trainingList.value.length % pageSize.value === 1 && trainingList.value.length > pageSize.value)  {
          trainingList.value.pop(); // 保持总数不变
        }

        Object.assign(newTraining, { 
          title: "", 
          trainingDate: "", 
          instructor: "",
          location: "",
          description: ""
        })
        const trainingRes = await request.post("/training/add",newT)
        newT.id = trainingRes.id
        total.value += 1
        totalPages.value = Math.ceil(total.value / pageSize.value) // 总页数
        //showMessage("研修を登録しました", "success")
      } catch (error) {
        //showMessage("登録に失敗しました", "error")
      } finally {
        isSubmitting.value = false
      }
    }

    const likeAnswer = async (answerId) => {
      // TODO: API呼び出しをここに実装
      const answer = questions.value
        .flatMap(q => q.answers)
        .find(a => a.id === answerId)
      
      if (answer) {
        answer.likeCount = (answer.likeCount || 0) + 1
      }
    }

    // ユーティリティ関数
    const isValidUrl = (string) => {
      try {
        new URL(string)
        return true
      } catch (_) {
        return false
      }
    }

    const formatDate = (date) => {
      if (!date) return ""
      return new Date(date).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatTrainingDate = (dateStr) => {
      if (!dateStr) return ""
      return new Date(dateStr).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
    }

    const getTrainingStatus = (dateStr) => {
      const today = new Date()
      const trainingDate = new Date(dateStr)
      
      if (trainingDate < today) return "終了"
      if (trainingDate.toDateString() === today.toDateString()) return "本日開催"
      return "開催予定"
    }

    const getTrainingStatusClass = (dateStr) => {
      const today = new Date()
      const trainingDate = new Date(dateStr)
      
      if (trainingDate < today) return "ended"
      if (trainingDate.toDateString() === today.toDateString()) return "today"
      return "upcoming"
    }

    const showMessage = (message, type = "info") => {
      // TODO: トースト通知やメッセージコンポーネントを実装
      console.log(`${type}: ${message}`)
    }

    const logout = () => {
        logoutAndRedirect(router)
    }
      
    // ライフサイクル
    onMounted(() => {
      // TODO: 初期データの読み込み
      loadInitialData();
      fetchData();
    })

    const loadInitialData = async () => {
      try {
        // TODO: APIから各種データを取得
        // await Promise.all([
        //   loadLearningMaterials(),
        //   loadQuestions(),
        //   loadTrainingCourses()
        // ])
      } catch (error) {
        showMessage("データの読み込みに失敗しました", "error")
      }
    }

    return {
      // State
      activeTab,
      isSubmitting,
      learningList,
      newLearning,
      questions,
      newQuestion,
      trainingList,
      newTraining,
      errors,
      currentPage,
      totalPages,
      pageSize, 
      total,
      employeeId,
      
      // Computed
      today,
      sortedTrainingList,
      
      // Methods
      switchTab,
      fetchData,
      nextPage,
      prevPage,
      addLearning,
      addQuestion,
      addAnswer,
      addTraining,
      likeAnswer,
      isValidUrl,
      formatDate,
      formatTrainingDate,
      getTrainingStatus,
      getTrainingStatusClass,
      logout
    }
  }
}
</script>

<style scoped>
/* 既存のスタイルに追加・改善 */

/* 共通ナビ */
.main-nav {
  width: 100%; 
  background: #1a4f9c; 
  position: fixed; 
  top: 0; 
  left: 0; 
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.main-nav ul { 
  display: flex; 
  list-style: none; 
  margin: 0; 
  padding: 0; 
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
  transition: background-color 0.2s ease;
}
.main-nav a:hover, 
.main-nav a.active { 
  background: #143a6e; 
}
.logout { 
  margin-left: auto; 
}
.logout a { 
  background: #d9534f; 
}
.logout a:hover { 
  background: #b52b27; 
}

/* 基本レイアウト */
body { 
  background: linear-gradient(135deg, #f2f9ff 0%, #e0efff 100%); 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.container {
  max-width: 1000px; 
  margin: 80px auto 40px; 
  padding: 20px;
  background: rgba(255, 255, 255, 0.95); 
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 { 
  color: #1a4f9c; 
  margin-bottom: 12px; 
  font-size: 2.2rem;
}
.description { 
  margin-bottom: 24px; 
  color: #555; 
  font-size: 1.1rem;
}

/* タブナビゲーション */
.tabs { 
  display: flex; 
  justify-content: center; 
  gap: 12px; 
  margin-bottom: 24px; 
  flex-wrap: wrap;
}
.tabs button {
  padding: 12px 20px; 
  border-radius: 25px; 
  border: 2px solid #1a4f9c;
  cursor: pointer; 
  background: #fff; 
  font-weight: 600; 
  color: #1a4f9c;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}
.tabs button:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}
.tabs button.active { 
  background: #1a4f9c; 
  color: #fff; 
  box-shadow: 0 4px 12px rgba(26, 79, 156, 0.3); 
}

/* カードスタイル */
.card {
  background: #fafbff;
  border: 2px solid #e1ecff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.card h2 {
  border-left: 6px solid #1a4f9c;
  padding-left: 16px;
  margin-bottom: 20px;
  color: #143a6e;
  font-size: 1.4rem;
}

/* フォームスタイル改善 */
.form-box { 
  margin-bottom: 24px;
}
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.input-group {
  flex: 1;
  margin-bottom: 16px;
}
.input-group input,
.input-group textarea {
  width: 100%;
  padding: 12px 16px; 
  border: 2px solid #d1e3ff; 
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #1a4f9c;
  box-shadow: 0 0 0 3px rgba(26, 79, 156, 0.1);
}
.input-group input.error,
.input-group textarea.error {
  border-color: #dc3545;
}

/* エラーメッセージ */
.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 4px;
  display: block;
}

/* 文字数カウンター */
.char-count {
  color: #666;
  font-size: 0.8rem;
  text-align: right;
  display: block;
  margin-top: 4px;
}

/* ボタンスタイル改善 */
button[type="submit"] {
  background: linear-gradient(135deg, #1a4f9c, #2c5aa0);
  color: #fff; 
  border: none;
  border-radius: 10px; 
  padding: 12px 24px; 
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}
button[type="submit"]:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 79, 156, 0.3);
}
button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* リストスタイル改善 */
.list-card {
  background: #f8faff; 
  border: 1px solid #e1ecff; 
  padding: 16px; 
  border-radius: 12px; 
  margin-bottom: 12px;
  transition: box-shadow 0.2s ease;
}
.list-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-content h3.card-title {
  margin: 0 0 8px 0;
  color: #1a4f9c;
  font-size: 1.1rem;
}
.card-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #666;
}
.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1a4f9c; 
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}
.link-btn:hover {
  color: #143a6e;
  text-decoration: underline;
}

/* Q&Aスタイル改善 */
.qa-card {
  background: #f6f9ff; 
  padding: 20px; 
  margin-bottom: 16px;
  border-radius: 12px; 
  border: 2px solid #e1ecff;
}
.question-header {
  margin-bottom: 16px;
}
.question-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a4f9c;
  margin-bottom: 8px;
}
.question-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
  flex-wrap: wrap;
}
.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status.resolved {
  background: #d4edda;
  color: #155724;
}
.status.pending {
  background: #fff3cd;
  color: #856404;
}

.answers-section {
  margin: 16px 0;
}
.answers-title {
  font-size: 1rem;
  color: #1a4f9c;
  margin-bottom: 12px;
}
.answers-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.answer-item {
  background: #fff;
  border: 1px solid #e1ecff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}
.answer-content {
  margin-bottom: 8px;
  line-height: 1.5;
}
.answer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
}
.like-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 16px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s ease;
}
.like-btn:hover {
  background: #e9ecef;
}

/* 回答フォーム */
.answer-form { 
  display: flex; 
  gap: 12px; 
  margin-top: 12px; 
  align-items: flex-start;
}
.answer-form .input-group {
  flex: 1;
  margin-bottom: 0;
}
.answer-form button {
  flex-shrink: 0; /* 按钮不被压缩 */
  background: #28a745; 
  color: #fff; 
  border: none;
  border-radius: 8px; 
  padding: 8px 16px; 
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  height: fit-content;
}
.answer-form button:hover:not(:disabled) { 
  background: #218838; 
}

/* 研修スタイル改善 */
.training-form {
  background: #f8faff;
  border: 1px solid #e1ecff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.training-list .list-card {
  border-left: 4px solid #1a4f9c;
}

.training-card {
  position: relative;
}
.training-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.training-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a4f9c;
  margin: 0;
  flex: 1;
}
.training-date {
  background: #1a4f9c;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}
.training-description {
  margin-bottom: 12px;
  color: #555;
  line-height: 1.5;
}
.training-details {
  margin-bottom: 12px;
}
.detail-item {
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #666;
}
.training-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
.status.upcoming {
  background: #d1ecf1;
  color: #0c5460;
}
.status.today {
  background: #f8d7da;
  color: #721c24;
}
.status.ended {
  background: #e2e3e5;
  color: #383d41;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .container {
    margin: 70px 10px 20px;
    padding: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .tabs {
    gap: 8px;
  }
  
  .tabs button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .training-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .answer-form {
    flex-direction: column;
    gap: 8px;
  }
  
  .question-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* アクセシビリティ改善 */
.no-data {
  text-align: center;
  padding: 32px 16px;
  color: #666;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

/* フォーカス表示 */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #1a4f9c;
  outline-offset: 2px;
}

/* アニメーション */
.list-card,
.qa-card,
.training-card {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ローディング状態 */
.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* 成功・エラーメッセージ用（将来のトースト実装用） */
.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
}
.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* ==== Layout Fixes (2025-08-23) ==== */
/* Prevent inputs from overflowing cards/containers */
*, *::before, *::after { box-sizing: border-box; }

.form-row {
  display: flex;
  flex-wrap: wrap;           /* allow wrapping on small widths */
  align-items: flex-start;
  gap: 16px;
}

.input-group {
  flex: 1 1 260px;           /* grow, shrink, min basis */
  min-width: 220px;          /* avoid squishing too small */
  max-width: 100%;
}

.input-group input,
.input-group textarea,
.input-group select {
  width: 100%;               /* fill the group but not overflow */
  max-width: 100%;
  display: block;
}

.card, .box, .form-box {
  overflow: visible;         /* ensure shadows and focus rings show */
}

/* Keep buttons from overlapping inputs on tight screens */
.actions, .btn-row, .button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.actions > *,
.btn-row > *,
.button-group > * {
  flex: 0 0 auto;
}

/* Avoid nav overlap with content if nav is fixed */
.page-content, .container, .content {
  padding-top: 72px;         /* room for the fixed nav */
}

/* Safer defaults for generic inputs */
input[type="text"],
input[type="url"],
input[type="number"],
input[type="date"],
textarea,
select {
  max-width: 100%;
}

/* Fix long URLs/words pushing layout */
.input-group { word-break: break-word; }
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>