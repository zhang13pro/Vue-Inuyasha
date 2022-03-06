import { isObject } from "./util/index"
import Dep from "./observer/dep.js"
import { observe } from "./observer/index.js"
import Watcher from "./observer/watcher"

// 初始化状态 注意这里的顺序 面试会问到：是否能在data里面直接使用prop的值 为什么？
// 这里初始化的顺序依次是 prop>methods>data>computed>watch
export function initState(vm) {
  // 获取传入的数据对象
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    /*该组件没有data的时候绑定一个空对象*/
    observe((vm._data = {}), true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch) initWatch(vm, opts.watch)
}

function initProps(vm, propsOptions) {
  // 缓存 props 的每个 key，性能优化
  const keys = (vm.$options._propKeys = [])
  // 遍历 props 对象
  for (const key in propsOptions) {
    // 缓存 key
    keys.push(key)
    // props格式验证
    const value = validateProp(key, propsOptions, propsData, vm)
    // TODO Vue的更新粒度为什么是组件级？
    defineReactive(props, key, value)
    // 代理 key 到 vm 对象上
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
}

// TODO bind是哪来的
function initMethods(vm, methods) {
  // 遍历 methods 对象，将 methods[key] 放到 vm 实例上
  for (const key in methods) {
    vm[key] = typeof methods[key] !== "function" ? noop : bind(methods[key], vm)
  }
}

// 初始化data数据
function initData(vm) {
  let data = vm.$options.data
  // 实例的_data属性就是传入的data
  // vue组件data推荐使用函数 防止数据在组件之间共享
  data = vm._data = typeof data === "function" ? data.call(vm) : data

  // proxy data on instance
  // 把data数据代理到vm 也就是Vue实例上面 我们可以使用this.a来访问this._data.a
  for (let key in data) {
    proxy(vm, `_data`, key)
  }

  //   对数据进行观测 --响应式数据核心
  observe(data)
}

function initComputed(vm) {
  const computed = vm.$options.computed
  const watchers = (vm._computedWatchers = {}) // 用来存放计算属性watcher

  for (let k in computed) {
    const userDef = computed[k] // 获取用户定义的计算属性
    const getter = typeof userDef === "function" ? userDef : userDef.get // 计算属性可以是函数 也可以是包含get set的对象
    // 创建计算watcher  lazy标志设置为true
    watchers[k] = new Watcher(vm, getter, () => {}, { lazy: true })
    // 对计算属性结果做缓存
    defineComputed(vm, k, userDef)
  }
}

// 定义普通对象用来劫持计算属性
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: () => {},
  set: () => {},
}
// 重新定义计算属性  对get和set劫持
function defineComputed(target, key, userDef) {
  if (typeof userDef === "function") {
    // 如果是一个函数  需要手动赋值到get上
    sharedPropertyDefinition.get = createComputedGetter(key)
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = userDef.set
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 重写计算属性的get方法 来判断是否需要进行重新计算
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key] // 获取对应的计算属性watcher
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate() // 计算属性取值的时候 如果是脏的  需要重新求值
        // 如果Dep还存在target 这个时候一般为渲染watcher 计算属性依赖的数据也需要收集
        if (Dep.target) {
          // TODO 这里为什么要收集依赖，涉及到使用栈结构保存watcher
          watcher.depend() // 收集计算属性的依赖
        }
      }
      return watcher.value // 计算属性watcher的值
    }
  }
}

// 初始化watch
function initWatch(vm) {
  let watch = vm.$options.watch
  for (let k in watch) {
    const handler = watch[k] // 用户自定义watch的写法可能是数组 对象 函数 字符串
    if (Array.isArray(handler)) {
      // 如果是数组就遍历进行创建
      handler.forEach((handle) => {
        createWatcher(vm, k, handle)
      })
    } else {
      createWatcher(vm, k, handler)
    }
  }
}

// 处理后的 handler 是对象或字符串
function createWatcher(vm, exprOrFn, handler, options = {}) {
  if (isObject(handler)) {
    options = handler //保存用户传入的对象
    handler = handler.handler // 用户watch写的handler函数
  }
  if (typeof handler === "string") {
    handler = vm[handler] // methods里的函数
  }

  return vm.$watch(exprOrFn, handler, options) // 调用vm.$watch创建用户watcher
}

// 代理 this.a = this._data.a;
function proxy(object, sourceKey, key) {
  Object.defineProperty(object, key, {
    get() {
      return object[sourceKey][key]
    },
    set(newValue) {
      object[sourceKey][key] = newValue
    },
  })
}

export function stateMixin(Vue) {
  // 处理watch的兼容性写法后 形参cb就是要执行的handler函数了
  Vue.prototype.$watch = function (exprOrFn, cb, options) {
    options.user = true // 用户watcher
    const vm = this
    let watcher = new Watcher(vm, exprOrFn, cb, options)
    if (options.immediate) {
      // TODO 为什么要传入参数
      cb.call(vm, watcher.value)
    }
  }
}
