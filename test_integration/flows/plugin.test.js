const fs = require('fs');

const babel = require('@babel/core');
const parser = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');
const { toMatchFile } = require('jest-file-snapshot');
const { default: generate } = require('@babel/generator');
const prettier = require('prettier');

expect.extend({ toMatchFile });

const myPlugin = require('../../src/plugin');
const { parserPlugins, generatorOptions } = require('../../src/plugin/used-plugins');

const generatedInstrumentedCode = (inputPath) => {
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  const ast = parser.parse(inputCode, {
    sourceType: 'module',
    plugins: parserPlugins,
  });
  const whiteListedModules = { fs: true, axios: true };
  const state = { whiteListedModules, fileName: inputPath, importPath: '../../../src/recorder' };
  traverse(ast, myPlugin(babel).visitor, null, state);
  const { code } = generate(ast, generatorOptions);
  return prettier.format(code, {
    singleQuote: true,
    parser: 'babel',
  });
};

const getInputAndOutputPathForInstrumented = (fileName) => {
  const inputPath = `test_integration/flows/${fileName}/${fileName}.js`;
  const outputPath = `test_integration/flows/${fileName}/${fileName}_instrumented.js`;

  return { inputPath, outputPath };
};

describe('plugin.test', () => {
  describe('01_module_exports', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '01_module_exports';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('02_async_functions', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '02_async_functions';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('03_ecma_export', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '03_ecma_export';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('04_unserializeable', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '04_unserializeable';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('05_dependency_injection', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '05_dependency_injection';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('06_mocks', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '06_mocks';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('07_large_payload', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '07_large_payload';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('08_this', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '08_this';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('09_typescript_exports', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '09_typescript_exports';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('10_anon_export_default', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '10_anon_export_default';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('11_higher_order', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '11_higher_order';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('12_unwanted_injections', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '12_unwanted_injections';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('13_anon_ts_export_default', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '13_anon_ts_export_default';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('14_anon_module_exports_default', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '14_anon_module_exports_default';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('15_named_module_exports_default', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '15_named_module_exports_default';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('16_exported_objects', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '16_exported_objects';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('17_param_mutation', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '17_param_mutation';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('18_record_stub_params', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '18_record_stub_params';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
  describe('19_demo', () => {
    it('should match instrumented code snapshot', () => {
      const filename = '19_demo';
      const { inputPath, outputPath } = getInputAndOutputPathForInstrumented(filename);
      expect(generatedInstrumentedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
});
