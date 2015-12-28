/**
  * 1. Skip holes in route component chain and
  * only consider components that implement
  * fetchData or fetchDataDeferred
  *
  * 2. Pull out fetch data methods
  *
  * 3. Call fetch data methods and gather promises
  */
export default (components, store, location, params, deferred) => {
  const methodName = deferred ? 'loadDataDeferred' : 'loadData';

  return components
    .filter((component) => component && component[methodName]) // 1
    .map((component) => component[methodName]) // 2
    .map(fetchData =>
      fetchData(store, location, params)); // 3
};
