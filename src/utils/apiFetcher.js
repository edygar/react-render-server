/* eslint-env browser, node */
import { camelizeKeys } from 'humps';
import servers from 'config/servers';
import 'isomorphic-fetch';
import normalize from 'normalizr';

const debug = require('debug')('debug:request');
const apiServer = servers.api;
const API_ROOT = `http://${apiServer.host}:${apiServer.port}${apiServer.prefix}/`;

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
export default function apiFetcher(endpoint, schema) {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint;

  debug('Requesting…', fullUrl);
  return fetch(fullUrl)
  .then(response =>
    response.json().then(json => ({ json, response }))
  ).then(({ json, response }) => {
    debug('Response from ', fullUrl, response);
    if (!response.ok) {
      return Promise.reject(json);
    }

    const camelizedJson = camelizeKeys(json);
    // const nextPageUrl = getNextPageUrl(response);

    return {
      ...normalize(camelizedJson, schema),
      /* { nextPageUrl } */
    };
  });
}

