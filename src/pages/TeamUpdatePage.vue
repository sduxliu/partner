<template>
  <div id="teamAddPage">
    <van-form @submit="onSubmit">
      <van-cell-group inset>

        <van-field name="uploader" label="队伍头像:">
          <template #input>
            <van-uploader v-model="fileList" :before-read="beforeRead" :after-read="afterRead" class="avatar"/>
          </template>
        </van-field>

        <van-field
            v-model="addTeamData.name"
            name="name"
            label="队伍名"
            placeholder="请输入队伍名"
            :rules="[{ required: true, message: '请输入队伍名' }]"
        />
        <van-field
            v-model="addTeamData.description"
            rows="4"
            autosize
            label="队伍描述"
            type="textarea"
            placeholder="请输入队伍描述"
        />
        <van-field
            is-link
            readonly
            name="datetimePicker"
            label="过期时间"
            :placeholder="addTeamData.expireTime ?? '点击选择过期时间'"
            @click="showPicker = true"
        />
        <van-popup v-model:show="showPicker" position="bottom">
          <van-datetime-picker
              v-model="addTeamData.expireTime"
              @confirm="showPicker = false"
              type="datetime"
              title="请选择过期时间"
              :min-date="minDate"
          />
        </van-popup>
        <van-field name="radio" label="队伍状态">
          <template #input>
            <van-radio-group v-model="addTeamData.status " direction="horizontal">
              <van-radio name="0">公开</van-radio>
              <van-radio name="1">私有</van-radio>
              <van-radio name="2">加密</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
            v-if="Number(addTeamData.status) === 2"
            v-model="addTeamData.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入队伍密码"
            :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">

import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/myAxios";
import {Toast} from "vant";
import {currentID} from "../states/currentID";

const router = useRouter();
const route = useRoute();

// 展示日期选择器
const showPicker = ref(false);

const minDate = new Date();
const id = route.query.id;
// 需要用户填写的表单数据
const addTeamData = ref({})
const fileList = ref([
  {url: addTeamData.value.avatarUrl, isImage: true},
  // Uploader 根据文件后缀来判断是否为图片文件
  // 如果图片 URL 中不包含类型信息，可以添加 isImage 标记来声明

]);
// 获取之前的队伍信息
onMounted(async () => {

      if (id <= 0) {
        Toast.fail('加载队伍失败');
        return;
      }
      const res = await myAxios.get("/team/get", {
        params: {
          id,
        }
      });
      if (res?.code === 0) {
        addTeamData.value = res.data;
        console.log(addTeamData.value)
        fileList.value[0].url = addTeamData.value.avatarUrl;
        addTeamData.value.status = addTeamData.value.status + "";
      } else {
        Toast.fail('加载队伍失败，请刷新重试');
      }
    }
)

// 提交
const onSubmit = async () => {
  const postData = {
    currentId: currentID.value,
    ...addTeamData.value,
    status: Number(addTeamData.value.status)
  }
  console.log(addTeamData.value.avatarUrl)
  // todo 前端参数校验
  const res = await myAxios.post("/team/update", postData);
  if (res?.code === 0 && res.data) {
    Toast.success('更新成功');
    router.push({
      path: '/team',
      replace: true,
    });
  } else {
    Toast.success('更新失败');
  }
}

const beforeRead = (file: any) => {
  const isJPG = file.type === "image/jpeg";
  const isLt2M = file.size/1024/1024 < 1;

  if (!isJPG) {
    Toast.fail("上传头像图片只能是 JPG 格式!");
    return false;
  }
  if (!isLt2M) {
    Toast.fail("上传头像图片大小不能超过 1MB!");
    return false;
  }
  return true;
};

const afterRead = (file: any) => {
  const ImgUploadFile = async (params: any) => {
    const formData = new FormData();
    formData.append('file', params);
    const res = await myAxios.post('/upload/img', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res && res.data) {
      // 更新 editUser 的 currentValue 为新上传的图片URL
      addTeamData.value.avatarUrl = res.data;
      fileList.value = [{ url: res.data, isImage: true }];
      Toast.success('图片上传成功');
    } else {
      Toast.fail('图片上传失败');
    }
  };
  ImgUploadFile(file.file);
};

</script>

<style scoped>
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: block;
}
</style>
