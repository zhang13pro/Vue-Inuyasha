import initMixin from "./mixin";
import initAssetRegisters from "./assets";
import initExtend from './initExtend'
import {ASSETS_TYPE} from './const'


export function initGlobalApi(Vue) {
  Vue.options = {}; // 全局的组件 指令 过滤器
  initMixin(Vue);
  ASSETS_TYPE.forEach((type) => {
    Vue.options[type + "s"] = {};
  });
  Vue.options._base = Vue; //_base是Vue的构造函数

  initExtend(Vue) //注册extend方法
  initAssetRegisters(Vue); //assets注册方法
}
