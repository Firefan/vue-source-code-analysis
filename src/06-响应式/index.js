let react = {
  name: 'wufeifan'
}
var temp = 'wufeifan'
Object.defineProperty(react, 'name', {
  configurable: true,
  get() {
    return temp
  },
  set(newValue) {
    console.log(`newVlaue is :${newValue}`)
    this.temp = newValue
  }
})
/*************************************************************** */
// 可以看到使用了defineProperty后会在访问属性和设置属性的时候触发
// 但是需要借助一个中间变量来报存设置的值
// 那不如写个函数，将中间变量保存在函数的作用域里
function defineReact (obj, key) {
  let value = obj[key]

  Object.defineProperty(obj, key, {
    configurable: true,
    get () {
      console.log(`get prop:${key} `, value)
      return value
    },
    set (newValue) {
      console.log(`set prop:${key} `, newValue)
      value = newValue
    }
  })
}

let newReact = {
  age: 18
}

// defineReact(newReact, 'age')

/************************************************************* */

// 给对象的每一个属性都设置为响应式的
function defineReact_02 (obj) {
  Object.keys(obj).map(key => {
    let value = obj[key]
    Object.defineProperty(obj, key, {
      configurable: true,
      get () {
        console.log(`get prop:${key} `, value)
        return value
      },
      set (newValue) {
        console.log(`set prop:${key} `, newValue)
        value = newValue
      }
    })
  })
}

let react_03 = {
  age: 18,
  name: 'wufeifan',
  gender: 'man'
}

// defineReact_02(react_03)

/***************************************************************** */

// 怎样为新增的属性也建立响应式
// 想一想vue.$set()是怎么实现的

function vue$set (target, key, value) {
  // value可能是object, array, others
  // TODO 还要对value进行响应式
  target[key] = value
  // TODO 之前的属性已经做了响应式，重复了
  defineReact_02(target)
}

// vue$set(react_03, 'job', 'coder')

/**************************************** */

// 以上只处理了一层属性的响应式，当属性很深的时候 {a: {b: {c:1}}}
// 记住，每个属性都是响应式的！！！ a是响应式的 a.b也是响应式的
function defineReact_03 (obj) {
  Object.keys(obj).forEach(key => {
    // 判断是对象
    // Object.prototype.toString
    let value = obj[key]
    Object.defineProperty(obj, key, {
      configurable: true,
      get () {
        console.log(`get prop:${key} `, value)
        return value
      },
      set (newValue) {
        console.log(`set prop:${key} `, newValue)
        value = newValue
      }
    })
    if(Object.prototype.toString.call(obj[key]) === "[object Object]"){
      defineReact_03(obj[key])
    }
  })
}

let react_04 = {
  person: {
    wufeifan: {
      age: 1,
      gender: 'male',
      education: {
        collage: '浙江理工大学'
      } 
    }
  }
}

// defineReact_03(react_04)

/******************************************* */

// 对象的属性值改变时，需要重新建立响应式
// 非引用的属性值 => 引用的属性值
function defineReact_04 (obj) {
  Object.keys(obj).forEach(key => {
    // 判断是对象
    // Object.prototype.toString
    let value = obj[key]
    if(Object.prototype.toString.call(obj[key]) === "[object Object]"){
      defineReact_04(obj[key])
    }
    Object.defineProperty(obj, key, {
      configurable: true,
      get () {
        console.log(`get prop:${key} `, value)
        return value
      },
      set (newValue) {
        console.log(`set prop:${key} `, newValue)
        value = newValue
        if(Object.prototype.toString.call(value) === "[object Object]"){
          defineReact_04(value)
        }
      }
    })
  })
}
defineReact_04(react_04)

/******************************************* */

