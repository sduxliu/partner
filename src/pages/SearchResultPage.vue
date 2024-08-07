<template>
  <div class="user-cards-container">
    <van-card class="user-card" v-for="user in userList" :title="`姓名：${user.username}`" :desc="`介绍：${user.profile}`" :thumb="user.avatarUrl" style="margin-bottom: 20px;">
      <template #tags>
        <van-tag plain type="danger" v-for="tag in user.tags" style="margin-right: 8px; margin-top: 8px">{{ tag }}</van-tag>
      </template>
      <template #footer>
        <van-button size="mini"  @click="toChat(user.id,user.avatarUrl,user.username)">联系我</van-button>
      </template>
    </van-card>
  </div>
  <van-empty v-if="!userList || userList.length < 1" description="搜索结果为空" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {useRoute, useRouter} from "vue-router";
import myAxios from "../plugins/myAxios";
import { Toast } from "vant";
import qs from 'qs';

const router = useRouter();
const route = useRoute();
const { tags } = route.query;
const userList = ref([]);

onMounted(async () => {
  const userListData = await myAxios.get('/user/search/tags', {
    params: {
      tagList: tags
    },
    paramsSerializer: params => {
      return qs.stringify(params, { indices: false });
    }
  })
      .then(function (response) {
        console.log('/user/search/tags succeed', response);
        return response?.data;
      })
      .catch(function (error) {
        console.error('/user/search/tags error', error);
        Toast.fail('请求失败');
      });

  if (userListData) {
    userListData.forEach(user => {
      if (user.tags) {
        user.tags = JSON.parse(user.tags);
      }
    });
    userList.value = userListData;
  }
});
// 跳转聊天页面
const toChat = (id:number,avatarUrl: any,username:any) => {
  router.push({
    path: "/chat",
    query: {
      id,
      avatarUrl,
      username,
      userType:1
    }
  })
}
</script>

<style scoped>
.user-cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background-color: #ebeee8 ;
  padding: 20px;
}

.user-card {
  width: 370px;
  background-color: #fff;
  border: 1px solid #007bff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin: 10px;
  transition: all 0.3s ease;
}

.custom-button {
  color: #fff;
  background-color: #108b96;
}
</style>