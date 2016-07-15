import { expect } from 'chai'
import { spy } from 'sinon'
import createLogger from '../createLogger'

const
  alwaysTrue = () => true,
  target = () => {
    class Target {
      constructor(props, state) {
        this.props = props
        this.state = state
        this._reactInternalInstance = {}
      }
    }

    return Target
  }

describe('createLogger()', () => {
  it('should log changes', () => {
    const
      logger = createLogger(alwaysTrue),
      Target = logger(target()),
      props = {},
      state = {},
      instance = new Target(props, state),
      consoleDebug = spy(),
      consoleGroup = spy(),
      consoleGroupEnd = spy()

    console.debug = consoleDebug
    console.group = consoleGroup
    console.groupEnd = consoleGroupEnd

    instance.componentWillUpdate(props, state)

    expect(consoleGroup.calledOnce).to.be.equal(true)
    expect(consoleDebug.callCount).to.be.equal(3)
    expect(consoleDebug.firstCall.args[0]).to.equal('—— no props diff ——')
    expect(consoleDebug.secondCall.args[0]).to.equal('—— no state diff ——')
    expect(consoleGroupEnd.calledOnce).to.be.equal(true)
  })

  it('should log changes if it present', () => {
    const
      logger = createLogger(alwaysTrue),
      Target = logger(target()),
      props = {},
      state = {},
      instance = new Target(props, state),
      consoleDebug = spy(),
      consoleGroup = spy(),
      consoleGroupEnd = spy()

    console.debug = consoleDebug
    console.group = consoleGroup
    console.groupEnd = consoleGroupEnd

    instance.componentWillUpdate({ prop: true }, { state: true })

    expect(consoleGroup.calledOnce).to.be.equal(true)
    expect(consoleDebug.callCount).to.be.equal(5)
    expect(consoleDebug.getCall(0).args[0]).to.equal('—— props diff ——')
    expect(consoleDebug.getCall(1).args[0]).to.equal('%c ADDED:')
    expect(consoleDebug.getCall(1).args[2]).to.equal('prop true')
    expect(consoleDebug.getCall(2).args[0]).to.equal('—— state diff ——')
    expect(consoleDebug.getCall(3).args[0]).to.equal('%c ADDED:')
    expect(consoleDebug.getCall(3).args[2]).to.equal('state true')
    expect(consoleGroupEnd.calledOnce).to.be.equal(true)
  })
})
