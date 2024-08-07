import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

import styleImport, {VantResolve} from 'vite-plugin-style-import';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        styleImport({
        resolves: [VantResolve()],
    }),],
    server: {
    host: '0.0.0.0', // 这个用于启动
    port: 8092, // 指定启动端口 不要加''
    open: true //启动后是否自动打开浏览器
}
})



// export default {
//     plugins: [
//         vue(),
//         AutoImport({
//             resolvers: [VantResolver()],
//         }),
//         Components({
//             resolvers: [VantResolver()],
//         }),
//     ],
//     //修改启动的
//     server: {
//         host: '0.0.0.0', // 这个用于启动
//         port: '8092', // 指定启动端口
//         open: true //启动后是否自动打开浏览器
//     }
// };
