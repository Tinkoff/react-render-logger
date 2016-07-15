# react-render-logger [![Build Status](https://travis-ci.org/TinkoffCreditSystems/react-render-logger.svg?branch=master)](https://travis-ci.org/TinkoffCreditSystems/react-render-logger)

Simple util for log component updates. 
Possible reasons to use find way for eliminate unnecessary component updates after performance bottleneck are located via `react-addons-perf` or other instruments.
  
# Usage

Changes tracking are very expensive operation, because every update trigger deep diff for all props and state elements.
Library provide way to configure loggable components on in runtime. 
```javascript
// utils/renderLogger.js
import debug from 'debug';
import createLogger from 'react-render-logger';

const prefix = 'Tinnkoff:trace:performance:';
const enableChecker = 
  componentKey =>
    debug(prefix + componentKey).enabled();

const renderLogger = createLogger(enableChecker);

export default renderLogger;
```

```javascript
// components/SomeComponent.jsx

import renderLogger from 'utils/renderLogger';

@renderLogger
class SomeComponent extends Component {
  render() {
    return null;
  }
}

export default SomeComponent;
```
