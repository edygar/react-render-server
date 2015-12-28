import {ROUTER_DID_CHANGE} from 'redux-router/lib/constants';
import getDataDependencies from 'utils/getDataDependencies';
import { isServer } from 'config/env';

const warn = require('debug')('warn:redux:middleware:fetchData');
const locationsAreEqual = (locA, locB) => (locA.pathname === locB.pathname) && (locA.search === locB.search);

export default store => next => action => {
  if (action.type === ROUTER_DID_CHANGE) {
    if (store.getState().router && locationsAreEqual(action.payload.location, store.getState().router.location)) {
      return next(action);
    }

    const {components, location, params} = action.payload;
    const promise = new Promise((resolve) => {
      const doTransition = () => {
        next(action);

        const deferred = getDataDependencies(components, store, location, params, true);
        Promise.all(deferred)
          .then(resolve)
          .catch(error => {
            // TODO: You may want to handle errors for fetchDataDeferred here
            warn('Warning: Error in fetchDataDeferred', error);
            return resolve();
          });
      };

      const immediate = getDataDependencies(components, store, location, params);
      Promise.all(immediate)
        .then(doTransition)
        .catch(error => {
          // TODO: You may want to handle errors for fetchData here
          warn('Warning: Error in fetchData', error);
          return doTransition();
        });
    });

    if (isServer) {
      // router state is null until ReduxRouter is created so we can use this to store
      // our promise to let the server know when it can render
      store.getState().router = promise;
    }

    return promise;
  }
  return next(action);
};
