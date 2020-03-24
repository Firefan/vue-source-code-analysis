function myVue (option) => {
  this._el = option.el
  this._data = option.data

  this.mount() // 挂载
}

myVue.prototype.mount = function => {
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
 * 1.在页面中，node 和 VNode 是意义对应关系
 * 2.先有AST 和 数据 生成 VNode（render）
 * 3.将旧的 Vnode和新的Vnode比较（diff）更新（update）
 */

// 是 render 函数，目的是缓存AST(这里使用虚拟DOM简化)
myVue.prototype.createRender = function {

}

// 将虚拟DOM渲染到页面上：diff算法就在此
myVue.prototype.updata = function {

}
