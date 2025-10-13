import { createI18n } from 'vue-i18n'

const messages = {
    ja: {
        nav: {
            home: 'ホーム',
            basic: '基本情報',
            skill: 'スキル分析',
            search: '人材管理',
            itx: '技談広場',
            exchange: '縁談広場',
            logout: 'ログアウト',
        },
        login: {
            title: 'ログイン',
            username: 'ユーザー名',
            password: 'パスワード',
            remember: 'ログイン保持',
            forgot: 'パスワードを忘れた？',
            signIn: 'ログイン',
            signingIn: 'ログイン中...',
            register: '新規登録',
            success: 'ログイン成功',
            needUserPass: 'ユーザー名とパスワードを入力してください。'
        },
        register: { title: '新規登録', submit: '登録', cancel: '取消' },
        common: { confirmLogout: 'ログアウトしますか？' },
        api: {
            networkError: 'ネットワークエラー',
            unauthorized: 'ログインが必要です',
            forbidden: 'アクセス権限がありません',
            unknown: '予期しないエラーが発生しました'
        },
        error: {
            bad_credentials: 'ユーザー名またはパスワードが正しくありません',
        },
        about: {
            overview: '会社概要',
            companyName: '会社名',
            address: '所在地',
            established: '設立',
            capital: '資本金',
            turnover: '取扱高',
            shareholders: '出資株主',
            board: '役員',
            banks: '取引銀行',
            employeesConsolidated: '社員連結数',
            affiliates: '関係会社',
            parentCompany: 'グループ親会社',
            directors:'取締役',
            supervisors:'監査役',
            parentInfo: '親会社情報',
            parentDescLine1: '信華信技術股份有限公司は、グローバルなお客様向けにアプリケーションソフトウェア製品と情報サービスを提供するプロバイダです。',
            parentDescLine2: 'お客様向けにITサポートサービスを提供し、企業価値の向上を支援しています。',
            parentEstablished: '設立',
            parentCapital: '資本金',
            parentSales: '売上',
            parentInvestors: '海外出資者',
            parentRepresentative: '代表者',
            parentEmployees: '社員数',
            parentLocation: '所在地',

            departments: '部署紹介',
            orgChartAlt: '部署構成図',

            contactUs: 'お問い合わせ',
            contact: {
                name: 'お名前',
                email: 'メールアドレス',
                message: 'お問い合わせ内容',
                send: '送信',
                summary: '送信内容'
            }
        }
    },
    zh: {
        nav: {
            home: '首页',
            basic: '基本信息',
            skill: '技能分析',
            search: '人材管理',
            itx: '技术交流广场',
            exchange: '交流中心',
            logout: '退出登录',
        },
        login: {
            title: '登录',
            username: '用户名',
            password: '密码',
            remember: '记住登录',
            forgot: '忘记密码？',
            signIn: '登录',
            signingIn: '登录中...',
            register: '新用户注册',
            success: '登录成功',
            needUserPass: '请输入用户名和密码。'
        },
        register: { title: '新用户注册', submit: '注册', cancel: '取消' },
        common: { confirmLogout: '确定要退出登录吗？' },
        api: {
            networkError: '网络错误',
            unauthorized: '需要登录',
            forbidden: '没有访问权限',
            unknown: '发生未知错误'
        },
        error: {
            bad_credentials: '用户名或密码不正确',
        },
        about: {
            overview: '公司概况',
            companyName: '公司名称',
            address: '所在地',
            established: '成立时间',
            capital: '注册资本',
            turnover: '营业额',
            shareholders: '出资股东',
            board: '董事与监事',
            banks: '往来银行',
            employeesConsolidated: '合并员工数',
            affiliates: '关联公司',
            parentCompany: '集团母公司',
            directors:'董事',
            supervisors:'监事',
            parentInfo: '母公司信息',
            parentDescLine1: '信华信技术股份有限公司为全球客户提供应用软件产品与信息服务。',
            parentDescLine2: '为客户提供 IT 支持服务，助力提升企业价值。',
            parentEstablished: '成立时间',
            parentCapital: '注册资本',
            parentSales: '销售额',
            parentInvestors: '海外出资者',
            parentRepresentative: '代表者',
            parentEmployees: '员工数',
            parentLocation: '所在地',

            departments: '部门介绍',
            orgChartAlt: '组织结构图',

            contactUs: '联系我们',
            contact: {
                name: '姓名',
                email: '邮箱',
                message: '咨询内容',
                send: '发送',
                summary: '发送内容'
            }
        }
    }
}

const saved = localStorage.getItem('locale') || 'ja'
const i18n = createI18n({
    legacy: false,
    locale: saved,
    fallbackLocale: 'ja',
    messages
})

export default i18n
