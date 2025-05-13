function getInfoElements() {
  return {
    massInfoEl: document.getElementById('mass'),
    scaleInfoEl: document.getElementById('scale'),
    nameInfoEl: document.getElementById('name'),
    densityInfoEl: document.getElementById('density'),
    positionInfoEl: document.getElementById('position'),
    velocityInfoEl: document.getElementById('velocity'),
  };
}

function getIsVectorBoxClick(parentEvent, boxId) {
  // TODO: Improve this to prevent null parent el;
  return parentEvent.target.id === boxId
  || parentEvent.target.parentElement.parentElement.id === boxId
  || (parentEvent.target.parentElement.parentElement.parentElement || {}).id === boxId 
  || parentEvent.target.parentElement.id === boxId;
}

function getIsInfoValueClicked(parentEvent, boxId) {
  return parentEvent.target.id === boxId || parentEvent.target.parentElement.id === boxId;
}

function hideVectorInputs(vectorInfoEl) {
  vectorInfoEl
    .getElementsByTagName('span')[0].value = '';
  vectorInfoEl
    .getElementsByTagName('span')[0].style.display = 'initial';
  vectorInfoEl
    .getElementsByTagName('span')[1].style.display = 'initial';
  vectorInfoEl
    .getElementsByTagName('input')[0].style.display = 'none';
  vectorInfoEl
    .getElementsByTagName('input')[1].style.display = 'none';
}

function showVectorInputs(vectorInfoEl) {
  vectorInfoEl
    .getElementsByTagName('span')[0].style.display = 'none';
  vectorInfoEl
    .getElementsByTagName('span')[1].style.display = 'none';
  const [vectorXInput, vectorYInput] = vectorInfoEl
    .getElementsByTagName('input');

  vectorXInput.value = '';
  vectorYInput.value = '';

  vectorXInput.style.display = 'initial';
  vectorYInput.style.display = 'initial';
  return [vectorXInput, vectorYInput];
}

function showInput(valueInfoEl, currentlyOpenBody, key) {
  valueInfoEl
    .getElementsByTagName('span')[0].style.display = 'none';
  const [inputEl] = valueInfoEl
    .getElementsByTagName('input');

  inputEl.value = '';
  inputEl.style.display = 'initial';
  inputEl.placeholder = currentlyOpenBody[key];

  inputEl.focus();
  return inputEl;
}

function hideInput(valueInfoEl) {
  valueInfoEl
    .getElementsByTagName('span')[0].value = '';
  valueInfoEl
    .getElementsByTagName('span')[0].style.display = 'initial';
  valueInfoEl
    .getElementsByTagName('input')[0].style.display = 'none';
}

export function setupInputs(currentlyOpenBody) {
  const infoElements = getInfoElements();
  const inputElements = {};
  Object.values(infoElements).map((valueInfoEl) => {
    const [inputEl] = valueInfoEl
      .getElementsByTagName('input');
    inputElements[`${valueInfoEl.id}Input`] = inputEl; 
    inputEl.placeholder = currentlyOpenBody[valueInfoEl.id];
    inputEl.value = '';
  });

  inputElements.positionXInput = infoElements.positionInfoEl.getElementsByTagName('input')[0];
  inputElements.positionYInput = infoElements.positionInfoEl.getElementsByTagName('input')[1];

  inputElements.velocityXInput = infoElements.velocityInfoEl.getElementsByTagName('input')[0];
  inputElements.velocityYInput = infoElements.velocityInfoEl.getElementsByTagName('input')[1];

  inputElements.positionXInput.value = '';
  inputElements.positionYInput.value = '';
                              
  inputElements.velocityXInput.value = '';
  inputElements.velocityYInput.value = '';
  return inputElements;
}

export function clickHandler(parentEvent, currentlyOpenBody) {
  const infoElements = getInfoElements();
  const {
    massInfoEl,
    scaleInfoEl,
    nameInfoEl,
    densityInfoEl,
    positionInfoEl,
    velocityInfoEl,
  } = infoElements;
  let massInput = {};
  let scaleInput = {};
  let nameInput = {};
  let densityInput = {};
  let positionXInput = {};
  let positionYInput = {};
  let velocityXInput = {};
  let velocityYInput = {};
  // ***************************************************************************
  // ***************************************************************************
  //
  // Handling Clicks
  //
  // ***************************************************************************
  // ***************************************************************************
  // TODO: Move out of this file and into a helper. 
  if (getIsInfoValueClicked(parentEvent, 'name')) {
    nameInput = showInput(nameInfoEl, currentlyOpenBody, 'name');
  } else {
    hideInput(nameInfoEl);
  }

  if (getIsInfoValueClicked(parentEvent, 'mass')) {
    massInput = showInput(massInfoEl, currentlyOpenBody, 'mass');
  } else {
    hideInput(massInfoEl);
  }

  if (getIsInfoValueClicked(parentEvent, 'scale')) {
    scaleInput = showInput(scaleInfoEl, currentlyOpenBody, 'scale');
  } else {
    hideInput(scaleInfoEl);
  }

  if (getIsInfoValueClicked(parentEvent, 'density')) {
    densityInput = showInput(densityInfoEl, currentlyOpenBody, 'density');
  } else {
    hideInput(densityInfoEl);
  }

  if (getIsVectorBoxClick(parentEvent, 'position')) {
    [positionXInput, positionYInput] = showVectorInputs(positionInfoEl);

    positionXInput.placeholder = Number(currentlyOpenBody.position.x.toPrecision(4));
    positionYInput.placeholder = Number(currentlyOpenBody.position.y.toPrecision(4));
  } else {
    hideVectorInputs(positionInfoEl);
  }

  if (getIsVectorBoxClick(parentEvent, 'velocity')) {
    [velocityXInput, velocityYInput] = showVectorInputs(velocityInfoEl);

    velocityXInput.placeholder = Number((currentlyOpenBody.velocity.x / 1000).toPrecision(5));
    velocityYInput.placeholder = Number((currentlyOpenBody.velocity.y / 1000).toPrecision(5));
  } else {
    hideVectorInputs(velocityInfoEl);
  }

  return {
    massInput, 
    scaleInput, 
    nameInput, 
    densityInput,
    positionXInput,
    positionYInput,
    velocityXInput,
    velocityYInput,
  };
}
