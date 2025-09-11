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
      <!-- 会社概要 -->
      <section>
        <img src="images/top.jpg" alt="top" width="950" />
        <h1>株式会社ハイシンクジャパン</h1>
        <h2>会社概要</h2>
        <ul>
          <li><strong>会社名：</strong>株式会社ハイシンクジャパン (Japan Hi-Think Corporation)</li>
          <li><strong>所在地：</strong>
            <ul>
              <li>【本社】東京都港区芝浦 3-2-16 A-PLACE田町イースト 6F / 4F</li>
              <li>東京都港区芝浦 3-5-39 イーストウィング 3F</li>
              <li>TEL：03-5439-5499（代表）</li>
              <li>FAX：03-5439-5799</li>
            </ul>
          </li>
          <li><strong>設立：</strong>1999年9月</li>
          <li><strong>資本金：</strong>2億2,400万円</li>
          <li><strong>取扱高：</strong>
            <ul>
              <li>220.5 億円（ハイシンクジャパングループ連結）</li>
              <li>169.1 億円（ハイシンクジャパン単体）</li>
            </ul>
          </li>
          <li><strong>出資株主：</strong>信華信技術国際有限公司（香港）100％</li>
          <li><strong>役員：</strong>
            <ul>
              <li>取締役：王 興海（信華信技術國際有限公司 董事/総裁）</li>
              <li>取締役：黄 邦瑜</li>
              <li>取締役：劉 軍（信華信技術股份有限公司 董事長）</li>
              <li>取締役：王 悦（信華信技術股份有限公司 董事/総裁）</li>
              <li>取締役：倉田 英樹</li>
              <li>監査役：上矢 博</li>
            </ul>
          </li>
          <li><strong>取引銀行：</strong>
            <ul>
              <li>みずほ銀行 外資系企業法人部（日本橋支店）</li>
              <li>三菱UFJ銀行 田町支店</li>
              <li>三井住友銀行 三田通法人営業部（三田通支店）</li>
              <li>さわやか信用金庫 東京港支店</li>
            </ul>
          </li>
          <li><strong>社員連結数：</strong>1,019名（2025年1月1日時点）</li>
          <li><strong>関係会社：</strong>
            <p>信華信技術股份有限公司、大連ハイテクゾーン信華信技術トレーニングセンタ、信華信教育コンサルティング(大連)有限公司、信華信教育科技(瀋陽)有限公司、信華信(大連)施設管理有限公司、数安信成技術(大連)有限公司、信華信技術国際有限公司、信華信(大連)ソフトウェアサービス股份有限公司、信華信(済南)インフォメーション技術有限公司、信華信(蘇州)インフォメーション技術有限公司、信華信(大連)企業管理有限公司、訊和創新有限公司、訊和創新科技(北京)有限公司、済南訊和信息技術有限公司、株式会社ハイシンクジャパン、株式会社沖縄ハイシンク、株式会社ハイシンク創研、信華信技術インドネシア有限公司、信華信(大連)デジタル技術有限公司、北京支社、深圳支社、信華信技術(昆山)有限公司、信華信(重慶)インフォメーション技術有限公司、大連華信新島科技有限公司、北京領雁科技股份有限公司</p>
          </li>
          <li><strong>グループ親会社：</strong>信華信技術股份有限公司</li>
        </ul>

        <h3>親会社情報</h3>
        <p>
          信華信技術股份有限公司は、グローバルなお客様向けにアプリケーションソフトウェア製品と情報サービスを提供するプロバイダです。<br>
          お客様向けにITサポートサービスを提供し、企業価値の向上を支援しています。
        </p>
        <ul>
          <li>設立：1996年5月</li>
          <li>資本金：35,372万元</li>
          <li>売上：33.2億元(2023年度)</li>
          <li>海外出資者：NEC、NTTデータグループ、日立ソリューションズ、NECソリューションイノベータ、日鉄ソリューションズ</li>
          <li>代表者：劉 軍</li>
          <li>社員数：10,352名（2024年12月31日時点）</li>
          <li>所在地：中国大連市高新技術産業園区黄浦路977号</li>
        </ul>
      </section>

      <!-- 部署紹介 -->
      <section class="departments">
        <h2>部署紹介</h2>
        <img src="images/20250329-体制図2.png" alt="部署構成図" width="900" />
      </section>

      <!-- お問い合わせ -->
      <section>
        <h2>お問い合わせ</h2>
        <form class="contact-form" @submit.prevent="handleSubmit">
          <label for="name">お名前</label>
          <input type="text" id="name" v-model="form.name" required />

          <label for="email">メールアドレス</label>
          <input type="email" id="email" v-model="form.email" required />

          <label for="message">お問い合わせ内容</label>
          <textarea id="message" v-model="form.message" rows="5" required></textarea>

          <button type="submit">送信</button>
        </form>
      </section>

      <footer>
        &copy; 2025 株式会社ハイシンクジャパン All rights reserved.
      </footer>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'
export default {
  name: "HomePage",
  data() {
    return {
      form: {
        name: "",
        email: "",
        message: ""
      },
      permissionsLevel: localStorage.getItem("permissionsLevel") || ''
    };
  },
    // 在组件实例创建后立即发起请求
  async created() {
    await this.fetchUserInfo();
  },
  methods: {
        // 异步获取员工数据的方法
    async fetchUserInfo() {
      try {
        // 使用 await 暂停执行，等待请求完成
        const usernameStorage = localStorage.getItem('username') || '';
        const apiData = await request.post("/employee/top",{
        username: usernameStorage
    });
        // 保存员工情報到 localStorage
        this.permissionsLevel = apiData.permissionsLevel || '';
        localStorage.setItem("permissionsLevel", apiData.permissionsLevel || ''); 
        localStorage.setItem("employeeId", apiData.employeeId || ''); 

      } catch (err) {
        console.error("社員IDと権限レベルの取得に失敗しました:", err.response?.data?.message);
        //showError.value = true
        //errorMessage.value = err.response?.data?.message || 'ログインに失敗しました'
      }
    },
    handleSubmit() {
      alert(`送信内容\nお名前: ${this.form.name}\nメール: ${this.form.email}\n内容: ${this.form.message}`);
      this.form.name = "";
      this.form.email = "";
      this.form.message = "";
    },
    logout() {
    console.log("✅ logout() が呼ばれました");
    alert("ログアウトしました");
    sessionStorage.removeItem("token");
    localStorage.clear();
    this.$router.push("/login");
  }
 }
};
</script>

<style scoped>
body {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f2f9ff 0%, #e0efff 100%);
  padding-top: 64px;
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
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  background-color: #ffffffcc;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
h1, h2 {
  text-align: center;
  color: #1a4f9c;
}
section {
  padding: 30px 20px;
  border-bottom: 1px solid #d0e0ff;
}
p, ul {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}
.departments ul {
  padding-left: 20px;
}
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}
.contact-form label {
  font-weight: 600;
  color: #444;
}
.contact-form input,
.contact-form textarea {
  padding: 10px;
  font-size: 15px;
  border: 1.8px solid #9ab8f8;
  border-radius: 10px;
  background-color: #f8fbff;
}
.contact-form button {
  padding: 12px;
  font-size: 16px;
  background-color: #1a4f9c;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}
.contact-form button:hover {
  background-color: #143a6e;
}
footer {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}
@media (max-width: 600px) {
  .main-nav ul {
    flex-direction: column;
  }
}
</style>
