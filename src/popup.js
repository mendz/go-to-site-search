/* global chrome */

const newTypes = {
  NEW_TAB: 'new-tab',
  NEW_WINDOW: 'new-window',
};

const DATA_NAMES = {
  ...newTypes,
  DOMAIN_SITE: 'domain-site',
  QUERIES: 'queries',
  INCOGNITO_CHECK: 'incognito-check',
};

const INPUT_WITH_BOOLEAN_VALUES = ['radio', 'checkbox'];

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
 *
 * @param {string} site
 * @param {string[]} queries
 */
function openSearchesNewTabs(site, queries) {
  queries.forEach((query) => {
    chrome.tabs.create({
      url: getUrl(site, query),
      active: true,
    });
  });
}

/**
 *
 * @param {string} site
 * @param {string[]} queries
 * @param {boolean} isIncognito
 */
function openSearchesNewWindow(site, queries, isIncognito) {
  chrome.windows.create(
    {
      focused: true,
      width: 840,
      incognito: isIncognito,
    },
    (window) => {
      const { id } = window;
      queries.forEach((query) => {
        chrome.tabs.create({
          windowId: id,
          url: getUrl(site, query),
          active: true,
        });
      });
      chrome.windows.get(id, { populate: true }, (windowWithTabs) => {
        chrome.tabs.remove(windowWithTabs.tabs[0].id);
      });
    }
  );
}

/**
 * @param {string} site
 * @param {string[]} queries
 * @param {string} newType
 */
function openSearches(site, queries, newType) {
  const isIncognito = document.querySelector(
    'input[type="checkbox"]#incognito-check'
  ).checked;
  if (newType === newTypes.NEW_TAB && !isIncognito) {
    openSearchesNewTabs(site, queries);
  }
  if (newType === newTypes.NEW_WINDOW || isIncognito) {
    openSearchesNewWindow(site, queries, isIncognito);
  }
}

/**
 * @param {InputEvent} event
 */
function search(event) {
  event.preventDefault();
  const site = event.target.elements[DATA_NAMES.DOMAIN_SITE].value;
  const queriesString = event.target.elements.queries.value?.trim() ?? '';
  const queries = queriesString.length ? queriesString.split('\n') : [''];
  const newType = [
    ...document.querySelectorAll(
      '.settings-container input[type="radio"][name="new-window-tab"]'
    ),
  ].find((radio) => radio.checked);
  openSearches(site, queries, newType.value);
}

/**
 * @param {InputEvent} event
 */
function handleDomainChange(event) {
  const { value } = event.target;
  if (event.inputType === 'insertFromPaste') {
    document.querySelector(`#${DATA_NAMES.DOMAIN_SITE}`).value = trimDomain(
      value
    );
  }
}

/**
 * @param {InputEvent} event
 */
function handleSaveInputValues(event) {
  const { dataset, type, name } = event.target;
  let { value } = event.target;
  const otherValue = {
    dataName: null,
    value: null,
  };
  // handle the values
  if (INPUT_WITH_BOOLEAN_VALUES.includes(type)) {
    value = event.target.checked;
  } else if (dataset.name === 'domain' && type === 'text') {
    value = trimDomain(value);
  }
  if (name === 'new-window-tab') {
    otherValue.dataName =
      dataset.name === DATA_NAMES.NEW_TAB
        ? DATA_NAMES.NEW_WINDOW
        : DATA_NAMES.NEW_TAB;
    otherValue.value = !value;
  }
  const values = { [dataset.name]: value };
  if (otherValue.dataName !== null) {
    values[otherValue.dataName] = otherValue.value;
  }
  // save the values
  chrome.storage.sync.set(values, () => {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    } else {
      console.info(`saved - (${dataset.name}) with: (${value})`);
    }
  });
}

function clearInputs() {
  document.querySelector(`#${DATA_NAMES.DOMAIN_SITE}`).value = '';
  document.querySelector(`#${DATA_NAMES.QUERIES}`).value = '';
  chrome.storage.sync.set(
    { [DATA_NAMES.DOMAIN_SITE]: null, [DATA_NAMES.QUERIES]: null },
    () => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      } else {
        console.info(`clear form storage inputs`);
      }
    }
  );
}

/**
 *
 * @param {InputEvent} event
 */
function onIncognitoChange(event) {
  const { target } = event;
  const newTab = document.querySelector(
    '.settings-container input[type="radio"][name="new-window-tab"]#new-tab'
  );
  const newWindow = document.querySelector(
    '.settings-container input[type="radio"][name="new-window-tab"]#new-window'
  );
  if (target.checked) {
    newTab.disabled = true;
    newTab.parentElement.classList.add('disabled');
    newWindow.checked = true;
  } else {
    newTab.disabled = false;
    newTab.parentElement.classList.remove('disabled');
  }
}

function disableInputs() {
  const incognitoCheck = document.querySelector(
    'input[type="checkbox"]#incognito-check'
  );
  onIncognitoChange({ target: { checked: incognitoCheck.checked } });
}

function saveInputsValue() {
  // save inputs on chrome storage
  Object.values(DATA_NAMES).forEach((dataName) => {
    document
      .querySelector(`#${dataName}`)
      .addEventListener('input', handleSaveInputValues);
  });
  chrome.storage.sync.get(Object.values(DATA_NAMES), (result) => {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
      return;
    }
    Object.values(DATA_NAMES).forEach((dataName) => {
      const input = document.querySelector(`#${dataName}`);
      if (INPUT_WITH_BOOLEAN_VALUES.includes(input.type)) {
        input.checked = result[dataName] ?? false;
      } else {
        input.value = result[dataName] ?? '';
      }
    });
    disableInputs();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
    const incognitoCheck = document.querySelector(
      'input[type="checkbox"]#incognito-check'
    );
    const incognitoDetails = document.querySelector(
      'details.incognito-details'
    );
    if (isAllowedAccess) {
      incognitoCheck.disabled = false;
      incognitoCheck.parentElement.classList.remove('disabled');
      incognitoDetails.classList.add('hide');
    } else {
      incognitoCheck.disabled = true;
      incognitoCheck.parentElement.classList.add('disabled');
      incognitoDetails.classList.remove('hide');
    }
  });
  document.querySelector('form').addEventListener('submit', search);
  document.querySelector('button#clear').addEventListener('click', clearInputs);
  document
    .querySelector(`#${DATA_NAMES.DOMAIN_SITE}`)
    .addEventListener('input', handleDomainChange);
  document
    .querySelector(`#${DATA_NAMES.INCOGNITO_CHECK}`)
    .addEventListener('change', onIncognitoChange);
  saveInputsValue();
});
