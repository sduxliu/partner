<template>
  <van-form @submit="onSubmit">
    <!-- 其他输入项 -->
    <van-field
        v-if="editUser.editKey !== 'avatarUrl' && editUser.editKey !== 'gender' && editUser.editKey !== 'userPassword'"
        v-model="editUser.currentValue"
        :name="editUser.editKey"
        :label="editUser.editName"
        :placeholder="`请输入${editUser.editName}`"
    />

    <!-- 上传头像部分 -->
    <div v-if="editUser.editKey === 'avatarUrl'">
      <van-uploader v-model="fileList" :before-read="beforeRead" :after-read="afterRead" class="avatar" />
    </div>

    <!-- 性别选择部分 -->
    <div v-if="editUser.editKey === 'gender'">
      <van-field
          v-model="editUser.currentValue"
          :name="editUser.editKey"
          :label="editUser.editName"
          readonly
          clickable
          @click="showPicker = true"
          placeholder="请选择性别"
      />
      <van-popup v-model:show="showPicker" position="bottom">
        <van-picker :columns="genderOptions" v-model="selectedGender" @confirm="onConfirm" @cancel="showPicker = false" />
      </van-popup>
    </div>

    <!-- 修改密码部分：需要输入新密码和确认密码 -->
    <div v-if="editUser.editKey === 'userPassword'">
      <van-field
          v-model="newPassword"
          name="newPassword"
          label="新密码"
          type="password"
          placeholder="请输入新密码"
      />
      <van-field
          v-model="confirmPassword"
          name="confirmPassword"
          label="确认密码"
          type="password"
          placeholder="请再次输入新密码"
      />
    </div>

    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import myAxios from '../plugins/myAxios';
import { Toast } from 'vant';
import { getCurrentUser } from '../services/user';

const route = useRoute();
const router = useRouter();

const editUser = ref({
  editKey: route.query.editKey,
  currentValue: route.query.currentValue,
  editName: route.query.editName,
});

const showPicker = ref(false);
const genderOptions = ref([{ text: '男', value: '1' }, { text: '女', value: '0' }]);
const selectedGender = ref('');

const newPassword = ref('');
const confirmPassword = ref('');

const onConfirm = (value, index) => {
  selectedGender.value = genderOptions.value[index].text;
  editUser.value.currentValue = genderOptions.value[index].text; // 用文本表示当前值
  showPicker.value = false;
};

onMounted(() => {
  if (editUser.value.editKey === 'gender') {
    selectedGender.value = editUser.value.currentValue === '1' ? '男' : '女';
    editUser.value.currentValue = selectedGender.value; // 使初始值显示成“男”或“女”
  }
});

const onSubmit = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail('用户未登录');
    await router.push({ path: '/user/login' });
    return;
  }

  if (editUser.value.editKey === 'gender') {
    editUser.value.currentValue = selectedGender.value === '男' ? '1' : '0';
  }

  if (editUser.value.editKey === 'phone' && editUser.value.currentValue?.length !== 11) {
    Toast.fail('电话长度应为11位!');
    return;
  }

  if (editUser.value.editKey === 'userPassword') {
    if (newPassword.value.length < 8) {
      Toast.fail('密码长度不能低于8位');
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      Toast.fail('两次密码不一致');
      return;
    }
    editUser.value.currentValue = newPassword.value;
  }

  const res = await myAxios.post('/user/update', {
    id: currentUser.id,
    [editUser.value.editKey]: editUser.value.currentValue,
  });

  if (res.code === 0 && res.data > 0) {
    Toast.success('修改成功');
    router.back();
  } else {
    Toast.fail('修改错误');
  }
};

const fileList = ref([{ url: editUser.value.currentValue, isImage: true }]);

const beforeRead = (file) => {
  const isJPG = file.type === 'image/jpeg';
  const isLt2M = file.size / 1024 / 1024 < 1;

  if (!isJPG) {
    Toast.fail('上传头像图片只能是 JPG 格式!');
    return false;
  }
  if (!isLt2M) {
    Toast.fail('上传头像图片大小不能超过 1MB!');
    return false;
  }
  return true;
};

const afterRead = (file) => {
  const ImgUploadFile = async (params) => {
    const formData = new FormData();
    formData.append('file', params);
    const res = await myAxios.post('/upload/img', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res && res.data) {
      editUser.value.currentValue = res.data;
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