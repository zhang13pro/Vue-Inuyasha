import { ASSETS_TYPE } from "./const"

export default function initAssetRegisters(Vue) {
  ASSETS_TYPE.forEach((type) => {
    Vue[type] = function (id, definition) {
      if (type === "component") {
        // 全局组件注册
        // 子组件可能也有extend方法  VueComponent.component方法
        // 所谓的全局组件就是使用 Vue.extend 方法把传入的选项处理之后挂载到了 Vue.options.components 上面
        definition = this.options._base.extend(definition)
      } else if (type === "filter") {
      } else if (type === "directive") {
      }
      this.options[type + "s"][id] = definition
    }
  })
}
