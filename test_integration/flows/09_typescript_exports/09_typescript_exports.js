Object.defineProperty(exports, '__esModule', { value: true });

const exportTest1 = a => a;
exports.exportTest1 = exportTest1;

const exportTest2 = a => b => [a, b];

exports.default = exportTest2;

exports.exportTest3 = a => 2 * a;
exports.fetchFromDb = client => client.query();
