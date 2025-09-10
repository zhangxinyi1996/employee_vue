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
      <h1>従業員基本情報表示</h1>

      <!-- 写真 -->
      <section>
        <img :src="photo|| '/images/face.jpg'" alt="従業員写真" class="photo" />
      </section>

      <!-- 基本情報 -->
      <section class="basic-info">
        <h2>基本情報</h2>
        <dl>
          <template v-for="(value, key) in basicInfo" :key="key">
            <dt>{{ key }}</dt>
            <dd>{{ value }}</dd>
          </template>
        </dl>
      </section>

      <!-- 技術スキル -->
      <section>
        <h2>技術スキル（評価 1〜7）</h2>
        <ul class="skills-list">
          <li
            v-for="skill in skills"
            :key="skill.skillId"
            class="skill-item"
          >
            {{ skill.name }}
            <span :class="['skill-level', 'level-' + skill.level]">{{ skill.level }}</span>
          </li>
        </ul>
      </section>

      <!-- 資格 -->
      <section>
        <h2>資格</h2>
        <ul class="project-list" v-if="certifications.some(cert => cert.categoryName)">
          <li v-for="cert in certifications" :key="cert.name">
            {{ cert.categoryName }}（{{ cert.getYmd }}）
          </li>
        </ul>
      </section>

      <!-- プロジェクト経験 -->
      <section>
        <h2>プロジェクト経験</h2>
        <ul class="project-list" v-if="projects.some(project => project.projectName)">
          <li v-for="(project, index) in projects" :key="index">
            {{ project.projectName }}（{{ project.projectStart }}～{{ project.projectEnd }}、{{ project.projectRole }}）
          </li>
        </ul>
      </section>

      <!-- 自己PR -->
      <section>
        <h2>自己PR</h2>
        <p class="self-pr" v-html="selfPR"></p>
      </section>

      <section class="edit-section" style="text-align: center; margin-top: 40px;">
      <router-link to="/employee_info_edit" class="edit-button">編集</router-link>
      </section>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'
//import { ref } from 'vue'
export default {
  name: "EmployeeInfoShow",
  mounted() {
  // 画面全体の背景を白にリセット
  document.documentElement.style.backgroundImage = "none"; // html
  document.documentElement.style.backgroundColor = "#ffffff";
  document.body.style.backgroundImage = "none";             // body
  document.body.style.backgroundColor = "#ffffff";

  // body を画面全体に最低高さ確保
  document.body.style.minHeight = "100vh";
  window.scrollTo(0, 0)
},
  data() {
    return {
      photo: "images/face.jpg",
      basicInfo: {
        "氏名": "",
        "社員番号": "",
        "メールアドレス": "",
        "電話番号": "",
        "生年月日": "",
        "性別": "",
        "住所": "",
        "最終学歴": "",
        "入社年月日": "",
        "部署": "",
        "役職": "",
        "勤務形態": "",
        "直属上司": "",
        "緊急連絡先": "",
        "Slack ID": "",
        "Teams ID": "",
      },
      skills : ([        
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


      ]),
      certifications: [
        { categoryName: "", getYmd: "" }
      ],
 
      projects: [
        { projectStart: "", projectEnd:"", projectName: "" , projectRole: ""},
      ],
      selfPR: "",
      permissionsLevel: localStorage.getItem("permissionsLevel") || '',
    };
  },

  // 在组件实例创建后立即发起请求
  async created() {
    await this.fetchEmployeeData();
  },
  methods: {
    // 异步获取员工数据的方法
    async fetchEmployeeData() {
      try {
        // 使用 await 暂停执行，等待请求完成
        const usernameStorage = localStorage.getItem('username') || '';
        const apiData = await request.post("/employee/preview",{
        username: usernameStorage
    });
        // 调用方法处理并更新数据
        this.updateBasicInfo(apiData);
        // 保存员工情報到 localStorage
        localStorage.setItem("photo", apiData.photoPath || ''); 
        localStorage.setItem("employeeStatus", apiData.employeeStatus || ''); 
        localStorage.setItem("employeeId", apiData.employeeId || ''); 
        localStorage.setItem("branchId", apiData.branchId || ''); 
        localStorage.setItem("departmentId", apiData.departmentId || ''); 
        localStorage.setItem("branchName", apiData.branchName || ''); 
        localStorage.setItem("departmentName", apiData.departmentName || ''); 
        localStorage.setItem("name", apiData.name || ''); 
        localStorage.setItem("email", apiData.email || ''); 
        localStorage.setItem("phoneNo", apiData.phoneNo || ''); 
        localStorage.setItem("hireDate", apiData.hireDate || ''); 
        localStorage.setItem("position", apiData.position || ''); 
        localStorage.setItem("employmentType", apiData.employmentType || ''); 
        localStorage.setItem("managerName", apiData.managerName || ''); 
        localStorage.setItem("emergencyTel", apiData.emergencyTel || ''); 
        localStorage.setItem("slackId", apiData.slackId || ''); 
        localStorage.setItem("teamsId", apiData.teamsId || ''); 
        localStorage.setItem("selfPr", apiData.selfPr || ''); 
        localStorage.setItem("staffBasicInfoStaus", apiData.staffBasicInfoStaus || ''); 
        localStorage.setItem("birthday", apiData.birthday || ''); 
        localStorage.setItem("gender", apiData.gender || ''); 
        localStorage.setItem("address", apiData.address || ''); 
        localStorage.setItem("education", apiData.education || ''); 
        localStorage.setItem("staffSkillRequestList", JSON.stringify(apiData.staffSkillRequestList)); 
        localStorage.setItem("staffCategoryRequestList", JSON.stringify(this.certifications)); 
        localStorage.setItem("staffProjectRequestList", JSON.stringify(this.projects)); 
        localStorage.setItem("departmentRequestList", JSON.stringify(apiData.departmentRequestList)); 

      } catch (error) {
        console.error("请求员工信息失败:", error);
        // 可以根据需要处理错误，例如显示错误消息
      }
    },
    
    // 将 API 返回的数据格式化并更新到 basicInfo
    updateBasicInfo(data) {
      // 检查返回数据是否有效
      if ( typeof data === 'object') {
        this.basicInfo = {
          "氏名": data.name || "",
          "社員番号": data.employeeId || "",
          "メールアドレス": data.email || "",
          "電話番号": data.phoneNo || "",
          "生年月日": data.birthday || "", 
          "性別": data.gender || "",
          "住所": data.address || "",
          "最終学歴": data.education || "",
          "入社年月日": data.hireDate || "",
          "部署": (data.branchName || "") + " " + (data.departmentName || ""),
          "役職": data.position || "",
          "勤務形態": data.employmentType || "",
          "直属上司": data.managerName || "",
          "緊急連絡先": data.emergencyTel || "",
          "Slack ID": data.slackId || "",
          "Teams ID": data.teamsId || "",
        };
        // 同时更新照片路径
        this.photo = data.photoPath || "images/face.jpg";
        this.selfPR = data.selfPr || "";
        this.skills = data.staffSkillRequestList  || this.skills;
        const certList = data.staffCategoryRequestList;
        this.certifications = certList && certList.length > 0 ? certList : this.certifications ;
        const projectsList = data.staffProjectRequestList;
        this.projects = projectsList && projectsList.length > 0 ? projectsList : this.projects ;
      }
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
    }
  }
  };
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP&display=swap');

