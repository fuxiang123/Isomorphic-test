import { createSSRApp } from 'vue'
  
// 通过createSSRApp创建一个vue实例
// 该文件在服务器和客户端都会调用，所以抽成公共文件
export function createApp() {
  return createSSRApp({
    data: () => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`,
  });
}