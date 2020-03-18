// 二 创建实例

// 1. 拿到模版
// 2. 拿到数据
// 3. 将数据模版结合，得到html结构（DOM）
// 4. 放到页面中

let tempNode = document.querySelector('#root')

let data = {
  name: 'wufeifan',
  age: 27,
  gender: 'mail'
}
let reguler = /\{\{(.+?)\}\}/g // 双花括号解析

// 对于又嵌套结构的元素，如何拿到元素里的‘坑’，数据如何放‘坑’里？使用递归或时队列
function compiler (tempNode, data) {
  let childNodes = tempNode.childNodes
  childNodes.forEach(element => {
    if(element.nodeType === 3){// 判断节点类型：nodeType === 3 表示是文本节点
      let txt = element.nodeValue

      // data数据放到坑里
      txt = txt.replace(reguler, function( _, g){// 函数的 第一个参数 表示 匹配 到的内容
                                                 // 第n个参数 表示 正则中的 第 n 组
        return data[g.trim()]
      })
      // 此时 txt 与 DOM 是没有关系的
      element.nodeValue = txt

    }else if(element.nodeType === 1){// nodeType === 1 表示是元素
      compiler(element, data)
    }
  })
}

let cloneNode = tempNode.cloneNode(true) // 拷贝一份node, 原来的模版保留，以供后续使用

root.parentNode.replaceChild(cloneNode, root)

console.log(tempNode) // 说明Vue替换了root元素
compiler(cloneNode, data)
console.log(cloneNode)
