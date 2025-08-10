<template>
  <div>
    <!-- 共通ナビメニュー -->
    <nav class="main-nav">
      <ul>
        <li><router-link to="/top">ホーム</router-link></li>
        <li><router-link to="/employee_infoshow">基本情報</router-link></li>
        <li><a href="#">スキル分析</a></li>
        <li><a href="#">人材管理</a></li>
        <li><a href="#">技術交流モジュール</a></li>
        <li><a href="#">交流エリア</a></li>
      </ul>
    </nav>

    <div class="container">
      <section class="form-section" style="margin-top: 80px;">
        <h1>従業員基本情報編集</h1>
      </section>

      <form @submit.prevent="onSave" enctype="multipart/form-data">
        <!-- 写真 -->
        <section class="form-photo">
          <img :src="photoPreview || defaultPhoto" alt="従業員写真" class="photo" />
          <input type="file" @change="onFileChange" accept="image/*" />
        </section>

        <!-- 基本情報 -->
        <section class="form-section">
          <h2>基本情報</h2>
          <dl>
            <dt>氏名</dt>
            <dd><input type="text" v-model="form.name" /></dd>
            <dt>社員番号</dt>
            <dd><input type="text" v-model="form.employeeId" /></dd>
            <dt>メールアドレス</dt>
            <dd><input type="email" v-model="form.email" /></dd>
            <dt>電話番号</dt>
            <dd><input type="tel" v-model="form.phone" /></dd>
            <dt>生年月日</dt>
            <dd><input type="date" v-model="form.dob" /></dd>
            <dt>性別</dt>
            <dd>
              <select v-model="form.gender">
                <option>男性</option>
                <option>女性</option>
                <option>その他</option>
              </select>
            </dd>
            <dt>住所</dt>
            <dd><input type="text" v-model="form.address" /></dd>
            <dt>最終学歴</dt>
            <dd><input type="text" v-model="form.education" /></dd>
            <dt>入社年月日</dt>
            <dd><input type="date" v-model="form.joined" /></dd>
            <dt>部署</dt>
            <dd><input type="text" v-model="form.department" /></dd>
            <dt>役職</dt>
            <dd><input type="text" v-model="form.position" /></dd>
            <dt>勤務形態</dt>
            <dd><input type="text" v-model="form.workStyle" /></dd>
            <dt>直属上司</dt>
            <dd><input type="text" v-model="form.manager" /></dd>
            <dt>緊急連絡先</dt>
            <dd><input type="text" v-model="form.emergency" /></dd>
            <dt>Slack ID</dt>
            <dd><input type="text" v-model="form.slack" /></dd>
            <dt>Teams ID</dt>
            <dd><input type="text" v-model="form.teams" /></dd>
          </dl>
        </section>

        <!-- 技術スキル -->
        <section class="form-section">
          <h2>技術スキル（評価 1〜7）</h2>
          <div class="skills-list-edit">
            <div v-for="(skill, index) in skills" :key="index" class="skill-input">
              <input type="text" v-model="skill.name" />
              <select v-model.number="skill.level">
                <option v-for="n in 7" :key="n" :value="n">{{ n }}</option>
              </select>
              <button type="button" @click="removeSkill(index)">削除</button>
            </div>
            <button type="button" @click="addSkill">スキル追加</button>
          </div>
        </section>

        <!-- 資格 -->
        <section class="form-section">
          <h2>資格</h2>
          <div class="cert-list-edit">
            <div v-for="(cert, idx) in certs" :key="idx" class="cert-input">
              <input type="text" v-model="cert.name" />
              <input type="text" v-model="cert.status" />
              <button type="button" @click="removeCert(idx)">削除</button>
            </div>
            <button type="button" @click="addCert">資格追加</button>
          </div>
        </section>

        <!-- プロジェクト経験 -->
        <section class="form-section">
          <h2>プロジェクト経験</h2>
          <div class="project-list-edit">
            <div v-for="(project, idx) in projects" :key="idx" class="project-input">
              <input type="text" v-model="project.name" />
              <button type="button" @click="removeProject(idx)">削除</button>
            </div>
            <button type="button" @click="addProject">プロジェクト追加</button>
          </div>
        </section>

        <!-- 自己PR -->
        <section class="form-section">
          <h2>自己PR</h2>
          <textarea v-model="form.selfPR" rows="6"></textarea>
        </section>

        <!-- ボタン -->
        <div class="form-buttons">
          <button type="submit">保存</button>
          <button type="button" @click="onCancel">キャンセル</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// デフォルト写真
const defaultPhoto = '/images/face.jpg' // 画像パスは適宜調整してください

// 画像プレビュー用
const photoPreview = ref('')

