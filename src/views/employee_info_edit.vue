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

    <div class="container">
      <section class="form-section" style="margin-top: 80px;">
        <h1>従業員基本情報編集</h1>
      </section>

      <form @submit.prevent="onSave" enctype="multipart/form-data">
        <!-- 写真 -->
        <section class="form-photo">
          <img :src="photoPreview || form.photo || defaultPhoto" alt="従業員写真" class="photo"/>
          <input type="file" @change="onFileChange" accept="image/*" />
        </section>

        <section class="form-section" v-if="showError">
          <div class="error-message" style="font-size: large; white-space: pre-line;" v-if="showError">{{ errorMessage }}</div>
        </section>
        <!-- 基本情報 -->
        <section class="form-section">
          <h2>基本情報</h2>
          <dl>
            <dt>(＊は必須入力項目)</dt><dd>  </dd>
            <dt>氏名＊</dt><dd><input type="text" v-model="form.name" required /></dd>
            <!-- <dt>社員番号</dt><dd><input type="text" v-model="form.employeeId" readonly /></dd>-->
            <dt>メールアドレス＊</dt><dd><input type="email" v-model="form.email" required /></dd>
            <dt>電話番号＊</dt><dd><input type="tel" v-model="form.phone" required /></dd>
            <dt>生年月日＊</dt><dd><input type="date" v-model="form.dob"  required /></dd>
            <dt>性別＊</dt>
            <dd>
              <select v-model="form.gender" required >
                <option>男性</option>
                <option>女性</option>
                <option>その他</option>
              </select>
            </dd>
            <dt>住所＊</dt><dd><input type="text" v-model="form.address" required /></dd>
            <dt>最終学歴＊</dt><dd><input type="text" v-model="form.education" required /></dd>
            <dt>入社年月日＊</dt><dd><input type="date" v-model="form.joined " required /></dd>
            <dt>部署＊</dt>
              <dd>

                <select class="branch-input" v-model="selectedBranchId" @change="onBranchChange" required >
                  <option v-for="b in branches" :key="b.id" :value="b.id">
                    {{ b.name }}
                  </option>
                </select>

                <select class="depart-input" v-model="selectedDeptId" :disabled="!selectedBranchId || depts.length === 0" required >
                  <option v-for="d in depts" :key="d.id" :value="d.id">
                    {{ d.name }}
                  </option>
                </select>

              </dd>
            <dt>役職</dt><dd><input type="text" v-model="form.position" /></dd>
            <dt>勤務形態</dt><dd><input type="text" v-model="form.workStyle" /></dd>
            <dt>直属上司</dt><dd><input type="text" v-model="form.manager" /></dd>
            <dt>緊急連絡先</dt><dd><input type="text" v-model="form.emergency " /></dd>
            <dt>Slack ID</dt><dd><input type="text" v-model="form.slack" /></dd>
            <dt>Teams ID</dt><dd><input type="text" v-model="form.teams" /></dd>
          </dl>
        </section>

        <!-- 技術スキル -->
        <section class="form-section">
          <h2>技術スキル（0～7）</h2>
          <div class="skills-list-edit">
            <div v-for="skill in skills" :key="skill.skillId" class="skill-input">
              <input type="text" v-model="skill.name" readonly />
              <select v-model.number="skill.level">
                <option v-for="n in 8" :key="n-1" :value="n-1">{{ n-1 }}</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 資格 -->
        <section class="form-section">
          <h2>資格</h2>
          <div class="cert-list-edit">
            <div v-for="(cert, idx) in certs" :key="idx" class="cert-input">
              <input type="date" v-model="cert.getYmd" />
              <input type="text" v-model="cert.categoryName" placeholder="資格名" />
              <button type="button" @click="removeCert(idx)" style="width:80px">削除</button>
            </div>
            <button type="button" @click="addCert">資格追加</button>
          </div>
        </section>

        <!-- プロジェクト経験 -->
        <section class="form-section">
          <h2>プロジェクト経験</h2>
          <div class="project-list-edit">
            <div v-for="(project, idx) in projects" :key="idx" class="project-input">
              <input type="date" v-model="project.projectStart" /> 
              <input type="date" v-model="project.projectEnd" />
              <input type="text" v-model="project.projectName" placeholder="プロジェクト名"/>
              <input type="text" v-model="project.projectRole" placeholder="役割" />
              <button type="button" @click="removeProject(idx)" style="width:80px">削除</button>
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
          <button type="button" @click="onCancel">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const router = useRouter()

