<template>
  <template v-if="user">
    <van-cell title="头像" is-link to="/user/edit" icon = "user-circle-o" >
      <img style="height: 48px" :src="user.avatarUrl" :value="user.avatarUrl"
           @click="toEdit('avatarUrl', '头像', user.avatarUrl)"/>
    </van-cell>
    <van-cell title="昵称" is-link to="/user/edit" :value="user.username"
              @click="toEdit('username', '昵称', user.username)"  icon="manager-o"/>
    <van-cell title="账号" :value="user.userAccount" icon="user-circle-o"/>
    <van-cell title="性别" is-link :value="user.gender=== 1 ? '男': '女'"
              @click="toEdit('gender', '性别', user.gender)" icon="like-o"/>
    <van-cell title="电话" is-link to="/user/edit" :value="(!user.phone ? '暂无' : user.phone)" @click="toEdit('phone', '电话', user.phone)" icon="phone-o" />
    <van-cell title="邮箱" :value="user.email" icon="envelop-o"/>
<!--    可能为空-->
    <van-cell title="个人介绍" is-link to="/user/edit"
              :value="(!user || !user.profile || user.profile.length === 0) ? '暂无' : (user.profile.length > 10 ? user.profile.slice(0, 10) + '...' : user.profile)"
              @click="toEdit('profile', '个人介绍', user ? user.profile : '')" icon="smile-comment-o" />
    <van-cell title="标签" @click="toUpdateTag" is-link icon="label-o">
      <!-- 使用v-for来遍历标签数组 但是只显示三个,使用逗号隔开：-->
      <template v-if="user.tags.length > 3">
        <template v-for="(tag, index) in user.tags.slice(0, 3)">
          <span @click="toUpdateTag">{{ tag }}</span> <!-- 这里显示每个标签 -->
          <!-- 如果需要的话，可以在标签之间添加分隔符 -->
          <span v-if="index < 3 ">, </span> <!-- 不是最后一个标签时添加逗号分隔 -->
        </template>
        <span v-if="user.tags.length > 3">...</span>
      </template>
      <!-- 否则使用v-for来遍历标签数组，显示全部标签：-->
      <template v-else>
        <template v-for="(tag, index) in user.tags">
          <!-- 点击更新标签 -->
          <span @click="toUpdateTag">{{ tag }}</span> <!-- 这里显示每个标签 -->
          <!-- 如果需要的话，可以在标签之间添加分隔符 -->
          <span v-if="index < user.tags.length - 1">, </span> <!-- 不是最后一个标签时添加逗号分隔 -->
        </template>
      </template>
    </van-cell>
    <van-cell title="修改密码" is-link to="/user/edit" @click="toEdit('userPassword', '修改密码', '') " icon="setting-o"/>
    <van-cell title="注册时间" :value="user.createTime" icon="underway-o"/>
  </template>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {getCurrentUser} from "../services/user";
import myAxios from "../plugins/myAxios";
import {currentID} from "../states/currentID";

const user = ref();

onMounted(async () => {
  const res = await myAxios.get("/user/current");
  user.value = res.data;
  let dataStr = user.value.tags; // 这应该是一个包含 `["xxx","xxx"]` 的字符串
  let parsedArray = JSON.parse(dataStr); // 将字符串解析为数组
  user.value.tags = parsedArray; // 更新标签值
})

const router = useRouter();

const toEdit = (editKey: string, editName: string, currentValue: string) => {
  console.log("发请求啦" + editKey + editName + currentValue);
  router.push({
    path: '/user/edit',
    query: {
      editKey,
      editName,
      currentValue,
    }
  })
}


const toUpdateTag = () => {
  router.push({
        path: '/user/edit/tag',
        query: {
          editKey: 'tags',
          editName: '标签',
          currentValue: user.value.tags
        }
  }
  )
}

</script>

<style scoped>

</style>