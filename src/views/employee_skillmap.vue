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
      <h1>スキル分析画面</h1>

      <!-- 個別分析 -->
      <section aria-label="個別従業員スキル分析">
        <h2>個別スキル分析</h2>

        <div class="select-group" role="region" aria-label="個別従業員選択">
          <select v-model="selectedEmployee1" :disabled="isLoading || employees.length === 0">
            <option value="">--選択--</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
        </div>

        <!-- 加载指示器 -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <p>データを読み込んでいます...</p>
        </div>
        
        <!-- 基本情報 -->
        <dl class="basic-info" v-else-if="currentEmployee">
          <dt>氏名</dt>
          <dd>{{ currentEmployee.name }}</dd>
          <dt>部署</dt>
          <dd>{{ currentEmployee.department }}</dd>
          <dt>役職</dt>
          <dd>{{ currentEmployee.position }}</dd>
          <dt v-if="currentEmployee.experience !== undefined">仕事年数</dt>
          <dd v-if="currentEmployee.experience !== undefined">{{ currentEmployee.experience }}年</dd>
          <dt v-if="currentEmployee.gender">性別</dt>
          <dd v-if="currentEmployee.gender">{{ currentEmployee.gender }}</dd>
        </dl>

        <h3>カテゴリ別平均スキルレベル</h3>
        <div class="chart-container">
          <BarChart v-if="categoryBarChartData && categoryBarChartData.labels && categoryBarChartData.labels.length > 0" :chartData="categoryBarChartData" :chartOptions="barChartOptions" />
          <div v-else-if="!isLoading && selectedEmployee1" class="no-data">
            表示するスキルデータがありません
          </div>
        </div>

        <h3>上位スキルレーダーチャート</h3>
        <div class="chart-container">
          <RadarChart v-if="topSkillsRadarData && topSkillsRadarData.labels && topSkillsRadarData.labels.length > 0" :chartData="topSkillsRadarData" :chartOptions="radarChartOptions" />
          <div v-else-if="!isLoading && selectedEmployee1" class="no-data">
            表示するスキルデータがありません
          </div>
        </div>
      </section>

      <!-- 複数比較 -->
      <section aria-label="複数従業員スキル比較">
        <h2>複数従業員比較（最大3名）</h2>

        <div class="select-group" role="region" aria-label="複数従業員選択">
          <select v-model="selectedEmployee2" :disabled="isLoading || employees.length === 0">
            <option value="">--選択--</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
          <select v-model="selectedEmployee3" :disabled="isLoading || employees.length === 0">
            <option value="">--選択--</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
          <select v-model="selectedEmployee4" :disabled="isLoading || employees.length === 0">
            <option value="">--選択--</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
        </div>

        <h3>カテゴリ別平均スキルレベル比較</h3>
        <div class="chart-container">
          <BarChart v-if="multiCategoryBarData && multiCategoryBarData.labels && multiCategoryBarData.labels.length > 0" :chartData="multiCategoryBarData" :chartOptions="barChartOptions" />
          <div v-else-if="!isLoading" class="no-data">
            比較する従業員を選択してください
          </div>
        </div>

        <h3>主要スキルレーダーチャート比較</h3>
        <div class="chart-container">
          <RadarChart v-if="multiTopSkillsRadarData && multiTopSkillsRadarData.labels && multiTopSkillsRadarData.labels.length > 0" :chartData="multiTopSkillsRadarData" :chartOptions="radarChartOptions" />
          <div v-else-if="!isLoading" class="no-data">
            比較する従業員を選択してください
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, h } from "vue";
import { Chart as ChartJS, Title, Tooltip, Legend, RadialLinearScale, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";
import { Bar, Radar } from "vue-chartjs";
import request from '@/utils/request'
import { logoutAndRedirect } from '@/utils/auth'

ChartJS.register(Title, Tooltip, Legend, RadialLinearScale, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler);

// 安全なバーチャートコンポーネント（ランタイムテンプレート非依存のレンダー関数版）
const SafeBarChart = {
  name: 'SafeBarChart',
  props: {
    chartData: { type: Object, required: true, default: () => ({ labels: [], datasets: [] }) },
    chartOptions: { type: Object, required: true, default: () => ({}) }
  },
  setup(props) {
    const chartKey = computed(() => JSON.stringify(props.chartData));
    const validChartData = computed(() => {
      if (!props.chartData) return { labels: [], datasets: [] };
      const labels = Array.isArray(props.chartData.labels) ? props.chartData.labels : [];
      const datasets = Array.isArray(props.chartData.datasets) ? props.chartData.datasets : [];
      return { labels, datasets };
    });
    return () => h('div', { class: 'safe-chart-container' }, [
      h(Bar, { key: chartKey.value, data: validChartData.value, options: props.chartOptions })
    ]);
  }
};

// 安全なレーダーチャートコンポーネント（レンダー関数版）
const SafeRadarChart = {
  name: 'SafeRadarChart',
  props: {
    chartData: { type: Object, required: true, default: () => ({ labels: [], datasets: [] }) },
    chartOptions: { type: Object, required: true, default: () => ({}) }
  },
  setup(props) {
    const chartKey = computed(() => JSON.stringify(props.chartData));
    const validChartData = computed(() => {
      if (!props.chartData) return { labels: [], datasets: [] };
      const labels = Array.isArray(props.chartData.labels) ? props.chartData.labels : [];
      const datasets = Array.isArray(props.chartData.datasets) ? props.chartData.datasets : [];
      return { labels, datasets };
    });
    return () => h('div', { class: 'safe-chart-container' }, [
      h(Radar, { key: chartKey.value, data: validChartData.value, options: props.chartOptions })
    ]);
  }
};

export default {
  name: "EmployeeSkillMap",
  components: {
    BarChart: SafeBarChart,
    RadarChart: SafeRadarChart
  },
  setup() {
    const employees = ref([]);
    const isLoading = ref(false);
    const skillAnalysisData = ref({});
    const multiEmployeeSkills = ref([]);
    
    const selectedEmployee1 = ref("");
    const selectedEmployee2 = ref("");
    const selectedEmployee3 = ref("");
    const selectedEmployee4 = ref("");
    
    // 获取员工数据
    const fetchEmployees = async () => {
      try {
        isLoading.value = true;
        const response = await request.post('/employee/search', {});
        console.log('取得した従業員データ:', response);
        // 修正：从response.data.list或response.list中提取员工数据
        employees.value = response?.data?.list || response?.list || [];
        
        // 设置默认选中的员工
        if (employees.value.length > 0) {
          selectedEmployee1.value = employees.value[0].id;
          if (employees.value.length > 1) {
            selectedEmployee2.value = employees.value[1].id;
          }
          if (employees.value.length > 2) {
            selectedEmployee3.value = employees.value[2].id;
          }
        }
      } catch (error) {
        console.error('従業員データの取得エラー:', error.response?.data || error.message);
      } finally {
        isLoading.value = false;
      }
    };

    // 获取单个员工技能分析
    const fetchEmployeeSkillAnalysis = async (employeeId) => {
      if (!employeeId) {
        skillAnalysisData.value = {};
        return;
      }

      try {
        isLoading.value = true;
        const response = await request.get(`/employee/skill-analysis/by-employee/${employeeId}`);
        console.log('単一従業員のスキル分析データ:', response);
        // レスポンスデータの構造を確認し、チャートデータに適した形式に変換
        // 注意：axios响应拦截器已经返回了res.data（实际业务数据），所以response就是我们需要的数据
        skillAnalysisData.value = response || {};
        console.log('设置后的skillAnalysisData.value:', skillAnalysisData.value);
        console.log('skillAnalysisData.value.skills:', skillAnalysisData.value.skills);
      } catch (error) {
        console.error('単一従業員スキル分析の取得エラー:', error.response?.data || error.message);
        skillAnalysisData.value = {};
      } finally {
        isLoading.value = false;
      }
    };

    // 获取多个员工技能比较
    const fetchMultiEmployeeSkills = async () => {
      const employeeIds = [selectedEmployee2.value, selectedEmployee3.value, selectedEmployee4.value].filter(id => id);
      if (employeeIds.length === 0) {
        multiEmployeeSkills.value = [];
        return;
      }

      try {
        isLoading.value = true;
        const response = await request.post('/employee/skill-analysis/by-employees', { employeeIds });
        console.log('複数従業員のスキル比較データ:', response);
        // レスポンスデータの構造を確認し、チャートデータに適した形式に変換
        // 注意：axios响应拦截器已经返回了res.data（实际业务数据），所以response就是我们需要的数据
        multiEmployeeSkills.value = response || [];
        console.log('设置后的multiEmployeeSkills.value:', multiEmployeeSkills.value);
      } catch (error) {
        console.error('複数従業員スキル比較の取得エラー:', error.response?.data || error.message);
        multiEmployeeSkills.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // 组件挂载时获取数据
    onMounted(() => {
      fetchEmployees();
    });
    
    // ログアウト処理
    const logout = () => {
      logoutAndRedirect();
    };

    const currentEmployee = computed(() => {
      if (!employees.value || !selectedEmployee1.value) return null;
      return employees.value.find(emp => emp.id === selectedEmployee1.value) || null;
    });

    // 個別チャートデータ - 使用后端API数据
    const categoryBarChartData = computed(() => {
      if (!skillAnalysisData.value || !skillAnalysisData.value.categoryAverage) {
        return { labels: [], datasets: [] };
      }
      
      const { categoryAverage, employee } = skillAnalysisData.value;
      
      const labels = Object.keys(categoryAverage);
      const data = labels.map(category => categoryAverage[category]);
      
      return {
        labels,
        datasets: [{
          label: employee?.name || '社員' + ' のスキルレベル',
          data,
          backgroundColor: 'rgba(63,108,237,0.6)',
          borderColor: 'rgba(63,108,237,1)',
          borderWidth: 1
        }]
      };
    });

    const topSkillsRadarData = computed(() => {
      if (!skillAnalysisData.value || !skillAnalysisData.value.skills || !Array.isArray(skillAnalysisData.value.skills)) {
        return { labels: [], datasets: [] };
      }
      
      // スキルレベルが3以上のものを取得し、上位10個までを表示
      const topSkills = skillAnalysisData.value.skills
        .filter(skill => skill.level >= 3)
        .sort((a, b) => b.level - a.level)
        .slice(0, 10);
      
      const labels = topSkills.map(skill => skill.name);
      const data = topSkills.map(skill => skill.level);
      
      return {
        labels,
        datasets: [{
          label: skillAnalysisData.value.employee?.name || '社員' + ' の主要スキル',
          data,
          backgroundColor: 'rgba(63,108,237,0.2)',
          borderColor: 'rgba(63,108,237,0.8)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(63,108,237,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(63,108,237,1)'
        }]
      };
    });

    // 複数比較チャートデータ - 使用后端API数据
    const multiCategoryBarData = computed(() => {
      if (!multiEmployeeSkills.value || !Array.isArray(multiEmployeeSkills.value)) {
        return { labels: [], datasets: [] };
      }
      
      const validEmployees = multiEmployeeSkills.value.filter(emp => emp.skills && Array.isArray(emp.skills));
      if (validEmployees.length === 0) return { labels: [], datasets: [] };
      
      // スキルカテゴリを判断するヘルパー関数
      const skillMap = {};
      validEmployees.flatMap(emp => emp.skills).forEach(s => skillMap[s.name] = Math.max(skillMap[s.name]||0,s.level));
      const topSkills = Object.entries(skillMap).sort((a,b)=>b[1]-a[1]).slice(0,15).map(s=>s[0]);
      
      const datasets = validEmployees.map((emp,idx)=>({
        label: emp.name,
        data: topSkills.map(name => {
          const skill = emp.skills.find(s=>s.name===name);
          return skill ? skill.level : 0;
        }),
        backgroundColor: ["rgba(63,108,237,0.3)","rgba(234,91,91,0.3)","rgba(91,192,222,0.3)"][idx % 3],
        borderColor: ["rgba(63,108,237,0.7)","rgba(234,91,91,0.7)","rgba(91,192,222,0.7)"][idx % 3],
        fill: true
      }));
      
      return { labels: topSkills, datasets };
    });

    // 缺少的multiTopSkillsRadarData计算属性
    const multiTopSkillsRadarData = computed(() => {
      if (!multiEmployeeSkills.value || !Array.isArray(multiEmployeeSkills.value)) {
        return { labels: [], datasets: [] };
      }
      
      const validEmployees = multiEmployeeSkills.value.filter(emp => emp.skills && Array.isArray(emp.skills));
      if (validEmployees.length === 0) return { labels: [], datasets: [] };
      
      // 收集所有员工的技能并找出共同的主要技能
      const skillMap = {};
      validEmployees.flatMap(emp => emp.skills).forEach(s => {
        if (s.level >= 3) { // 只考虑3级以上的技能
          skillMap[s.name] = (skillMap[s.name] || 0) + 1;
        }
      });
      
      // 选择出现在多个员工中的技能或最常见的技能
      const commonSkills = Object.entries(skillMap)
        .filter(([, count]) => count >= 1) // 只解构需要的count参数，忽略name
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8) // 限制最多8个技能
        .map(([name]) => name);
      
      if (commonSkills.length === 0) return { labels: [], datasets: [] };
      
      const datasets = validEmployees.map((emp, idx) => ({
        label: emp.name,
        data: commonSkills.map(name => {
          const skill = emp.skills.find(s => s.name === name);
          return skill ? skill.level : 0;
        }),
        backgroundColor: [`rgba(63,108,237,${0.1 + idx * 0.1})`, `rgba(234,91,91,${0.1 + idx * 0.1})`, `rgba(91,192,222,${0.1 + idx * 0.1})`][idx % 3],
        borderColor: [`rgba(63,108,237,${0.6 + idx * 0.1})`, `rgba(234,91,91,${0.6 + idx * 0.1})`, `rgba(91,192,222,${0.6 + idx * 0.1})`][idx % 3],
        borderWidth: 2,
        pointBackgroundColor: [`rgba(63,108,237,1)`, `rgba(234,91,91,1)`, `rgba(91,192,222,1)`][idx % 3],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: [`rgba(63,108,237,1)`, `rgba(234,91,91,1)`, `rgba(91,192,222,1)`][idx % 3]
      }));
      
      return { labels: commonSkills, datasets };
    });

    const barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero:true, max:7, ticks:{ stepSize:1 } }, x:{ title:{ display:true, text:"カテゴリ" } } },
      plugins: { legend:{ display:true } }
    };

    const radarChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { beginAtZero:true, min:0, max:7, ticks:{ stepSize:1 }, pointLabels:{ font:{ size:14, weight:"600" } } } },
      plugins: { legend:{ position:"top" } }
    };

    // チャートデータのログ追加
    watch(categoryBarChartData, (newData) => {
      console.log('カテゴリバーチャートデータ:', newData);
    }, { deep: true });

    watch(topSkillsRadarData, (newData) => {
      console.log('主要スキルレーダーチャートデータ:', newData);
    }, { deep: true });

    watch(multiCategoryBarData, (newData) => {
      console.log('複数比較カテゴリバーチャートデータ:', newData);
    }, { deep: true });

    watch(multiTopSkillsRadarData, (newData) => {
      console.log('複数比較主要スキルレーダーチャートデータ:', newData);
    }, { deep: true });

    // 监听员工选择变化，更新技能分析数据
    watch(selectedEmployee1, (newValue) => {
      if (newValue) {  // 只有选择了员工才调用
      fetchEmployeeSkillAnalysis(newValue);
      }
    });
    
    // 监听多个员工选择变化，更新技能比较数据
    watch([selectedEmployee2, selectedEmployee3, selectedEmployee4], () => {
      const employeeIds = [selectedEmployee2.value, selectedEmployee3.value, selectedEmployee4.value].filter(id => id);
      if (employeeIds.length > 0) {  // 只有至少选择一个员工才调用
      fetchMultiEmployeeSkills();
      }
    });

    return {
      employees,
      selectedEmployee1,
      selectedEmployee2,
      selectedEmployee3,
      selectedEmployee4,
      currentEmployee,
      categoryBarChartData,
      topSkillsRadarData,
      multiCategoryBarData,
      multiTopSkillsRadarData,
      barChartOptions,
      radarChartOptions,
      isLoading,
      logout
    };
  }
};
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