// 以上只处理了对象的属性值是对象，当对象的属性值是数组的时候
function defineReact_05 (obj) {
  Object.keys(obj).forEach(key => {
    // 判断是对象
    // Object.prototype.toString
    let value = obj[key]
    if(["[object Object]", "[object Array]"].includes(Object.prototype.toString.call(obj[key]))){
      defineReact_05(obj[key])
    }
    Object.defineProperty(obj, key, {
      configurable: true,
      get () {
        console.log(`get prop:${key} `, value)
        return value
      },
      set (newValue) {
        console.log(`set prop:${key} `, newValue)
        value = newValue
        if(Object.prototype.toString.call(value) === "[object Object]"){
          defineReact_05(value)
        }
      }
    })
  })
}
let react_05 = [
  12,
  {
    wufeifan: [
      { age: 1 },
      'male',
    ]
  },
  {
    collage: '浙江理工大学'
  }
]
// defineReact_05(react_05)
/******************************************* */
// 数组的pop、push等操作改变数组，也需要响应式化
// 对数组方法的拦截

let ARRAY_METHODS = [
  'pop',
  'push'
]

// arry_methods是数组的原型方法
let arry_methods = Object.create( Array.prototype )

// 定义数组的拦截方法
ARRAY_METHODS.forEach(method => {
  arry_methods[method] = function() {
    console.log(`访问${method}方法了`)
    return Array.prototype[method].call(this, arguments)
  }
})

let arr = [{name: 1}]

// TODO __proto__有兼容问题
arr.__proto__ = arry_methods

function reactArrayfn (arr) {
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
      defineReact_06(arr)
      return result
    }
  })
  
  // TODO __proto__有兼容问题
  arr.__proto__ = arry_methods
}

function defineReact_06 (obj) {
  if(Object.prototype.toString.call(obj) === "[object Array]") reactArrayfn(obj)
  Object.keys(obj).forEach(key => {
    let value = obj[key]
    reactFn(obj, key, obj[key])
    if(["[object Object]", "[object Array]"].includes(Object.prototype.toString.call(obj[key]))){
      defineReact_06(obj[key])
    }
  })
}

function reactFn (target, key, value) {
  Object.defineProperty(target, key, {
    configurable: true,
    get () {
      console.log(`get prop:${key} `, value)
      return value
    },
    set (newValue) {
      console.log(`set prop:${key} `, newValue)
      value = newValue
      defineReact_06(value)
    }
  })
}

// defineReact_06(react_05)

function vueSet (target, key, value) {
  // value可能是object, array, others
  target[key] = value
  // TODO 之前的属性已经做了响应式，重复了
  defineReact_06(target)
  // 对value进行响应式
  defineReact_06(value)
}


/************************** 至此，包含访问数组的响应式就建立起来了 defineReact_06 ****************** */


/**************************接下来就是将模版编译和数据响应式结合起来********************************** */


function myVue (option) {
  this._el = option.el
  this._template = document.querySelector(`#${option.el}`)
  this._data = option.data
  this._parent = this._template.parentNode

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
  // 在这里，将数据响应式化
  defineReact_06(this._data)
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
    return parseVnodeWithData(ast, this._data)
  }
}

// 将虚拟DOM渲染到页面上：diff算法就在此
myVue.prototype.updata = function (vnodeWithData) {
// 简化，由结合了数据的vnode -> HTML DOM
let htmlDOM = parseVnodeToDOM(vnodeWithData)
console.log(htmlDOM)
this._parent.replaceChild(htmlDOM, this._template)
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

// 实现myVue data属性的代理
// 由myVue的构造函数知，实例化myVue时，传进去的data属性最终挂在了_data属性上
// 访问app的data属性的方式是访问app的_data属性
// 将app.person ==> app._data.person

function proxy (app) {
  Object.keys(app._data).map(key => {
    Object.defineProperty(app, key, {
      get () {
        return app._data[key]
      },
      set (newVale) {
        app._data[key] = newVale
      }
    })
  }) 
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

// 实现myVue data属性的代理
// 由myVue的构造函数知，实例化myVue时，传进去的data属性最终挂在了_data属性上
// 访问app的data属性的方式是访问app的_data属性
// 将app.person ==> app._data.person

function proxy (target, prop, key) {
  Object.defineProperty(app, key, {
    get () {
      return target[prop][key]
    },
    set (newVale) {
      target[prop][key] = newVale
    }
  })
}

Object.keys(app._data).forEach(key => {
  proxy(app, '_data', kye)
})
