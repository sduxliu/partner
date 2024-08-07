<template>
  <div id="teamPage" class="team-page">
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch" class="search-bar" />
<!--    <van-tabs v-model:active="active" @change="onTabChange" class="team-tabs">-->
<!--      <van-tab title="公开" name="public" />-->
<!--      <van-tab title="加密" name="private" />-->

<!--    </van-tabs>-->
    <van-tabs v-model:active="active" @change="onTabChange">
      <van-tab name="1" title="公开">
        <template #title>
          <van-icon name="wap-home-o" color="#ee0a24" size="16px"/>
          公开
        </template>
      </van-tab>
      <van-tab name="2" title="加密">
        <template #title>
          <van-icon name="lock" size="16px"/>
          加密
        </template>
      </van-tab>
        <van-tab name="3" title="我的队伍">
          <template #title>
            <van-icon name="user-o" size="16px"/>
            我的队伍
          </template>
        </van-tab>
    </van-tabs>
    <van-pull-refresh v-model="loading" @refresh="onRefresh" class="team-list-container">
      <team-card-list :teamList="teamList" />
    </van-pull-refresh>
    <van-empty v-if="teamList?.length < 1" description="数据为空" class="no-data" />
    <van-button class="add-button" type="primary" icon="plus" @click="toAddTeam">创建</van-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import TeamCardList from "../components/TeamCardList.vue";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/myAxios";
import { Toast } from "vant";
import {currentID} from "../states/currentID";

const teamList = ref([]);
const loading = ref(false);
const active = ref('public');
const searchText = ref('');
const router = useRouter();
const count = ref(0);

/**
 * 切换查询状态
 * @param name
 */
const onTabChange = async (name: string) => {
  let status;
  if (name === "1") {
    status = 0;
  }
  if (name === "2") {
    status = 2;
  }
  if (name === "3") {
    status = 3;
  }
  await listTeam(searchText.value, status);
};

// 页面加载时只触发一次
onMounted(() => {
  listTeam();
});

/**
 * 搜索队伍
 * @param val
 * @param status
 * @returns {Promise<void>}
 */
const listTeam = async (val = '', status=0): Promise<void> => {

  try {
    let res;
    if(status === 3){
       res = await myAxios.get("/team/list/my/join", {
            params: {
              currentId: "",
              status: ""
            }
          }
      );
    }
    else{
       res = await myAxios.get("/team/list", {
        params: {
          searchText: val,
          pageNum: 1,
          status: status,
        },
      });
    }

    if (res?.code === 0) {
      teamList.value = res.data;
    } else {
      Toast.fail('加载队伍失败，请刷新重试');
    }
  } catch (error) {
    Toast.fail('加载队伍失败，请刷新重试');
  }
};

const onRefresh = async () => {
  await listTeam();
  setTimeout(() => {
    Toast.success('刷新成功');
    loading.value = false;
    count.value++;
  }, 1000);
};

// 跳转到创建队伍页
const toAddTeam = () => {
  router.push({ path: "/team/add" });
};

const onSearch = (val: string | undefined) => {
  listTeam(val);
};
</script>

<style scoped>
.team-page {
  padding: 20px;
  background-color: #f8f8f8;
  min-height: 100vh;
  box-sizing: border-box; /* 确保padding包含在min-height内 */
  position: relative; /* 为fixed按钮提供参考 */
}

.search-bar {
  margin-bottom: 16px;
}

.team-tabs {
  margin-bottom: 16px;
  background-color: #fff;
}

.team-list-container {
  padding-bottom: 60px; /* 保证列表底部不会被固定按钮遮挡 */
}

.no-data {
  margin-top: 20px;
}


.add-button {
  /* 按钮的基本样式 */
  padding: 12px 20px; /* 增加内边距，使按钮内文本和边缘之间有更多空间 */
  border-radius: 50%; /* 圆形 */
  font-size: 16px; /* 增加字体大小 */
  font-weight: bold; /* 设置为粗体以突出按钮重要性 */
  background: #f5f5f5 linear-gradient(135deg,#17ead9,#6078ea); /* 设置背景颜色为蓝色调（可以根据品牌或主题调整） */
  color: #ffffff; /* 设置文字颜色为白色 */
  transition: all 0.3s ease; /* 添加过渡效果，使按钮在悬停或点击时更加平滑 */
  /* 鼠标悬停时的样式变化 */
  &:hover {
    background-color: #00bfff; /* 鼠标悬停时改变背景颜色 */
    transform: scale(1.05); /* 稍微放大按钮 */
  }
  /* 按钮激活时的样式变化（可选） */
  &:active {
    background-color: #00a9ff; /* 按钮激活时改变背景颜色 */
  }
}
</style>