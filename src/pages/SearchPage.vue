<template>
  <form action="/">
    <van-search
        v-model="searchText"
        show-action
        placeholder="请输入要搜索的标签"
        @search="onInputSearch"
        @cancel="onCancel"
        @keyup.enter="onInputSearch"> <!-- 维持 Enter 功能 -->
    <template #action>
      <van-button type="primary" size = "mini" @click="onInputSearch">添加标签</van-button>
    </template>
    </van-search>
  </form>
  <van-divider content-position="left">已选标签</van-divider>
  <div v-if="activeIds.length > 0" style="text-align: right; margin-top: 10px;">
    <van-button type="danger" size="mini" @click="clearAllTags">清除所有</van-button>
  </div>
  <div v-if="activeIds.length === 0">推荐标签</div>
  <van-row gutter="16" style="padding: 0 16px">
    <van-col v-for="tag in activeIds" :key="tag">
      <van-tag
          :closeable="true"
          size="medium"
          :type="isCustomTag(tag) ? 'danger' : 'primary'"
          @close="doClose(tag)"
          style="margin-top: 5px;"
      >
        {{ tag }}
      </van-tag>
    </van-col>
  </van-row>
  <van-divider content-position="left">选择标签</van-divider>
  <van-tree-select
      v-model:active-id="activeIds"
      v-model:main-active-index="activeIndex"
      :items="filteredTagList"
      :max="10"
      height="330px"
  />
  <div style="padding: 12px">
    <van-button block type="primary" @click="doSearchResult">搜索</van-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchText = ref('');
const customTags = ref<string[]>([]);

const originTagList = [
  {
    text: '性别',
    children: [
      { text: '男', id: '男' },
      { text: '女', id: '女' },
    ],
  },
  {
    text: '年级',
    children: [
      { text: '大一', id: '大一' },
      { text: '大二', id: '大二' },
      { text: '大三', id: '大三' },
      { text: '大四', id: '大四' },
    ],
  },
  {
    text: '语言',
    children: [
      { text: 'Java', id: 'Java' },
      { text: 'Python', id: 'Python' },
      { text: 'C', id: 'C' },
      { text: 'C++', id: 'C++' },
      { text: 'C#', id: 'C#' },
    ],
  },
];

const activeIds = ref<string[]>([]);
const activeIndex = ref<number>(0);

const filteredTagList = computed(() => {
  if (!searchText.value) return originTagList;
  return originTagList.map(parent => ({
    ...parent,
    children: parent.children.filter(child => child.text.includes(searchText.value)),
  }));
});

// 添加一个方法来清除所有已选择的标签
const clearAllTags = () => {
  activeIds.value = [];
  customTags.value = [];
};
// 搜索输入标签并添加到选中标签列表
const onInputSearch = () => {
  if (!searchText.value.trim()) return;
  const value = searchText.value.trim();
  if (!activeIds.value.includes(value)) {
    customTags.value.push(value);
    activeIds.value.push(value);
  }
  searchText.value = '';
};

const onCancel = () => {
  searchText.value = '';
};

const doClose = (tag: string) => {
  activeIds.value = activeIds.value.filter(item => item !== tag);
  customTags.value = customTags.value.filter(item => item !== tag);
};

const isCustomTag = (tag: string) => {
  return customTags.value.includes(tag);
};

const doSearchResult = () => {
  console.log(activeIds.value);
  router.push({
    path: '/user/list',
    query: { tags: activeIds.value },
  });
};

</script>

<style scoped>
</style>