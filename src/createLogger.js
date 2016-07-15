import differ from 'deep-diff'
import now from 'performance-now'
import chainMethod from './chainMethod'

const
  isDevelopment = () => process.env.NODE_ENV !== 'production',
  dictionary = {
    E: {
      color: '#2196F3',
      text: 'CHANGED:'
    },
    N: {
      color: '#4CAF50',
      text: 'ADDED:'
    },
    D: {
      color: '#F44336',
      text: 'DELETED:'
    },
    A: {
      color: '#2196F3',
      text: 'ARRAY:'
    }
  },
  style = kind => `color: ${dictionary[kind].color}; font-weight: bold`,
  render = diff => {
    const { kind, path, lhs, rhs, index, item } = diff

    switch (kind) {
      case 'E':
        return `${path.join('.')} ${lhs} → ${rhs}`
      case 'N':
        return `${path.join('.')} ${rhs}`
      case 'D':
        return `${path.join('.')}`
      case 'A':
        return (`${path.join('.')}[${index}]`, item)
    }
  },
  renderDiff = elem => {
    const
      { kind } = elem,
      output = render(elem)

    console.debug(`%c ${dictionary[kind].text}`, style(kind), output)
  },
  logDiff = key => diff => {
    if (diff) {
      console.debug(`—— ${key} diff ——`)
      diff.forEach(renderDiff)
    } else {
      console.debug(`—— no ${key} diff ——`)
    }
  },
  logPropsDiff = logDiff('props'),
  logStateDiff = logDiff('state'),

  /**
   * Zero-overhead in production build.
   *
   * In development useful for detect potentially memory leeks
   * and unnecessary component updates.
   *
   * For enable logging in client side, you should return true for chrck namespace key
   *
   * Example namespace name:
   *  - Input - every update will be logged, group will be collapsed
   *  - Input:explained - same as before, but group will be expanded
   */
  createLogger =
    enabled => target => {
      if (!isDevelopment()) {
        return target
      }
      const
        groupName = target.name,
        traceGroupName = `${groupName}:explained`,
        logGroup = groupTitle => {
          if (enabled(traceGroupName)) {
            console.group(groupTitle)
          } else {
            console.groupCollapsed(groupTitle)
          }
        }

      function logger(nextProps, nextState) {
        if (enabled(traceGroupName) || enabled(groupName)) {
          const
            startTime = now(),
            time = new Date(),
            propsDiff = differ(this.props, nextProps),
            stateDiff = differ(this.state, nextState),
            groupTitle = `${groupName} @${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`

          logGroup(groupTitle)
          logPropsDiff(propsDiff)
          logStateDiff(stateDiff)

          console.debug(`→ logger took ${(now() - startTime).toFixed(3)}ms on instance ${this._reactInternalInstance._rootNodeID}`) // eslint-disable-line no-underscore-dangle
          console.groupEnd(groupName)
        }
      }

      chainMethod('componentWillUpdate', target.prototype, logger)

      return target
    }

export default createLogger
