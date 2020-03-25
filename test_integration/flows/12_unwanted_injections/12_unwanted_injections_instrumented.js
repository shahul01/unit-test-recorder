const { recorderWrapper } = require('../../../src/recorder');
const fun = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/12_unwanted_injections/12_unwanted_injections.js',
      name: 'fun',
      paramIds: ['arr'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    arr => arr.map(e => 2 * e),
    ...p
  );

const fun2 = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/12_unwanted_injections/12_unwanted_injections.js',
      name: 'fun2',
      paramIds: ['num'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    num => num.toLocaleString(),
    ...p
  );

const fun3 = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/12_unwanted_injections/12_unwanted_injections.js',
      name: 'fun3',
      paramIds: ['f'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    f => f.call(null, 2),
    ...p
  );

module.exports = { fun, fun2, fun3 };
