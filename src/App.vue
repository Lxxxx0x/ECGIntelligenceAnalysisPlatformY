<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const locale = zhCn
</script>

<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>

<style lang="scss">
:root {
  --el-color-primary: #2b4b6b;
  --el-color-primary-light-3: #567089;
  --el-color-primary-light-5: #8c9eae;
  --el-color-primary-light-7: #c1cdd8;
  --el-color-primary-light-8: #dce3e9;
  --el-color-primary-light-9: #eef2f6;
  --el-color-primary-dark-2: #223c56;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f3f5f8;
}
</style>
