import { isObject, isReservedTag } from "../util/index";
// 定义Vnode类
export default class Vnode {
  constructor(tag, data, key, children, text, componentOptions) {
    console.log(
      "🚀 ~ file: index.js ~ line 5 ~ Vnode ~ constructor ~ componentOptions",
      componentOptions
    );
    this.tag = tag;
    this.data = data;
    this.key = key;
    this.children = children;
    this.text = text;
    // 组件节点标识
    this.componentOptions = componentOptions;
  }
}

// 创建元素vnode 等于render函数里面的 h=>h(App)
export function createElement(vm, tag, data = {}, ...children) {
  let key = data.key;

  if (isReservedTag(tag)) {
    // 如果是普通标签
    return new Vnode(tag, data, key, children);
  } else {
    // 对于非普通 html 标签 就需要生成组件 Vnode 把 Ctor 和 children 作为 Vnode 最后一个参数 componentOptions 传入
    let Ctor = vm.$options.components[tag]; //获取组件的构造函数
    return createComponent(vm, tag, data, key, children, Ctor);
  }
}

function createComponent(vm, tag, data, key, children, Ctor) {
  if (isObject(Ctor)) {
    //   如果没有被改造成构造函数
    Ctor = vm.$options._base.extend(Ctor);
  }
  // 声明组件自己内部的生命周期
  data.hook = {
    // 组件创建过程的自身初始化方法
    init(vnode) {
      let child = (vnode.componentInstance = new Ctor({ _isComponent: true })); //实例化组件
      child.$mount(); //因为没有传入el属性  需要手动挂载 为了在组件实例上面增加$el方法可用于生成组件的真实渲染节点
    },
  };

  // 组件vnode 也叫占位符vnode  ==> $vnode
  return new Vnode(
    `vue-component-${Ctor.cid}-${tag}`,
    data,
    key,
    undefined,
    undefined,
    {
      Ctor,
      children,
    }
  );
}

// 创建文本vnode
export function createTextNode(vm, text) {
  return new Vnode(undefined, undefined, undefined, undefined, text);
}
