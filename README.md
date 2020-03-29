# vue-source-code-analysis
as repository name
# vue 与 模版

步骤

1. 编写 模版  
  1. 直接在 HTML 中写模版 [非组件]
  2. 使用 template (字符串的模版) [非组件]
  3. 以[组件的方式]，在单文件中书写 (< template />)
2. 创建Vue实例
3. 将Vue挂载到模版上(mount)，并生成真实的DOM


# 数据绑定到模版

1. 获取页面模版
2. 节点分析（类型、值、数据替换）
3. 插值替换
4. dom替换

## 后续的优化: 
1. 使用递归节点结构的分析 => 子节点：递归访问
2. 数据替换 => 对象深层属性的访问: 循环代替递归

# 虚拟DOM和DOM

1. 为什么要使用虚拟dom？？？ (使用虚拟dom是vue整个渲染跟新与数据追踪相关的)
  提升性能

2. 实现真实dom到虚拟dom
  1. 如何来描述一个dom：
    标签类型
    标签属性
    文本节点/元素节点 ==> 
      文本节点：文本的值
      元素节点：子元素 ===> 简单一点，最终的子元素节点都是文本节点 
  2. dom到虚拟dom：

## 函数柯里化

- 函数式编程

**为什么使用函数柯里化**
能将一部分东西缓存起来，于是就提升了效率，但是必然造成内存的占用
> Vue 本质上是使用 HTML 的字符串作为模版，将字符串 模版 转换为 AST， 再转换为VNode。

虚拟DOM的`render`方法: 
  - HTML模版 -> AST 
  - AST -> VNode
  - VNode -> DOM

这三个过程中，第一阶段最消耗性能，即 HTML 到 AST 的 字符串解析

    举个🌰: let s = "1 + 2 * (3 + 4)"，解析这个表达式，得到结果
    提示： 使用"波兰式"表达式，用栈结构来运算

在Vue中区分一个模版是HTML标签还是自定义的组件，就有用到函数柯里化。Vue中将所有可用的 HTML 标签先存起来了

## 虚拟DOM 的 render 方法

思考：模版转换为 抽象语法树 需要执行几次？
应该只要一次！！！
页面的模版是不会变的，改变的只是AST，修改AST就好了

*所以，应该将AST缓存在内存中，只需要传入改变的量就好了*，函数柯里化在此派上用场

# Object.defineProperty实现响应式

1. Object.defineProperty是给对象成员定义属性的配置函数
2. Object.defineProperty定义的对象成员，会在每次访问对象成员的时候执行，在Object.definePropert中可以设置对象成员的setter和getter函数
```js
let value = 1
Object.defineProprty(target, key, {
  configurable: true,
  get () {
    return value
  },
  set (newValue) {
    value = newValue
  }
})
```
3. 循环、递归给对象的属性设置响应式
同层属性循环设置属性配置函数
```js
let obj = {
  a: 1,
  b: 2
}
Object.keys(obj).map(key => {
  let value = obj[key]
  Object.defineProperty(obj, key, {
    configable: true,
    get () {
      return value
    },
    set (newValue) {
      value = newValue
    }
  })
})
```
深层属性递归设置属性配置函数
```js
function defineReact (obj) {
  Object.keys(obj).map(key => {
    let value = obj[key]
    Object.defineProperty(obj, key, {
      configable: true,
      get () {
        return value
      },
      set (newValue) {
        value = newValue
      }
    })
  })
}
function react(obj) {
  defineReact(obj)
  Object.keys(obj).map(key => {
    if(Object.prototype.toString.call(obj[key]) === "[object Object]") react(obj[key])
  })
}
```
4. 数组设置响应式
数组其实是特殊的对象，用`Object.keys`对数组操作，得到的是数组索引的数组`[0, 1, 2, ...]`
```js
function react(obj) {
  defineReact(obj)
  Object.keys(obj).map(key => {
    if(["[object Object]", "[object Array]"].includes(Object.prototype.toString.call(obj[key]))) react(obj[key])
  })
}
```
5. 给对想新增属性时，怎样给新增的属性也设置上响应式？
```js
function vueSet (target, prop, value) {
  let val = value
  Object.defineProperty(target, prop, {
    get () {
      return val
    },
    set (newVal) {
      val = newVal
    }
  })
}
```
6. 数组改变原数组的方法，如push,pop,shift,unshift等增加和减少数组元素的当法，对于新增的元素也要建立响应式的。
  - 问题: 数组push等方法执行时，如何拦截？
  原生的数组并没有提供这样的方法，需要我们构造一个方法。
```js
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
```
- 思考：如何给函数增加一些方法，但是不破坏原函数

## 代理
模拟的vue类
```js
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
```
`myVue`的`data`属性只是在生成`myVue`对象时定义的一个数据集合属性，在模版上实际直接书写`person.name`而不是`data.person.name`，那就需要写一个方法 `app.person.name` ==> `app.data.person.name`

```js
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
```

## 发布订阅模式


