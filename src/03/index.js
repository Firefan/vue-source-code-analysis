// 整合之前的代码，并进行对象属性访问的优化
// 和vue的构造函数做形同的事情: 页面模版元素 + 数据 => 显示
/**
 * 
 * @param {Object} options 
 * {
 *    el: 页面模版元素,
 *    data: 数据
 * }
 */
function MyVue(options){
  // 习惯： 内部数据下划线开头
  this._el = options.el
  this._data = options.data 
  

  // 只读属性
  this._tempDOM = document.querySelector(this._el)
  this._parent = this._tempDOM.parentNode

  // 分析节点，集合数据，得到DOM，放在页面
  this.render(this._tempDOM) // 用户页可以自己定义render的
}
// compiler + update
MyVue.prototype.render = function () {
  this.compiler()
}

// 编译 将 模版解析 并与 数据结合
MyVue.prototype.compiler = function () {
  let copyDOM = this._tempDOM.cloneNode(true) // 拷贝模版, 保留MyVue对象里的DOM元素
  compiler(copyDOM, this._data)
  this.update(copyDOM)
}

// 更新 将新生成的DON替换模版
MyVue.prototype.update = function (copyDOM) {
  this._parent.replaceChild(copyDOM, document.querySelector(this._el))
}

let reguler = /\{\{(.+?)\}\}/g // 双花括号解析

// 对于有嵌套结构的元素，如何拿到元素里的‘坑’，数据如何放‘坑’里？使用递归或时队列
function compiler (tempNode, data) {
  let childNodes = tempNode.childNodes
  childNodes.forEach(element => {
    if(element.nodeType === 3){// 判断节点类型：nodeType === 3 表示是文本节点
      let txt = element.nodeValue

      // data数据放到坑里
      txt = txt.replace(reguler, function( _, g){// 函数的 第一个参数 表示 匹配 到的内容
                                                 // 第n个参数 表示 正则中的 第 n 组
        return getPropByPath(g.trim(), data)
      })
      // 此时 txt 与 DOM 是没有关系的
      element.nodeValue = txt

    }else if(element.nodeType === 1){// nodeType === 1 表示是元素
      compiler(element, data)
    }
  })
}

/**
 * 
 * @param {Sting} propPath 'a.b.c'
 */
function getPropByPath (propPath, data) {
  let paths = propPath.split('.')
  let value = data
  while(paths.length){
    value = value[paths.shift()]
  }
  return value
}


let app = new MyVue({
  el: '#root',
  data: {
    person: {
      name: {
        firstName: 'wu',
        lastName: 'feifan'
      },
      favorateSports: 'tenis',
      age: 27
    }
  }
})