const defaultPhoto = '/images/face.jpg'
const photoPreview = ref('')
const permissionsLevel = ref(localStorage.getItem("permissionsLevel"))

const form = ref({
  photo: localStorage.getItem("photo") || defaultPhoto,
  photoFile: null,
  name:  localStorage.getItem("name") || '',
  employeeId: localStorage.getItem("employeeId") || '',
  email: localStorage.getItem("email") || '',
  phone: localStorage.getItem("phoneNo") || '',
  dob: localStorage.getItem("birthday") || '',
  gender: localStorage.getItem("gender")|| '',
  address: localStorage.getItem("address") || '',
  education: localStorage.getItem("education") || '',
  joined: localStorage.getItem("hireDate")|| '',
  position: localStorage.getItem("position") || '',
  workStyle: localStorage.getItem("employmentType") || '',
  manager: localStorage.getItem("managerName") || '',
  emergency: localStorage.getItem("emergencyTel") || '',
  slack: localStorage.getItem("slackId") || '',
  teams: localStorage.getItem("teamsId")|| '',
  selfPR: localStorage.getItem("selfPr")|| ''

})

const branches = ref([])
const depts = ref([])
const selectedBranchId = ref('')
const selectedDeptId = ref('')

const deptCache = new Map() // key: branch_id, value: dept array
//  branchs:JSON.parse(localStorage.getItem("departmentRequestList")) || '',
const departmentsAll = JSON.parse(localStorage.getItem("departmentRequestList")) || []
departmentsAll.forEach(dept => {
      const arr = deptCache.get(dept.branchId) || []
      if (!arr.find(d => d.id === dept.departmentId)) {
        arr.push({ id: dept.departmentId, name: dept.departmentName })
        deptCache.set(dept.branchId, arr)
      }
      if(!branches.value.find(b => b.id === dept.branchId)) {
        branches.value.push({ id: dept.branchId, name: dept.branchName })
      }
})

function onBranchChange() {
  if (!selectedBranchId.value) {
    selectedDeptId.value = '' // 先清空部门选择
    return
  }
  depts.value = deptCache.get(Number(selectedBranchId.value)) || []
}
function  logout() {
    console.log("✅ logout() が呼ばれました");
    alert("ログアウトしました");
    sessionStorage.removeItem("token");
    localStorage.clear();
    router.push("/login");
}

onMounted(() => {
  selectedBranchId.value = localStorage.getItem("branchId") || ''
  depts.value = deptCache.get(Number(selectedBranchId.value)) || []
  selectedDeptId.value = localStorage.getItem("departmentId") || ''
  window.scrollTo(0, 0)
})

const skills = ref([

        { "skillId": 0, "name": "Java", "level": 0 },
        { "skillId": 1, "name": "Python", "level": 0 },
        { "skillId": 2, "name": "JavaScript", "level": 0 },
        { "skillId": 3, "name": "TypeScript", "level": 0 },
        { "skillId": 4, "name": "AWS", "level": 0 },
        { "skillId": 5, "name": "Azure", "level": 0 },
        { "skillId": 6, "name": "GCP", "level": 0 },
        { "skillId": 7, "name": "OpenStack", "level": 0 },
        { "skillId": 8, "name": "React", "level": 0 },
        { "skillId": 9,  "name": "Vue.js", "level": 0 },
        { "skillId": 10, "name": "Angular", "level": 0 },
        { "skillId": 11, "name": "Svelte", "level": 0 },
        { "skillId": 12, "name": "Node.js", "level": 0 },
        { "skillId": 13, "name": "Spring Boot", "level": 0 },
        { "skillId": 14, "name": "Django", "level": 0 },
        { "skillId": 15, "name": "Ruby on Rails", "level": 0 },
        { "skillId": 16, "name": "Flutter", "level": 0 },
        { "skillId": 17, "name": "React Native", "level": 0 },
        { "skillId": 18, "name": "MySQL", "level": 0 },
        { "skillId": 19, "name": "PostgreSQL", "level": 0 },
        { "skillId": 20, "name": "MongoDB", "level": 0 },
        { "skillId": 21, "name": "Redis", "level": 0 },
        { "skillId": 22, "name": "Jenkins", "level": 0 },
        { "skillId": 23, "name": "GitHub Actions", "level": 0 },
        { "skillId": 24, "name": "GitLab CI", "level": 0 },
        { "skillId": 25, "name": "Docker", "level": 0 },
        { "skillId": 26, "name": "Kubernetes", "level": 0 },
        { "skillId": 27, "name": "Helm", "level": 0 },
        { "skillId": 28, "name": "Terraform", "level": 0 },
        { "skillId": 29, "name": "Ansible", "level": 0 },
        { "skillId": 30, "name": "Pulumi", "level": 0 },
        { "skillId": 31, "name": "TensorFlow", "level": 0 },
        { "skillId": 32, "name": "PyTorch", "level": 0 },
        { "skillId": 33, "name": "GraphQL", "level": 0 },
        { "skillId": 34, "name": "REST API", "level": 0 },
        { "skillId": 35, "name": "WebAssembly", "level": 0 },
        { "skillId": 36, "name": "Serverless (Lambda等)", "level": 0 },
        { "skillId": 37, "name": "Kafka", "level": 0 },
        { "skillId": 38, "name": "Elasticsearch", "level": 0 }
      ])

        
