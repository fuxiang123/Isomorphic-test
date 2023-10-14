import { cpus } from 'os';
import cluster from 'cluster';

const numCPUs = cpus().length;

// 创建子进程
function createWorker() {
  // 创建子进程并进行心跳监控
  const worker = cluster.fork();

  let missed = 0; // 没有回应的心跳次数

  // 心跳
  const timer = setInterval(() => {
    // 三次没回应，杀之
    if (missed == 3) {
      clearInterval(timer);
      console.log('子进程' + worker.process.pid + '心跳检测失败!');
      process.kill(worker.process.pid);
      return;
    }
    // 开始心跳
    missed++;
    worker.send('ping#' + worker.process.pid);
  }, 10000);

  worker.on('message', msg => {
    // 确认心跳回应。
    if (msg == 'pong#' + worker.process.pid) {
      missed--;
    }
  });

  // 挂了就没必要再进行心跳了
  worker.on('exit', () => {
    clearInterval(timer);
  });
  console.log('子进程' + worker.process.pid + '已启动');
}

export default task => {
  if (cluster.isPrimary) {
    // 主进程逻辑
    for (let i = 0; i < numCPUs / 2; i++) {
      createWorker();
    }

    // 子进程因错误退出时，创建新的子进程替代
    cluster.on('exit', () => {
      setTimeout(() => {
        createWorker();
      }, 5000);
    });
  } else {
    // 子进程逻辑
    // 回应心跳信息
    process.on('message', msg => {
      if (msg === 'ping#' + process.pid) {
        process.send('pong#' + process.pid);
      }
    });

    // 处理未捕获异常
    process.on('uncaughtException', err => {
      console.error('进程' + process.pid + '发生错误:', err);
      // TODO: 可对错误进行上报、写入日志
      process.exit(1);
    });

    // 子进程内存泄露监控
    const timer = setInterval(() => {
      const mem = process.memoryUsage();
      if (mem.rss > 314572800) {
        // 300M
        console.error('子进程' + process.pid + '内存泄露:', mem);
        clearInterval(timer);
        process.exit(1);
      }
    }, 5000);

    task();
  }
};
