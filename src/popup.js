/* global chrome */

/**
 * @param {string} site
 */
function trimDomain(site) {
  try {
    const url = new URL(site);
    return url.hostname.replace(/^www\./, '');
  } catch (error) {
    return site;
  }
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

/**
 * @param {InputEvent} event
 */
function search(event) {
  event.preventDefault();
  const site = event.target.elements.domainSite.value;
  const queriesString = event.target.elements.queries.value?.trim() ?? '';
  const queries = queriesString.length ? queriesString.split('\n') : [''];
  openTabs(site, queries);
}

/**
 * @param {InputEvent} event
 */
function handleDomainChange(event) {
  const { value } = event.target;
  if (event.inputType === 'insertFromPaste') {
    document.querySelector('#domainSite').value = trimDomain(value);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', search);
  document
    .querySelector('#domainSite')
    .addEventListener('input', handleDomainChange);
});
