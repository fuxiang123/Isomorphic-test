import { createSSRApp } from 'vue'
  
// 通过createSSRApp创建一个vue实例
export function createApp() {
  return createSSRApp({
    data: () => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`,
  });
}

export default createApp;