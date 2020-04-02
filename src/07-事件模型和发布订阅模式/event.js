let event= (function event () {
  // eventObj用来存事件一对象
  // eventObj = {
  //   eventType: [handler1, handler1, ...]
  //   ...
  //}
  eventObj = {}
  return {
    on: function (type, handler) {
      (eventObj[type] || (eventObj[type] = [])).push(handler)
    },
    // 消除事件
    // 1. 不穿参数，那就是消除事件对象的所有事件
    // 2. 只传事件类型type参数，消除type类的所有事件
    // 3. type和hander都传，消除这个事件
    off: function (type, handler) {
      let _type = type || Array.from(arguments)[0] || null
      let _handler = handler || Array.from(arguments)[1] || null
      if(_type === null){
        eventObj = {}
      }else if(!_type && (_handler === null)){
        eventObj[_type]= {}
      }else{
        eventObj[_type] = eventObj[_type].filter(_handler => _handler !== handler )
      }
    },
    // 触发事件
    emit: function ( handler ) {
      let hasHandler = false
      Object.keys(eventObj).forEach(typeEvent => {
        eventObj[typeEvent].forEach((_handler, index) => {
          if(_handler === handler) {
            hasHandler = true
            _handler()
          }
        })
      })
      if(!hasHandler ) console.log(`未注册${handler.name}事件`)
    },
  }
})()