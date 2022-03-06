import { arrayMethods } from "./array"
import { hasProto } from "../util/env"
import Dep from "./dep"

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
class Observer {
  // 观测值
  constructor(value) {
    this.value = value
    this.dep = new Dep() //当数组使用7种重写方法时  是无法进行依赖收集和派发更新的  此属性主要辅助数组更新
    /*
    将Observer实例绑定到data的__ob__属性上面去，
    observe的时候会先检测是否已经有__ob__对象存放Observer实例了，
    */
    def(value, "__ob__", this)

    if (Array.isArray(value)) {
      // 是否支持__proto__
      if (hasProto) {
        protoAugment(value, arrayMethods) // 数组增强
      } else {
        copyAugment(value, arrayMethods, arrayKeys) // 对每个突变方法def
      }
      // 如果数组里面还包含数组 递归判断
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk(data) {
    // 让对象上的所有属性依次进行观测
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      let value = data[key]
      defineReactive(data, key, value)
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i])
    }
  }
}
// Object.defineProperty数据劫持核心 兼容性在ie9以及以上
function defineReactive(data, key, value) {
  let childOb = observe(value) // 递归关键 --如果value还是一个对象会继续走一遍defineReactive 层层遍历一直到value不是对象才停止
  let dep = new Dep() // 为每个属性实例化一个Dep

  Object.defineProperty(data, key, {
    get() {
      // 页面取值的时候 可以把watcher收集到dep里面--依赖收集
      if (Dep.target) {
        // 如果有watcher dep就会保存watcher 同时watcher也会保存dep
        dep.depend()
        if (childOb) {
          // 这里表示 属性的值依然是一个对象 包含数组和对象 childOb指代的就是Observer实例对象  里面的dep进行依赖收集
          // 比如{a:[1,2,3]} 属性a对应的值是一个数组 观测数组的返回值就是对应数组的Observer实例对象
          childOb.dep.depend()
          // 如果数据结构类似 {a:[1,2,[3,4,[5,6]]]} 这种数组多层嵌套  数组包含数组的情况
          // 那么我们访问a的时候 只是对第一层的数组进行了依赖收集 里面的数组因为没访问到  所以无法收集依赖
          // 但是如果我们改变了a里面的第二层数组的值  是需要更新页面的  所以需要对数组递归进行依赖收集
          if (Array.isArray(value)) {
            dependArray(value) // 不停的进行依赖收集
          }
        }
      }
      return value
    },
    set(newValue) {
      if (newValue === value) return
      // 如果赋值的新值也是一个对象  需要观测
      observe(newValue)
      value = newValue
      dep.notify() // 通知渲染watcher去更新--派发更新
    },
  })
}
// 递归收集数组依赖
function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    // e.__ob__代表e已经被响应式观测了 但是没有收集依赖 所以把他们收集到自己的Observer实例的dep里面
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      // 如果数组里面还有数组  就递归去收集依赖
      dependArray(e)
    }
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe(data) {
  if (typeof data !== "object" || data == null) {
    return
  }
  // 如果是对象或数组 将递归进行属性劫持 返回新ob实例
  return new Observer(data)
}

// helpers

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  })
}

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment(target, src) {
  target.__proto__ = src
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
function copyAugment(target, src, keys) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}
