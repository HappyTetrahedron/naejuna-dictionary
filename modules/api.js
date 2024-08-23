/**
 * This module contains functions to retrieve data from the spreadsheet (which acts kind of like an API).
 * It also caches the results in local browser storage.
 */
import * as Config from "../configuration.js"

var cache = undefined;
var cacheDisabled = false;

try {
    cache = await caches.open("naejuna");
}
catch (exception) {}

export async function fetchData() {
    let url = Config.API_URL
    let data = await fetchWithCache(url, cacheDisabled ? 0 : Config.CACHE_DURATION);
    return data;
}

export function clearCache() {
    localStorage.clear();
}

async function fetchWithCache(url, cacheDuration) {
    let lastCached = localStorage.getItem(url)
    if (!cache || lastCached < Date.now() - cacheDuration) {
        let res = await fetch(url, {redirect: "follow"})
        if (!!cache) {
            await cache.put(url, res);
        }
        else {
            return await res.json();
        }
        localStorage.setItem(url, Date.now())
    }
    let res = await cache.match(url);
    return await res.json()
}
