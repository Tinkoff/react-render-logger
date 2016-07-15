import { expect } from 'chai'
import { spy } from 'sinon'
import createLogger from '../createLogger'

const
  alwaysTrue = () => true,
  alwaysFalse = () => false,
  onlyShort = group => group.indexOf(':') === -1,
  target = () => {
    class Target {
      constructor(props, state) {
        this.props = props
        this.state = state
        this._reactInternalInstance = {}
      }

      componentWillUpdate() {}
    }

    return Target
  }

describe('createLogger()', () => {
  it('should have empty log message if no changes detected', () => {
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

  it('should follow for log details config', () => {
    const
      logger = createLogger(onlyShort),
      Target = logger(target()),
      props = {},
      state = {},
      instance = new Target(props, state),
      consoleDebug = spy(),
      consoleGroup = spy(),
      consoleGroupCollapsed = spy(),
      consoleGroupEnd = spy()

    console.debug = consoleDebug
    console.group = consoleGroup
    console.groupCollapsed = consoleGroupCollapsed
    console.groupEnd = consoleGroupEnd

    instance.componentWillUpdate(props, state)

    expect(consoleGroupCollapsed.calledOnce).to.be.equal(true)
    expect(consoleGroup.callCount).to.be.equal(0)
    expect(consoleDebug.callCount).to.be.equal(3)
    expect(consoleDebug.firstCall.args[0]).to.equal('—— no props diff ——')
    expect(consoleDebug.secondCall.args[0]).to.equal('—— no state diff ——')
    expect(consoleGroupEnd.calledOnce).to.be.equal(true)
  })

  it('should log noting if not allowed', () => {
    const
      logger = createLogger(alwaysFalse),
      Target = logger(target()),
      props = {},
      state = {},
      instance = new Target(props, state),
      consoleDebug = spy(),
      consoleGroup = spy(),
      consoleGroupCollapsed = spy(),
      consoleGroupEnd = spy()

    console.debug = consoleDebug
    console.group = consoleGroup
    console.groupCollapsed = consoleGroupCollapsed
    console.groupEnd = consoleGroupEnd

    instance.componentWillUpdate(props, state)

    expect(consoleGroupCollapsed.callCount).to.be.equal(0)
    expect(consoleGroup.callCount).to.be.equal(0)
    expect(consoleDebug.callCount).to.be.equal(0)
    expect(consoleGroupEnd.callCount).to.be.equal(0)
  })

  it('should log all possible variant of log message', () => {
    const
      logger = createLogger(alwaysTrue),
      Target = logger(target()),
      props = {
        array: ['1'],
        object: {
          key: true
        },
        string: 'string'
      },
      state = {},
      instance = new Target(props, state),
      consoleDebug = spy(),
      consoleGroup = spy(),
      consoleGroupEnd = spy()

    console.debug = consoleDebug
    console.group = consoleGroup
    console.groupEnd = consoleGroupEnd

    instance.componentWillUpdate({
      array: ['1', '3'],
      object: {
        key: false
      }
    }, { state: true })

    expect(consoleGroup.calledOnce).to.be.equal(true)
    expect(consoleDebug.callCount).to.be.equal(7)
    expect(consoleDebug.getCall(0).args[0]).to.equal('—— props diff ——')
    expect(consoleDebug.getCall(1).args[0]).to.equal('%c ARRAY:')
    expect(consoleDebug.getCall(1).args[2]).to.deep.equal({ kind: 'N', rhs: '3' })
    expect(consoleDebug.getCall(2).args[0]).to.equal('%c CHANGED:')
    expect(consoleDebug.getCall(2).args[2]).to.equal('object.key true → false')
    expect(consoleDebug.getCall(3).args[0]).to.equal('%c DELETED:')
    expect(consoleDebug.getCall(3).args[2]).to.equal('string')
    expect(consoleGroupEnd.calledOnce).to.be.equal(true)
  })

  it('should not perform any changes if NODE_ENV is production', () => {
    const env = process.env

    process.env = {
      NODE_ENV: 'production'
    }

    const // eslint-disable-line
      logger = createLogger(alwaysTrue),
      TargetPure = target(),
      Target = logger(TargetPure)

    expect(process.env.NODE_ENV).to.be.equal('production')
    expect(Target.prototype).to.be.deep.equal({})

    process.env = env
  })
})
