import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 文档目录（原型素材文件）：不参与文件监视
const docDir = fileURLToPath(new URL('./doc', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 将 @ 别名映射到 src 目录，方便使用绝对路径导入
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
    // 监视选项：忽略 doc 文档目录（原型素材），避免文件监视异常
    watch: {
      ignored: (filePath) => filePath.startsWith(docDir),
    },
    // 开发服务器代理：/api 开头的请求转发到后端 8080 端口
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
