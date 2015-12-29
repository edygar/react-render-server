/* eslint-env browser, node */
import { camelizeKeys } from 'humps';
import servers from 'config/servers';
import 'isomorphic-fetch';
import { normalize } from 'normalizr';

const API_ROOT =
  servers.api.proxyThrought?
  `${servers.self.protocol}://${servers.self.host}:${servers.self.port}${servers.self.prefix}${servers.api.proxyThrought}/`:
  `${servers.api.protocol}://${servers.api.host}:${servers.api.port}${servers.api.prefix}/`;

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
export default function apiFetcher(endpoint, schema) {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint;

  return fetch(fullUrl)
  .then(response =>
    response.json().then(json => ({ json, response }))
  ).then(({ json, response }) => {
    if (!response.ok) {
      return Promise.reject(json);
    }

    const camelizedJson = camelizeKeys(json);
    const nextPageUrl = getNextPageUrl(response);

    return {
      ...normalize(camelizedJson, schema),
      nextPageUrl
    };
  });
}


function getNextPageUrl(response) {
  const link = response.headers.get('link');
  if (!link) {
    return null;
  }

  const nextLink = link.split(',').find(s => s.indexOf('rel="next"') > -1);
  if (!nextLink) {
    return null;
  }

  return nextLink.split(';')[0].slice(1, -1);
}
