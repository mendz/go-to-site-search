/* global chrome */

let incognitoWindowId = null;

function findIncognitoWindowId() {
  chrome.windows.getAll(
    { populate: false, windowTypes: ['normal'] },
    (windows) => {
      for (const window of windows) {
        console.log(window.incognito);
        if (window.incognito) {
          incognitoWindowId = window.id;
          return;
        }
      }
    }
  );
}

function openIncognitoWindow() {
  chrome.windows.create(
    {
      url: null,
      incognito: true,
    },
    () => {
      findIncognitoWindowId();
      console.log(incognitoWindowId);
    }
  );
}

/**
 * @param {string} site
 * @param {string} query
 */
function getUrl(site, query) {
  return `https://www.google.com/search?q=site:${site}${
    query ? `%20${query}` : ''
  }`;
}

// https://stackoverflow.com/questions/60328589/how-to-open-new-tab-in-an-existing-incognito-window
/**
 * @param {string} site
 * @param {string[]} queries
 */
function openIncognitoTabs(site, queries) {
  chrome.windows.getAll(
    { populate: false, windowTypes: ['normal'] },
    (windows) => {
      for (const window of windows) {
        if (window.incognito) {
          // Use this window.
          queries.forEach((query) => {
            chrome.tabs.create({
              url: getUrl(site, query),
              active: true,
              windowId: window.id,
            });
          });
          return;
        }
      }

      // No incognito window found, open a new one.
      chrome.windows.create({
        url: getUrl(site, queries[0] ?? ''),
        incognito: true,
      });
      // openIncognitoTabs(site, queries);
    }
  );
}

/**
 * @param {string} site
 * @param {string[]} queries
 */
function openTabs(site, queries) {
  queries.forEach((query) => {
    chrome.tabs.create({
      url: getUrl(site, query),
      active: true,
    });
  });
}

function search(event) {
  event.preventDefault();
  const site = event.target.elements.domainSite.value;
  const queriesString = event.target.elements.queries.value?.trim() ?? '';
  const queries = queriesString.length ? queriesString.split('\n') : [''];
  openTabs(site, queries);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', search);
  document
    .querySelector('.incognito-wrapper button')
    .addEventListener('click', openIncognitoWindow);
});
