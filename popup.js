/* global chrome */
let counter = 0;
const html = String.raw;

function generateTemplate(index) {
  return html`
    <fieldset data-index="${index}">
      <label for="domain-site">
        Domain/Site (${index})
        <input
          type="text"
          name="domain-site-${index}"
          id="domain-site-${index}"
          placeholder="Enter domain or site name"
          required
        />
      </label>
      <label for="query" class="input-wrapper">
        Query (${index})
        <input
          type="text"
          name="query-${index}"
          id="query-${index}"
          placeholder="Enter extra query (optional)"
        />
      </label>
    </fieldset>
  `;
}

function checkButtonsStatus() {
  if (counter === 0) {
    document.querySelector('#remove-inputs').disabled = true;
    document.querySelector('button[type="submit"]').disabled = true;
  } else {
    document.querySelector('#remove-inputs').disabled = false;
    document.querySelector('button[type="submit"]').disabled = false;
  }
}

function addInputs() {
  const wrapper = document.querySelector('.input-wrapper');
  let htmlString = '';
  counter += 1;
  htmlString += generateTemplate(counter);
  wrapper.insertAdjacentHTML('beforeend', htmlString);
  checkButtonsStatus();
}

function minusInputs() {
  const wrapper = document.querySelector('.input-wrapper');
  const inputsToRemove = wrapper.querySelector(
    `fieldset[data-index="${counter}"]`
  );
  counter -= 1;
  wrapper.removeChild(inputsToRemove);
  checkButtonsStatus();
}

function search(event) {
  event.preventDefault();
  Array.from({ length: counter }).forEach((_, i) => {
    const site = event.target.elements[`domain-site-${i + 1}`].value;
    const query = event.target.elements[`query-${i + 1}`].value;
    chrome.tabs.create({
      url: `https://www.google.com/search?q=site:${site}${
        query ? `%20${query}` : ''
      }`,
      active: true,
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', search);
  addInputs();
  document.querySelector('#add-inputs').addEventListener('click', addInputs);
  document
    .querySelector('#remove-inputs')
    .addEventListener('click', minusInputs);
});
