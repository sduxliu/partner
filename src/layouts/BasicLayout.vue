<template>
  <van-nav-bar v-if="!NOT_SHOW_NAVBAR_AND_TABBAR.includes(route.path)" fixed="fixed" left-arrow left-text="返回"
               :title="title" @click-right="onClickRight" @click-left="onClickLeft">
    <template v-if ="SHOW_SEARCH.includes(route.path)" #right>
      <van-icon name="search" size="22"/>
      <span style="color: rgb(25,137,250)">标签</span>
    </template>
  </van-nav-bar>
  <div id="center">
    <router-view/>
  </div>
  <van-tabbar v-model="active" v-if="!NOT_SHOW_NAVBAR_AND_TABBAR.includes(route.path)" @change="onChange" route>
    <van-tabbar-item icon="home-o" name="index" to="/">推荐</van-tabbar-item>
    <van-tabbar-item icon="friends-o"  name="team" to="/team">队伍</van-tabbar-item>
    <van-tabbar-item icon="chat-o" name="chat" to="/public_chat">聊天厅</van-tabbar-item>
    <van-tabbar-item icon="manager-o" name="user" to="/user">我的</van-tabbar-item>
  </van-tabbar>
</template>
<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import request from "../plugins/myAxios";
import routes from "../config/route";
import Copyright from "../components/Copyright.vue";
import qs from "qs";
const route = useRoute()
const router = useRouter();
const DEFAULT_TITLE = '同行网';
const title = ref(DEFAULT_TITLE);
const NOT_SHOW_NAVBAR_AND_TABBAR = ["/user/login", '/user/register','/user/login/email','/user/forgetPassword']
const SHOW_SEARCH = ["/", '/team']
const CHAT = ["/chat"]
/**
 * 根据路由切换标题
 */
router.beforeEach((to: { path: any; }, from: any) => {
  const toPath = to.path;
  const route = routes.find((route: { path: any; }) => {
    return toPath == route.path;
  })
  title.value = route?.title ?? DEFAULT_TITLE;
})


const onClickLeft = () => {
  router.back();
};
const onClickRight = async () => {
  if (SHOW_SEARCH.includes(route.path)) {
    await router.push("/search")
  };
}
const active = ref('name');
const onChange = async () => {
    // To do push router
  if (active.value === 'chat') {
    await router.push("/chat")
  } else if (active.value === 'team') {
    await router.push("/team")
  } else if (active.value === 'index') {
    await router.push("/")
  } else if (active.value === 'user') {
    await router.push("/user")
  }
}


</script>

<style scoped>
#center {
  margin-top: 48px;
  padding-bottom: 60px;
}
#content {
  padding-bottom: 10px;
}
.login-container {
  padding-top: 50px;
}
.container{
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin-bottom: auto;
}
</style>
