import { pushTarget, popTarget } from "./dep"
import { queueWatcher } from "./scheduler"
import { isObject } from "../util/index"

// 全局变量id  每次new Watcher都会自增
let id = 0

class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn // updateComponent
    this.cb = cb //回调函数 比如在watcher更新之前可以执行beforeUpdate方法、用户watcher的handler
    this.options = options //额外的选项 true代表渲染watcher
    this.id = id++ // watcher的唯一标识
    this.deps = [] //存放dep的容器
    this.depsId = new Set() //用来去重dep
    this.user = options.user //标识用户watcher
    this.lazy = options.lazy //标识计算属性watcher
    this.dirty = this.lazy //dirty可变  表示计算watcher是否需要重新计算 默认是true
    // 如果表达式是一个函数
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn
    } else {
      // 用户watcher 传过来的可能是一个字符串   类似 "a.a.a.a.b"
      this.getter = function () {
        let path = exprOrFn.split(".")
        let obj = vm
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]] //vm.a.a.a.a.b
        }
        return obj
      }
    }
    // 非计算属性实例化就会默认调用get方法 进行取值  保留结果 计算属性实例化的时候不会去调用get
    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    pushTarget(this) // 在调用方法之前先把当前watcher实例推到全局Dep.target上
    // 如果watcher是渲染watcher 那么就相当于执行  vm._update(vm._render())
    // 这个方法在render函数执行的时候会取值 从而实现依赖收集
    // 计算属性在这里执行用户定义的get函数 访问计算属性的依赖项
    // 从而把自身计算watcher添加到依赖项dep里面收集起来
    const res = this.getter.call(this.vm)
    popTarget() // 在调用方法之后把当前watcher实例从全局Dep.target移除
    return res
  }
  //   把dep放到deps里面 同时保证同一个dep只被保存到watcher一次  同样的  同一个watcher也只会保存在dep一次
  addDep(dep) {
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      //   直接调用dep的addSub方法  把自己--watcher实例添加到dep的subs容器里面
      dep.addSub(this)
    }
  }
  update() {
    // 计算属性依赖的值发生变化 只需要把dirty置为true  下次访问到了重新计算
    if (this.lazy) {
      this.dirty = true
    } else {
      // 多次调用update 将渲染watcher先缓存起来，等一会一起更新
      queueWatcher(this) // 异步推送到观察者队列中 下一个tick时调用
    }
  }
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  // 让计算属性的依赖值 收集外层 watcher
  depend() {
    // 计算属性的watcher存储了依赖项的dep
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend() //调用依赖项的dep去收集渲染watcher
    }
  }
  // TODO Vue的数据劫持的粒度可以很小，所以为什么引入VDOM和diff

  // watcher.update queueWatcher 执行nextTick(cb) 在回调中遍历触发watcher queue中的run()
  run() {
    const newVal = this.get() //新值
    const oldVal = this.value //老值
    this.value = newVal // 现在的新值将成为下一次变化的老值
    // 方法判断 watcher 类型
    if (this.user) {
      // 用户 watcher
      if (newVal !== oldVal || isObject(newVal)) {
        this.cb.call(this.vm, newVal, oldVal)
      }
    } else {
      // 渲染 watcher
      this.cb.call(this.vm)
    }
  }
}

export default Watcher
