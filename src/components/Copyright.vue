<template>
  <!-- 版权信息 -->
  <div id="copyright">
    &copy; {{ new Date().getFullYear() }} 同行网. All rights reserved.
    <br>
    <a href="/user/login" target="_self">
      <img src="../assets/logo.png" alt="logo" style="width: 20px;height: 20px;margin-right: 5px">
      <span>在这里交志同道合的朋友</span>
    </a>
  </div>
</template>

<script>
export default {
  name: "Copyright"
}
</script>

<style scoped>
#copyright {
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  color: #999;
  background-color: #fff;
  padding: 10px 0;
}

a, a:link, a:visited, a:hover, a:active {
  text-decoration: none;
  color: inherit;
}
</style>