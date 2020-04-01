const _ = require('lodash');

const {
  generateAssignmentOperation,
  generateRegularInputAssignments,
  generateInputAssignmentsWithInjections,
} = require('./statement-helpers');

const { reduceExternalImports } = require('./utils');

const generateImportStatementFromActivity = (activity, allExternalData) => {
  const importedFunctions = Object.keys(activity);
  const scriptImports = importedFunctions.reduce((acc, importedFunction) => {
    const {
      isDefault, isEcmaDefault, importPath,
    } = activity[importedFunction].meta;
    if (isEcmaDefault) return `${acc}\nconst {default:${importedFunction}} = require('${importPath}')`;
    if (isDefault) return `${acc}\nconst ${importedFunction} = require('${importPath}')`;
    return `${acc}\nconst {${importedFunction}} = require('${importPath}')`;
  }, '');

  // Mocks are imported in a separate place
  const externalsWithoutMocks = allExternalData.filter(ed => !ed.isMock);

  const externalDataImports = reduceExternalImports(externalsWithoutMocks);

  return scriptImports + externalDataImports;
};

const generateInputStatements = (capture, meta, testIndex, packagedArguments) => {
  const allExternalData = [];

  // Generate all the assignment operations
  const {
    inputStatements,
    inputStatementExternalData,
  } = generateRegularInputAssignments(capture, meta, testIndex, packagedArguments);
  allExternalData.push(...inputStatementExternalData);

  // Generate injected function assignments if any
  const {
    injectedFunctionMocks,
    functionMockExternalData,
  } = generateInputAssignmentsWithInjections(capture, meta, testIndex, packagedArguments);
  allExternalData.push(...functionMockExternalData);

  return {
    inputStatements,
    injectedFunctionMocks,
    inputStatementExternalData: allExternalData,
  };
};

const generateExpectStatement = (functionIdentifier, capture, meta) => {
  const { doesReturnPromise, paramIds } = meta;
  const resultType = _.get(capture, 'types.result');
  const invokeExpression = `${functionIdentifier}(${paramIds.join(',')})`;

  const awaitString = doesReturnPromise ? 'await ' : '';
  const actualStatement = `const actual = ${awaitString}${invokeExpression}`;
  const defaultReturn = `${actualStatement};expect(actual).toEqual(result)`;
  return {
    Object: `${actualStatement};expect(actual).toMatchObject(result)`,
    Function: `${actualStatement};expect(actual.toString()).toEqual(result)`,
  }[resultType] || defaultReturn;
};

const generateResultStatement = (capture, meta, captureIndex, packagedArguments) => {
  const maybeObject = capture.result;
  const resultType = _.get(capture, 'types.result');
  const lIdentifier = 'result';
  const { statement, externalData } = generateAssignmentOperation(
    maybeObject, lIdentifier, meta, captureIndex, resultType, packagedArguments,
  );
  return { resultStatement: statement, resultStatementExternalData: externalData };
};

module.exports = {
  generateInputStatements,
  generateImportStatementFromActivity,
  generateExpectStatement,
  generateResultStatement,
};
