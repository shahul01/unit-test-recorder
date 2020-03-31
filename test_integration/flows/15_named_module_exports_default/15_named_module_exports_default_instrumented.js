const { recorderWrapper } = require('../../../src/recorder');
const foo = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/15_named_module_exports_default/15_named_module_exports_default.js',
      name: 'foo',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: true,
      isEcmaDefault: false,
      isAsync: false
    },
    a => a,
    ...p
  );

module.exports = foo;
