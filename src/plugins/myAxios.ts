import axios, {AxiosInstance} from "axios";
import {currentID} from "../states/currentID";
import {Toast} from "vant";
import {getCurrentUser} from "../services/user";
const myAxios: AxiosInstance = axios.create({
    // baseURL: 'http://124.221.169.181:8090/api'
    baseURL: 'http://localhost:8080/api'
});
// 携带cookie
myAxios.defaults.withCredentials = true; // 配置为true

// Add a request interceptor
myAxios.interceptors.request.use(function (config) {
    console.log('我要发请求啦', config)
    // Do something before request is sent  如果用户未登录
    if(getCurrentUser == null){
        window.location.href = `/user/login?redirect=${window.location.href}`;
    }
    // @ts-ignore
    return config;
}, function (error) {
    // Do something with request error

    return Promise.reject(error);
});

// Add a response interceptor
myAxios.interceptors.response.use(function (response) {
    console.log('我收到你的响应啦', response)
    // 如果返回的是401 状态码
    if (response.data?.code === 40100) { // 检查JSON中的状态码
        window.location.href = `/user/login?redirect=${window.location.href}`;
    }
    // Do something with response data
    return response.data;
}, function (error) {
    console.log('我收到你的错误响应啦', error)
    Toast(error);
    switch (error.response.status) {
        case 40100:
            // 返回 40100 ,跳转到登录：
            Toast('请先登录');
            window.location.href = `/user/login?redirect=${window.location.href}`;
    }

    return Promise.reject(error);
});

export default myAxios;

