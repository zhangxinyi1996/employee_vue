<template>
  <div>
    <!-- 共通ナビメニュー -->
    <nav class="main-nav">
      <ul>
        <li><router-link to="/top">ホーム</router-link></li>
        <li><router-link to="/employee_infoshow">基本情報</router-link></li>
        <li><router-link to="/employee_skillmap">スキル分析</router-link></li>
        <li><router-link to="/employee_search">人材管理</router-link></li>
        <li><router-link to="/itexchange_area">技談広場</router-link></li>
        <li><router-link to="/exchange_area">縁談広場</router-link></li>
        <li class="logout"><a href="#" @click.prevent="logout">ログアウト</a></li>
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

        <label for="departmentSelect">部署</label>
        <select id="departmentSelect" v-model="department">
          <option value="">指定なし</option>
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
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
        検索結果：{{ pagination.total }} 件
      </div>

      <div v-if="isLoading" class="loading-indicator">
        <div class="loading-spinner"></div>
        <p>検索中...</p>
      </div>
      <table v-else aria-label="検索結果テーブル">
        <thead>
          <tr>
            <th>氏名</th>
            <th>部署</th>
            <th>役職</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredEmployees.length === 0">
            <td colspan="4" class="no-data">検索結果がありません</td>
          </tr>
          <tr v-for="emp in filteredEmployees" :key="emp.id">
            <td>{{ emp.name }}</td>
            <td>{{ emp.department }}</td>
            <td>{{ emp.position }}</td>
            <td>
              <button type="button" class="info-btn" @click="openModal(emp)">詳細</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页组件 -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <div class="pagination-info">
          全 {{ pagination.total }} 件中 {{ (pagination.page - 1) * pagination.pageSize + 1 }} - {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 件を表示
        </div>
        <div class="pagination-controls">
          <button 
            class="page-btn" 
            :disabled="pagination.page === 1" 
            @click="changePage(1)"
            title="最初のページ"
          >
            ≪
          </button>
          <button 
            class="page-btn" 
            :disabled="pagination.page === 1" 
            @click="changePage(pagination.page - 1)"
            title="前のページ"
          >
            ＜
          </button>
          
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="page-btn page-number" 
            :class="{ active: page === pagination.page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          
          <button 
            class="page-btn" 
            :disabled="pagination.page === pagination.totalPages" 
            @click="changePage(pagination.page + 1)"
            title="次のページ"
          >
            ＞
          </button>
          <button 
            class="page-btn" 
            :disabled="pagination.page === pagination.totalPages" 
            @click="changePage(pagination.totalPages)"
            title="最後のページ"
          >
            ≫
          </button>
          
          <span class="page-jump">
            ページへ移動:
            <input 
              type="number" 
              v-model.number="jumpPage" 
              min="1" 
              :max="pagination.totalPages"
              @keyup.enter="jumpToPage"
            />
            <button class="page-btn" @click="jumpToPage">移動</button>
          </span>
          
          <select v-model.number="pagination.pageSize" @change="changePageSize" class="page-size-select">
            <option :value="10">10件/ページ</option>
            <option :value="20">20件/ページ</option>
            <option :value="50">50件/ページ</option>
            <option :value="100">100件/ページ</option>
          </select>
        </div>
      </div>
    </div>

    <!-- モーダル -->
    <div class="modal" :class="{ active: isModalActive }" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalDesc">
      <div class="modal-content">
        <button type="button" class="modal-close-btn" aria-label="閉じる" @click="closeModal">&times;</button>
        <h2 id="modalTitle">社員詳細情報</h2>
        <div class="detail-grid">
          <div v-for="(value, key) in modalEmployeeInfo" :key="key" class="detail-item">
            <div class="detail-label">{{ key }}</div>
            <div class="detail-value" v-if="Array.isArray(value)">
              <ul>
                <li v-for="(v, i) in value" :key="i">{{ v }}</li>
              </ul>
            </div>
            <div class="detail-value" v-else>{{ value || '未設定' }}</div>
          </div>
        </div>
        <div id="modalDesc" class="visually-hidden">
          従業員の基本情報の詳細を表示しています。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { logoutAndRedirect } from '@/utils/auth'
import request from '@/utils/request'
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
      department: '',
      employees: [],
      departments: [],
      isLoading: false,
      isModalActive: false,
      modalEmployeeInfo: {},
      // 分页相关
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
      },
      jumpPage: 1
    }
  },
  computed: {
    filteredSkills() {
      const allSkillsMap = new Map();
      this.employees.forEach(emp => {
        if (emp && emp.skills && Array.isArray(emp.skills)) {
          emp.skills.forEach(s => {
            if (this.selectedCategory === 'all' || s.category === this.selectedCategory) {
              allSkillsMap.set(s.name, s);
            }
          });
        }
      });
      return Array.from(allSkillsMap.values()).sort((a,b) => a.name.localeCompare(b.name));
    },
    filteredEmployees() {
      // 直接返回后端分页数据
      return this.employees;
    },
    // 计算可见的页码
    visiblePages() {
      const pages = [];
      const total = this.pagination.totalPages;
      const current = this.pagination.page;
      
      if (total <= 7) {
        // 总页数小于等于7，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // 总页数大于7，智能显示
        if (current <= 4) {
          // 当前页在前面
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          // 当前页在后面
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          // 当前页在中间
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    }
  },
  created() {
    // 初始化部门列表
    this.fetchDepartments();
  },
  methods: {
    // 获取部门列表
    async fetchDepartments() {
      try {
        // 从employees数据中提取不重复的部门名称
        const departmentsSet = new Set();
        this.employees.forEach(emp => {
          if (emp && emp.department) {
            departmentsSet.add(emp.department);
          }
        });
        this.departments = Array.from(departmentsSet).sort();
      } catch (error) {
        console.error('部署リストの取得エラー:', error);
      }
    },
    calcAge(birthYear) {
      const now = new Date();
      // 添加安全检查，确保birthYear是有效的数字
      if (!birthYear || isNaN(birthYear)) {
        return ''; // 如果birthYear无效，返回空字符串
      }
      return now.getFullYear() - birthYear;
    },
    async onSearch(resetPage = true) {
      try {
        this.isLoading = true;
        // 重置页码（新搜索时）
        if (resetPage) {
          this.pagination.page = 1;
        }
        
        // 构建查询参数（包含分页）
        const searchParams = {
          category: this.selectedCategory === 'all' ? '' : this.selectedCategory,
          skills: this.selectedSkills,
          techLevel: this.techLevel,
          techExpYears: this.techExpYears,
          gender: this.gender,
          minAge: this.minAge,
          maxAge: this.maxAge,
          minExperience: this.minExperience,
          maxExperience: this.maxExperience,
          department: this.department,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        };
        
        // 发送请求到后端
        const response = await request.post('/employee/search', searchParams);
        
        // 更新员工数据和分页信息
        if (response) {
          this.employees = response.list || [];
          this.pagination.total = response.total || 0;
          this.pagination.page = response.page || 1;
          this.pagination.pageSize = response.pageSize || 10;
          this.pagination.totalPages = response.totalPages || 0;
        } else {
          this.employees = [];
          this.pagination.total = 0;
        }
        
        // 更新部门列表
        this.fetchDepartments();
      } catch (error) {
        console.error('検索エラー:', error);
        alert('検索に失敗しました。\n' + (error.response?.data?.message || 'エラーが発生しました'));
      } finally {
        this.isLoading = false;
      }
    },
    // 切换页码
    changePage(page) {
      if (page === '...' || page < 1 || page > this.pagination.totalPages) return;
      this.pagination.page = page;
      this.onSearch(false); // 不重置页码
    },
    // 改变每页显示数量
    changePageSize() {
      this.pagination.page = 1; // 重置到第一页
      this.onSearch(false);
    },
    // 跳转到指定页
    jumpToPage() {
      if (this.jumpPage < 1 || this.jumpPage > this.pagination.totalPages) {
        alert(`ページ番号は 1 から ${this.pagination.totalPages} の間で入力してください`);
        return;
      }
      this.changePage(this.jumpPage);
    },
    async openModal(emp) {
      try {
        this.isLoading = true;
        // 请求员工详情
        const response = await request.get(`/employee/detail/${emp.id}`);
        const employee = response || emp; // 如果请求失败，使用表格中的数据
        
        // 构建模态框显示的信息
        // 直接使用employee对象，因为后端返回的数据没有basicInfo嵌套结构
        this.modalEmployeeInfo = { ...employee };
        // 移除不需要直接显示的嵌套对象
        delete this.modalEmployeeInfo.qualifications;
        delete this.modalEmployeeInfo.projects;
        // 如果有资格证书信息，添加到模态框数据中
        if (employee.qualifications && employee.qualifications.length > 0) this.modalEmployeeInfo['資格'] = employee.qualifications;
        // 如果有项目经验信息，添加到模态框数据中
        if (employee.projects && employee.projects.length > 0) this.modalEmployeeInfo['プロジェクト経験'] = employee.projects.map(p => `${p.name} （${p.period}） - 役割: ${p.role}`);
        this.isModalActive = true;
      } catch (error) {
        console.error('詳細取得エラー:', error);
        // 如果详情请求失败，尝试使用表格中已有的数据
        this.modalEmployeeInfo = { ...emp };
        // 移除不需要直接显示的嵌套对象
        delete this.modalEmployeeInfo.qualifications;
        delete this.modalEmployeeInfo.projects;
        // 如果有资格证书信息，添加到模态框数据中
        if (emp.qualifications && emp.qualifications.length > 0) this.modalEmployeeInfo['資格'] = emp.qualifications;
        // 如果有项目经验信息，添加到模态框数据中
        if (emp.projects && emp.projects.length > 0) this.modalEmployeeInfo['プロジェクト経験'] = emp.projects.map(p => `${p.name} （${p.period}） - 役割: ${p.role}`);
        this.isModalActive = true;
        alert('詳細情報の取得に失敗しましたが、基本情報を表示します。');
      } finally {
        this.isLoading = false;
      }
    },
    closeModal() {
      this.isModalActive = false;
    },
    logout() {
     logoutAndRedirect(this.$router)
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

    /* 加载指示器 */
    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #1a4f9c;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e7ff;
      border-top: 4px solid #1a4f9c;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* 无数据提示 */
    .no-data {
      text-align: center;
      color: #777;
      padding: 40px 20px !important;
      font-style: italic;
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
      max-width: 900px;
      margin: 0 auto;
      border-radius: 16px;
      padding: 40px 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: relative;
      font-size: 15px;
      color: #2e3a59;
      line-height: 1.7;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-close-btn {
      position: absolute;
      top: 18px;
      right: 22px;
      font-size: 32px;
      font-weight: 700;
      color: #999;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s ease, transform 0.2s ease;
    }

    .modal-close-btn:hover {
      color: #1a4f9c;
      transform: rotate(90deg);
    }

    .modal-content h2 {
      margin-top: 0;
      margin-bottom: 30px;
      font-weight: 700;
      color: #1a4f9c;
      letter-spacing: 0.08em;
      font-size: 26px;
      text-align: center;
      padding-bottom: 15px;
      border-bottom: 3px solid #1a4f9c;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 20px;
      margin-top: 10px;
    }

    .detail-item {
      background: linear-gradient(145deg, #f8faff, #eef3ff);
      border: 2px solid #d0daf5;
      border-radius: 10px;
      padding: 16px 20px;
      box-shadow: 
        3px 3px 6px rgba(26, 79, 156, 0.1),
        -2px -2px 6px rgba(255, 255, 255, 0.9);
      transition: all 0.3s ease;
    }

    .detail-item:hover {
      border-color: #1a4f9c;
      box-shadow: 
        4px 4px 10px rgba(26, 79, 156, 0.2),
        -3px -3px 8px rgba(255, 255, 255, 1);
      transform: translateY(-2px);
    }

    .detail-label {
      font-weight: 700;
      color: #1a4f9c;
      font-size: 14px;
      margin-bottom: 8px;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
    }

    .detail-label::before {
      content: '■';
      margin-right: 8px;
      color: #1a4f9c;
      font-size: 12px;
    }

    .detail-value {
      color: #2e3a59;
      font-weight: 500;
      font-size: 15px;
      white-space: pre-wrap;
      word-break: break-word;
      padding-left: 20px;
    }

    .detail-value ul {
      margin: 0;
      padding-left: 20px;
      list-style: circle;
    }

    .detail-value ul li {
      margin-bottom: 6px;
      line-height: 1.6;
    }

    /* 自己PR等の長いテキスト用 */
    .detail-item:has(.detail-label:contains('自己PR')),
    .detail-item:has(.detail-label:contains('住所')) {
      grid-column: 1 / -1;
    }

    @media (max-width: 900px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
      
      .modal-content {
        padding: 30px 25px;
        max-width: 95%;
      }
    }

    @media (max-width: 600px) {
      form {
        grid-template-columns: 1fr 1fr;
      }
      
      .detail-item {
        padding: 12px 16px;
      }
      
      .modal-content h2 {
        font-size: 22px;
      }
    }

    @media (max-width: 400px) {
      form {
        grid-template-columns: 1fr;
      }
    }

    /* 分页样式 */
    .pagination-container {
      margin-top: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f8faff, #ffffff);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .pagination-info {
      text-align: center;
      color: #2e3a59;
      font-weight: 500;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .page-btn {
      min-width: 40px;
      height: 40px;
      padding: 8px 12px;
      border: 2px solid #d0daf5;
      background: white;
      color: #2e3a59;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .page-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #1a4f9c, #2d6cb8);
      color: white;
      border-color: #1a4f9c;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(26, 79, 156, 0.3);
    }

    .page-btn:disabled {
      background: #f5f5f5;
      color: #ccc;
      cursor: not-allowed;
      border-color: #e0e0e0;
    }

    .page-btn.page-number.active {
      background: linear-gradient(135deg, #1a4f9c, #2d6cb8);
      color: white;
      border-color: #1a4f9c;
      box-shadow: 0 4px 10px rgba(26, 79, 156, 0.4);
    }

    .page-jump {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 15px;
      color: #2e3a59;
      font-size: 14px;
      font-weight: 500;
    }

    .page-jump input {
      width: 60px;
      height: 40px;
      padding: 8px;
      border: 2px solid #d0daf5;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      transition: border-color 0.3s ease;
    }

    .page-jump input:focus {
      outline: none;
      border-color: #1a4f9c;
      box-shadow: 0 0 0 3px rgba(26, 79, 156, 0.1);
    }

    .page-size-select {
      height: 40px;
      padding: 8px 12px;
      border: 2px solid #d0daf5;
      border-radius: 8px;
      background: white;
      color: #2e3a59;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      margin-left: 15px;
      transition: all 0.3s ease;
    }

    .page-size-select:hover {
      border-color: #1a4f9c;
    }

    .page-size-select:focus {
      outline: none;
      border-color: #1a4f9c;
      box-shadow: 0 0 0 3px rgba(26, 79, 156, 0.1);
    }

    /* 分页响应式 */
    @media (max-width: 768px) {
      .pagination-controls {
        gap: 5px;
      }

      .page-btn {
        min-width: 35px;
        height: 35px;
        padding: 6px 10px;
        font-size: 13px;
      }

      .page-jump {
        margin-left: 5px;
        font-size: 13px;
      }

      .page-jump input {
        width: 50px;
        height: 35px;
      }

      .page-size-select {
        height: 35px;
        font-size: 13px;
        margin-left: 5px;
      }
    }

    @media (max-width: 480px) {
      .pagination-controls {
        flex-direction: column;
        gap: 10px;
      }

      .page-jump,
      .page-size-select {
        margin-left: 0;
      }
    }
</style>