skills.value = JSON.parse(localStorage.getItem("staffSkillRequestList"))

const certs = ref([
  { categoryName: "", getYmd: "" },
])

certs.value = JSON.parse(localStorage.getItem("staffCategoryRequestList")) || certs.value;

const projects = ref([
 { projectStart: "", projectEnd:"", projectName: "" , projectRole: ""},
])

projects.value = JSON.parse(localStorage.getItem("staffProjectRequestList")) || projects.value;


function onFileChange(e) {
  const photoFile = e.target.files[0]
  if (!photoFile) return

  // 预览
  const reader = new FileReader()
  reader.onload = (event) => { photoPreview.value = event.target.result }
  reader.readAsDataURL(photoFile)
  
  // ファイルの保存
  form.value.photoFile = photoFile

}

function addCert() { certs.value.push({ categoryName: '', getYmd: '' }) }
function removeCert(idx) { certs.value.splice(idx, 1) }

function addProject() { projects.value.push({ projectStart: "",projectEnd:"",projectName: "" ,projectRole: "" }) }
function removeProject(idx) { projects.value.splice(idx, 1) }

const showError = ref(false)
const errorMessage = ref('')

function validateInputFields() {
  showError.value = false
  errorMessage.value = ''
  let msg = ''

  // 電話番号の簡易チェック
  const regexPhone = /^0\d{9,10}$/
  if (!regexPhone.test(form.value.phone)) {
    msg = "電話番号：正しい電話番号を入力してください (例: 09012345678)" 
  }

  // 生年月日の簡易チェック
  const dob = new Date(form.value.dob)
  const today = new Date()
  if (dob > today) {
    msg += (msg ? '\n' : '') + "生年月日：未来の日付は入力できません"
  }

  // 入社日の簡易チェック
  const joined = new Date(form.value.joined)
  if (joined > today) {
    msg += (msg ? '\n' : '') + "入社年月日：未来の日付は入力できません"
  }

  // 緊急連絡先の簡易チェック
  if (form.value.emergency) {
    if (!regexPhone.test(form.value.emergency)) {
      msg += (msg ? '\n' : '') + "緊急連絡先：正しい電話番号を入力してください (例: 09012345678)" 
    }
  }

  // 資格の取得日の簡易チェック
  certs.value.forEach((cert, idx) => {

    if (!cert.getYmd && !cert.categoryName ) {
      return
    }

    if (!cert.getYmd && cert.categoryName ) {
      msg += (msg ? '\n' : '') + `資格${idx+1}：資格の取得日を入力してください`
    }

    if (cert.getYmd && !cert.categoryName ) {
      msg += (msg ? '\n' : '') + `資格${idx+1}：資格名を入力してください`
    }

    const getYmd = new Date(cert.getYmd)
    if (getYmd > today) {
      msg += (msg ? '\n' : '') + `資格${idx+1}：未来の日付は入力できません`
    }
  })

  // プロジェクトの開始日と終了日の簡易チェック
  projects.value.forEach((project, idx) => {
    if (!project.projectStart && !project.projectEnd && !project.projectName && !project.projectRole ) {
      return
    }
    if (!project.projectStart || !project.projectEnd || !project.projectName || !project.projectRole ) {  
      msg += (msg ? '\n' : '') + `プロジェクト${idx+1}：プロジェクトかかわる全項目を入力してください`
      return
    }

    if (project.projectStart && project.projectEnd) {    
      const projectStart = new Date(project.projectStart)
      const projectEnd = new Date(project.projectEnd)
      if (projectStart > projectEnd) {
        msg += (msg ? '\n' : '') + `プロジェクト${idx+1}：開始日が終了日より前の日付は入力できません`
      }
      if (projectStart > today) {
        msg += (msg ? '\n' : '') + `プロジェクト${idx+1}：開始日が未来の日付は入力できません`
      }
      if (projectEnd > today) {
        msg += (msg ? '\n' : '') + `プロジェクト${idx+1}：終了日が未来の日付は入力できません`
      }
    }
  })

  if (msg) {
    showError.value = true
    errorMessage.value = msg
    return false
  }
  return true
}

