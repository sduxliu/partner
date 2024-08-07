<template>
  <div class="chat-container">
    <div v-if="route.path === '/public_chat'" class="notice-bar">
      <van-notice-bar
          left-icon="volume-o"
          scrollable
          color="#1989fa"
          background="#ecf9ff"
          text="感谢大家的参与，请勿在此刷屏。为维护和谐网络环境，发言需遵守法律法规，不侵犯他人隐私、权利，不进行人身攻击、发布广告或垃圾信息，不散布虚假信息或恶意传播谣言，尊重他人，注意措辞和语气。"
      />
    </div>
    <div v-if="route.path === '/public_chat'" class="chat-content">
      <!-- Public chat content here -->
    </div>
    <div v-else class="header" >
      <p v-if="stats.chatType === stats.chatEnum.PRIVATE_CHAT">{{ stats.chatUser.username.slice(0, 14) }}</p>
      <p v-if="stats.chatType === stats.chatEnum.TEAM_CHAT">{{ stats.team.teamName.slice(0, 14) }}</p>
    </div>
    <div class="content" ref="chatRoom" v-html="stats.content"></div>
    <div class="send">
      <V3Emoji
          :recent="true"
          @click-emoji="appendText"
          :options-name="optionsName"
          size="bif"
      />
      <textarea placeholder="聊点什么吧...." v-model="stats.text" @keyup.enter="send" class="input-text"></textarea>
      <button class="input-send-button" @click="send">
        <van-icon name="guide-o" style="font-size: 36px;" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {nextTick, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {Toast} from "vant";
import {getCurrentUser} from "../services/user";
import request from "../plugins/myAxios";
import V3Emoji from 'vue3-emoji'
import 'vue3-emoji/dist/style.css'
import {defaultAvatar} from "../common/commons"
const route = useRoute()
const router = useRouter()

const stats = ref({
  user: {
    id: 0,
    username: "",
    userAvatarUrl: ''
  },
  isCollapse: false,
  users: [],
  chatUser: {
    id: 0,
    username: ''
  },
  chatEnum: {
    // 私聊
    PRIVATE_CHAT: 1,
    // 队伍聊天
    TEAM_CHAT: 2,
    // 大厅
    HALL_CHAT: 3
  },
  chatType: null,
  team: {
    teamId: 0,
    teamName: ''
  },
  text: "",
  messages: [],
  content: ''
})

const appendText = (val) => {
  stats.value.text += val
}


const optionsName = {
  'Smileys & Emotion': '笑脸&表情',
  'Food & Drink': '食物&饮料',
  'Animals & Nature': '动物&自然',
  'Travel & Places': '旅行&地点',
  'People & Body': '人物&身体',
  Objects: '物品',
  Symbols: '符号',
  Flags: '旗帜',
  Activities: '活动'
};

let socket = null;
const heartbeatInterval = 30 * 1000; // 30秒
let heartbeatTimer = null;
// 发送心跳包准备测试连接
const startHeartbeat = () => {
  heartbeatTimer = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send("PING");
    }
  }, heartbeatInterval);
}

