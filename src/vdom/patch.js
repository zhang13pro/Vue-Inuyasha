// patch用来渲染和更新视图
export function patch(oldVnode, vnode) {
  // 判断传入的oldVnode是否是一个真实元素
  // 这里很关键  初次渲染 传入的vm.$el就是咱们传入的el选项  所以是真实dom
  // 之后更新vm.$el被替换成了更新之前的虚拟dom
  if (!oldVnode) {
    // 组件的创建过程是没有el属性的
    return createElm(vnode);
  } else {
    const isRealElement = oldVnode.nodeType;
    if (isRealElement) {
      // oldVnode是真实dom元素 就代表初次渲染
      const oldElm = oldVnode;
      const parentElm = oldElm.parentNode;
      // 将虚拟dom转化成真实dom节点
      const el = createElm(vnode);
      // 插入到 老的el节点下一个节点的前面 就相当于插入到老的el节点的后面
      // 这里不直接使用父元素appendChild是为了不破坏替换的位置
      parentElm.insertBefore(el, oldElm.nextSibling);
      // 删除老的el节点
      parentElm.removeChild(oldVnode);
      return el;
    } else {
      // oldVnode是虚拟dom 就是更新过程 使用diff算法
      if (oldVnode.tag !== vnode.tag) {
        // 如果新旧标签不一致 用新的替换旧的 oldVnode.el代表的是真实dom节点
        oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
      }
      // 如果旧节点是一个文本节点
      if (!oldVnode.tag) {
        if (oldVnode.text !== vnode.text) {
          oldVnode.el.textContent = vnode.text;
        }
      }
      // 不符合上面两种 代表标签一致 并且不是文本节点
      // 为了节点复用 所以直接把旧的虚拟dom对应的真实dom赋值给新的虚拟dom的el属性
      const el = (vnode.el = oldVnode.el);
      // 更新属性
      updateProperties(vnode, oldVnode.data);

      const oldCh = oldVnode.children || []; // 老的儿子
      const newCh = vnode.children || []; // 新的儿子
      if (oldCh.length > 0 && newCh.length > 0) {
        // 新老都存在子节点
        updateChildren(el, oldCh, newCh);
      } else if (oldCh.length) {
        // 老的有儿子新的没有
        el.innerHTML = "";
      } else if (newCh.length) {
        // 新的有儿子
        for (let i = 0; i < newCh.length; i++) {
          const child = newCh[i];
          el.appendChild(createElm(child));
        }
      }
    }
  }
}

function createComponent(vnode) {
  // 初始化组件
  // 创建组件实例
  let i = vnode.data;
  // i = vnode.data.hook.init
  // 调用组件data.hook.init方法进行组件初始化过程 最终组件的vnode.componentInstance.$el就是组件渲染好的真实dom
  if ((i = i.hook) && (i = i.init)) i(vnode);
  // 如果组件实例化完毕有componentInstance属性 那证明是组件
  if (vnode.componentInstance) return true;
}