// フォームデータ
const form = ref({
  name: '山田 太郎',
  employeeId: '20250123',
  email: 'yamada.taro@example.com',
  phone: '080-1234-5678',
  dob: '1987-06-15',
  gender: '男性',
  address: '東京都港区芝浦3-2-16 A-PLACE田町イースト 6F',
  education: '東京工業大学 工学部 情報工学科 卒業（2010年3月）',
  joined: '2015-04-01',
  department: '開発部',
  position: 'シニアエンジニア',
  workStyle: '正社員',
  manager: '佐藤 一郎',
  emergency: '090-9876-5432（妻）',
  slack: '@taro.yamada',
  teams: 'taro.yamada@hi-think.co.jp',
  selfPR:
    '15年以上のシステム開発経験があり、JavaとJavaScriptを中心に幅広い技術を扱えます。\nチームリーダーとしてプロジェクトマネジメント経験も豊富です。\n新しい技術を学ぶことが好きで、常に最新のトレンドをキャッチアップしています。'
})

// 技術スキル配列
const skills = ref([
  { name: 'Java', level: 6 },
  { name: 'Python', level: 5 },
  { name: 'JavaScript', level: 7 },
  { name: 'TypeScript', level: 6 },
  { name: 'AWS', level: 6 },
  { name: 'Azure', level: 4 },
  { name: 'GCP', level: 3 },
  { name: 'OpenStack', level: 2 },
  { name: 'React', level: 6 },
  { name: 'Vue.js', level: 5 },
  { name: 'Angular', level: 3 },
  { name: 'Svelte', level: 2 },
  { name: 'Node.js', level: 5 },
  { name: 'Spring Boot', level: 5 },
  { name: 'Django', level: 3 },
  { name: 'Ruby on Rails', level: 2 },
  { name: 'Flutter', level: 3 },
  { name: 'React Native', level: 3 },
  { name: 'MySQL', level: 7 },
  { name: 'PostgreSQL', level: 6 },
  { name: 'MongoDB', level: 5 },
  { name: 'Redis', level: 4 },
  { name: 'Jenkins', level: 5 },
  { name: 'GitHub Actions', level: 5 },
  { name: 'GitLab CI', level: 4 },
  { name: 'Docker', level: 6 },
  { name: 'Kubernetes', level: 5 },
  { name: 'Helm', level: 4 },
  { name: 'Terraform', level: 4 },
  { name: 'Ansible', level: 3 },
  { name: 'Pulumi', level: 2 },
  { name: 'TensorFlow', level: 4 },
  { name: 'PyTorch', level: 3 },
  { name: 'GraphQL', level: 4 },
  { name: 'REST API', level: 7 },
  { name: 'WebAssembly', level: 2 },
  { name: 'Serverless (Lambda等)', level: 4 },
  { name: 'Kafka', level: 3 },
  { name: 'Elasticsearch', level: 4 }
])

// 資格配列
const certs = ref([
  { name: '基本情報技術者試験', status: '取得済み' },
  { name: 'AWS認定ソリューションアーキテクト – アソシエイト', status: '取得済み' }
])

// プロジェクト経験配列
const projects = ref([
  { name: '社内基幹システムの刷新プロジェクト（リーダー、2019-2021）' },
  { name: 'AWSクラウド移行プロジェクト（メンバー、2022）' }
])

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      photoPreview.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

function addSkill() {
  skills.value.push({ name: '', level: 1 })
}
function removeSkill(index) {
  skills.value.splice(index, 1)
}

function addCert() {
  certs.value.push({ name: '', status: '' })
}
function removeCert(index) {
  certs.value.splice(index, 1)
}

function addProject() {
  projects.value.push({ name: '' })
}
function removeProject(index) {
  projects.value.splice(index, 1)
}

function onSave() {
  if (confirm('編集した内容を保存してもよろしいでしょうか？')) {
    // ここで保存処理を実装（API呼び出しなど）
    // 例: axios.post('/api/employee', { form: form.value, skills: skills.value, ... })

    // 保存後は表示画面へ遷移
    router.push('/employee_infoshow')
  }
}

function onCancel() {
  router.push('/employee_infoshow')
}
</script>

<style scoped>
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 15px;
  border: 1px solid #ccd2e0;
  border-radius: 6px;
  background-color: #f9fbff;
  font-family: inherit;
}

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

.main-nav a {
  display: block;
  padding: 16px 24px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.3s ease;
}

.main-nav a:hover {
  background-color: #143a6e;
}

textarea {
  resize: vertical;
}

.form-section {
  margin-bottom: 40px;
}

.form-buttons {
  text-align: center;
  margin-top: 40px;
}

.form-buttons button {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #1a4f9c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin: 0 10px;
}

.form-buttons button:hover {
  background-color: #143a6e;
}

.form-photo {
  text-align: center;
  margin-bottom: 30px;
}

.form-photo input[type="file"] {
  margin-top: 12px;
}

.skills-list-edit,
.cert-list-edit,
.project-list-edit {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill-input,
.cert-input,
.project-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.skill-input input[type="text"],
.cert-input input[type="text"],
.project-input input[type="text"] {
  flex: 1;
}

.skill-input select {
  width: 80px;
}
</style>
