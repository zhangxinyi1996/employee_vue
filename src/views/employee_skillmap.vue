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
      <h1>スキル分析画面</h1>

      <!-- 個別分析 -->
      <section aria-label="個別従業員スキル分析">
        <h2>個別スキル分析</h2>

        <div class="select-group" role="region" aria-label="個別従業員選択">
          <select v-model="selectedEmployee1">
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
        </div>

        <dl class="basic-info">
          <template v-if="currentEmployee">
            <template v-for="(val, key) in currentEmployee.basicInfo" :key="key">
              <dt>{{ key }}</dt>
              <dd>{{ val }}</dd>
            </template>
          </template>
        </dl>

        <h3>カテゴリ別平均スキルレベル</h3>
        <div class="chart-container" v-if="categoryBarChartData.labels.length">
          <BarChart :chart-data="categoryBarChartData" :chart-options="barChartOptions" />
        </div>

        <h3>上位スキルレーダーチャート</h3>
        <div class="chart-container" v-if="topSkillsRadarData.labels.length">
          <RadarChart :chart-data="topSkillsRadarData" :chart-options="radarChartOptions" />
        </div>
      </section>

      <!-- 複数比較 -->
      <section aria-label="複数従業員スキル比較">
        <h2>複数従業員比較（最大3名）</h2>

        <div class="select-group" role="region" aria-label="複数従業員選択">
          <select v-model="selectedEmployee2">
            <option value="">--選択--</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
          <select v-model="selectedEmployee3">
            <option value="">--選択--</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
          <select v-model="selectedEmployee4">
            <option value="">--選択--</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
        </div>

        <h3>カテゴリ別平均スキルレベル比較</h3>
        <div class="chart-container" v-if="multiCategoryBarData.labels.length">
          <BarChart :chart-data="multiCategoryBarData" :chart-options="barChartOptions" />
        </div>

        <h3>主要スキルレーダーチャート比較</h3>
        <div class="chart-container" v-if="multiTopSkillsRadarData.labels.length">
          <RadarChart :chart-data="multiTopSkillsRadarData" :chart-options="radarChartOptions" />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { Chart as ChartJS, Title, Tooltip, Legend, RadialLinearScale, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";
import { Bar, Radar } from "vue-chartjs";

ChartJS.register(Title, Tooltip, Legend, RadialLinearScale, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler);

export default {
  name: "EmployeeSkillMap",
  components: {
    BarChart: Bar,
    RadarChart: Radar
  },
  setup() {
    const employees = ref([
      {
        id: "yamada",
        name: "山田 太郎",
        basicInfo: { "氏名": "山田 太郎", "部署": "開発部", "役職": "シニアエンジニア" },
        skills: [
          { name: "Java", level: 6, category: "プログラミング言語" },
          { name: "Python", level: 5, category: "プログラミング言語" },
          { name: "JavaScript", level: 7, category: "プログラミング言語" },
          { name: "AWS", level: 6, category: "クラウド" },
          { name: "MySQL", level: 7, category: "データベース" }
        ]
      },
      {
        id: "sato",
        name: "佐藤 一郎",
        basicInfo: { "氏名": "佐藤 一郎", "部署": "開発部", "役職": "マネージャー" },
        skills: [
          { name: "Java", level: 7, category: "プログラミング言語" },
          { name: "Python", level: 4, category: "プログラミング言語" },
          { name: "AWS", level: 7, category: "クラウド" }
        ]
      },
      {
        id: "suzuki",
        name: "鈴木 花子",
        basicInfo: { "氏名": "鈴木 花子", "部署": "企画部", "役職": "プロジェクトリーダー" },
        skills: [
          { name: "JavaScript", level: 7, category: "プログラミング言語" },
          { name: "TypeScript", level: 6, category: "プログラミング言語" },
          { name: "AWS", level: 5, category: "クラウド" }
        ]
      }
    ]);

    const selectedEmployee1 = ref(employees.value[0].id);
    const selectedEmployee2 = ref(employees.value[1].id);
    const selectedEmployee3 = ref(employees.value[2].id);
    const selectedEmployee4 = ref("");

    const currentEmployee = computed(() => employees.value.find(emp => emp.id === selectedEmployee1.value));

    // 個別チャートデータ
    const categoryBarChartData = computed(() => {
      if (!currentEmployee.value) return { labels: [], datasets: [] };
      const catMap = {};
      currentEmployee.value.skills.forEach(s => {
        if (!catMap[s.category]) catMap[s.category] = [];
        catMap[s.category].push(s.level);
      });
      const labels = Object.keys(catMap);
      const data = labels.map(cat => (catMap[cat].reduce((a,b)=>a+b,0)/catMap[cat].length).toFixed(2));
      return { labels, datasets: [{ label: "平均スキルレベル", data, backgroundColor: "rgba(63,108,237,0.7)" }] };
    });

    const topSkillsRadarData = computed(() => {
      if (!currentEmployee.value) return { labels: [], datasets: [] };
      const sortedSkills = [...currentEmployee.value.skills].sort((a,b)=>b.level-a.level).slice(0,10);
      return {
        labels: sortedSkills.map(s=>s.name),
        datasets: [{ label: currentEmployee.value.name, data: sortedSkills.map(s=>s.level), backgroundColor:"rgba(63,108,237,0.3)", borderColor:"rgba(63,108,237,0.7)", fill:true }]
      };
    });

    // 複数比較チャートデータ
    const multiCategoryBarData = computed(() => {
      const selectedIds = [selectedEmployee2.value, selectedEmployee3.value, selectedEmployee4.value].filter(Boolean);
      if (!selectedIds.length) return { labels: [], datasets: [] };
      const emps = selectedIds.map(id => employees.value.find(e => e.id===id)).filter(Boolean);
      const allCats = [...new Set(emps.flatMap(emp=>emp.skills.map(s=>s.category)))];
      const datasets = emps.map((emp,idx)=>({
        label: emp.name,
        data: allCats.map(cat => {
          const arr = emp.skills.filter(s=>s.category===cat).map(s=>s.level);
          return arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : 0;
        }),
        backgroundColor: ["rgba(63,108,237,0.7)","rgba(234,91,91,0.7)","rgba(91,192,222,0.7)"][idx]
      }));
      return { labels: allCats, datasets };
    });

    const multiTopSkillsRadarData = computed(() => {
      const selectedIds = [selectedEmployee2.value, selectedEmployee3.value, selectedEmployee4.value].filter(Boolean);
      if (!selectedIds.length) return { labels: [], datasets: [] };
      const emps = selectedIds.map(id => employees.value.find(e => e.id===id)).filter(Boolean);
      const skillMap = {};
      emps.flatMap(emp => emp.skills).forEach(s => skillMap[s.name] = Math.max(skillMap[s.name]||0,s.level));
      const topSkills = Object.entries(skillMap).sort((a,b)=>b[1]-a[1]).slice(0,15).map(s=>s[0]);
      const datasets = emps.map((emp,idx)=>({
        label: emp.name,
        data: topSkills.map(name => emp.skills.find(s=>s.name===name)?.level||0),
        backgroundColor: ["rgba(63,108,237,0.3)","rgba(234,91,91,0.3)","rgba(91,192,222,0.3)"][idx],
        borderColor: ["rgba(63,108,237,0.7)","rgba(234,91,91,0.7)","rgba(91,192,222,0.7)"][idx],
        fill: true
      }));
      return { labels: topSkills, datasets };
    });

    const barChartOptions = {
      responsive: true,
      scales: { y: { beginAtZero:true, max:7, ticks:{ stepSize:1 } }, x:{ title:{ display:true, text:"カテゴリ" } } },
      plugins: { legend:{ display:true } }
    };

    const radarChartOptions = {
      responsive: true,
      scales: { r: { beginAtZero:true, min:0, max:7, ticks:{ stepSize:1 }, pointLabels:{ font:{ size:14, weight:"600" } } } },
      plugins: { legend:{ position:"top" } }
    };

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
      radarChartOptions
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
  margin: 0 auto 50px;
}

/* レスポンシブ */
@media (max-width: 700px) {
  dl.basic-info { grid-template-columns: 1fr; max-width: 90%; }
  dl.basic-info dt { text-align: left; }
  .chart-container { max-width: 100%; padding: 0 10px; }
}
</style>
