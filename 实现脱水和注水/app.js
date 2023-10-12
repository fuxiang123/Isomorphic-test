import { createSSRApp } from 'vue'

// 用于服务器数据预取的接口
const getDogImgs = async () => {
  const imgs = [];
  for (let i = 0; i < 3; i++) {
      // 网上随便找的获取随机宠物图片的一个api
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      if (res.ok) {
          const data = await res.json();
          imgs.push(data.message);
      }
  }
  return imgs;
}


// 通过createSSRApp创建一个vue实例
// 该文件在服务器和客户端都会调用，所以抽成公共文件
export function createApp() {
  const component = {
    data: () => ({ imgs: [] }),
    template: `
    <div>
        <img v-for="img in imgs" :src="img" :key="img" style="width:500px;height:500px" />
    </div>
    `,
    // 自定义一个asyncData方法，用于服务端渲染时，提前获取数据
    // 我们会在服务器端调用这个方法，然后将数据挂载到window.__INITIAL_DATA__上
    asyncData: getDogImgs,
    async mounted() {
      // 如果已经有数据了，直接从window中获取
      // __INITIAL_DATA__是服务端渲染时，将数据挂载到window上的
      if (window.__INITIAL_DATA__) {
        // 有服务端数据时，使用服务端渲染时的数据
        this.imgs = window.__INITIAL_DATA__;
        window.__INITIAL_DATA__ = undefined;
        return;
      } else {
        // 如果没有数据，就请求数据
        this.imgs = await getDogImgs();
      }
    }
  };


  return createSSRApp(component);
}