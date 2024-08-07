
<template>
  <van-nav-bar fixed="fixed" left-arrow left-text="返回" :title="title"  @click-left="onClickLeft">
  </van-nav-bar>
  <div class="background"></div>
  <div class="login-page">
    <!-- 背景图片设置 -->
    <h1 class="title">同行网</h1>
    <p class="subtitle">一个人走得快，一群人走得远</p>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
            v-model="username"
            name="账户名"
            label="账户名"
            placeholder="输入账户名用于登录"
            :rules="[{ required: true, message: '请填写账户名' }]"
        />
        <van-field
            v-model="userEmail"
            name="邮箱"
            label="邮箱"
            placeholder="邮箱"
            :rules="[{ required: true, message: '请填写邮箱' }]"
        />
        <!-- 密码输入框 -->
        <van-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="密码"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
            :right-icon="showPassword ? 'eye' : 'eye-o'"
            @click-right-icon="toggleShowPassword"
        />
        <!-- 确认密码输入框 -->
        <van-field
            v-model="checkPassword"
            :type="showPassword ? 'text' : 'password'"
            name="确认密码"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[{ required: true, message: '请确认密码' }]"
        />
        <div v-if="passwordsNotMatch" style="color: red; font-size: 14px; margin-left: 20px;">
          密码不一致
        </div>
        <!-- 验证码字段和发送按钮 -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <van-field
              v-model="code"
              type="text"
              label="验证码"
              placeholder="请输入验证码"
              :rules="[{ required: true, message: '请输入验证码' }]"
              style="flex-grow: 1;"
          />
          <van-button
              :disabled="btnDisabled"
              type="info"
              style="margin-left: 8px; flex-shrink: 0;"
              @click="sendCaptcha"
          >
            {{ btnText }}
          </van-button>
        </div>
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
<!--        <copyright/>-->
      </div>
    </van-form>

    <!-- 版权信息 -->
    <div id="copyright">
      &copy; {{ new Date().getFullYear() }} 同行网. All rights reserved.
      <br>
      <a href="/user/login" target="_self">
        <img src="../assets/logo.png" alt="logo" style="width: 20px;height: 20px;margin-right: 5px">
        <span>在这里交志同道合的朋友</span>
      </a>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { Toast } from 'vant';
import { useRoute, useRouter } from "vue-router";
import myAxios from "../plugins/myAxios";
import Copyright from "../components/Copyright.vue";

const router = useRouter();
const route = useRoute();
const username = ref('');
const userEmail = ref('');
const password = ref('');
const code = ref('');
const checkPassword = ref('');
const showPassword = ref(false);
const DEFAULT_TITLE = '注册账户';
const title = ref(DEFAULT_TITLE);


// 发送按钮的状态
const btnState = reactive({
  count: 60,
  text: '发送',
  disabled: false,
  timer: null
});

const btnText = computed(() => btnState.disabled ? `${btnState.count}s后重试` : btnState.text);
const btnDisabled = computed(() => btnState.disabled);
const passwordsNotMatch = computed(() => password.value && checkPassword.value && password.value !== checkPassword.value);
function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

async function onSubmit() {
  if (password.value !== checkPassword.value) {
    console.log('密码不匹配');
    return;
  }
  console.log('提交表单');
  const res = await myAxios.post('/user/register', {
    userAccount: username.value,
    email: userEmail.value,
    code: code.value,
    userPassword: password.value,
    checkPassword: checkPassword.value,
  });
  if (res.code === 0 && res.data) {
    Toast.success('注册成功！');
    window.location.href = `/user/login`;
  } else {
    Toast.fail('注册失败,' + res.description);
  }
}

async function sendCaptcha() {
  if (!userEmail.value) {
    Toast.fail('请填写邮箱');
    return;
  }

  // 禁用按钮
  btnState.disabled = true;
  btnState.text = '发送';

  const res = await myAxios.post('/user/sendCaptcha', {
    userEmail: userEmail.value,
    code: code.value,
  });

  if (res.code === 0 && res.data) {
    Toast.success('发送成功！');
  } else {
    Toast.fail('发送失败,' + res.description);
    btnState.disabled = false;
    return;
  }

  btnState.timer = setInterval(() => {
    if (btnState.count <= 0) {
      clearInterval(btnState.timer);
      btnState.disabled = false;
      btnState.count = 60;
      return;
    }
    btnState.count--;
  }, 1000);
}

watch(() => btnState.disabled, (newValue) => {
  if (!newValue) {
    btnState.count = 60;
    clearInterval(btnState.timer);
  }
});

const onClickLeft = () => {
  router.back();
};
</script>

<style scoped>
.login-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #333;
  z-index: 1;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('../assets/background.png') no-repeat center center;
  background-size: cover !important;
  z-index: -1;
  filter: blur(5px);
}

.title {
  font-size: 2rem;
  margin: 1rem 0 0.5rem;
}

.subtitle {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #666;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.actions {
  margin-top: 1.5rem;
}

.action-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  color: #666;
}

#copyright {
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  color: #999;
  background-color: #fff;
  padding: 10px 0;
}

a, a:link, a:visited, a:hover, a:active {
  text-decoration: none;
  color: inherit;
}
</style>