import { initState } from "./state"
import { initEvents } from "./instance/events"
import { compileToFunctions } from "./compiler/index"
import { callHook, mountComponent } from "./lifecycle"
import { mergeOptions } from "./util/index"

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    // 这里的this代表调用_init方法的对象(实例对象)
    // this.$options缓存 用户new Vue的时候传入的属性和全局的Vue.options合并之后的结果
    // vm.constructor指向的是vm.__proto__.constructor===Vue.prototype.constructor===Vue
    vm.$options = mergeOptions(vm.constructor.options, options)
    initLifecycle(vm) // TODO
    initEvents(vm)
    initRender(vm) // TODO
    callHook(vm, "beforeCreate")
    initInjections(vm) // TODO resolve injections before data/props
    // 初始化状态，将data转化成响应式
    initState(vm)
    initProvide(vm) // TODO resolve provide after data/props
    callHook(vm, "created")
    // 如果有el属性 进行模板渲染
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  // 这块代码在源码里面的位置其实是放在entry-runtime-with-compiler.js里面
  // 表示Vue包含compile编译功能的版本 和runtime-only版本区分开
  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    vm.$el = el = document.querySelector(el)

    // 将模板转换成对应渲染函数 =>虚拟dom vnode => diff算法 更新虚拟dom => 产生真实节点，更新
    if (!options.render) {
      let template = options.template

      if (!template && el) {
        // 如果不存在render和template 但是存在el属性 直接将模板赋值到el所在的外层html结构（就是el本身 并不是父元素）
        template = el.outerHTML
      }
      // 如果存在template属性，把template模板转化成render函数
      if (template) {
        const render = compileToFunctions(template)
        options.render = render
      }
      // 既没template又没有el的情况呢？
      // 要熟悉 options.components API 的用法
    }

    // 组件挂载流程
    return mountComponent(vm, el)
  }
}
