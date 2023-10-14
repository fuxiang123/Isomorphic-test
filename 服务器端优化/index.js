import ssrServer from './server.js';
import processDaemon from './processDaemon.js';

// 启动服务
const task = () => {
  ssrServer();
};

processDaemon(task);
