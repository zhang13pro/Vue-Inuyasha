let callbacks = []
let pending = false
// 包括渲染watcher 和用户手动调用nextTick传入的回调
function flushCallbacks() {
  pending = false //只有异步回调真正开始调用 才把标志还原为false
  // 依次执行回调
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]()
  }
}
let timerFunc // 定义异步方法 最好的情况是微任务
if (typeof Promise !== "undefined") {
  // 如果支持promise
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
  }
} else if (typeof MutationObserver !== "undefined") {
  // MutationObserver 主要是监听dom变化 微任务
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true,
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} else if (typeof setImmediate !== "undefined") {
  // 降级为宏任务
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb) {
  // 除了渲染watcher调用，还有用户自己手动调用的nextTick 一起被收集到数组
  callbacks.push(cb)
  // 标志位经典用法 确保多次调用nextTick只执行一次，真正清空异步队列回调时恢复标志位
  if (!pending) {
    // Promise.resolve().then(flushCallbacks) // Vue3 不考虑兼容性
    pending = true
    // 异步执行
    timerFunc()
  }
}
