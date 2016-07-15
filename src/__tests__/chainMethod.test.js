import { expect } from 'chai'
import { spy } from 'sinon'
import chainMethod from '../chainMethod'

describe('chainMethod', () => {
  it('should use right function if no target method found in prototype', () => {
    const
      right = spy(),
      proto = {}

    chainMethod('methodName', proto, right)

    expect(proto.methodName).to.be.equal(right)
  })

  it('should correct mix method calls', () => {
    const
      left = spy(),
      right = spy()

    class Target {
      methodName() {
        expect(this).to.be.instanceof(Target)
        left()
      }
    }

    chainMethod('methodName', Target.prototype, right)

    new Target().methodName()

    expect(left.calledOnce).to.be.equal(true)
    expect(right.calledOnce).to.be.equal(true)
  })
})