// 虚拟dom转成真实dom
function createElm(vnode) {
  const { tag, data, key, children, text } = vnode;
  //   判断虚拟dom 是元素节点还是文本节点
  if (typeof tag === "string") {
    if (createComponent(vnode)) {
      // 如果是组件 返回真实组件渲染的真实dom
      return vnode.componentInstance.$el;
    }
    //   虚拟dom的el属性指向真实dom 方便后续更新diff算法操作
    vnode.el = document.createElement(tag);
    // 解析虚拟dom属性
    updateProperties(vnode);
    // 如果有子节点就递归插入到父节点里面
    children.forEach((child) => {
      return vnode.el.appendChild(createElm(child));
    });
  } else {
    //   文本节点
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 解析vnode的data属性 映射到真实dom上
function updateProperties(vnode, oldProps = {}) {
  const newProps = vnode.data || {};

  const el = vnode.el; // 真实节点

  // 如果新的节点没有 需要把老的节点属性移除
  for (const k in oldProps) {
    if (!newProps[k]) {
      el.removeAttribute(k);
    }
  }
  // 对style样式做特殊处理 如果新的没有 需要把老的style值置为空
  const newStyle = newProps.style || {};
  const oldStyle = oldProps.style || {};
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  // 遍历新的属性 进行增加操作
  for (const key in newProps) {
    if (key === "style") {
      for (const styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps.class;
    } else {
      // 给这个元素添加属性 值就是对应的值
      el.setAttribute(key, newProps[key]);
    }
  }
}

// 判断两个vnode的标签和key是否相同 如果相同 就可以认为是同一节点就地复用
function isSameVnode(oldVnode, newVnode) {
  // 思考：v-for为什么添加key，
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}
// diff算法核心 采用双指针的方式 对比新老vnode的儿子节点
// TODO Vue的diff为什么不引入React的Fiber
function updateChildren(parent, oldCh, newCh) {
  let oldStartIndex = 0; //老儿子的起始下标
  let oldStartVnode = oldCh[0]; //老儿子的第一个节点
  let oldEndIndex = oldCh.length - 1; //老儿子的结束下标
  let oldEndVnode = oldCh[oldEndIndex]; //老儿子的起结束节点

  let newStartIndex = 0; //同上  新儿子的
  let newStartVnode = newCh[0];
  let newEndIndex = newCh.length - 1;
  let newEndVnode = newCh[newEndIndex];

  // 根据key来创建老的儿子的index映射表  类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置
  function makeIndexByKey(children) {
    let map = {};
    children.forEach((item, index) => {
      map[item.key] = index;
    });
    return map;
  }
  // 生成的映射表
  let map = makeIndexByKey(oldCh);

  // 只有当新老儿子的双指标的起始位置不大于结束位置的时候  才能循环 一方停止了就需要结束循环
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 因为暴力对比过程把移动的vnode置为 undefined 如果不存在vnode节点 直接跳过
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 头和头对比 依次向后追加
      patch(oldStartVnode, newStartVnode); //递归比较儿子以及他们的子节点
      oldStartVnode = oldCh[++oldStartIndex];
      newStartVnode = newCh[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      //尾和尾对比 依次向前追加
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIndex];
      newEndVnode = newCh[--newEndIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 老的头和新的尾相同 把老的头部移动到尾部
      patch(oldStartVnode, newEndVnode);
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //insertBefore可以移动或者插入真实dom
      oldStartVnode = oldCh[++oldStartIndex];
      newEndVnode = newCh[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 老的尾和新的头相同 把老的尾部移动到头部
      patch(oldEndVnode, newStartVnode);
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldCh[--oldEndIndex];
      newStartVnode = newCh[++newStartIndex];
    } else {
      // 上述四种情况属于diff的优化 优化了向后添加，向前添加，尾部移动到头部，头部移动到尾部，反转
      // 暴力对比 根据老的子节点的key和index的映射表 从新的开始子节点进行查找 如果可以找到就进行移动操作 如果找不到则直接进行插入
      let moveIndex = map[newStartVnode.key];
      if (!moveIndex) {
        // 老的节点找不到  直接插入
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        let moveVnode = oldCh[moveIndex]; //找得到就拿到老的节点
        oldCh[moveIndex] = undefined; //这个是占位操作 避免数组塌陷  防止老节点移动走了之后破坏了初始的映射表位置
        parent.insertBefore(moveVnode.el, oldStartVnode.el); //把找到的节点移动到最前面
        patch(moveVnode, newStartVnode);
      }
    }
  }
  // 如果老节点循环完毕了 但是新节点还有  证明  新节点需要被添加到头部或者尾部
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 这是一个优化写法 insertBefore的第二个参数是null等同于appendChild作用
      const ele =
        newCh[newEndIndex + 1] == null ? null : newCh[newEndIndex + 1].el;
      parent.insertBefore(createElm(newCh[i]), ele);
    }
  }
  // 如果新节点循环完毕 老节点还有  证明老的节点需要直接被删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldCh[i];
      if (child != undefined) {
        parent.removeChild(child.el);
      }
    }
  }
}
