import express from 'express'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './app.js'

// 创建一个express实例
const server = express();

// 通过express.get方法创建一个路由, 作用是当浏览器访问'/'时, 对该请求进行处理
server.get('/', (req, res) => {
  // 通过createSSRApp创建一个vue实例
  const app = createApp();
  
  // 通过renderToString将vue实例渲染成字符串
  renderToString(app).then((html) => {
    // 将字符串插入到html模板中
    const htmlStr = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vue SSR Example</title>
          <script type="importmap">
          {
            "imports": {
              "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
            }
          }
          </script>
          <script type="module" src="/client-entry.js"></script>
        </head>
        <body>
          <div id="app">${html}</div>
        </body>
      </html>
    `;
    // 通过res.send将字符串返回给浏览器
    res.send(htmlStr);
  });
})

// 将当前目录作为静态资源目录，这样浏览器才能访问到client-entry.js
server.use(express.static('.'));

// 监听3000端口
server.listen(3000, () => {
  console.log('ready http://localhost:3000')
})