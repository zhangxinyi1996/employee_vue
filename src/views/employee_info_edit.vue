<template>
  <div>
    <!-- 共通ナビメニュー -->
    <nav class="main-nav">
      <ul>
        <li><router-link to="/top">ホーム</router-link></li>
        <li><router-link to="/employee_infoshow">基本情報</router-link></li>
        <li><router-link to="/employee_skillmap">スキル分析</router-link></li>
        <li><router-link to="/employee_search">人材管理</router-link></li>
        <li><a href="#">技術交流モジュール</a></li>
        <li><router-link to="/exchange_area">交流エリア</router-link></li>
        <li class="logout"><a href="/logout">ログアウト</a></li>
      </ul>
    </nav>

    <div class="container">
      <section class="form-section" style="margin-top: 80px;">
        <h1>従業員基本情報編集</h1>
      </section>

      <form @submit.prevent="onSave" enctype="multipart/form-data">
        <!-- 写真 -->
        <section class="form-photo">
          <img :src="photoPreview || form.photo || defaultPhoto" alt="従業員写真" class="photo" />
          <input type="file" @change="onFileChange" accept="image/*" />
        </section>
        <!-- 基本情報 -->
        <section class="form-section">
          <h2>基本情報</h2>
          <dl>
            <dt>氏名</dt><dd><input type="text" v-model="form.name" /></dd>
            <dt>社員番号</dt><dd><input type="text" v-model="form.employeeId" /></dd>
            <dt>メールアドレス</dt><dd><input type="email" v-model="form.email" /></dd>
            <dt>電話番号</dt><dd><input type="tel" v-model="form.phone" /></dd>
            <dt>生年月日</dt><dd><input type="date" v-model="form.dob" /></dd>
            <dt>性別</dt>
            <dd>
              <select v-model="form.gender">
                <option>男性</option>
                <option>女性</option>
                <option>その他</option>
              </select>
            </dd>
            <dt>住所</dt><dd><input type="text" v-model="form.address" /></dd>
            <dt>最終学歴</dt><dd><input type="text" v-model="form.education" /></dd>
            <dt>入社年月日</dt><dd><input type="date" v-model="form.joined" /></dd>
            <dt>部署</dt><dd><input type="text" v-model="form.department" /></dd>
            <dt>役職</dt><dd><input type="text" v-model="form.position" /></dd>
            <dt>勤務形態</dt><dd><input type="text" v-model="form.workStyle" /></dd>
            <dt>直属上司</dt><dd><input type="text" v-model="form.manager" /></dd>
            <dt>緊急連絡先</dt><dd><input type="text" v-model="form.emergency" /></dd>
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
              <input type="text" v-model="cert.categoryName" placeholder="資格名" />
              <input type="date" v-model="cert.getYmd" />
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
              <input type="date" v-model="project.projectStart" class="short-input" /> 
              <input type="date" v-model="project.projectEnd" />
              <input type="text" v-model="project.projectName" placeholder="プロジェクト名" />
              <input type="text" v-model="project.projectRole" placeholder="役割" />
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
import request from '../utils/request'

const router = useRouter()

const defaultPhoto = '/images/face.jpg'
const photoPreview = ref('')


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
  department:localStorage.getItem("departmentName") || '',
  position: localStorage.getItem("position") || '',
  workStyle: localStorage.getItem("employmentType") || '',
  manager: localStorage.getItem("managerName") || '',
  emergency: localStorage.getItem("emergencyTel") || '',
  slack: localStorage.getItem("slackId") || '',
  teams: localStorage.getItem("teamsId")|| '',
  selfPR: localStorage.getItem("selfPr")|| ''

})

const skills = ref([

        { "skillId": 0, "name": "Java", "level": 1 },
        { "skillId": 1, "name": "Python", "level": 2 },
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

async function onSave() {
  if (confirm('編集した内容を保存してもよろしいですか？')) {

   try {
        // ファイルのアップロード処理のため FormData を使う
        const formData = new FormData()
        formData.append("photoFile", form.value.photoFile)

        // その他項目の追加
        formData.append( "employeeStatus",localStorage.getItem("employeeStatus") )
        formData.append( "id",localStorage.getItem("employeeId") )
        formData.append("departmentName",form.value.department )
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

      } catch (error) {
        console.error("请求员工信息失败:", error);
        // 可以根据需要处理错误，例如显示错误消息
      }
    
    
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
  width: 800px;        /* 親要素に合わせる */
  box-sizing: border-box; /* パディング込みで幅計算 */
}

/* 中央寄せにする場合 */
dl dd {
  display: flex;
  justify-content: center; /* 横方向中央寄せ */
}

dt {
  font-weight: 700;
  color: #455a86;
  padding-top: 4px;
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

.skills-list-edit, .cert-list-edit, .project-list-edit {
  display: grid;
  gap: 12px;
}

.skill-input, .cert-input, .project-input {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;  /* 水平方向中央寄せ */
}

/* 技術名は広め */
.skill-input input[type="text"],
.skill-input select {
 width: 800px;   /* 最大幅を指定（任意） */
}

/* 技術レベルは短く */
.skill-input select,
.skill-input input[type="number"] {
  width: 200px;
}

.cert-input input, .project-input input {
  flex: 1;
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
