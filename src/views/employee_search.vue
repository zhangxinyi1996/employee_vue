<template>
  <div>
    <!-- 共通ナビメニュー -->
    <nav class="main-nav">
      <ul>
         <li><router-link to="/top">ホーム</router-link></li>
        <li><router-link to="/employee_infoshow">基本情報</router-link></li>
        <li><router-link to="/employee_skillmap">スキル分析</router-link></li>
        <li><router-link to="/employee_search">人材管理</router-link></li>
        <li><router-link to="/itexchange_area">技術交流モジュール</router-link></li>
         <li><router-link to="/exchange_area">交流エリア</router-link></li>
         <!-- ログアウトを右端に -->
        <li class="logout"><a href="/logout">ログアウト</a></li>
      </ul>
    </nav>

    <div class="container">
      <h1>人材管理 - 従業員検索</h1>

      <form @submit.prevent="onSearch">
        <label for="skillCategory">技術カテゴリ</label>
        <select id="skillCategory" v-model="selectedCategory">
          <option value="all">すべて</option>
          <option value="language">プログラミング言語</option>
          <option value="framework">フレームワーク</option>
          <option value="cloud">クラウド</option>
          <option value="tools">ツール</option>
          <option value="other">その他スキル</option>
        </select>

        <label>技術スキル（複数選択可）</label>
        <div class="skill-filters" role="group" aria-label="技術スキル選択">
          <label v-for="skill in filteredSkills" :key="skill.name">
            <input type="checkbox" v-model="selectedSkills" :value="skill.name" /> {{ skill.name }}
          </label>
          <span v-if="filteredSkills.length === 0">該当する技術スキルがありません。</span>
        </div>

        <label for="techLevelSelect">技術レベル</label>
        <select id="techLevelSelect" v-model="techLevel">
          <option value="">指定なし</option>
          <option value="初級">初級</option>
          <option value="中級">中級</option>
          <option value="上級">上級</option>
          <option value="エキスパート">エキスパート</option>
        </select>

        <label for="techExpYears">技術経験年数（最小）</label>
        <input type="number" id="techExpYears" v-model.number="techExpYears" min="0" max="50" />

        <label for="genderSelect">性別</label>
        <select id="genderSelect" v-model="gender">
          <option value="">指定なし</option>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
          <option value="その他">その他</option>
        </select>

        <label for="minAge">年齢（最小）</label>
        <input type="number" id="minAge" v-model.number="minAge" min="18" max="100" />

        <label for="maxAge">年齢（最大）</label>
        <input type="number" id="maxAge" v-model.number="maxAge" min="18" max="100" />

        <label for="minExperience">仕事年数（最小）</label>
        <input type="number" id="minExperience" v-model.number="minExperience" min="0" max="50" />

        <label for="maxExperience">仕事年数（最大）</label>
        <input type="number" id="maxExperience" v-model.number="maxExperience" min="0" max="50" />

        <button type="submit">検索</button>
      </form>

      <div id="resultCount" aria-live="polite" aria-atomic="true">
        検索結果：{{ filteredEmployees.length }} 件（上位10件まで表示）
      </div>

      <table aria-label="検索結果テーブル">
        <thead>
          <tr>
            <th>氏名</th>
            <th>部署</th>
            <th>役職</th>
            <th>性別</th>
            <th>年齢</th>
            <th>仕事年数</th>
            <th>技術スキル</th>
            <th>詳細</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredEmployees.length === 0">
            <td colspan="8" style="text-align:center; color:#777;">
              条件に一致する従業員は見つかりませんでした。
            </td>
          </tr>
          <tr v-for="emp in topFilteredEmployees" :key="emp.id">
            <td>{{ emp.name }}</td>
            <td>{{ emp.department }}</td>
            <td>{{ emp.position }}</td>
            <td>{{ emp.gender }}</td>
            <td>{{ calcAge(emp.birthYear) }}</td>
            <td>{{ emp.experience }}</td>
            <td>{{ emp.skills.map(s => s.name).join(', ') }}</td>
            <td>
              <button type="button" class="info-btn" @click="openModal(emp)">詳細</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- モーダル -->
    <div class="modal" :class="{ active: isModalActive }" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalDesc">
      <div class="modal-content">
        <button type="button" class="modal-close-btn" aria-label="閉じる" @click="closeModal">&times;</button>
        <h2 id="modalTitle">基本情報</h2>
        <dl class="basic-info">
          <template v-for="(value, key) in modalEmployeeInfo" :key="key">
            <dt>{{ key }}</dt>
            <dd v-if="Array.isArray(value)">
              <ul>
                <li v-for="(v, i) in value" :key="i">{{ v }}</li>
              </ul>
            </dd>
            <dd v-else>{{ value }}</dd>
          </template>
        </dl>
        <div id="modalDesc" class="visually-hidden">
          従業員の基本情報の詳細を表示しています。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeManagement',
  data() {
    return {
      selectedCategory: 'all',
      selectedSkills: [],
      techLevel: '',
      techExpYears: 0,
      gender: '',
      minAge: 18,
      maxAge: 70,
      minExperience: 0,
      maxExperience: 50,
      employees: [
        {
          id: 'tanaka',
          name: '田中 一郎',
          birthYear: 1982,
          gender: '男性',
          experience: 13,
          department: '開発部',
          position: 'エンジニア',
          skills: [
            { name: 'Java', category: 'language', level: '上級', expYears: 8 },
            { name: 'Spring', category: 'framework', level: '中級', expYears: 6 },
            { name: 'MySQL', category: 'other', level: '上級', expYears: 9 }
          ],
          basicInfo: { /* 省略：先ほどのHTMLと同じ */ },
          qualifications: ['基本情報技術者（2015年）','応用情報技術者（2017年）','AWS認定ソリューションアーキテクト（2019年）'],
          projects: [{ name: '受注管理システム開発', period: '2018/4～2019/3', role: 'リードエンジニア' }]
        },
        {
          id: 'kobayashi',
          name: '小林 花子',
          birthYear: 1992,
          gender: '女性',
          experience: 5,
          department: '営業部',
          position: '営業担当',
          skills: [
            { name: '営業', category: 'other', level: '上級', expYears: 7 },
            { name: 'コミュニケーション', category: 'other', level: 'エキスパート', expYears: 10 }
          ],
          basicInfo: { /* 省略 */ },
          qualifications: ['宅地建物取引士（2016年）','販売士2級（2015年）'],
          projects: [{ name: '新規顧客開拓プロジェクト', period: '2019/5～2020/6', role: 'リーダー' }]
        }
      ],
      isModalActive: false,
      modalEmployeeInfo: {}
    }
  },
  computed: {
    filteredSkills() {
      const allSkillsMap = new Map();
      this.employees.forEach(emp => {
        emp.skills.forEach(s => {
          if (this.selectedCategory === 'all' || s.category === this.selectedCategory) {
            allSkillsMap.set(s.name, s);
          }
        });
      });
      return Array.from(allSkillsMap.values()).sort((a,b) => a.name.localeCompare(b.name));
    },
    filteredEmployees() {
      return this.employees.filter(emp => {
        const age = this.calcAge(emp.birthYear);

        if (this.gender && emp.gender !== this.gender) return false;
        if (age < this.minAge || age > this.maxAge) return false;
        if (emp.experience < this.minExperience || emp.experience > this.maxExperience) return false;

        // 技術スキル
        if (this.selectedSkills.length > 0) {
          const hasAnySkill = emp.skills.some(s => this.selectedSkills.includes(s.name));
          if (!hasAnySkill) return false;

          if (this.techLevel) {
            const matchLevel = emp.skills.some(s => this.selectedSkills.includes(s.name) && s.level === this.techLevel && s.expYears >= this.techExpYears);
            if (!matchLevel) return false;
          } else {
            const matchExp = emp.skills.some(s => this.selectedSkills.includes(s.name) && s.expYears >= this.techExpYears);
            if (!matchExp) return false;
          }
        } else {
          if (this.techExpYears > 0) {
            const hasExp = emp.skills.some(s => s.expYears >= this.techExpYears);
            if (!hasExp) return false;
          }
          if (this.techLevel) {
            const hasLevel = emp.skills.some(s => s.level === this.techLevel);
            if (!hasLevel) return false;
          }
        }

        return true;
      });
    },
    topFilteredEmployees() {
      return this.filteredEmployees.slice(0, 10);
    }
  },
  methods: {
    calcAge(birthYear) {
      const now = new Date();
      return now.getFullYear() - birthYear;
    },
    onSearch() {
      // Vueではcomputedで自動更新されるので処理不要
    },
    openModal(emp) {
      // 基本情報 + 資格 + プロジェクト
      this.modalEmployeeInfo = { ...emp.basicInfo };
      if (emp.qualifications && emp.qualifications.length > 0) this.modalEmployeeInfo['資格'] = emp.qualifications;
      if (emp.projects && emp.projects.length > 0) this.modalEmployeeInfo['プロジェクト経験'] = emp.projects.map(p => `${p.name} （${p.period}） - 役割: ${p.role}`);
      this.isModalActive = true;
    },
    closeModal() {
      this.isModalActive = false;
    }
  }
}
</script>

