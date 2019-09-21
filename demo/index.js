import { html } from 'lit-element';
import '../src/lit-combo-box';
import '../src/lit-select';
import '../src/lit-date-picker-calendar';
import { elements } from './demo-data.js';

(async() => {
  const comboBox = document.createElement('lit-combo-box');
  document.body.appendChild(comboBox);

  comboBox.items = elements;
  comboBox.value = elements[0].value;

  const select = document.createElement('lit-select');
  document.body.appendChild(select);

  await select.updateComplete;

  select.renderItem = item => html`
    <lit-item value="${item.value}">${item.label}</lit-item>
  `;

  select.items = elements.slice(0, 10);

  const calendar = document.createElement('lit-date-picker-calendar');
  document.body.appendChild(calendar);
})();
