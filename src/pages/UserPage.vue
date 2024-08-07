<template>
  <div class="user-profile">
    <div v-if="user">
      <!-- 头像区域 -->
        <div style="padding-top: 5px"></div>
        <div class="center">
          <img :alt="user?.username" class="img" :src="user?.avatarUrl?user.avatarUrl:commonImg">
        </div>
      <div style="padding-top: 15px"></div>
      <!-- 用户信息区域 -->
      <div class="user-info">
        <van-cell class="cell" title="昵称:" :value="user?.username" icon="manager-o"></van-cell>
        <van-cell class="cell" title="账户:" :value="user?.userAccount" icon="user-circle-o"></van-cell>
        <van-cell class="cell" title="更多信息" is-link to="/user/update" icon="more-o"></van-cell>
        <van-cell class="cell" title="我创建的队伍" is-link to="/user/team/create" icon="friends-o"></van-cell>
        <van-cell class="cell" title="我加入的队伍" is-link to="/user/team/join" icon = "cluster-o"></van-cell>
      </div>
    </div>
    <!-- 退出登录按钮 -->
    <van-button
        plain
        icon="/logo-out.svg"
        type="primary"
        block class="logout-button"
        @click="logout"
    >
      退出登录
    </van-button>
  </div>
  <div>
    <copyright/>
  </div>
</template>
<!--<template>-->
<!--  <div style="padding-top: 5px"></div>-->
<!--  <div class="center">-->
<!--    <img :alt="user?.username" class="img" :src="user?.avatarUrl?user.avatarUrl:commonImg">-->
<!--  </div>-->
<!--  <div style="padding-top: 15px"/>-->
<!--  <van-cell :value="user?.username.length<10?user?.username:user?.username.slice(0,10)+'...'" icon="manager-o">-->
<!--    <template #title>-->
<!--      <span class="custom-title">昵称</span>-->
<!--    </template>-->
<!--  </van-cell>-->
<!--  <van-cell :value="user?.userAccount" icon="user-circle-o">-->
<!--    <template #title>-->
<!--      <span class="custom-title">账号</span>-->
<!--    </template>-->
<!--  </van-cell>-->
<!--  &lt;!&ndash; 用户信息区域 &ndash;&gt;-->
<!--  <div class="user-info">-->
<!--    <van-cell class="cell" title="用户名" :value="user?.username"></van-cell>-->
<!--    <van-cell class="cell" title="我的信息" is-link to="/user/update"></van-cell>-->
<!--    <van-cell class="cell" title="我创建的队伍" is-link to="/user/team/create"></van-cell>-->
<!--    <van-cell class="cell" title="我加入的队伍" is-link to="/user/team/join"></van-cell>-->
<!--  </div>-->
<!--  <van-space style="margin: 13px" direction="vertical" fill>-->
<!--    <div>-->
<!--      <van-button  plain-->
<!--                   icon="/logo-out.svg"-->
<!--                   type="primary"-->
<!--                   block class="logout-button"-->
<!--                   @click="logout">退出登录</van-button>-->
<!--      <div style="padding-top: 10px;"></div>-->
<!--    </div>-->
<!--  </van-space>-->
<!--  <div>-->
<!--    <copyright/>-->
<!--  </div>-->
<!--</template>-->

<script setup lang="ts">
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {getCurrentUser} from "../services/user";
import myAxios from "../plugins/myAxios";
import {Toast} from "vant";
import {currentID} from "../states/currentID";
import Copyright from "../components/Copyright.vue";
import commonImg from "../assets/commonAvatar.jpg";

const user = ref();

const router = useRouter();

onMounted(async () => {
  user.value = await getCurrentUser();
  if(!user.value){
    await router.push('/user/login');
  }
})

const logout = () => {
  const res = myAxios.post('/user/logout?id='+user.value.id)
  console.log(res.data, '用户注销');
  console.log(res.code, '退出码');
  currentID.value = 0;
  Toast.success('退出登录');
  window.location.href = '/user/login';
}
</script>


<style scoped>

.user-profile {
  display: flex;
  flex-direction: column;
  text-align: left; /* 设置文本和子元素左对齐 */
  padding: 20px;
  margin-bottom: auto;
  flex-wrap: wrap; /* 可以让子元素在空间不足时换行 */
  justify-content: space-between; /* 可以让子元素之间有间隔 */
  //align-items: center; /* 垂直居中对齐子元素 */
}

.cell {
  width: 100%;
  margin-bottom: 40px;
  text-align: center;
}

.logout-button {
  justify-content: center; /* 水平居中对齐 */
  border-radius: 20px;
  margin-top:80px; /* 增加上边距，使其与其他元素有一定距离 */
  margin-bottom: 10px;
  text-align: center;
}
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
