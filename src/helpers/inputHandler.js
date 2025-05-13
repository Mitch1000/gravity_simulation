// ***************************************************************************
// ***************************************************************************
// Handling Input Boxes
// ***************************************************************************
// ***************************************************************************
//

import * as MathJS from 'mathjs';

function setInfoElValue(keyEl, value) {
  const valueBox = keyEl.getElementsByClassName('value')[0];

  valueBox.innerHTML = value;
}

function setVectorDisplayValue({ vector, displayEl, unit = 'km', unitModifier = 1 }) {
  const getValueElement = ({ vectorKey = 'x' }) => {
    return displayEl
      .getElementsByClassName(`value-${vectorKey}`)[0].getElementsByTagName('span')[0];
  };

  getValueElement({ vectorKey: 'x' }).innerHTML = `x: ${Number(vector.x / unitModifier).toPrecision(4)} ${unit}`;

  getValueElement({ vectorKey: 'y' }).innerHTML = `y: ${Number(vector.y / unitModifier).toPrecision(4)} ${unit}`;
};

export function setInfoBoxValues(currentlyOpenBody, infoEl) {
  const els = Array.from(infoEl.getElementsByTagName('div'));
  Object.keys(currentlyOpenBody).forEach((key) => {
    const keyEl = els.find((el) => el.id === key);
    if (typeof keyEl !== 'object') { return; }

    const value = currentlyOpenBody[key];

    if (value === undefined) {
      return;
    }

    let valueString = value.toString();

    if (key === 'name') {
      valueString;
      return setInfoElValue(keyEl, valueString);
    }

    if (key === 'scale') {
      return setInfoElValue(keyEl, value);
    }

    if (key === 'mass') {
      valueString = `${Number(currentlyOpenBody[key].toPrecision(5))} kg`;
      return setInfoElValue(keyEl, valueString);
    }

    if (key === 'density') {
      valueString += ' kg/m&sup3;';
      return setInfoElValue(keyEl, valueString);
    }
    
    if (key === 'velocity') {
      return setVectorDisplayValue({ vector: value, unitModifier: 1000, unit: 'km/s', displayEl: keyEl });
    }

    if (key === 'position') {
      return setVectorDisplayValue({ vector: value, unitModifier: 1, unit: 'km', displayEl: keyEl });
    }

    if (key === 'acceleration') {
      return setVectorDisplayValue({ vector: value, unitModifier: 1, unit: 'm/s&sup2;', displayEl: keyEl });
    }
  });
}
export function inputHandler({
  massInput, 
  scaleInput, 
  nameInput, 
  densityInput,
  positionXInput,
  positionYInput,
  velocityXInput,
  velocityYInput,
}) {
  const isInputValid = (inputEl) => {
    return ((inputEl || {}).value || '').length > 0;
  };

  const handleNumericInput = ({ inputEl, updateKey, currentlyOpenBody, unitModifier = 1 }) => {
    if (!isInputValid(inputEl)) { 
      return;
    }

    const valueString = String(inputEl.value);
    const value = MathJS.evaluate(valueString);


    if (value > Infinity) {
      return;
    }

    if (Number.isNaN(value)) {
      inputEl.value = '';
      return;
    }
   
    currentlyOpenBody[updateKey] = value * unitModifier;
   
    inputEl.value = '';
  };

  const handleTextInput = ({ inputEl, updateKey, currentlyOpenBody }) => {
    if (!isInputValid(inputEl)) { 
      return;
    }

    const value = inputEl.value;

    currentlyOpenBody[updateKey] = value;
    
    inputEl.value = '';
  };


  const handleVectorInput = ({ inputEl, updateKey, currentlyOpenBody, unitModifier = 1 }) => {
    if (!isInputValid(inputEl)) { 
      return;
    }

    const { vectorKey } = inputEl.dataset;

    const inputValue = MathJS.evaluate(String(inputEl.value));

    if (Number.isNaN(inputValue)) {
      inputEl.value = '';
      return;
    }
    const parseInput = inputValue * unitModifier;
    currentlyOpenBody[updateKey][vectorKey] = parseInput;
  };

  const handlePlanetInputs = (currentlyOpenBody) => {
    if (Object.keys(currentlyOpenBody || {}).length <= 0) {
      return;
    }

    handleTextInput({ inputEl: nameInput, currentlyOpenBody, updateKey: 'name' });
    handleNumericInput({ inputEl: massInput, updateKey: 'mass', currentlyOpenBody });
    handleNumericInput({ inputEl: scaleInput, updateKey: 'scale', currentlyOpenBody });
    handleNumericInput({ inputEl: densityInput , updateKey: 'density', currentlyOpenBody });
    handleVectorInput({ inputEl: positionXInput, currentlyOpenBody, updateKey: 'position', unitModifier: 1 });
    handleVectorInput({ inputEl: positionYInput, currentlyOpenBody, updateKey: 'position', unitModifier: 1 });
    handleVectorInput({ inputEl: velocityXInput, currentlyOpenBody, updateKey: 'velocity', unitModifier: 1000 });
    handleVectorInput({ inputEl: velocityYInput, currentlyOpenBody, updateKey: 'velocity', unitModifier: 1000 });
  };

  return {
    handlePlanetInputs,
    setInfoBoxValues,
  };
}
