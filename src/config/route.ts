// 定义一些路由
import Index from "../pages/Index.vue";
import Team from "../pages/TeamPage.vue";
import UserPage from "../pages/UserPage.vue";
import UserUpdatePage from "../pages/UserUpdatePage.vue";
import UserTeamJoinPage from "../pages/UserTeamJoinPage.vue";
import UserTeamCreatePage from "../pages/UserTeamCreatePage.vue";
import SearchPage from "../pages/SearchPage.vue";
import SearchResultPage from "../pages/SearchResultPage.vue";
import UserEditPage from "../pages/UserEditPage.vue";
import UserLoginPage from "../pages/UserLoginPage.vue";
import TeamAddPage from "../pages/TeamAddPage.vue";
import TeamUpdatePage from "../pages/TeamUpdatePage.vue";
import UserRegisterPage from "../pages/RegisterPage.vue";
import UserEditTagPage from "../pages/UserEditTagPage.vue";
import ForgetPasswordPage from "../pages/ForgetPasswordPage.vue";
import ChatPage from "../pages/ChatPage.vue";
import UserInfoPage from "../pages/UserInfoPage.vue";
import UserEmailLogin from "../pages/UserEmailLoginPage.vue";
import TeamUsersPage from "../pages/TeamUsersPage.vue";
/**meta:{navShow :true}是否是一级页面 */  //  ,meta:{navShow :true,tabbarShow:true}
const routes = [
    { path: '/', title: '主页', component: Index },
    { path: '/team', title: '找队伍', component: Team},
    { path: '/team/add', title: '创建队伍', component: TeamAddPage },
    { path: '/team/update', title: '更新队伍', component: TeamUpdatePage },
    { path: '/user', title: '我的信息', component: UserPage},
    { path: '/search', title: '找搭子', component: SearchPage },
    { path: '/user/list', title: '用户列表', component: SearchResultPage },
    { path: '/user/edit', title: '编辑信息', component: UserEditPage  },
    { path: '/user/login', title: '用户登录', component: UserLoginPage },
    { path: '/user/forgetPassword', title: '忘记密码', component: ForgetPasswordPage },
    { path: '/user/register', title: '注册账号', component: UserRegisterPage },
    { path: '/user/update', title: '更新信息', component: UserUpdatePage },
    { path: '/user/team/join', title: '我的队伍', component: UserTeamJoinPage },
    { path: '/user/team/create', title: '创建队伍', component: UserTeamCreatePage },
    { path: '/user/team/users', title: '队员列表', component: TeamUsersPage },
    { path: '/user/edit/tag', title: '编辑标签', component: UserEditTagPage },
    { path: '/chat', title: '聊天', component: ChatPage },
    {path: '/public_chat',title: '公共聊天',component: ChatPage},
    {path: '/user/info/',title: '用户信息',component: UserInfoPage},
    {path: '/user/login/email',title: '邮箱登录',component: UserEmailLogin}
]

export default routes;
