(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // dep和watcher是多对多的关系
  // 每个属性都有自己的dep
  var id$1 = 0; //dep实例的唯一标识

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = []; // 这个是存放watcher的容器
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        //   如果当前存在watcher
        if (Dep.target) {
          Dep.target.addDep(this); // 把自身-dep实例存放在watcher里面
        }
      }
    }, {
      key: "notify",
      value: function notify() {
        //   依次执行subs里面的watcher更新方法
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        //   把watcher加入到自身的subs容器
        this.subs.push(watcher);
      }
    }]);

    return Dep;
  }(); // 默认Dep.target为null
  Dep.target = null; // 栈结构用来存watcher

  var targetStack = [];
  function pushTarget(watcher) {
    targetStack.push(watcher);
    Dep.target = watcher; // Dep.target指向当前watcher
  }
  function popTarget() {
    targetStack.pop(); // 当前watcher出栈 拿到上一个watcher

    Dep.target = targetStack[targetStack.length - 1];
  }

  // 先保留数组原型
  var arrayProto = Array.prototype; // 然后将arrayMethods继承自数组原型
  // 这里是面向切片编程思想（AOP）--不破坏封装的前提下，动态的扩展功能

  var arrayMethods = Object.create(arrayProto);
  var methodsToPatch = ["push", "pop", "shift", "unshift", "splice", "reverse", "sort"];
  methodsToPatch.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      //   这里保留原型方法的执行结果
      var result = arrayProto[method].apply(this, args); // 这句话是关键
      // this代表的就是数据本身 比如数据是{a:[1,2,3]} 那么我们使用a.push(4)  this就是a  ob就是a.__ob__ 这个属性代表的是该数据已经被响应式观察过了 __ob__对象指的就是Observer实例

      var ob = this.__ob__;
      var inserted;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
      }

      if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测

      ob.dep.notify(); //数组派发更新 ob指的就是数组对应的Observer实例 我们在get的时候判断如果属性的值还是对象那么就在Observer实例的dep收集依赖 所以这里是一一对应的  可以直接更新

      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    // 观测值
    function Observer(value) {
      _classCallCheck(this, Observer);

      this.value = value;
      this.dep = new Dep(); //当数组使用7种重写方法时  是无法进行依赖收集和派发更新的  此属性主要辅助数组更新

      Object.defineProperty(value, "__ob__", {
        //  值指代的就是Observer的实例
        value: this,
        //  不可枚举
        enumerable: false,
        writable: true,
        configurable: true
      });

      if (Array.isArray(value)) {
        // 这里对数组做了额外判断
        // 通过重写数组原型方法来对数组的七种方法进行拦截
        value.__proto__ = arrayMethods; // 如果数组里面还包含数组 递归判断

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 让对象上的所有属性依次进行观测
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = data[key];
          defineReactive(data, key, value);
        }
      }
    }, {
      key: "observeArray",
      value: function observeArray(items) {
        for (var i = 0; i < items.length; i++) {
          observe(items[i]);
        }
      }
    }]);

    return Observer;
  }(); // Object.defineProperty数据劫持核心 兼容性在ie9以及以上


  function defineReactive(data, key, value) {
    var childOb = observe(value); // 递归关键 --如果value还是一个对象会继续走一遍odefineReactive 层层遍历一直到value不是对象才停止
    //   思考？如果Vue数据嵌套层级过深 >>性能会受影响

    var dep = new Dep(); // 为每个属性实例化一个Dep

    Object.defineProperty(data, key, {
      get: function get() {
        // 页面取值的时候 可以把watcher收集到dep里面--依赖收集
        if (Dep.target) {
          // 如果有watcher dep就会保存watcher 同时watcher也会保存dep
          dep.depend();

          if (childOb) {
            // 这里表示 属性的值依然是一个对象 包含数组和对象 childOb指代的就是Observer实例对象  里面的dep进行依赖收集
            // 比如{a:[1,2,3]} 属性a对应的值是一个数组 观测数组的返回值就是对应数组的Observer实例对象
            childOb.dep.depend();

            if (Array.isArray(value)) {
              // 如果数据结构类似 {a:[1,2,[3,4,[5,6]]]} 这种数组多层嵌套  数组包含数组的情况  那么我们访问a的时候 只是对第一层的数组进行了依赖收集 里面的数组因为没访问到  所以五大收集依赖  但是如果我们改变了a里面的第二层数组的值  是需要更新页面的  所以需要对数组递归进行依赖收集
              if (Array.isArray(value)) {
                // 如果内部还是数组
                dependArray(value); // 不停的进行依赖收集
              }
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return; // 如果赋值的新值也是一个对象  需要观测

        observe(newValue);
        value = newValue;
        dep.notify(); // 通知渲染watcher去更新--派发更新
      }
    });
  } // 递归收集数组依赖


  function dependArray(value) {
    for (var e, i = 0, l = value.length; i < l; i++) {
      e = value[i]; // e.__ob__代表e已经被响应式观测了 但是没有收集依赖 所以把他们收集到自己的Observer实例的dep里面

      e && e.__ob__ && e.__ob__.dep.depend();

      if (Array.isArray(e)) {
        // 如果数组里面还有数组  就递归去收集依赖
        dependArray(e);
      }
    }
  }

  function observe(data) {
    // 递归进行属性劫持
    if (_typeof(data) !== "object" || data == null) {
      return;
    }

    return new Observer(data);
  }

  var callbacks = [];
  var pending = false;

  function flushCallbacks() {
    pending = false; //把标志还原为false
    // 依次执行回调

    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i]();
    }
  }

  var timerFunc; //定义异步方法  采用优雅降级

  if (typeof Promise !== "undefined") {
    // 如果支持promise
    var p = Promise.resolve();

    timerFunc = function timerFunc() {
      p.then(flushCallbacks);
    };
  } else if (typeof MutationObserver !== "undefined") {
    // MutationObserver 主要是监听dom变化 也是一个异步方法
    var counter = 1;
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else if (typeof setImmediate !== "undefined") {
    // 如果前面都不支持 判断setImmediate
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    // 最后降级采用setTimeout
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks, 0);
    };
  }

  function nextTick(cb) {
    // 除了渲染watcher  还有用户自己手动调用的nextTick 一起被收集到数组
    callbacks.push(cb);

    if (!pending) {
      // 如果多次调用nextTick  只会执行一次异步 等异步队列清空之后再把标志变为false
      pending = true;
      timerFunc();
    }
  }

  var queue = [];
  var has = {};

  function flushSchedulerQueue() {
    for (var index = 0; index < queue.length; index++) {
      //   调用watcher的run方法 执行真正的更新操作
      queue[index].run();
    } // 执行完之后清空队列


    queue = [];
    has = {};
  } // 实现异步队列机制


  function queueWatcher(watcher) {
    var id = watcher.id; //   watcher去重

    if (has[id] === undefined) {
      //  同步代码执行 把全部的watcher都放到队列里面去
      queue.push(watcher);
      has[id] = true; // 进行异步调用

      nextTick(flushSchedulerQueue);
    }
  }

  var ASSETS_TYPE = ["component", "directive", "filter"];

  var LIFECYCLE_HOOKS = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed"]; // 合并策略

  var strats = {}; //生命周期合并策略

  function mergeHook(parentVal, childVal) {
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal);
      } else {
        return [childVal];
      }
    } else {
      return parentVal;
    }
  } // 组件 指令 过滤器的合并策略


  function mergeAssets(parentVal, childVal) {
    var res = Object.create(parentVal); //比如有同名的全局组件和自己定义的局部组件 那么parentVal代表全局组件 自己定义的组件是childVal  首先会查找自已局部组件有就用自己的  没有就从原型继承全局组件  res.__proto__===parentVal

    if (childVal) {
      for (var k in childVal) {
        res[k] = childVal[k];
      }
    }

    return res;
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });
  ASSETS_TYPE.forEach(function (type) {
    strats[type + "s"] = mergeAssets;
  });
  function mergeOptions(parent, child) {
    var options = {}; // 遍历父亲

    for (var k in parent) {
      mergeFiled(k);
    } // 父亲没有 儿子有


    for (var _k in child) {
      if (!parent.hasOwnProperty(_k)) {
        mergeFiled(_k);
      }
    }

    function mergeFiled(k) {
      //真正合并字段方法
      if (strats[k]) {
        options[k] = strats[k](parent[k], child[k]);
      } else {
        // 默认策略
        options[k] = child[k] ? child[k] : parent[k];
      }
    }

    return options;
  }
  function isObject(data) {
    if (_typeof(data) !== "object" || data == null) {
      return false;
    }

    return true;
  }
  function isReservedTag(tagName) {
    // 定义常见标签
    var str = "html,body,base,head,link,meta,style,title," + "address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section," + "div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul," + "a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby," + "s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video," + "embed,object,param,source,canvas,script,noscript,del,ins," + "caption,col,colgroup,table,thead,tbody,td,th,tr," + "button,datalist,fieldset,form,input,label,legend,meter,optgroup,option," + "output,progress,select,textarea," + "details,dialog,menu,menuitem,summary," + "content,element,shadow,template,blockquote,iframe,tfoot";
    var obj = {};
    str.split(",").forEach(function (tag) {
      obj[tag] = true;
    });
    return obj[tagName];
  }

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb; //回调函数 比如在watcher更新之前可以执行beforeUpdate方法

      this.options = options; //额外的选项 true代表渲染watcher

      this.id = id++; // watcher的唯一标识

      this.deps = []; //存放dep的容器

      this.depsId = new Set(); //用来去重dep

      this.user = options.user; //标识用户watcher

      this.lazy = options.lazy; //标识计算属性watcher

      this.dirty = this.lazy; //dirty可变  表示计算watcher是否需要重新计算-执行用户定义的方法
      // 如果表达式是一个函数

      if (typeof exprOrFn === "function") {
        this.getter = exprOrFn;
      } else {
        this.getter = function () {
          //用户watcher传过来的可能是一个字符串   类似a.a.a.a.b
          var path = exprOrFn.split(".");
          var obj = vm;

          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]]; //vm.a.a.a.a.b
          }

          return obj;
        };
      } // 非计算属性实例化就会默认调用get方法 进行取值  保留结果


      this.value = this.lazy ? undefined : this.get();
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        pushTarget(this); // 在调用方法之前先把当前watcher实例推到全局Dep.target上

        var res = this.getter.call(this.vm); //如果watcher是渲染watcher 那么就相当于执行  vm._update(vm._render()) 这个方法在render函数执行的时候会取值 从而实现依赖收集

        popTarget(); // 在调用方法之后把当前watcher实例从全局Dep.target移除

        return res;
      } //   把dep放到deps里面 同时保证同一个dep只被保存到watcher一次  同样的  同一个watcher也只会保存在dep一次

    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep); //   直接调用dep的addSub方法  把自己--watcher实例添加到dep的subs容器里面

          dep.addSub(this);
        }
      } //   这里简单的就执行以下get方法  之后涉及到计算属性就不一样了

    }, {
      key: "update",
      value: function update() {
        // 计算属性依赖的值发生变化 只需要把dirty置为true  下次访问到了重新计算
        if (this.lazy) {
          this.dirty = true;
        } else {
          // 每次watcher进行更新的时候  可以让他们先缓存起来  之后再一起调用
          // 异步队列机制
          queueWatcher(this);
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "depend",
      value: function depend() {
        // 计算属性的watcher存储了依赖项的dep 
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend(); //调用依赖项的dep去收集渲染watcher
        }
      }
    }, {
      key: "run",
      value: function run() {
        var newVal = this.get(); //新值

        var oldVal = this.value; //老值

        this.value = newVal; //跟着之后  老值就成为了现在的值

        if (this.user) {
          if (newVal !== oldVal || isObject(newVal)) {
            this.cb.call(this.vm, newVal, oldVal);
          }
        } else {
          // 渲染watcher
          this.cb.call(this.vm);
        }
      }
    }]);

    return Watcher;
  }();

  // 这里初始化的顺序依次是 prop>methods>data>computed>watch

  function initState(vm) {
    // 获取传入的数据对象
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      // 初始化data
      initData(vm);
    }

    if (opts.computed) {
      initComputed(vm);
    }

    if (opts.watch) {
      initWatch(vm);
    }
  }


  function initData(vm) {
    var data = vm.$options.data; //   实例的_data属性就是传入的data
    // vue组件data推荐使用函数 防止数据在组件之间共享

    data = vm._data = typeof data === "function" ? data.call(vm) : data; // 把data数据代理到vm 也就是Vue实例上面 我们可以使用this.a来访问this._data.a

    for (var key in data) {
      proxy(vm, "_data", key);
    } //   对数据进行观测 --响应式数据核心


    observe(data);
  }

  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; //用来存放计算watcher

    for (var k in computed) {
      var userDef = computed[k]; //获取用户定义的计算属性

      var getter = typeof userDef === "function" ? userDef : userDef.get; //创建计算属性watcher使用
      // 创建计算watcher  lazy设置为true

      watchers[k] = new Watcher(vm, getter, function () {}, {
        lazy: true
      });
      defineComputed(vm, k, userDef);
    }
  }

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: function get() {},
    set: function set() {}
  };

  function defineComputed(target, key, userDef) {
    if (typeof userDef === "function") {
      // 如果是一个函数  需要手动赋值到get上
      sharedPropertyDefinition.get = createComputedGetter(key);
    } else {
      sharedPropertyDefinition.get = createComputedGetter(key);
      sharedPropertyDefinition.set = userDef.set;
    }

    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatchers[key]; //获取对应的计算属性watcher

      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate(); //计算属性取值的时候 如果是脏的  需要重新求值
          // 如果Dep还存在target 这个时候一般为渲染watcher 计算属性依赖的数据也需要收集

          if (Dep.target) {
            watcher.depend();
          }
        }

        return watcher.value;
      }
    };
  } // 初始化watch


  function initWatch(vm) {
    var watch = vm.$options.watch;

    var _loop = function _loop(k) {
      var handler = watch[k]; //可能是数组 对象 函数 字符串

      if (Array.isArray(handler)) {
        handler.forEach(function (handle) {
          createWatcher(vm, k, handle);
        });
      } else {
        createWatcher(vm, k, handler);
      }
    };

    for (var k in watch) {
      _loop(k);
    }
  }

  function createWatcher(vm, exprOrFn, handler) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (_typeof(handler) === "object") {
      options = handler; //保存用户传入的对象

      handler = handler.handler; //是函数
    }

    if (typeof handler === "string") {
      handler = vm[handler];
    }

    return vm.$watch(exprOrFn, handler, options);
  }

  function proxy(object, sourceKey, key) {
    Object.defineProperty(object, key, {
      get: function get() {
        return object[sourceKey][key];
      },
      set: function set(newValue) {
        object[sourceKey][key] = newValue;
      }
    });
  }

  function stateMixin(Vue) {
    Vue.prototype.$watch = function (exprOrFn, cb, options) {
      var vm = this; // 这里表示是一个用户watcher

      new Watcher(vm, exprOrFn, cb, _objectSpread2(_objectSpread2({}, options), {}, {
        user: true
      }));

      if (options.immediate) {
        cb(); //如果立刻执行
      }
    };
  }

  // 以下为源码的正则  对正则表达式不清楚的同学可以参考小编之前写的文章(前端进阶高薪必看 - 正则篇);
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; //匹配标签名 形如 abc-123

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //匹配特殊标签 形如 abc:234 前面的abc:可有可无

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配标签开始 形如 <abc-123 捕获里面的标签名

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"
  // 解析标签生成ast核心

  function parse(html) {
    var root, currentParent; //代表根节点 和当前父节点
    // 栈结构 来表示开始和结束标签

    var stack = []; // 标识元素和文本type

    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3; // 生成ast方法

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } // 对开始标签进行处理


    function handleStartTag(_ref) {
      var tagName = _ref.tagName,
          attrs = _ref.attrs;
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    } // 对结束标签进行处理


    function handleEndTag(tagName) {
      // 栈结构 []
      // 比如 <div><span></span></div> 当遇到第一个结束标签</span>时 会匹配到栈顶<span>元素对应的ast 并取出来
      var element = stack.pop(); // 当前父元素就是栈顶的上一个元素 在这里就类似div

      currentParent = stack[stack.length - 1]; // 建立parent和children关系

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    } // 对文本进行处理


    function handleChars(text) {
      // 去掉空格
      text = text.replace(/\s/g, "");

      if (text) {
        currentParent.children.push({
          type: TEXT_TYPE,
          text: text
        });
      }
    }

    while (html) {
      // 查找<
      var textEnd = html.indexOf("<"); // 如果<在第一个 那么证明接下来就是一个标签 不管是开始还是结束标签

      if (textEnd === 0) {
        // 如果开始标签解析有结果
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          // 把解析好的标签名和属性解析生成ast
          handleStartTag(startTagMatch);
          continue;
        } // 匹配结束标签</


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          handleEndTag(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0; // 形如 hello<div></div>

      if (textEnd >= 0) {
        // 获取文本
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        handleChars(text);
      }
    } // 匹配开始标签


    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        }; //匹配到了开始标签 就截取掉

        advance(start[0].length); // 开始匹配属性
        // end代表结束符号>  如果不是匹配到了结束标签
        // attr 表示匹配的属性

        var end, attr;

        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          attr = {
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] //这里是因为正则捕获支持双引号 单引号 和无引号的属性值

          };
          match.attrs.push(attr);
        }

        if (end) {
          //   代表一个标签匹配到结束的>了 代表开始标签解析完毕
          advance(1);
          return match;
        }
      }
    } //截取html字符串 每次匹配到了就往前继续匹配


    function advance(n) {
      html = html.substring(n);
    } //   返回生成的ast


    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容
  // 判断节点类型  
  // 主要包含处理文本核心
  // 源码这块包含了复杂的处理  比如 v-once v-for v-if 自定义指令 slot等等  咱们这里只考虑普通文本和变量表达式{{}}的处理

  function gen(node) {
    // 如果是元素类型
    if (node.type == 1) {
      //   递归创建
      return generate(node);
    } else {
      //   如果是文本节点
      var text = node.text; // 不存在花括号变量表达式

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } // 正则是全局模式 每次需要重置正则的lastIndex属性  不然会引发匹配bug


      var lastIndex = defaultTagRE.lastIndex = 0;
      var tokens = [];
      var match, index;

      while (match = defaultTagRE.exec(text)) {
        // index代表匹配到的位置
        index = match.index;

        if (index > lastIndex) {
          //   匹配到的{{位置  在tokens里面放入普通文本
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        } //   放入捕获到的变量内容


        tokens.push("_s(".concat(match[1].trim(), ")")); //   匹配指针后移

        lastIndex = index + match[0].length;
      } // 如果匹配完了花括号  text里面还有剩余的普通文本 那么继续push


      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      } // _v表示创建文本


      return "_v(".concat(tokens.join("+"), ")");
    }
  } // 处理attrs属性


  function genProps(attrs) {
    var str = "";

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]; // 对attrs属性里面的style做特殊处理

      if (attr.name === "style") {
        (function () {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  } // 生成子节点 调用gen函数进行递归创建


  function getChildren(el) {
    var children = el.children;

    if (children) {
      return "".concat(children.map(function (c) {
        return gen(c);
      }).join(","));
    }
  } // 递归创建生成code


  function generate(el) {
    var children = getChildren(el);
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : "undefined").concat(children ? ",".concat(children) : "", ")");
    return code;
  }

  function compileToFunctions(template) {
    // 我们需要把html字符串变成render函数
    // 1.把html代码转成ast语法树  ast用来描述代码本身形成树结构 不仅可以描述html 也能描述css以及js语法
    // 很多库都运用到了ast 比如 webpack babel eslint等等
    var ast = parse(template); // 2.优化静态节点
    // 这个有兴趣的可以去看源码  不影响核心功能就不实现了
    //   if (options.optimize !== false) {
    //     optimize(ast, options);
    //   }
    // 3.通过ast 重新生成代码
    // 我们最后生成的代码需要和render函数一样
    // 类似_c('div',{id:"app"},_c('div',undefined,_v("hello"+_s(name)),_c('span',undefined,_v("world"))))
    // _c代表创建元素 _v代表创建文本 _s代表文Json.stringify--把对象解析成文本

    var code = generate(ast); //   使用with语法改变作用域为this  之后调用render函数可以使用call改变this 方便code里面的变量取值

    var renderFn = new Function("with(this){return ".concat(code, "}"));
    return renderFn;
  }

  // patch用来渲染和更新视图 
  function patch(oldVnode, vnode) {
    // 判断传入的oldVnode是否是一个真实元素
    // 这里很关键  初次渲染 传入的vm.$el就是咱们传入的el选项  所以是真实dom
    // 之后更新vm.$el被替换成了更新之前的虚拟dom
    if (!oldVnode) {
      // 组件的创建过程是没有el属性的
      return createElm(vnode);
    } else {
      var isRealElement = oldVnode.nodeType;

      if (isRealElement) {
        // oldVnode是真实dom元素 就代表初次渲染
        var oldElm = oldVnode;
        var parentElm = oldElm.parentNode; // 将虚拟dom转化成真实dom节点

        var el = createElm(vnode); // 插入到 老的el节点下一个节点的前面 就相当于插入到老的el节点的后面
        // 这里不直接使用父元素appendChild是为了不破坏替换的位置

        parentElm.insertBefore(el, oldElm.nextSibling); // 删除老的el节点

        parentElm.removeChild(oldVnode);
        return el;
      } else {
        // oldVnode是虚拟dom 就是更新过程 使用diff算法
        if (oldVnode.tag !== vnode.tag) {
          // 如果新旧标签不一致 用新的替换旧的 oldVnode.el代表的是真实dom节点
          oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
        } // 如果旧节点是一个文本节点


        if (!oldVnode.tag) {
          if (oldVnode.text !== vnode.text) {
            oldVnode.el.textContent = vnode.text;
          }
        } // 不符合上面两种 代表标签一致 并且不是文本节点
        // 为了节点复用 所以直接把旧的虚拟dom对应的真实dom赋值给新的虚拟dom的el属性


        var _el = vnode.el = oldVnode.el; // 更新属性


        updateProperties(vnode, oldVnode.data);
        var oldCh = oldVnode.children || []; // 老的儿子

        var newCh = vnode.children || []; // 新的儿子

        if (oldCh.length > 0 && newCh.length > 0) {
          // 新老都存在子节点
          updateChildren(_el, oldCh, newCh);
        } else if (oldCh.length) {
          // 老的有儿子新的没有
          _el.innerHTML = "";
        } else if (newCh.length) {
          // 新的有儿子
          for (var i = 0; i < newCh.length; i++) {
            var child = newCh[i];

            _el.appendChild(createElm(child));
          }
        }
      }
    }
  }

  function createComponent$1(vnode) {
    // 初始化组件
    // 创建组件实例
    var i = vnode.data;

    if ((i = i.hook) && (i = i.init)) {
      i(vnode);
    } // 如果组件实例化完毕有componentInstance属性 那证明是组件


    if (vnode.componentInstance) {
      return true;
    }
  } // 虚拟dom转成真实dom


  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        vnode.key;
        var children = vnode.children,
        text = vnode.text; //   判断虚拟dom 是元素节点还是文本节点

    if (typeof tag === "string") {
      if (createComponent$1(vnode)) {
        // 如果是组件 返回真实组件渲染的真实dom
        return vnode.componentInstance.$el;
      } //   虚拟dom的el属性指向真实dom 方便后续更新diff算法操作


      vnode.el = document.createElement(tag); // 解析虚拟dom属性

      updateProperties(vnode); // 如果有子节点就递归插入到父节点里面

      children.forEach(function (child) {
        return vnode.el.appendChild(createElm(child));
      });
    } else {
      //   文本节点
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } // 解析vnode的data属性 映射到真实dom上


  function updateProperties(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var newProps = vnode.data || {};
    var el = vnode.el; // 真实节点
    // 如果新的节点没有 需要把老的节点属性移除

    for (var k in oldProps) {
      if (!newProps[k]) {
        el.removeAttribute(k);
      }
    } // 对style样式做特殊处理 如果新的没有 需要把老的style值置为空


    var newStyle = newProps.style || {};
    var oldStyle = oldProps.style || {};

    for (var key in oldStyle) {
      if (!newStyle[key]) {
        el.style[key] = "";
      }
    } // 遍历新的属性 进行增加操作


    for (var _key in newProps) {
      if (_key === "style") {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (_key === "class") {
        el.className = newProps["class"];
      } else {
        // 给这个元素添加属性 值就是对应的值
        el.setAttribute(_key, newProps[_key]);
      }
    }
  } // 判断两个vnode的标签和key是否相同 如果相同 就可以认为是同一节点就地复用


  function isSameVnode(oldVnode, newVnode) {
    return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
  } // diff算法核心 采用双指针的方式 对比新老vnode的儿子节点


  function updateChildren(parent, oldCh, newCh) {
    var oldStartIndex = 0; //老儿子的起始下标

    var oldStartVnode = oldCh[0]; //老儿子的第一个节点

    var oldEndIndex = oldCh.length - 1; //老儿子的结束下标

    var oldEndVnode = oldCh[oldEndIndex]; //老儿子的起结束节点

    var newStartIndex = 0; //同上  新儿子的

    var newStartVnode = newCh[0];
    var newEndIndex = newCh.length - 1;
    var newEndVnode = newCh[newEndIndex]; // 根据key来创建老的儿子的index映射表  类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (item, index) {
        map[item.key] = index;
      });
      return map;
    } // 生成的映射表


    var map = makeIndexByKey(oldCh); // 只有当新老儿子的双指标的起始位置不大于结束位置的时候  才能循环 一方停止了就需要结束循环

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
        // 上述四种情况都不满足 那么需要暴力对比
        // 根据老的子节点的key和index的映射表 从新的开始子节点进行查找 如果可以找到就进行移动操作 如果找不到则直接进行插入
        var moveIndex = map[newStartVnode.key];

        if (!moveIndex) {
          // 老的节点找不到  直接插入
          parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        } else {
          var moveVnode = oldCh[moveIndex]; //找得到就拿到老的节点

          oldCh[moveIndex] = undefined; //这个是占位操作 避免数组塌陷  防止老节点移动走了之后破坏了初始的映射表位置

          parent.insertBefore(moveVnode.el, oldStartVnode.el); //把找到的节点移动到最前面

          patch(moveVnode, newStartVnode);
        }
      }
    } // 如果老节点循环完毕了 但是新节点还有  证明  新节点需要被添加到头部或者尾部


    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        // 这是一个优化写法 insertBefore的第一个参数是null等同于appendChild作用
        var ele = newCh[newEndIndex + 1] == null ? null : newCh[newEndIndex + 1].el;
        parent.insertBefore(createElm(newCh[i]), ele);
      }
    } // 如果新节点循环完毕 老节点还有  证明老的节点需要直接被删除


    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        var child = oldCh[_i];

        if (child != undefined) {
          parent.removeChild(child.el);
        }
      }
    }
  }

  function mountComponent(vm, el) {
    // 上一步模板编译解析生成了render函数
    // 下一步就是执行vm._render()方法 调用生成的render函数 生成虚拟dom
    // 最后使用vm._update()方法把虚拟dom渲染到页面
    // 真实的el赋值给实例的$el属性
    vm.$el = el; //   _update和._render方法都是挂载在Vue原型的方法  类似_init
    // 引入watcher的概念 这里注册一个渲染watcher 执行vm._update(vm._render())方法渲染视图

    callHook(vm, "beforeMount");

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, function () {
      callHook(vm, "beforeUpdate");
    }, true);
    callHook(vm, "mounted");
  }
  function lifecycleMixin(Vue) {
    // 把_update挂载在Vue的原型
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var prevVnode = vm._vnode; // 保留上一次的vnode

      vm._vnode = vnode;

      if (!prevVnode) {
        // patch是渲染vnode为真实dom核心
        vm.$el = patch(vm.$el, vnode); // 初次渲染 vm._vnode肯定不存在 要通过虚拟节点 渲染出真实的dom 赋值给$el属性
      } else {
        vm.$el = patch(prevVnode, vnode); // 更新时把上次的vnode和这次更新的vnode穿进去 进行diff算法
      }
    };
  }
  function callHook(vm, hook) {
    // 依次执行生命周期对应的方法
    var handlers = vm.$options[hook];

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm); //生命周期里面的this指向当前实例
      }
    }
  }

  function initMixin$1(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; // 这里的this代表调用_init方法的对象(实例对象)
      //  this.$options就是用户new Vue的时候传入的属性和全局的Vue.options合并之后的结果

      vm.$options = mergeOptions(vm.constructor.options, options);
      callHook(vm, "beforeCreate"); // 初始化状态

      initState(vm);
      callHook(vm, "created"); // 如果有el属性 进行模板渲染

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    }; // 这块代码在源码里面的位置其实是放在entry-runtime-with-compiler.js里面
    // 代表的是Vue源码里面包含了compile编译功能 这个和runtime-only版本需要区分开


    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); // 如果不存在render属性

      if (!options.render) {
        // 如果存在template属性
        var template = options.template;

        if (!template && el) {
          // 如果不存在render和template 但是存在el属性 直接将模板赋值到el所在的外层html结构（就是el本身 并不是父元素）
          template = el.outerHTML;
        } // 最终需要把tempalte模板转化成render函数


        if (template) {
          var render = compileToFunctions(template);
          options.render = render;
        }
      } // 将当前组件实例挂载到真实的el节点上面


      return mountComponent(vm, el);
    };
  }

  var Vnode = function Vnode(tag, data, key, children, text, componentOptions) {
    _classCallCheck(this, Vnode);

    console.log("🚀 ~ file: index.js ~ line 5 ~ Vnode ~ constructor ~ componentOptions", componentOptions);
    this.tag = tag;
    this.data = data;
    this.key = key;
    this.children = children;
    this.text = text;
    this.componentOptions = componentOptions;
  }; // 创建元素vnode 等于render函数里面的 h=>h(App)
  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var key = data.key;

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    if (isReservedTag(tag)) {
      // 如果是普通标签
      return new Vnode(tag, data, key, children);
    } else {
      // 否则就是组件
      var Ctor = vm.$options.components[tag]; //获取组件的构造函数

      return createComponent(vm, tag, data, key, children, Ctor);
    }
  }

  function createComponent(vm, tag, data, key, children, Ctor) {
    if (isObject(Ctor)) {
      Ctor = vm.$options._base.extend(Ctor);
    } // 声明组件自己内部的生命周期


    data.hook = {
      // 组件创建过程的自身初始化方法
      init: function init(vnode) {
        var child = vnode.componentInstance = new Ctor({
          _isComponent: true
        }); //实例化组件

        child.$mount(); //因为没有传入el属性  需要手动挂载 为了在组件实例上面增加$el方法可用于生成组件的真实渲染节点
      }
    }; // 组件vnode也叫占位符vnode  ==> $vnode

    return new Vnode("vue-component-".concat(Ctor.cid, "-").concat(tag), data, key, undefined, undefined, {
      Ctor: Ctor,
      children: children
    });
  } // 创建文本vnode


  function createTextNode(vm, text) {
    return new Vnode(undefined, undefined, undefined, undefined, text);
  }

  function renderMixin(Vue) {
    // render函数里面有_c _v _s方法需要定义
    Vue.prototype._c = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 创建虚拟dom元素
      return createElement.apply(void 0, [this].concat(args));
    };

    Vue.prototype._v = function (text) {
      // 创建虚拟dom文本
      return createTextNode(this, text);
    };

    Vue.prototype._s = function (val) {
      // 如果模板里面的是一个对象  需要JSON.stringify
      return val == null ? "" : _typeof(val) === "object" ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      var vm = this; // 获取模板编译生成的render方法

      var render = vm.$options.render;
      console.log("🚀 ~ file: render.js ~ line 28 ~ renderMixin ~ render", render); // 生成vnode--虚拟dom

      var vnode = render.call(vm);
      return vnode;
    }; // 挂载在原型的nextTick方法 可供用户手动调用


    Vue.prototype.$nextTick = nextTick;
  }

  function initMixin(Vue) {
    Vue.mixin = function (mixin) {
      //   合并对象
      this.options = mergeOptions(this.options, mixin);
    };
  }

  function initAssetRegisters(Vue) {
    ASSETS_TYPE.forEach(function (type) {
      Vue[type] = function (id, definition) {
        if (type === 'component') {
          // 全局组件注册
          // 子组件可能也有extend方法  VueComponent.component方法
          definition = this.options._base.extend(definition);
        }

        this.options[type + 's'][id] = definition;
      };
    });
  }

  function initExtend(Vue) {
    var cid = 0; // 创建子类继承Vue父类 便于属性扩展

    Vue.extend = function (extendOptions) {
      // 创建子类的构造函数 并且调用初始化方法
      var Sub = function VueComponent(options) {
        this._init(options);
      };

      Sub.cid = cid++; //组件的唯一标识

      Sub.prototype = Object.create(this.prototype); // 子类原型指向父类

      Sub.prototype.constructor = Sub; //constructor指向自己

      Sub.options = mergeOptions(this.options, extendOptions); //合并自己的options和父类的options

      return Sub;
    };
  }

  function initGlobalApi(Vue) {
    Vue.options = {}; // 全局的组件 指令 过滤器

    initMixin(Vue);
    ASSETS_TYPE.forEach(function (type) {
      Vue.options[type + "s"] = {};
    });
    Vue.options._base = Vue; //_base是Vue的构造函数

    initExtend(Vue); //注册extend方法

    initAssetRegisters(Vue); //assets注册方法
  }

  function Vue(options) {
    // 这里开始进行Vue初始化工作
    this._init(options);
  } // _init方法是挂载在Vue原型的方法 通过引入文件的方式进行原型挂载需要传入Vue
  // 此做法有利于代码分割


  initMixin$1(Vue);
  renderMixin(Vue);
  lifecycleMixin(Vue);
  stateMixin(Vue);
  initGlobalApi(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
