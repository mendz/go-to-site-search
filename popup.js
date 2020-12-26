/* global chrome */
/**
 * @param {string} site
 * @param {string} query
 */
function getUrl(site, query) {
  return `https://www.google.com/search?q=site:${site}${
    query ? `%20${query}` : ''
  }`;
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
});
