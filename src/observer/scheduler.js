import { nextTick } from "../util/next-tick"
let queue = []
let has = {} // 存放watcher的列表
// 渲染watcher的回调
function flushSchedulerQueue() {
  for (let index = 0; index < queue.length; index++) {
    // 调用watcher的run方法 执行真正的更新操作
    queue[index].run()
  }
  // 执行完之后清空队列
  queue = []
  has = {}
}

// 实现异步队列机制
export function queueWatcher(watcher) {
  const id = watcher.id
  //   watcher去重，多次触发setter只添加同一个渲染watcher
  if (has[id] === undefined) {
    //  同步代码执行 把全部的watcher都放到队列里面去
    queue.push(watcher)
    has[id] = true
    // 进行异步调用 批处理 防抖
    nextTick(flushSchedulerQueue) // 使用异步渲染是基于性能的考虑
  }
}
