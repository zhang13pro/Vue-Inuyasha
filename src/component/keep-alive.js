export default {
  name: "keep-alive",
  abstract: true, // 内置抽象组件 不会被渲染到真实DOM中，也不会出现在父组件链中

  // 允许组件有条件地进行缓存
  props: {
    include,
    exclude,
    max: [String, Number],
  },

  methods: {
    cacheVNode() {
      const { cache, keys, vnodeToCache, keyToCache } = this
      // vnode没有缓存则进行缓存
      if (vnodeToCache) {
        const { tag, componentInstance, componentOptions } = vnodeToCache
        cache[keyToCache] = {
          name: getComponentName(componentOptions),
          tag,
          componentInstance,
        }
        keys.push(keyToCache)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode) // 超过最大缓存数 销毁数组第0个key对应的vnode
        }
        this.vnodeToCache = null
      }
    },
  },

  created() {
    this.cache = Object.create(null) // 缓存对象  {a:vNode,b:vNode}
    this.keys = [] // 缓存组件的key集合 [a,b]
  },

  destroyed() {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys) // 销毁所有cache中的组件实例
    }
  },

  mounted() {
    this.cacheVNode()
    // 利用watch 动态监听include  exclude
    this.$watch("include", (val) => {
      pruneCache(this, (name) => matches(val, name))
    })
    this.$watch("exclude", (val) => {
      pruneCache(this, (name) => !matches(val, name))
    })
  },

  updated() {
    // 更新时缓存vnode
    this.cacheVNode()
  },

  // 提供渲染函数
  render() {
    const slot = this.$slots.default
    const vnode = getFirstComponentChild(slot) // 获取第一个子组件
    const componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // 获取组件名 通过name 或者tag
      const name = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode // name不在include中或者在exclude中则直接返回vnode（没有取缓存）
      }

      const { cache, keys } = this
      const key =
        vnode.key == null
          ? // same constructor may get registered as different local components
            // so cid alone is not enough (#3269)
            componentOptions.Ctor.cid +
            (componentOptions.tag ? `::${componentOptions.tag}` : "")
          : vnode.key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        // LRU cache 算法 移动到数组最后，更新缓存新鲜度
        remove(keys, key)
        keys.push(key)
      } else {
        // delay setting the cache until update
        // 如果已经缓存过直接从缓存中获取组件实例给vnode，否则缓存，注意不是立即缓存。update时才进行缓存
        this.vnodeToCache = vnode
        this.keyToCache = key
      }

      vnode.data.keepAlive = true //标记虚拟节点已经被缓存
    }
    return vnode || (slot && slot[0])
  },
}

// helpers

export function isDef(v) {
  return v !== undefined && v !== null
}
export function isRegExp(v) {
  return _toString.call(v) === "[object RegExp]"
}
function isAsyncPlaceholder(node) {
  return node.isComment && node.asyncFactory
}
// 从数组中移除元素
function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}
function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}
// 是否匹配，include exclude都可以用逗号分隔字符串、正则表达式或一个数组来表示
function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === "string") {
    return pattern.split(",").indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  return false
}

function pruneCacheEntry(cache, key, keys, current) {
  const entry = cache[key]
  if (entry && (!current || entry.tag !== current.tag)) {
    entry.componentInstance.$destroy() // 销毁最长未被访问的vnode
  }
  cache[key] = null // GC
  remove(keys, key) // 删除key
}
function pruneCache(keepAliveInstance, filter) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const entry = cache[key] // 缓存组件
    if (entry) {
      const name = entry.name
      /* name不符合filter条件的，同时不是目前渲染的vnode时，销毁vnode对应的组件实例（Vue实例），并从cache中移除 */
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}
