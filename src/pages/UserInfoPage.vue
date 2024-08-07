<template>
  <div style="padding-top: 5px"></div>
  <div class="center">
    <img :alt="user?.username" class="img" :src="user?.avatarUrl?user.avatarUrl:commonImg">
  </div>
  <div style="padding-top: 15px"/>
  <van-cell :value="user?.username.length<10?user?.username:user?.username.slice(0,10)+'...'" icon="manager-o">
    <template #title>
      <span class="custom-title">昵称</span>
    </template>
  </van-cell>
  <van-cell :value="user.userAccount" icon="user-circle-o">
    <template #title>
      <span class="custom-title">账号</span>
    </template>
  </van-cell>
  <van-cell :value="user.gender===1?'男':'女'" icon="like-o">
    <template #title>
      <span class="custom-title">性别</span>
    </template>
  </van-cell>
  <van-cell :value="user?.phone" icon="comment-o">
    <template #title>
      <span class="custom-title">联系方式</span>
    </template>
  </van-cell>
  <van-cell :value="user?.email" icon="envelop-o">
    <template #title>
      <span class="custom-title">邮箱</span>
    </template>
  </van-cell>
  <van-cell title="简介" icon="chat-o">
    <template #value>
      <div v-if="user.profile" class="van-multi-ellipsis--l3">
        {{ user?.profile?.length > 10 ? user.profile.slice(0, 10) + '...' : user.profile }}
      </div>
      <div v-if="!user.profile" class="van-ellipsis">
        暂无简介
      </div>
    </template>
  </van-cell>
  <van-space style="margin: 13px" direction="vertical" fill>
      <div>
        <van-button type="primary" @click="chatUser" block>私信</van-button>
        <div style="padding-top: 10px;"></div>
      </div>
  </van-space>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import request from "../plugins/myAxios";
import {UserType} from "../models/user";
import Copyright from "../components/Copyright.vue";
import {getCurrentUser} from "../services/user";
import commonImg from "../assets/commonAvatar.jpg";
const router = useRouter();
const route = useRoute();

console.log(route.query)
const id = route.query.id;
// const loginUser = ref({
//   user: {},
//   userIds: []
// })
const user = ref<UserType>({
  "id": 0,
  "username": "",
  "userAccount": "",
  "avatarUrl": "",
  "gender": 0,
  "email": "",
  "phone": '',
  "profile": '',
  "userStatus": 0,
  "userRole": 0,
  "tags": "",
  createTime: new Date()
})
const chatUser = () => {
  router.push({
    path: "/chat",
    query: {
      id: user.value.id,
      username: user.value.username,
      userType: 1
    }
  })
}

onMounted(async () => {
  const res = await request.get(`/user/info${id}`)
  // const currentUser = await getCurrentUser()
  // loginUser.value.user = currentUser
  // loginUser.value.userIds = JSON.parse(currentUser.userIds)
  user.value = res.data;
  console.log(user.value);

})


</script>

<style scoped>

.center {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.img {
  box-shadow: 0 0 14px rgba(0, 0, 0, 0.5);
  border-radius: 20%;
  height: 135px;
  width: 135px;
}
:deep(.van-popup--center) {
  max-width: none;
  border-radius: 5%;
}

</style>