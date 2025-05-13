import planetData from '../data/planetData.json';
import handleSlider from './handleSlider';
import PhysicsBody from './physicsBody';

let intitialTimeScale = 10;
let isYearCounted = true;
let yearCount = new Date().getFullYear();
const initialZoom = 0.01;

//TODO: Refactor for Single Responsibility principle 

export function generatePhysicsBodies(scenarioKey, distanceUnitMultiplier) {
  const massUnitMultiplier = 10 ** 24; // Kilograms
  const physicsBodies = planetData[scenarioKey].map((data) => {
    const planet = JSON.parse(JSON.stringify(data));
    planet.mass *= massUnitMultiplier;
    planet.position.x *= distanceUnitMultiplier;
    planet.position.y *= distanceUnitMultiplier;

    return new PhysicsBody(planet);
  });

  return physicsBodies;
}

export function setYearCount() {
  const yearEl = document.getElementById('year-count')
    .getElementsByTagName('span')[0];
  yearEl.innerHTML = yearCount;
}

export function handleYearCount(physicsBodies) {
  const earth = physicsBodies.find((body) => body.name === 'Earth');
  const sun = physicsBodies.find((body) => body.name === 'Sun');
  const earthPosition = ((earth || {}).position || {});
  const sunPosition = ((sun || {}).position || {});
  const isInXWindow = earthPosition.x > sunPosition.x;

  if (isInXWindow && !isYearCounted) {
    yearCount += 1;

    isYearCounted = true;

    setYearCount();
  }
  if (earthPosition.x < sunPosition.x) {
    isYearCounted = false;
  }
}

export function setInitialTimeScale(scenarioKey) {
  if (scenarioKey === 'Chaotic') {
    intitialTimeScale = 2500;
  } else {
    intitialTimeScale = 10;
  }
  return intitialTimeScale;
}


export function setupScenarioUI({
  currentScenario, 
  timeScale, 
  zoom, 
  distanceUnitMultiplier,
  setPhysicsBodies,
  setTimeScale,
  setZoom,
}) {
  const updateTimeConstant = (sliderValue, initialPosition, sliderEl) => {
    let currentTimeScale = timeScale;

    const getTimeScale = () => currentTimeScale
      + (Math.exp(1) * sliderValue * (intitialTimeScale / 35) * 5);
  
    if (initialPosition < sliderEl.getBoundingClientRect().top) {
      currentTimeScale = Math.min(currentTimeScale, intitialTimeScale);
  
      currentTimeScale = Math.max(currentTimeScale + ((sliderValue * (intitialTimeScale / 6)) / 10), 0);
      return setTimeScale(currentTimeScale);
    }

    currentTimeScale = getTimeScale();

    setTimeScale(currentTimeScale);
  };

  const zoomSliderEl = document.getElementById('zoom-slider');;

  const zoomSetter = (sliderValue) => {
    const newZoom = zoom + (0.01 * sliderValue);
    setZoom(newZoom);
  }; 
  const zoomHandler = handleSlider(zoomSetter, zoomSliderEl);
        
  const timeSliderEl = document.getElementById('time-slider');

  const timeHandler = handleSlider(updateTimeConstant, timeSliderEl);

  const scenarioSelectEl = document.getElementById('senario-select');

  Object.keys(planetData).forEach((scenarioKey) => {
    const opt = document.createElement('option');
    opt.value = scenarioKey;
    opt.innerHTML = scenarioKey;
    scenarioSelectEl.appendChild(opt);
  });

  scenarioSelectEl.value = currentScenario;
  scenarioSelectEl.addEventListener('click', (event) => event.preventDefault());
  const handleScenarioSelect = (event) => {
    currentScenario = event.currentTarget.value;

    const newTimeScale = setInitialTimeScale(currentScenario);
    setTimeScale(newTimeScale);
    setZoom(initialZoom);

    // Reset sliders
    timeHandler.reset();
    zoomHandler.reset();

    const physicsBodies = generatePhysicsBodies(currentScenario, distanceUnitMultiplier);
    setPhysicsBodies(physicsBodies);
  };

  scenarioSelectEl.addEventListener('change', handleScenarioSelect);
}

