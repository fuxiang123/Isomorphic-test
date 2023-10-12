import express from 'express'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './app.js'

// 创建一个express实例
const server = express();

// 通过express.get方法创建一个路由, 作用是当浏览器访问'/'时, 对该请求进行处理
server.get('/', async (req, res) => {
  // 通过createSSRApp创建一个vue实例
  const app = createApp();

  let initData = null;
  // 判断是否有我们自定义的asyncData方法，如果有就用该函数初始化数据
  if (app._component.asyncData) {
    initData = await app._component.asyncData();
  }
  
  // 这个接口获取的图片是随机的,如果浏览器的图片地址和这里一致
  // 说明浏览器没有触发二次渲染，同构成功
  console.log("当前的图片地址是:" + JSON.stringify(initData));

  // 通过renderToString将vue实例渲染成字符串
  renderToString(app).then((html) => {
    // 将字符串插入到html模板中
    // 通过一个script标签将初始化数据挂载到window.__INITIAL_DATA__上
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
          <script>window.__INITIAL_DATA__ = ${JSON.stringify(initData)}</script>
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