body {
  margin: 0;
  font-family: "游ゴシック体", "Yu Gothic", "Noto Serif JP", serif, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;  /* 背景画像なし */
  padding-top: 64px;
  color: #2e3a59;
  line-height: 1.8;
  background-image: none; 
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
   height: 20px;   /* ← 他ボタンと同じ高さに統一 */
}

.main-nav a:hover {
  background-color: #143a6e;
}
/* ログアウトだけ赤色 */
.main-nav .logout {
  margin-left: auto;
}
.main-nav .logout a {
  background-color: #d9534f;
}
.main-nav .logout a:hover {
  background-color: #b52b27;
}
/* container を全画面幅にして枠なしに */
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
  padding-left: 200px; /* ← ここを追加 */
  display: grid;
  grid-template-columns: 150px 1fr;
  row-gap: 18px;
  column-gap: 28px;
  color: #3c4a6e;
  font-size: 17px;
  margin: 0;
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

.edit-button {
  display: inline-block;
  padding: 12px 28px;
  background-color: #1a4f9c;
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  text-decoration: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: background-color 0.3s ease;
}
.edit-button:hover {
  background-color: #143a6e;
}

.skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.skill-item {
  background: linear-gradient(145deg, #f0f4ff, #d9e1ff);
  border-radius: 20px;
  padding: 14px 18px;
  box-shadow:
    4px 4px 6px #bcc9f2,
    -4px -4px 6px #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: #344a91;
  font-size: 15px;
  transition: transform 0.2s ease;
  cursor: default;
}
.skill-item:hover {
  transform: translateY(-3px);
  box-shadow:
    6px 6px 8px #b0bcf0,
    -6px -6px 8px #f7f9ff;
}

.skill-level {
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
  font-weight: 700;
  text-align: center;
  line-height: 28px;
  font-size: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}
.level-1 { background-color: #bbbdbf; }
.level-2 { background-color: #7f9cff; }
.level-3 { background-color: #5984ff; }
.level-4 { background-color: #3f6ced; }
.level-5 { background-color: #3452b1; }
.level-6 { background-color: #2a3a79; }
.level-7 { background-color: #1e2a55; }

.photo {
  display: block;
  max-width: 150px;
  max-height: 150px;
  margin: 0 auto 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #9ab8ff;
  box-shadow:
    0 6px 15px rgba(58,84,148,0.25);
}

.self-pr {
  white-space: pre-wrap;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.8;
  color: #3c4a6e;
  background-color: #f5f7ff;
  border-radius: 12px;
  padding: 18px 24px;
  box-shadow: inset 2px 2px 6px #d7dff9;
  letter-spacing: 0.02em;
}

ul.project-list {
  list-style: disc inside;
  color: #455a86;
  font-size: 16px;
  font-weight: 500;
  padding-left: 20px;
  margin-top: 10px;
  line-height: 1.6;
}

/* 資格部分 横並び */
.cert-list {
  list-style: disc inside;
  padding-left: 20px;
  margin: 0;
  color: #455a86;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cert-list li {
  display: flex;
  justify-content: space-between;
  /* border-bottom: 1px solid #dde3ea; */
  padding-bottom: 6px;
}

.cert-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 75%;
}

.cert-date {
  flex-shrink: 0;
  color: #3c4a6e;
  font-weight: 600;
}

@media (max-width: 600px) {
  dl {
    grid-template-columns: 1fr;
    padding-left: 0;
  }
  .skills-list {
    grid-template-columns: repeat(auto-fit,minmax(120px,1fr));
  }
}

@media (max-width: 480px) {
  .cert-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .cert-status {
    max-width: 100%;
  }
}
</style>
