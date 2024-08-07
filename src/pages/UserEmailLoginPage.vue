<template>
  <van-nav-bar fixed="fixed" left-arrow left-text="返回" :title="title"  @click-left="onClickLeft">
  </van-nav-bar>
  <div class="background"></div>
  <div class="login-page">
    <!-- 背景图片设置 -->
    <h1 class="title">同行网</h1>
    <p class="subtitle">一个人走得快，一群人走得远</p>

    <van-form @submit="onSubmit" class="login-form">
      <van-cell-group inset>
        <div class="logo-container">
          <van-image
              round
              width="10rem"
              height="10rem"
              :src="logo"
          />
        </div>

        <van-field
            v-model="userEmail"
            name="userEmail"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[{ required: true, message: '请填写邮箱' }]"
        />
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
              text="发送"
              style="margin-left: 8px; flex-shrink: 0;"
              @click="sendCaptcha"
          >
            {{ btnText }}
          </van-button>
        </div>
      </van-cell-group>

      <div class="actions">
        <van-button round block type="default" native-type="submit"  >
          <van-icon name="envelop-o" />
          邮箱登录
        </van-button>
        <div class="action-links">
          <span @click="openForgetPassword" class="forget-password">忘记密码?</span>
          <span @click="toRegister" class="register">立即注册</span>
        </div>
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

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import routes from "../config/route";
import {computed, reactive, ref} from "vue";
import myAxios from "../plugins/myAxios";
import { Toast } from "vant";
import { setCurrentUserState } from "../states/user";
import { currentID } from "../states/currentID";
import logo from '../assets/logo.png';

const router = useRouter();
const route = useRoute();
const userEmail = ref('');
const code = ref('');

const DEFAULT_TITLE = '邮箱登录';
const title = ref(DEFAULT_TITLE);
/**
 * 根据路由切换标题
 */
router.beforeEach((to: { path: any; }, from: any) => {
  const toPath = to.path;
  const route = routes.find((route: { path: any; }) => {
    return toPath == route.path;
  })
  title.value = route?.title ?? DEFAULT_TITLE;
})


const btnState = reactive({
  count: 60,
  text: '发送',
  disabled: false
});

const btnText = computed(() => btnState.disabled ? `${btnState.count}s后重试` : btnState.text);
const btnDisabled = computed(() => btnState.disabled);

const onSubmit = async () => {
  if(!userEmail.value){
    Toast.fail('请输入邮箱');
    return;
  }
  if(!code.value){
    Toast.fail('请输入验证码');
    return;
  }
  const res = await myAxios.post('/user/email/login', {
    email: userEmail.value,
    code: code.value,
  });
  if (res.code === 0 && res.data) {
    Toast.success('登录成功！');
    currentID.value = res.data.id;
    const Rest = await myAxios.get('/user/current');
    if (Rest.code === 0) {
      setCurrentUserState(Rest.data);
    }

    window.location.href = '/';
  } else {
    Toast.fail('登录失败！');
  }
};
// 注册
const toRegister = () => {
  router.push('/user/register')
};

const openForgetPassword = () => {
  router.push('/user/forgetPassword')

};
// 邮箱登录
const onClickLeft = () => {
  router.back();
};

async function sendCaptcha() {
  if (!userEmail.value) {
    Toast.fail('请填写邮箱');
    return;
  }

  btnState.disabled = true;
  btnState.text = '发送';

  const res = await myAxios.post('/user/sendCaptcha', {
    userEmail: userEmail.value,
  });

  if (res.code === 0 && res.data) {
    Toast.success('发送成功！');
  } else {
    Toast.fail('发送失败,\n' + res.description);
    btnState.disabled = false;
    return;
  }

  btnState.text = '发送成功';
  const timer = setInterval(() => {
    btnState.count--;
    if (btnState.count <= 0) {
      clearInterval(timer);
      btnState.disabled = false;
      btnState.text = '发送';
      btnState.count = 60;
    }
  }, 1000);
}
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
