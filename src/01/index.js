// 二 创建实例
console.log(root) // 说明Vue替换了root元素

let app = new Vue({
  el: '#root',
  data: {
    name: 'wufeifan',
    age: 27,
    gender: 'male'
  }
})

console.log(root)

// 