<!--
 * @Author: syp1996 304899670@qq.com
 * @Date: 2025-08-22 13:58:01
 * @LastEditors: syp1996 304899670@qq.com
 * @LastEditTime: 2025-08-22 19:20:53
 * @FilePath: \markdown-fontend-main\src\views\components\MainContent.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="main-content">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'MainContent'
}
</script>

<style scoped>
.main-content {
  flex: 1;
  overflow: auto;
  background-color: #f0f2f5;
}
</style>