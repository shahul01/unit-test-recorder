const { toMatchFile } = require('jest-file-snapshot');
const { RecorderManager } = require('../../src/recorder');

expect.extend({ toMatchFile });

const getSnapshotFileName = fileName => `test_integration/flows/${fileName}/${fileName}_activity.json`;

// Dont record params of injections
process.env.UTR_RECORD_STUB_PARAMS = false;

/* eslint-disable global-require */
describe('driver', () => {
  beforeEach(() => {
    RecorderManager.clear();
  });
  describe('01_module_exports', () => {
    it('should record activity', () => {
      const mei = require('./01_module_exports/01_module_exports_instrumented');
      mei.foo(1, 2);
      mei.foo(1, 2);
      mei.foo('A', 'B');
      mei.foo(2, 1);
      mei.bar(2, 2);
      mei.specialParams(1, { b: 1, c: 1 });
      mei.specialParams(1, { b: 1, c: 1 }, 2);
      mei.specialParams2(1, { b: 1, c: 1 });
      const outputFileName = getSnapshotFileName('01_module_exports');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('02_async_functions', () => {
    it('should record activity', async () => {
      const { getFacebookInfo, getSocialInfo } = require('./02_async_functions/02_async_functions_instrumented');
      await getSocialInfo('email');
      await getFacebookInfo('email');
      const outputFileName = getSnapshotFileName('02_async_functions');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('03_ecma_export', () => {
    it('should record activity', () => {
      const {
        default: ecma2, ecma1, ecma3, ecma4,
      } = require('./03_ecma_export/03_ecma_export_instrumented');
      ecma1(1, 2);
      ecma2(1);
      ecma3(1);
      ecma4(1);
      const outputFileName = getSnapshotFileName('03_ecma_export');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('04_unserializeable', () => {
    it('should record activity', () => {
      const unserializeable = require('./04_unserializeable/04_unserializeable_instrumented');
      unserializeable.circularReference(1);
      unserializeable.returnAFunction(1, a => a * 2);
      unserializeable.getElapsedTime(new Date('2018-02-01T00:00:00.000Z'), new Date('2019-02-01T00:00:00.000Z'));
      unserializeable.returnsNaN('a');
      const outputFileName = getSnapshotFileName('04_unserializeable');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('05_dependency_injection', () => {
    it('should record activity', async () => {
      const di = require('./05_dependency_injection/05_dependency_injection_instrumented');
      const query = q => new Promise((resolve) => {
        setTimeout(() => resolve({
          'SELECT * FROM posts WHERE id=?': { title: 'content' },
          'SELECT region_id FROM regions where post_id=?': 42,
          'SELECT COUNT(*) FROM active_users;': 350,
        }[q]), 1);
      });

      const pooledQuery = () => new Promise((resolve) => {
        setTimeout(() => resolve([{ comment: 'comment 1' }, { comment: 'comment 2' }]));
      });
      const dbClient = {
        commitSync: () => {},
        __proto__: {
          query,
          __proto__: {
            pool: {
              pooledQuery,
            },
          },
        },
      };
      const redisCache = () => new Promise((resolve) => {
        setTimeout(() => resolve(350));
      });
      await di.getPost(dbClient, 1, redisCache);
      await Promise.all([1, 2].map(val => di.getActiveUserCount(dbClient, val)));
      const outputFileName = getSnapshotFileName('05_dependency_injection');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('06_mocks', () => {
    it('should record activity', async () => {
      const mocks = require('./06_mocks/06_mocks_instrumented');
      await mocks.getTodo();
      await mocks.localMocksTest();
      // mocks.datesTest(); // TODO
      // await mocks.higherOrderTest(); // TODO
      const outputFileName = getSnapshotFileName('06_mocks');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('07_large_payload', () => {
    it('should record activity', async () => {
      const { getClickCounts } = require('./07_large_payload/07_large_payload_instrumented');
      getClickCounts();
      const outputFileName = getSnapshotFileName('07_large_payload');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('08_this', () => {
    it('should record activity', async () => {
      const { newTarget, sample, protoOverwrite } = require('./08_this/08_this_instrumented');
      const obj = { InjectedPromise: global.Promise };
      await newTarget(obj);
      sample();
      protoOverwrite();
      const outputFileName = getSnapshotFileName('08_this');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('09_typescript_exports', () => {
    it('should record activity', async () => {
      const {
        exportTest1, default: exportTest2, exportTest3, fetchFromDb,
      } = require('./09_typescript_exports/09_typescript_exports_instrumented');
      exportTest1(2);
      exportTest2(3);
      exportTest3(4);
      await fetchFromDb({ query: () => ({ rows: [{ a: 42 }] }) });
      const outputFileName = getSnapshotFileName('09_typescript_exports');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('10_anon_export_default', () => {
    it('should record activity', async () => {
      const { default: edTest } = require('./10_anon_export_default/10_anon_export_default_instrumented');
      edTest(1, 2);
      const outputFileName = getSnapshotFileName('10_anon_export_default');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('11_higher_order', () => {
    it('should record activity', async () => {
      const hoi = require('./11_higher_order/11_higher_order_instrumented');
      hoi.base({ someFun: () => 1 })({ someOtherFun: () => 2 });
      hoi.validFun({ someFun: () => 3 });
      hoi.secondary1({ someFun: () => 4 });
      hoi.secondary2({ someFun: () => 5 });
      const outputFileName = getSnapshotFileName('11_higher_order');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('12_unwanted_injections', () => {
    it('should record activity', async () => {
      const ui = require('./12_unwanted_injections/12_unwanted_injections_instrumented');
      ui.fun([1, 2]);
      ui.fun2(2);
      ui.fun3(a => a);
      const outputFileName = getSnapshotFileName('12_unwanted_injections');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('13_anon_ts_export_default', () => {
    it('should record activity', async () => {
      const anonTs = require('./13_anon_ts_export_default/13_anon_ts_export_default_instrumented');
      anonTs.default(1, 2);
      const outputFileName = getSnapshotFileName('13_anon_ts_export_default');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('14_anon_module_exports_default', () => {
    it('should record activity', async () => {
      const anonMe = require('./14_anon_module_exports_default/14_anon_module_exports_default_instrumented');
      anonMe(1);
      const outputFileName = getSnapshotFileName('14_anon_module_exports_default');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('15_named_module_exports_default', () => {
    it('should record activity', async () => {
      const namedMe = require('./15_named_module_exports_default/15_named_module_exports_default_instrumented');
      namedMe(1);
      const outputFileName = getSnapshotFileName('15_named_module_exports_default');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('16_exported_objects', () => {
    it('should record activity', async () => {
      const exportedObj = require('./16_exported_objects/16_exported_objects_instrumented');
      await exportedObj.obj1.foo1({ someFun: () => Promise.resolve(1) }, 2);
      await exportedObj.obj1.foo2();
      await exportedObj.obj2.bar(2, 1);
      await exportedObj.obj2.deep.fun({ anotherFun: () => 1 });
      await exportedObj.obj2.higher(1)(2);
      exportedObj.largeObj.largeFun();
      const outputFileName = getSnapshotFileName('16_exported_objects');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('17_param_mutation', () => {
    it('should record activity', async () => {
      const pm = require('./17_param_mutation/17_param_mutation_instrumented');
      const arr = [1];
      pm.fun(arr);
      const outputFileName = getSnapshotFileName('17_param_mutation');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('18_record_stub_params', () => {
    it('should record activity', async () => {
      const rsp = require('./18_record_stub_params/18_record_stub_params_instrumented');
      process.env.UTR_RECORD_STUB_PARAMS = true;
      rsp.fun({ fun: a => a });
      const outputFileName = getSnapshotFileName('18_record_stub_params');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);

      process.env.UTR_RECORD_STUB_PARAMS = false;
    });
  });
  describe('19_demo', () => {
    it('should record activity', async () => {
      const demo = require('./19_demo/19_demo_instrumented');
      process.env.UTR_RECORD_STUB_PARAMS = true;
      await demo.saveTodos({ bulkInsert: arr => ({ message: `${arr.length} rows added` }) });
      const outputFileName = getSnapshotFileName('19_demo');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);

      process.env.UTR_RECORD_STUB_PARAMS = false;
    });
  });
});
/* eslint-enable global-require */
