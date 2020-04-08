const _ = require('lodash');

const RecorderManager = require('./manager');

const { injectDependencyInjections } = require('./injection');
const { checkAndSetHash } = require('./utils/hash-helper');
const { generateTypesObj } = require('./utils/dynamic-type-inference');

const pre = ({ meta, p }) => {
  const { path, name, paramIds } = meta;
  const address = ['recorderState', path, 'exportedFunctions', name];
  if (!_.get(RecorderManager, address)) {
    _.set(RecorderManager, address, {
      meta: { ...meta, paramIds },
      captures: [],
    });
  }
  const capturesAddress = [...address, 'captures'];
  const old = _.get(RecorderManager, capturesAddress);
  RecorderManager.record(capturesAddress, old.concat([{}]), old);
  const captureIndex = old.length;
  injectDependencyInjections(p, { ...meta, captureIndex });
  const params = p;
  return {
    path, name, captureIndex, params,
  };
};

const captureUserFunction = ({
  result, path, name, captureIndex, params, doesReturnPromise,
}) => {
  // Record types from this capture
  const types = generateTypesObj({ params, result });

  // TODO: Handle higher order functions
  if (_.isFunction(result)) {
    result = result.toString();
  }
  const addrToCurrentFun = ['recorderState', path, 'exportedFunctions', name];
  const addrToDoesReturnPromise = [...addrToCurrentFun, 'meta', 'doesReturnPromise'];
  const addrToCaptureIndex = [...addrToCurrentFun, 'captures', captureIndex];

  // Record if the function returned a promise
  RecorderManager.record(addrToDoesReturnPromise, doesReturnPromise, false);

  const basePath = ['recorderState', path, 'exportedFunctions', name];
  if (checkAndSetHash(RecorderManager, basePath, params)) {
    // Capture already exists
    RecorderManager.record(addrToCaptureIndex, null, null);
    return;
  }

  // Merge with recordings of dependency injections
  const existing = _.get(RecorderManager, addrToCaptureIndex);
  const newCapture = { params, result, types };
  RecorderManager.record(addrToCaptureIndex, _.merge(existing, newCapture), existing);
};

const recorderWrapper = (meta, innerFunction, ...p) => {
  const originalParams = _.clone(p);
  let preObj;
  try {
    preObj = pre({ meta, p });
  } catch (e) {
    console.error(e);
    // Dont try to record if pre fails
    return innerFunction(...originalParams);
  }
  // If the function itself throws exception then
  // the user should handle it
  const result = innerFunction(...p);
  try {
    const {
      path, name, captureIndex, params,
    } = preObj;
    if (result && _.isFunction(result.then)) {
      // It might be a promise
      result.then(res => captureUserFunction({
        result: res, path, name, captureIndex, params, doesReturnPromise: true,
      }));
    } else {
      captureUserFunction({
        result, path, name, captureIndex, params, doesReturnPromise: false,
      });
    }
  } catch (e) {
    console.error(e);
  }

  return result;
};

module.exports = {
  recorderWrapper,
};
