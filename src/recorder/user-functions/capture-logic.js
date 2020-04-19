const { getNamespace } = require('cls-hooked');
const _ = require('lodash');

const RecorderManager = require('../manager');
const { checkAndSetHash } = require('../utils/hash-helper');
const { generateTypesObj } = require('../utils/dynamic-type-inference');
const { recordAllToRecorderState } = require('../injection/di-recorder');

const processFunctionLikeParam = (param) => {
  if (_.isFunction(param) && !param.utrIsInjected) {
    return param.toString();
  }
  // Will be mocked separately
  if (param.utrIsInjected) return null;
  return param;
};

const captureUserFunction = (params, result) => {
  const session = getNamespace('default');
  const meta = session.get('meta');
  const { path, name, doesReturnPromise } = meta;
  // Record types from this capture
  const types = generateTypesObj({ params, result });

  // TODO: Handle higher order functions
  if (_.isFunction(result)) {
    result = result.toString();
  }
  params = params.map(processFunctionLikeParam);
  const newCapture = { params, result, types };

  const addrToCurrentFun = ['recorderState', path, 'exportedFunctions', name];
  const addrToDoesReturnPromise = [...addrToCurrentFun, 'meta', 'doesReturnPromise'];
  const captures = _.get(RecorderManager, [...addrToCurrentFun, 'captures'], []);
  const captureIndex = captures.length;
  const addrToCaptureIndex = [...addrToCurrentFun, 'captures', captureIndex];

  // Record if the function returned a promise
  RecorderManager.record(addrToDoesReturnPromise, doesReturnPromise, false);

  const basePath = ['recorderState', path, 'exportedFunctions', name];
  if (checkAndSetHash(RecorderManager, basePath, newCapture)) {
    // Capture already exists
    RecorderManager.record(addrToCaptureIndex, null, null);
    return;
  }

  RecorderManager.recordTrio(addrToCaptureIndex, params, result, types);

  // Record all dependency injections
  recordAllToRecorderState(captureIndex);
};

module.exports = { captureUserFunction, processFunctionLikeParam };