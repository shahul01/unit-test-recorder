const _ = require('lodash');
const { getNamespace } = require('../../util/cls-provider');

const { traverseBfs } = require('../utils/object-traverser');
const { newFunctionNameGenerator } = require('../../util/misc');
const { injectFunctionDynamically } = require('./injector');

const {
  CLS_NAMESPACE,
} = require('../../util/constants');

const injectDependencyInjections = (params) => {
  const session = getNamespace(CLS_NAMESPACE);
  const stack = session.get('stack');
  const meta = _.last(stack);
  const { injectionWhitelist, path: fileName } = meta;
  params.forEach((param, paramIndex) => {
    try {
      // If param is an object/array with functions
      if (_.isObject(param) && !_.isFunction(param)) {
        const iterator = traverseBfs(param, injectionWhitelist);
        for (
          let path = iterator.next().value;
          path !== undefined;
          path = iterator.next().value
        ) {
          const existingProperty = _.get(param, path);
          const lIndex = path.length - 1;
          const newFnName = newFunctionNameGenerator(path[lIndex], fileName);
          const newPath = _.clone(path);
          newPath[lIndex] = newFnName;
          const fppkey = path.join('.');
          const propertyToInject = _.get(param, newPath, existingProperty);
          const injectedProperty = injectFunctionDynamically(
            propertyToInject, paramIndex, fppkey,
          );
          _.set(param, newPath, injectedProperty);
        }
      } else {
        params[paramIndex] = injectFunctionDynamically(
          params[paramIndex], paramIndex, null,
        );
      }
    } catch (e) {
      // Ignore this param
      console.error(e);
    }
  });
};

module.exports = {
  injectDependencyInjections,
};
