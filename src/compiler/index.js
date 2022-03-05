import { parse } from "./parse"
import { generate } from "./codegen"
export function compileToFunctions(template, options) {
  // 我们需要把html字符串变成render函数
  // 1.把html代码转成ast语法树  ast用来描述代码本身形成树结构 不仅可以描述html 也能描述css以及js语法
  // 很多库都运用到了ast 比如 webpack babel eslint等等
  let ast = parse(template.trim(), options)
  // 2.优化静态节点
  // 将AST树进行优化
  // 优化的目标：生成模板AST树，检测不需要进行DOM改变的静态子树。
  // 一旦检测到这些静态树，我们就能做以下这些事情：
  // I.把它们变成常数，这样我们就再也不需要每次重新渲染时创建新的节点了。
  // II.在patch的过程中直接跳过。
  if (options.optimize !== false) {
    optimize(ast, options) // TODO
  }
  // 3.通过ast 重新生成代码
  // 我们最后生成的代码需要和render函数一样
  // 类似_c('div',{id:"app"},_c('div',undefined,_v("hello"+_s(name)),_c('span',undefined,_v("world"))))
  // _c代表创建元素 _v代表创建文本 _s代表文Json.stringify--把对象解析成文本
  let code = generate(ast, options)
  //   使用with语法改变作用域为this  之后调用render函数可以使用call改变this 方便code里面的变量取值
  let renderFn = new Function(`with(this){return ${code}}`)
  return renderFn
}