<style>
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
    .container {
      max-width: 960px;
      margin: 50px auto 100px;
      padding: 30px 40px;
      background-color: #fff;
      border-radius: 12px;
      box-shadow:
        0 2px 8px rgba(46, 58, 89, 0.1);
    }

    h1 {
      text-align: center;
      color: #1f2e4a;
      margin-bottom: 40px;
      font-weight: 700;
      letter-spacing: 0.1em;
      font-size: 28px;
    }

    form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px 30px;
      margin-bottom: 30px;
    }

    label {
      display: flex;
      flex-direction: column;
      font-weight: 600;
      color: #455a86;
      font-size: 15px;
      user-select: none;
    }

    select, input[type="number"], input[type="text"] {
      margin-top: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1.5px solid #c8d0e7;
      font-size: 15px;
      font-family: inherit;
      color: #2e3a59;
      outline-offset: 2px;
      transition: border-color 0.3s ease;
    }

    select:focus, input[type="number"]:focus, input[type="text"]:focus {
      border-color: #1a4f9c;
      box-shadow: 0 0 5px rgba(26,79,156,0.5);
    }

    .skill-filters {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 8px 12px;
      max-height: 150px;
      overflow-y: auto;
      padding: 10px 12px;
      border: 1.5px solid #c8d0e7;
      border-radius: 8px;
      background: linear-gradient(145deg, #f0f4ff, #d9e1ff);
      box-shadow:
        4px 4px 6px #bcc9f2,
        -4px -4px 6px #ffffff;
    }

    .skill-filters label {
      cursor: pointer;
      font-weight: 500;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #344a91;
      padding: 4px 6px;
      border-radius: 6px;
      transition: background-color 0.3s ease;
    }

    .skill-filters label:hover {
      background-color: #c3d1ff;
    }

    .skill-filters input[type="checkbox"] {
      transform: scale(1.1);
      cursor: pointer;
    }

    button[type="submit"] {
      grid-column: 1 / -1;
      padding: 14px 0;
      font-size: 18px;
      font-weight: 700;
      color: white;
      background-color: #1a4f9c;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 5px 10px rgba(26,79,156,0.6);
      transition: background-color 0.3s ease;
    }

    button[type="submit"]:hover {
      background-color: #143a6e;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
      color: #344a91;
    }

    th, td {
      border-bottom: 1px solid #dde3ea;
      padding: 10px 12px;
      text-align: left;
    }

    th {
      background-color: #f5f7ff;
      font-weight: 700;
    }

    tr:hover {
      background-color: #f0f4ff;
    }

    button.info-btn {
      padding: 6px 12px;
      background-color: #1a4f9c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.3s ease;
    }

    button.info-btn:hover {
      background-color: #143a6e;
    }

    #resultCount {
      margin-bottom: 16px;
      font-weight: 600;
      color: #1f2e4a;
      text-align: right;
    }

    /* モーダル */

    .modal {
      display: none;
      position: fixed;
      z-index: 2000;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.6);
      overflow-y: auto;
      padding: 40px 20px;
      box-sizing: border-box;
    }

    .modal.active {
      display: block;
    }

    .modal-content {
      background: white;
      max-width: 700px;
      margin: 0 auto;
      border-radius: 12px;
      padding: 30px 40px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      position: relative;
      font-size: 15px;
      color: #2e3a59;
      line-height: 1.6;
    }

    .modal-close-btn {
      position: absolute;
      top: 18px;
      right: 22px;
      font-size: 28px;
      font-weight: 700;
      color: #666;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s ease;
    }

    .modal-close-btn:hover {
      color: #1a4f9c;
    }

    .modal-content h2 {
      margin-top: 0;
      margin-bottom: 24px;
      font-weight: 700;
      color: #1f2e4a;
      letter-spacing: 0.06em;
      font-size: 22px;
      text-align: center;
    }

    dl.basic-info {
      display: grid;
      grid-template-columns: 140px 1fr;
      row-gap: 14px;
      column-gap: 24px;
    }

    dl.basic-info dt {
      font-weight: 700;
      color: #455a86;
    }

    dl.basic-info dd {
      margin: 0;
      white-space: pre-wrap;
      font-weight: 500;
      color: #344a91;
    }

    dl.basic-info dd ul {
      margin: 0;
      padding-left: 18px;
      list-style: disc;
    }

    dl.basic-info dd ul li {
      margin-bottom: 4px;
    }

    @media (max-width: 600px) {
      form {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 400px) {
      form {
        grid-template-columns: 1fr;
      }
    }
</style>
