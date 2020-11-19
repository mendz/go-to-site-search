/* global chrome */

function search(event) {
  event.preventDefault();
  const site = event.target.elements.domainSite.value;
  const query = event.target.elements.query.value;
  chrome.tabs.create({
    url: `https://www.google.com/search?q=site:${site}${!!query ? '%20'+query : ''}`,
    active: true,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', search);
});
