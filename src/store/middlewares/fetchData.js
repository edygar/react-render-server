import {UPDATE_PATH} from 'redux-simple-router';
import getDataDependencies from 'utils/getDataDependencies';

const locationsAreEqual = (locA, locB) => (locA.pathname === locB.pathname) && (locA.search === locB.search);

export default ({getState, dispatch}) => next => action => {
  if (action.type === UPDATE_PATH) {
    if (getState().routing && locationsAreEqual(action.payload.location, getState().routing.location)) {
      return next(action);
    }
    const {components, location, params} = action.payload;
    const promise = new Promise((resolve) => {
      const doTransition = () => {
        next(action);
        Promise.all(getDataDependencies(components, getState, dispatch, location, params, true))
          .then(resolve)
          .catch(error => {
            // TODO: You may want to handle errors for fetchDataDeferred here
            console.warn('Warning: Error in fetchDataDeferred', error);
            return resolve();
          });
      };

      Promise.all(getDataDependencies(components, getState, dispatch, location, params))
        .then(doTransition)
        .catch(error => {
          // TODO: You may want to handle errors for fetchData here
          console.warn('Warning: Error in fetchData', error);
          return doTransition();
        });
    });

    if (__SERVER__) {
      // routing state is null until ReduxSimpleRouter is created so we can use this to store
      // our promise to let the server know when it can render
      getState().routing = promise;
    }

    return promise;
  }

  return next(action);
};