.main-nav li { margin: 0; }

.main-nav a, .main-nav a.router-link-active {
  display: block;
  padding: 16px 24px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.3s ease;
  height: 20px;   /* ← 他ボタンと同じ高さに統一 */
}

.main-nav a:hover { background-color: #143a6e; }
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
  padding: 40px 20px;
  font-style: italic;
  font-size: 16px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

/* 安全チャートコンテナ（削除済み・下部に統合） */
.container {
  max-width: 1000px;
  margin: 50px auto 100px;
  padding: 30px 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  color: #2e3a59;
}

h1,h2,h3 {
  text-align: center;
  color: #1f2e4a;
  margin-bottom: 30px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.select-group { text-align: center; margin-bottom: 30px; }

select {
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 280px;
  max-width: 90%;
  cursor: pointer;
}

dl.basic-info {
  max-width: 600px;
  margin: 0 auto 40px;
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px 20px;
  color: #455a86;
  font-size: 16px;
  font-weight: 500;
}

dl.basic-info dt {
  font-weight: 700;
  color: #344a91;
  padding-top: 4px;
  text-align: right;
  user-select: none;
}

dl.basic-info dd {
  margin: 0;
  white-space: pre-wrap;
  font-weight: 500;
  color: #2e3a59;
  word-break: break-word;
}

.chart-container {
  max-width: 700px;
  height: 400px;
  margin: 0 auto 50px;
  position: relative;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.safe-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.safe-chart-container canvas {
  display: block !important;
  max-width: 100%;
  max-height: 100%;
}

/* レスポンシブ */
@media (max-width: 700px) {
  dl.basic-info { grid-template-columns: 1fr; max-width: 90%; }
  dl.basic-info dt { text-align: left; }
  .chart-container { max-width: 100%; padding: 0 10px; }
}
</style>
