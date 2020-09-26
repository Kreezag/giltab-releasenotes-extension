const isEmpty = require('lodash/isEmpty')

interface RequestUrlParamsSearch {
    [key: string]: string;
}

interface RequestUrlParams {
    pathname: string;
    search?: RequestUrlParamsSearch|null;
    hash?: string;
    protocol?: 'http'|'https';
}


const convertSearchParams = (params: RequestUrlParamsSearch|null) => {
    if (!isEmpty(params)) {
        return Object.entries(params.search).reduce((result, [key, value]) => result ? `${result}&${key}=${value}` : `?${key}=${value}`, '')
    }
    return ''
}

const createRequestUrl = (
    origin: string,
    params: RequestUrlParams = {
        pathname: '',
        protocol: 'http',
        search: null,
        hash: null,
    }) => {
    const _pathname = params.pathname.startsWith('/') ? params.pathname : `/${params.pathname}`;
    const _protocol = origin.trim().match('/http|https:\/\//') ? '' : `${params.protocol}://`;
    const _origin = origin.replace('/\/$/', '');
    const _search = convertSearchParams(params.search);
    const _hash = params.hash ? `#${params.hash}` : '';

    const url = new URL (`${_protocol}${_origin}${_pathname}${_search}${_hash}`)

    return url.toString()
}


export { createRequestUrl }