async function onSave() {
  if (!validateInputFields()) {
    window.scrollTo(0, 0)
    return
  }
  if (confirm('編集した内容を保存してもよろしいですか？')) {
       
    // ファイルのアップロード処理のため FormData を使う
    const formData = new FormData()
    formData.append("photoFile", form.value.photoFile)

    // その他項目の追加
    formData.append( "employeeStatus",localStorage.getItem("employeeStatus") )
    formData.append( "id",localStorage.getItem("employeeId") )
    formData.append("branchId", selectedBranchId.value )
    formData.append("departmentId",selectedDeptId.value )
    formData.append("name",form.value.name )
    formData.append("email",form.value.email )
    formData.append("phoneNo",form.value.phone )
    formData.append("hireDate",form.value.joined )
    formData.append("position",form.value.position )
    formData.append("employmentType",form.value.workStyle )
    formData.append("managerName",form.value.manager )
    formData.append("emergencyTel",form.value.emergency )
    formData.append("slackId",form.value.slack )
    formData.append("teamsId",form.value.teams )
    formData.append("photoPath",form.value.photo )
    formData.append("selfPr",form.value.selfPR )
    formData.append("staffBasicInfoStaus",localStorage.getItem("staffBasicInfoStaus") )
    formData.append("birthday",form.value.dob )
    formData.append("gender",form.value.gender )
    formData.append("address",form.value.address )
    formData.append("education",form.value.education )
    //formData.append("staffSkillRequestList",skills.value )
    appendListToFormData(formData, skills.value, "staffSkillRequestList");
    //formData.append("staffCategoryRequestList",certs.value )
    appendListToFormData(formData, certs.value, "staffCategoryRequestList");
    //formData.append("staffProjectRequestList",projects.value )
    appendListToFormData(formData, projects.value, "staffProjectRequestList");


    await request.post("/employee/edit",formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then(res => {
      console.log("保存正常終了", res.data)
      localStorage.setItem("photo", res.data.path); 
    })
    .catch(err => {
      console.error("保存失敗終了", err)
    })

    // 保存员工情報到 localStorage
    localStorage.setItem("employeeStatus", "1"); 
    localStorage.setItem("employeeId", formData.id); 
    localStorage.setItem("departmentName", formData.departmentName); 
    localStorage.setItem("name", formData.name); 
    localStorage.setItem("email", formData.email); 
    localStorage.setItem("phoneNo", formData.phoneNo); 
    localStorage.setItem("hireDate", formData.hireDate); 
    localStorage.setItem("position", formData.position); 
    localStorage.setItem("employmentType", formData.employmentType); 
    localStorage.setItem("managerName", formData.managerName); 
    localStorage.setItem("emergencyTel", formData.emergencyTel); 
    localStorage.setItem("slackId", formData.slackId); 
    localStorage.setItem("teamsId", formData.teamsId); 
    localStorage.setItem("selfPr", formData.selfPr); 
    localStorage.setItem("staffBasicInfoStaus", "1"); 
    localStorage.setItem("birthday", formData.birthday); 
    localStorage.setItem("gender", formData.gender); 
    localStorage.setItem("address", formData.address); 
    localStorage.setItem("education", formData.education); 
    localStorage.setItem("staffSkillRequestList", JSON.stringify(skills.value));
    localStorage.setItem("staffCategoryRequestList", JSON.stringify(certs.value) ); 
    localStorage.setItem("staffProjectRequestList", JSON.stringify(projects.value) ); 
    alert('保存しました。')
   
    router.push('/employee_infoshow')
  }
}

function appendListToFormData(fd, list, listName) {
  list.forEach((obj, i) => {
    Object.entries(obj).forEach(([k, v]) => {
      const key = `${listName}[${i}].${k}`;
      fd.append(key, v ?? "");
    });
  });
}
function onCancel() { router.push('/employee_infoshow') }


</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP&display=swap');

body {
  margin: 0;
  font-family: "游ゴシック体", "Yu Gothic", "Noto Serif JP", serif, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #e4e9f2 100%);
  padding-top: 64px;
  color: #2e3a59;
  line-height: 1.8;
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

.container {
  max-width: 100%;
  margin: 50px auto 100px;
  padding: 30px 40px;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  border: none;
}

h1, h2 {
  text-align: center;
  color: #1f2e4a;
  margin-bottom: 36px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

section {
  margin-bottom: 50px;
  border-bottom: 1px solid #dde3ea;
  padding-bottom: 36px;
}

section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

dl {
  padding-left: 200px;
  display: grid;
  grid-template-columns: 150px 1fr;
  row-gap: 18px;
  column-gap: 28px;
  color: #3c4a6e;
  font-size: 17px;
  margin: 0;
}
dl dd input[type="text"],
dl dd input[type="email"],
dl dd input[type="tel"],
dl dd input[type="date"],
dl dd select {
  width: 80%;        /* 親要素に合わせる */
  box-sizing: border-box; /* パディング込みで幅計算 */
}

/* 中央寄せにする場合 */
dl dd {
  display: flex;
  justify-content: left; /* 横方向中央寄せ */
}

dt {
  margin: 0;
  font-weight: 700;
  color: #455a86;
  padding-top: 4px;
  justify-content: center; /* 横方向右寄せ */
}

dd {
  margin: 0;
  white-space: pre-wrap;
  font-weight: 500;
}

input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select, textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #cfd6e4;
  outline: none;
  box-shadow: inset 1px 1px 4px rgba(0,0,0,0.05);
}
 .branch-input{
  width: 39%;        /* 親要素に合わせる */
  box-sizing:border-box; /* パディング込みで幅計算 */
  justify-content: left; /* 横方向右寄せ */
}
 .depart-input{
  width: 39%;        /* 親要素に合わせる */
  box-sizing:border-box; /* パディング込みで幅計算 */
  margin-left: 2%; /* 左边留点空隙 */
}
textarea {
  resize: vertical;
}

button {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  background-color: #1a4f9c;
  color: #fff;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #143a6e;
}

.cert-list-edit, .project-list-edit {
  display: grid;
  gap: 12px;
}

.skills-list-edit  {
  display: flex;       /* 一行排列 */
  flex-wrap: wrap;     /* 超过宽度换行 */
  gap: 20px;           /* 每组技能之间的间隔 */
}
.skill-input {
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 6px;            /* 输入框和下拉框间距 */
  min-width: 100px;    /* 每组技能的最小宽度 */
}
.cert-input, .project-input{
  display: flex;
  flex-wrap: wrap;  
  gap: 12px;
  align-items: center;
  justify-content: center;  /* 水平方向中央寄せ */
}

/* 技術名は広め */
.skill-input input[type="text"],
.skill-input select {
  min-width: 80px;
}


/* 技術レベルは短く */
.skill-input select,
.skill-input input[type="number"] {
  width: 10%;
  min-width: 150px;
}

.cert-input input[type="date"]{
  flex:1;
  max-width: 120px;
}

.cert-input input[type="text"] {
  flex:3;
  min-width: 200px;
}

.project-input input[type="date"] {
  
  flex:1;
  max-width: 120px;
}
.project-input input[placeholder="プロジェクト名"] {
  flex:3;
  min-width: 200px;
}

.project-input input[placeholder="役割" ] {
  flex:1;
  min-width: 200px;
}
.photo {
  display: block;
  max-width: 150px;
  max-height: 150px;
  margin: 0 auto 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #9ab8ff;
  box-shadow: 0 6px 15px rgba(58,84,148,0.25);
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}

@media (max-width: 600px) {
  dl {
    grid-template-columns: 1fr;
    padding-left: 0;
  }
  .skills-list-edit, .cert-list-edit, .project-list-edit {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .cert-input, .project-input, .skill-input {
    flex-direction: column;
    align-items: stretch;
  }
}


</style>
