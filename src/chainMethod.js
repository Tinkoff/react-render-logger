
const
  chain = (left, right) => function chainer(...args) {
    left.apply(this, args)
    right.apply(this, args)
  },
  chainMethod = (name, proto, right) => {
    if (!!proto[name]) {
      proto[name] = chain(proto[name], right)
    } else {
      proto[name] = right
    }
  }

export default chainMethod
