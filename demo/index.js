import '../src/lit-combo-box.js';
import {elements} from './demo-data.js';

const comboBox = document.createElement('lit-combo-box');
document.body.appendChild(comboBox);

comboBox.items = elements;
comboBox.value = elements[0].name;