const stopHeartbeat = () => {
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

const chatRoom = ref(null)
// 页面加载完成后运行第一次
onMounted(async (children, fn) => {
  // 获取信息——历史消息
  let {id, username, userType, teamId, teamName, teamType} = route.query
  stats.value.chatUser.id = Number.parseInt(id)
  stats.value.team.teamId = Number.parseInt(teamId)
  stats.value.chatUser.username = username
  stats.value.team.teamName = teamName
  // 聊天类型
  if (userType && Number.parseInt(userType) === stats.value.chatEnum.PRIVATE_CHAT) {
    stats.value.chatType = stats.value.chatEnum.PRIVATE_CHAT
  } else if (teamType && Number.parseInt(teamType) === stats.value.chatEnum.TEAM_CHAT) {
    stats.value.chatType = stats.value.chatEnum.TEAM_CHAT
  } else {
    stats.value.chatType = stats.value.chatEnum.HALL_CHAT
  }
  stats.value.user = await getCurrentUser()
  // 私聊
  if (stats.value.chatType === stats.value.chatEnum.PRIVATE_CHAT) {
    let privateMessage = await request.post("/chat/privateChat",
        {
          toId: stats.value.chatUser.id,
        });
    console.log("私聊消息:" + stats.value.chatUser.id);
    console.log(privateMessage)
    privateMessage = Array.from(privateMessage.data);
    if(privateMessage.length === 0 || privateMessage.length === 1){
      // createContent(null, stats.value.chatUser, "暂无消息")
    }else {
      privateMessage.forEach(chat => {
        if (chat.isMy === true) {
          createContent(null, chat.formUser, chat.text)
        } else {
          createContent(chat.toUser, null, chat.text, null, chat.createTime)
        }
      })
    }

  }
  if (stats.value.chatType === stats.value.chatEnum.HALL_CHAT) {
    let hallMessage = await request.get("/chat/hallChat")
    console.log("大厅消息:"+hallMessage.data);
    hallMessage = Array.from(hallMessage.data);
    if(hallMessage.length === 0){
      // createContent(null, stats.value.user, "暂无消息")
    }else{
      hallMessage.forEach(chat => {
        if (chat.isMy === true) {
          createContent(null, chat.formUser, chat.text)
        } else {
          createContent(chat.formUser, null, chat.text, chat.isAdmin,chat.createTime)
        }
      })
    }

  }
  if (stats.value.chatType === stats.value.chatEnum.TEAM_CHAT) {
    let teamMessage = await request.post("/chat/teamChat",
        {
          teamId: stats.value.team.teamId
        })
    teamMessage = Array.from(teamMessage.data);
    if(teamMessage.length === 0){
      // createContent(null, stats.value.user, "暂无消息")
    }else{
      teamMessage.forEach(chat => {
        if (chat.isMy === true) {
          createContent(null, chat.formUser, chat.text)
        } else {
          createContent(chat.formUser, null, chat.text, chat.isAdmin,chat.createTime)
        }
      })
    }

  }
  // 初始化，建立websocket
  init()
  // 内容始终显示最下方
  await nextTick()
  const lastElement = chatRoom.value.lastElementChild
  // lastElement.scrollIntoView()
  if (lastElement) {
    lastElement.scrollIntoView()
  } else {
    console.error('lastElement is null or undefined');
  }
})

const init = () => {
  let uid = stats.value.user?.id;
  if (typeof (WebSocket) == "undefined") {
    Toast.fail("您的浏览器不支持WebSocket")
  } else {
    // 区分线上和开发环境
    let socketUrl = process.env.NODE_ENV !== "development" ? `wss://xinxi.sdu/api/websocket/${uid}/${stats.value.team.teamId}`
        : `ws://localhost:8080/api/websocket/${uid}/${stats.value.team.teamId}`
    console.log("socket地址:"+socketUrl)
    if (socket != null) {
      socket.close();
      socket = null;
    }
    // 开启一个websocket服务
    socket = new WebSocket(socketUrl);
    //打开事件
    socket.onopen = function () {
      startHeartbeat();
      console.log("websocket已打开");
    };
    //  浏览器端收消息，获得从服务端发送过来的文本消息
    socket.onmessage = function (msg) {
      if (msg.data === "pong") {
        return;
      }
      // 对收到的json数据进行解析，
      let data = JSON.parse(msg.data)
      if (data.error) {
        Toast.fail(data.error)
        return
      }
      // 获取在线人员信息；发送的在线人员信息
      if (data.users) {
        stats.value.users = data.users.filter(user => {
          return user.id !== uid
        })
        // 获取当前连接的所有用户信息，并且排除自身，自己不会出现在自己的聊天列表里
      } else {
        // 如果服务器端发送过来的json数据 不包含 users 这个key，那么发送过来的就是聊天文本json数据
        let flag;
        if (stats.value.chatType === data.chatType) {
          // 单聊: 发送给自己的和自己发送的信息
          flag = (uid === data.toUser?.id && stats.value.chatUser?.id === data.formUser?.id)
        }
        if ((stats.value.chatType === data.chatType)) {
          // 大厅 对方发送的消息
          flag = (data.formUser?.id !== uid)
        }
        // 队伍
        if (stats.value.chatType === data.chatType && data.teamId && stats.value.team.teamId === data.teamId) {
          // 自己没有发送消息
          flag = (data.formUser?.id !== uid)
        }
        if (flag) {
          stats.value.messages.push(data)
          // 构建消息内容
          createContent(data.formUser, null, data.text, data.isAdmin,data.createTime)
          nextTick(() => {
            const lastElement = chatRoom.value.lastElementChild
            lastElement.scrollIntoView()
          })
        }
        flag = null;
      }
    };
    //关闭事件
    socket.onclose = function () {
      console.log("websocket已关闭");
      stopHeartbeat();
      setTimeout(init, 5000); // 5秒后重连
    };
    //发生了错误事件
    socket.onerror = function () {
      console.log("websocket发生了错误");
    }
  }
}

const send = () => {
  if (stats.value.chatUser.id === 0) {
    return;
  }
  if (stats.value.chatUser.id === stats.value.user.id) {
    Toast.fail("不能给自己发信息")
    return;
  }
  if (!stats.value.text.trim()) {
    Toast.fail("请输入内容")
  } else {
    if (typeof (WebSocket) == "undefined") {
      Toast.fail("您的浏览器不支持WebSocket")
    } else {
      console.log("您的浏览器支持WebSocket");
      let message = {
        fromId: stats.value.user.id,
        toId: stats.value.chatUser.id,
        text: stats.value.text,
        chatType: stats.value.chatType,
        teamId: stats.value.team.teamId,
      }
      console.log(message);
      // 发送消息
      socket.send(JSON.stringify(message));
      console.log("发送成功");
      stats.value.messages.push({user: stats.value.user.id, text: stats.value.text})
      createContent(null, stats.value.user, stats.value.text)
      stats.value.text = '';
      nextTick(() => {
        const lastElement = chatRoom.value.lastElementChild
        // lastElement.scrollIntoView()
        if (lastElement) {
          lastElement.scrollIntoView()
        } else {
          console.error('lastElement is null or undefined');
        }
      })
    }
  }
}

const showUser = (id) => {
  router.push({
    path: "/user/info",
    query: {
      id: id
    }
  })
}

/**
 * 这个方法是用来将 json的聊天消息数据转换成 html的。
 */
const createContent = (remoteUser, nowUser, text, isAdmin,createTime) => {
  // 当前用户消息
  let html;
  if (nowUser) {
    // nowUser 表示是否显示当前用户发送的聊天消息，绿色气泡
    html = `
    <div class="message self">
    <div class="myInfo info">
      <img :alt=${nowUser.username} class="avatar" onclick="showUser(${nowUser.id})" src=${nowUser.userAvatarUrl ?? defaultAvatar}>
    </div>
      <p class="text">${text}</p>
    </div>
`
  } else if (remoteUser) {
    // remoteUser表示远程用户聊天消息，灰色的气泡
    html = `
     <div class="message other">
      <img :alt=${remoteUser.username} class="avatar" onclick="showUser(${remoteUser.id})" src=${remoteUser.userAvatarUrl ?? defaultAvatar}>
    <div class="info">
      <span class="username">${remoteUser.username.length < 10 ? remoteUser.username : remoteUser.username.slice(0, 10)}&nbsp;&nbsp;&nbsp;${createTime}</span>
      <p class="${isAdmin ? 'admin text' : 'text'}" >${text}</p>
    </div>
    </div>
`
  }
  stats.value.content += html;
}
/**
 * 模板字符串事件
 * @param id
 */
window.showUser = (id) => {
  showUser(id)
}

</script>
<style>
.header {
  text-align: center;
  margin-top: 10px;
}
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.notice-bar {
  width: 100%;
  position: fixed;
  top: 44px;
}
.message {
  display: flex;
  align-items: center;
  margin: 10px 10px;
}

.content {
  padding-top: 22px;
  padding-bottom: 57px;
  display: flex;
  flex-direction: column
}
.chat-content {
  flex: 1;
  overflow: auto;
  padding-top: 54px; /* Adjust for the fixed notice bar */
}

.self {
  align-self: flex-end;
}

.avatar {
  align-self: flex-start;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 10px;
  margin-left: 10px;
}

.username {
  align-self: flex-start;
  text-align: center;
  max-width: 200px;
  font-size: 12px;
  color: #999;
  padding-bottom: 4px;
  white-space: nowrap;
  overflow: visible;
  background-color: #fff;
}

.info {
  display: flex;
  flex-direction: column;
  order: 2;
}

.myInfo {
  align-self: flex-start;
}

.text {
  padding: 10px;
  border-radius: 10px;
  background-color: #eee;
  word-wrap: break-word;
  word-break: break-all;
}

.other .text {
  align-self: flex-start;
}

.admin {
  background-color: rgba(253, 0, 0, 0.13);
}

.self .text {
  background-color: #0084ff;
  color: #fff;
}


.input-send-button {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}
.send {
  position: fixed;
  bottom: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
}
.input-text {
  flex: auto;
  width: 2060px;
  margin-right: 10px;
  padding: 1px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
}


.emoji-item {
  width: 0;
  height: 0;
  margin-top: -45px;
}

.pollup {
  width: 290px;
  height: 280px;
  position: absolute;
  right: 0;
  margin-left: 10px;
  bottom: 50px;
  z-index: 5;
  transition: all ease .5s;
  border-radius: 10px;
  overflow: hidden;
}

.pollup .emoji-container-item {
  padding: 1px;
  text-align: center;
  cursor: pointer;
}

.emoji-container-open-btn {
  font-size: 28px;
  cursor: pointer;
  margin-left: 5px;
}

</style>
