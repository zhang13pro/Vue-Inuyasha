import { mergeOptions } from "../util/index"

export default function initExtend(Vue) {
  let cid = 0
  // 创建子类继承Vue父类 便于属性扩展
  Vue.extend = function (extendOptions) {
    // 创建子类的构造函数 并且调用初始化方法
    const Sub = function VueComponent(options) {
      this._init(options) // 调用Vue初始化方法
    }

    Sub.cid = cid++ //组件的唯一标识
    Sub.prototype = Object.create(this.prototype) // 子类原型指向父类
    Sub.prototype.constructor = Sub // 修正 constructor
    Sub.options = mergeOptions(this.options, extendOptions) //合并自己的options和父类的options
    return Sub
  }
}

// Vue.extend 核心思路就是使用原型继承的方法返回了 Vue 的子类 并且利用 mergeOptions 把传入组件的 options 和父类的 options 进行了合并
// 组件的合并策略同样用到了原型继承
