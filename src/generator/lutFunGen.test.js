const prettier = require('prettier');
const { captureArrayToLutFun } = require('./lutFunGen');

describe('lutFunGen', () => {
  describe('captureArrayToLutFun', () => {
    it('should work if payload is small', () => {
      const captures = [
        { params: [1, 2], result: 1 },
        { params: [3], result: 3 },
        { params: ['a', 'b'], result: 'c' },
        { params: [{ foo: 'bar' }, 'd'], result: 'e' },
        { params: ['foo.exe'], result: 'yep' },
        { params: [], result: { loo: 'car' } },
      ];
      const lIdentifier = 'lIdentifier.foo.bar';
      const meta = { path: 'path', name: 'name', relativePath: './' };
      const captureIndex = 0;
      const packagedArguments = { sizeLimit: 500 };
      const { code, externalData } = captureArrayToLutFun(
        captures,
        lIdentifier,
        meta,
        captureIndex,
        packagedArguments,
      );
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "(...params) => {
          const safeParams = params.length === 0 ? [undefined] : params;
          return safeParams.reduce(
            (acc, param) => {
              if (typeof param === 'string') return acc[param];
              const stringifiedParam = JSON.stringify(param);
              if (stringifiedParam && stringifiedParam.length > 10000)
                return acc['KEY_TOO_LARGE'];
              return acc[stringifiedParam];
            },
            {
              '1': {
                '2': 1
              },
              '3': 3,
              a: {
                b: 'c'
              },
              '{\\"foo\\":\\"bar\\"}': {
                d: 'e'
              },
              'foo.exe': 'yep',
              undefined: {
                loo: 'car'
              }
            }
          );
        };
        "
      `);
      const formattedExternalData = JSON.stringify(externalData[0], null, 2);
      expect(formattedExternalData).toMatchInlineSnapshot('undefined');
      // eslint-disable-next-line
      const fn = eval(code);
      captures.forEach((capture) => {
        expect(fn(...capture.params)).toEqual(capture.result);
      });
    });
    it('should work if payload is large', () => {
      const captures = [
        {
          params: [],
          result: {
            message: 'Imagine a large payload',
          },
        },
      ];
      const lIdentifier = 'lIdentifier.foo.bar';
      const meta = { path: 'path', name: 'name', relativePath: './' };
      const captureIndex = 0;
      const limit = 10;
      const packagedArguments = { sizeLimit: limit };
      const { code, externalData } = captureArrayToLutFun(
        captures,
        lIdentifier,
        meta,
        captureIndex,
        packagedArguments,
      );
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "(...params) => {
          const safeParams = params.length === 0 ? [undefined] : params;
          return safeParams.reduce((acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          }, name0lIdentifierFooBar);
        };
        "
      `);
      const formattedExternalData = JSON.stringify(externalData[0], null, 2);
      expect(formattedExternalData).toMatchInlineSnapshot(`
        "{
          \\"fileString\\": \\"module.exports = {\\\\n  undefined: {\\\\n    message: 'Imagine a large payload'\\\\n  }\\\\n};\\\\n\\",
          \\"identifier\\": \\"name0lIdentifierFooBar\\",
          \\"filePath\\": \\"path/name_0_lIdentifierFooBar.mock.js\\",
          \\"importPath\\": \\"./path/name_0_lIdentifierFooBar.mock.js\\"
        }"
      `);
    });
    it('should work if key is too large', () => {
      const captures = [{ params: [{ message: 'Large key' }], result: 42 }];
      const lIdentifier = 'lIdentifier.foo.bar';
      const meta = { path: 'path', name: 'name', relativePath: './' };
      const captureIndex = 0;
      const limit = 500;
      const keyLimit = 2;
      const packagedArguments = { sizeLimit: limit };
      const { code } = captureArrayToLutFun(
        captures,
        lIdentifier,
        meta,
        captureIndex,
        packagedArguments,
        keyLimit,
      );
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "(...params) => {
          const safeParams = params.length === 0 ? [undefined] : params;
          return safeParams.reduce(
            (acc, param) => {
              if (typeof param === 'string') return acc[param];
              const stringifiedParam = JSON.stringify(param);
              if (stringifiedParam && stringifiedParam.length > 2)
                return acc['KEY_TOO_LARGE'];
              return acc[stringifiedParam];
            },
            {
              '{\\"message\\":\\"Large key\\"}': 42,
              KEY_TOO_LARGE: 42
            }
          );
        };
        "
      `);
      // eslint-disable-next-line
      const fn = eval(code);
      captures.forEach((capture) => {
        expect(fn(...capture.params)).toEqual(capture.result);
      });
    });
    it('should work if payload and key is large', () => {
      const captures = [
        {
          params: [{ message: 'Imagine a large key' }],
          result: {
            message: 'Imagine a large payload',
          },
        },
      ];
      const lIdentifier = 'lIdentifier.foo.bar';
      const meta = { path: 'path', name: 'name', relativePath: './' };
      const captureIndex = 0;
      const limit = 5;
      const keyLimit = 5;
      const packagedArguments = { sizeLimit: limit };
      const { code, externalData } = captureArrayToLutFun(
        captures,
        lIdentifier,
        meta,
        captureIndex,
        packagedArguments,
        keyLimit,
      );
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "(...params) => {
          const safeParams = params.length === 0 ? [undefined] : params;
          return safeParams.reduce((acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 5)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          }, name0lIdentifierFooBar);
        };
        "
      `);
      const formattedExternalData = JSON.stringify(externalData[0], null, 2);
      expect(formattedExternalData).toMatchInlineSnapshot(`
        "{
          \\"fileString\\": \\"module.exports = {\\\\n  '{\\\\\\"message\\\\\\":\\\\\\"Imagine a large key\\\\\\"}': {\\\\n    message: 'Imagine a large payload'\\\\n  },\\\\n  KEY_TOO_LARGE: {\\\\n    message: 'Imagine a large payload'\\\\n  }\\\\n};\\\\n\\",
          \\"identifier\\": \\"name0lIdentifierFooBar\\",
          \\"filePath\\": \\"path/name_0_lIdentifierFooBar.mock.js\\",
          \\"importPath\\": \\"./path/name_0_lIdentifierFooBar.mock.js\\"
        }"
      `);
    });
  });
});
