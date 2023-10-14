import { createSSRApp } from 'vue'

// 用于服务器数据预取的接口
// 生成三个随机数
const getRandomNums = async () => {
  const randomNums = [];
  for (let i = 0; i < 3; i++) {
      // 远程接口不好测试，这里换成手动mock接口
      const res = await new Promise((resolve) => {
          setTimeout(() => {
              resolve(Math.random());
          }, 100);
      });
      randomNums.push(res);
  }
  return randomNums;
}


// 通过createSSRApp创建一个vue实例
// 该文件在服务器和客户端都会调用，所以抽成公共文件
export function createApp() {
  const component = {
    data: () => ({ nums: [] }),
    template: `<div v-for="num in nums" :key="num" >{{ num  }}</div>`,
    // 自定义一个asyncData方法，用于服务端渲染时，提前获取数据
    // 我们会在服务器端调用这个方法，然后将数据挂载到window.__INITIAL_DATA__上
    asyncData: getRandomNums,
    async mounted() {
      // 如果已经有数据了，直接从window中获取
      // __INITIAL_DATA__是服务端渲染时，将数据挂载到window上的
      if (window.__INITIAL_DATA__) {
        // 有服务端数据时，使用服务端渲染时的数据
        this.nums = window.__INITIAL_DATA__;
        window.__INITIAL_DATA__ = undefined;
        return;
      } else {
        // 如果没有数据，就请求数据
        this.nums = await getRandomNums();
      }
    }
  };


  return createSSRApp(component);
}