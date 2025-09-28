<template>
  <select :value="locale" @change="onChange">
    <option value="ja">日本語</option>
    <option value="zh">中文</option>
  </select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const onChange = (e) => {
  locale.value = e.target.value
  localStorage.setItem('locale', locale.value)
  document.documentElement.setAttribute('lang', locale.value)
}
</script>

<style scoped>
select { height: 28px; border-radius: 6px; padding: 2px 6px; }
</style>
