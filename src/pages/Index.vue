<template>
  <van-pull-refresh v-model="load" @refresh="onRefresh">
    <van-cell center title="推荐">
      <template #right-icon>
        <van-switch v-model="isMatchMode" size="24" @change="onMatchModeChange"/>
      </template>
    </van-cell>
    <user-card-list :user-list="userList" :loading="loading"/>
    <van-empty v-if="!userList.length" description="数据为空"/>
  </van-pull-refresh>
  <van-dialog v-model:show="showDialog" title="选择推荐数量" show-cancel-button>
    <van-radio-group v-model="selectedNum">
      <van-radio name="5">5</van-radio>
      <van-radio name="10">10</van-radio>
      <van-radio name="15">15</van-radio>
      <van-radio name="20">20</van-radio>
    </van-radio-group>
    <template #footer>
      <van-button @click="confirmSelection">确认</van-button>
    </template>
  </van-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import myAxios from '../plugins/myAxios';
import { Toast } from 'vant';
import UserCardList from '../components/UserCardList.vue';
import { UserType } from '../models/user';
import { currentID } from '../states/currentID';


const isMatchMode = ref(false);
const load = ref(false);
const userList = ref<UserType[]>([]);
const loading = ref(true);
const pageNum = ref(1);
const showDialog = ref(false);
const selectedNum = ref(10); // 默认推荐数量

const fetchData = async (url: string, params: object) => {
  try {
    const response = await myAxios.get(url, { params });
    console.log(`${url} succeed`, response);
    return response.data;
  } catch (error) {
    console.error(`${url} error`, error);
    Toast.fail('请求失败');
    return null;
  }
};

const loadData = async () => {
  loading.value = true;
  const url = isMatchMode.value ? '/user/match' : '/user/recommend';
  const params = isMatchMode.value
      ? { num: selectedNum.value, currentId: currentID.value }
      : { pageSize: 10, pageNum: pageNum.value, currentId: currentID.value };

  const data = await fetchData(url, params);
  if (data) {
    const users = (isMatchMode.value ? data : data.records) as UserType[];
    users.forEach(user => {
      if (user.tags) user.tags = JSON.parse(user.tags);
    });
    userList.value = [...userList.value, ...users].filter(user => user.id !== currentID.value); // 追加新数据，去重
  }
  loading.value = false;
};

const onScroll = () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    pageNum.value += 1;
    loadData();
  }
};

const onMatchModeChange = () => {
  if (isMatchMode.value) {
    showDialog.value = true;
  } else {
    userList.value = [];
    pageNum.value = 1;
    loadData();
  }
};

const confirmSelection = () => {
  showDialog.value = false;
  userList.value = [];
  loadData();
};

watch(isMatchMode, (newMode) => {
  if (!newMode) {
    userList.value = [];
    pageNum.value = 1;
    loadData();
  }
});

onMounted(() => {
  loadData();
  window.addEventListener('scroll', onScroll);
});

const onRefresh = async () => {
  userList.value = [];
  pageNum.value = 1;
  await loadData();
  Toast.success('刷新成功');
  load.value = false;
};
</script>

<style scoped>
#search {
  margin-left: 10px;
  color: #1989FA;
}
</style>