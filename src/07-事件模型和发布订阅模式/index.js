function myVue (option) {
  this._el = option.el
  this.elm = document.querySelector(`#${option.el}`) // 这里是DOM
  this._template = this.elm.cloneNode(true) // 复制一份，为了更新时vnode不变
  this._data = option.data
  this._parent = this.elm.parentNode
  // 在这里，将数据响应式化
  react(this._data, this)
  this.mount() // 挂载
}

myVue.prototype.mount = function () {
  // 提供一个render 方法：生成虚拟DOM
  this.render = this.createRender()
  this.mountComponent()
}

myVue.prototype.mountComponent = function () {

  let mount = () => {
    this.updata( this.render() )
  }
  mount.call(this) // 后面的过程会解释，此时不深究
}

/**
 * 在Vue中，使用了 二次提交的 设计结构
 * 1.在页面中，node 和 VNode 是一一对应关系
 * 2.先有AST 和 数据 生成 VNode（render）
 * 3.将旧的 Vnode和新的Vnode比较（diff）更新（update）
 */

// 是 render 函数，目的是缓存AST(这里使用虚拟DOM简化)
myVue.prototype.createRender = function () {
  let ast = creatVnode(this._template)
  // Vue: 将AST + data => Vnode
  // 简化模型: 带有坑的Vnode + data => 含有数据的Vnode
  return function render () {
    return parseVnodeWithData(JSON.parse(JSON.stringify(ast)), this._data)
  }
}

// 将虚拟DOM渲染到页面上：diff算法就在此
myVue.prototype.updata = function (vnodeWithData) {
// 简化，由结合了数据的vnode -> HTML DOM
let htmlDOM = parseVnodeToDOM(vnodeWithData)
console.log(htmlDOM)
this._parent.replaceChild(htmlDOM, document.querySelector(`#${this._el}`))
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


// 描述vnode的函数
class VNnode {
  constructor(tag, data, value, type){
    this.tag = tag && tag.toLowerCase()
    this.data = data 
    this.value = value
    this.type = type
    this.children = []
  }

  appendChild(vnode){
    this.children.push(vnode)
  }
}

/**
 * 使用递归从DOM生成Vnode（生成的是带{{xxx}}的vnode）
 * vue源码中使用 栈结构来实现 vnode
 */
function creatVnode (node) {
  let nodeType = node.nodeType
  let _vnode= null
  if(nodeType === 1){// 元素节点
    let tag = node.nodeName
    let attrs = node.attributes
    let data = {}
    for(let i = 0; i < attrs.length; i++ ){
      data[attrs[i].nodeName] = attrs[i].nodeValue
    }
    _vnode = new VNnode(tag, data, undefined, nodeType)
    // 考虑子元素
    let childNodes = node.childNodes
    for(let j = 0; j < childNodes.length; j++){
      _vnode.appendChild(creatVnode(childNodes[j]))
    }
  }else if(nodeType === 3){// 文本节点
    _vnode = new VNnode(undefined, undefined, node.nodeValue, nodeType)
  }
  return _vnode
}


// 将vnod的{{}}去掉
function parseVnodeWithData (vnode, data) {
  if(vnode.type === 1){// 元素节点
    for(let i = 0; i < vnode.children.length; i++){
      parseVnodeWithData(vnode.children[i], data)
    }
  }else if(vnode.type === 3){// 文本节点
    vnode.value = vnode.value.replace(reguler, function( _, g){
      return getPropByPath(g.trim(), data)
    })
  } 
  return vnode
}

/**
 * 将Vnode解析为真实的DOM
 */
function parseVnodeToDOM(vnode){
  let type = vnode.type
  if( type === 1 ){
    let _node = document.createElement(vnode.tag)

    // 属性
    Object.keys(vnode.data).map(key => {
      _node.setAttribute( key, vnode.data[key])
    })

    // 子元素
    vnode.children.forEach(child => {
      let _childNode = parseVnodeToDOM(child)
      _node.appendChild(_childNode)
    })
    return _node
  }else if(type === 3 ){
    return document.createTextNode(vnode.value)
  }
  return realNode
}


let reguler = /\{\{(.+?)\}\}/g // 双花括号解析


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


function react (obj, ctx) {
  defineReact(obj, ctx)
  Object.keys(obj).forEach(key => {
    if(Object.prototype.toString.call(obj[key]) === "[object Array]") reactArrayfn(obj[key], ctx)
    if(["[object Object]", "[object Array]"].includes(Object.prototype.toString.call(obj[key]))){
      react(obj[key], ctx)
    }
  })
  
}

function defineReact (target, ctx) {
  Object.keys(target).forEach(key => {
    let value = target[key]
    Object.defineProperty(target, key, {
      get () {
        console.log(`get prop:${key} `, value)
        return value
      },
      set (newValue) {
        console.log(`set prop:${key} `, newValue)
        value = newValue
        react(value, ctx)
        // 数据更新就重新渲染页面
        ctx.mountComponent()
      }
    })
  })
}


function reactArrayfn (arr, ctx) {
  let ARRAY_METHODS = [
    'pop',
    'push'
  ]
  
  // arry_methods是数组的原型方法
  let arry_methods = Object.create( Array.prototype )
  
  // 定义数组的拦截方法
  ARRAY_METHODS.forEach(method => {
    arry_methods[method] = function() {
      // 重新对数组响应式
      let result = Array.prototype[method].apply(arr, arguments)
      react(arr, ctx)
      return result
    }
  })
  
  // TODO __proto__有兼容问题
  arr.__proto__ = arry_methods
}


function vueSet (target, key, value) {
  // value可能是object, array, others
  target[key] = value
  // TODO 之前的属性已经做了响应式，重复了
  react(target, ctx)
  // 对value进行响应式
  react(value, ctx)
}

function proxy (target, prop, key) {
  Object.defineProperty(target, key, {
    get () {
      return target[prop][key]
    },
    set (newVale) {
      target[prop][key] = newVale
    }
  })
}

let app = new myVue({
  el: 'root',
  data: {
    person: {
      name: {
        firstName: 'wu',
        lastName: 'feifan'
      },
      favorateSports: 'tenis',
      age: 27
    },
    schoole: ['1', '2']
  }
})

Object.keys(app._data).forEach(key => {
  proxy(app, '_data', key)
})


