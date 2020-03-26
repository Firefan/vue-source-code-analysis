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
    if(["[object Object]", "[object Array]"].includes(Object.prototype.toString.call(obj[key]))){
      defineReact_05(obj[key])
    }
    reactFn(obj, key, obj[key])
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
      if(Object.prototype.toString.call(value) === "[object Object]"){
        defineReact_06(value)
      }
    }
  })
}

defineReact_06(react_05)


/************************** 至此，包含访问数组的响应式就建立起来了 defineReact_06 ****************** */