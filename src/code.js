import P5 from 'p5';
import rungeKutta from 'runge-kutta';
import handleSlider from './handleSlider';
import PhysicsBody from './physicsBody';
import Denormalizer from './denormalizer';

// N⋅m^2⋅kg^2
// Newtons, meter, kilogram - These are the units we are using.
// For time we are using seconds.
const gravitationConstant = 6.6738410 * (10 ** -11);
const chaoticMass = 10000;
let currentScenario = 'Solar System';
let physicsBodies = [];
let zoom = 0.01;
const distanceUnitMultiplier = 10 ** 9; // Meters
const massUnitMultiplier = 10 ** 24; // Kilograms
let timeScale = 10;
let intitialTimeScale = timeScale;
let clickedTimeScale = timeScale;
let isInfoBoxOpen = false;
let isInfoBoxClicked = false;
let massInput = {};
let scaleInput = {};
let nameInput = {};
let densityInput = {};
let positionXInput = {};
let positionYInput = {};
let velocityXInput = {};
let velocityYInput = {};
let yearCount = new Date().getFullYear();
let isYearCounted = true;
let isScaled = true;

const planetData = {
  'Solar System': [
    {
      name: 'Sun',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      mass: 1988500,
      color: [254, 223, 107],
      density: 1408,
      scale: 3,
    },
    {
      name: 'Mercury',
      position: { x: 58, y: 0, z: 0 }, // In millions of kilometers away from the Sun
      velocity: { x: 0, y: -47360, z: 0 }, // In meters per second
      mass: 0.33010, // In 10^24 kg
      color: [242, 74, 40],
      density: 5429,
      scale: 50,
      isToDrawForceVector: false,
    },
    {
      name: 'Venus',
      position: { x: -108.208, y: 0, z: 0 },
      velocity: { x: 0, y: -35020, z: 0 },
      mass: 4.8673, // In 10^24 kg
      color: [188, 116, 32],
      density: 5243,
      scale: 50,
      isToDrawForceVector: false,
    },
    {
      name: 'Earth',
      position: { x: 150.08, y: 0, z: 0 },
      velocity: { x: 0, y: -29780 },
      mass: 5.9722,
      color: [67, 121, 200],
      density: 5513,
      scale: 50,
    },
    // {
    //   name: 'Moon',
    //   position: { x: 150.08 + 0.3844, y: 0.266 - 0.034577, z: 0.333 },
    //   velocity: { x: 0, y: -29780 - 1022, z: 0 },
    //   mass: 0.07346,
    //   color: [178, 178, 178],
    //   density: 3344,
    //   scale: 0.05,
    //   isToDrawForceVector: false,
    // },
    {
      name: 'Ceres',
      position: { x: 413, y: 0, z: 0 },
      velocity: { x: 0, y: -17920, z: 0 },
      mass: 0.0009393,
      color: [178, 178, 178],
      density: 3344,
      scale: 34,
      isToDrawForceVector: false,
    },
    {
      name: 'Mars',
      position: { x: 228, y: 0, z: 0 },
      velocity: { x: 0, y: -24080, z: 0 },
      mass: 0.64169,
      color: [132, 52, 20],
      density: 3934,
      scale: 50,
      isToDrawForceVector: false,
    },
    {
      name: 'Jupiter',
      position: { x: 778, y: 0, z: 0 },
      velocity: { x: 0, y: -13060, z: 0 },
      mass: 1898.13,
      color: [247, 239, 129],
      density: 1326,
      scale: 12,
    },
    // {
    //   name: 'Ganymede',
    //   position: { x: 778 - 1.07, y: 0 },
    //   velocity: { x: 0, y: -13060 + 10900 },
    //   mass: 0.1482,
    //   color: [135, 122, 115],
    //   density: 1940,
    //   scale: 0.05,
    //   isToDrawForceVector: false,
    // },
    {
      name: 'Saturn',
      position: { x: 1451, y: 0, z: 0 },
      velocity: { x: 0, y: -9670, z: 0 },
      mass: 568.32,
      color: [215, 180, 119],
      density: 687,
      scale: 12,
    },
    {
      name: 'Neptune',
      position: { x: 4472.2, y: 0, z: 0 },
      velocity: { x: 0, y: -5450, z: 0 },
      mass: 102.409,
      color: [57, 85, 228],
      density: 1638,
      scale: 40,
      isToDrawForceVector: true,
    },
    {
      name: 'Pluto',
      position: { x: 5906.38, y: 0, z: 0 },
      velocity: { x: 0, y: -4640, z: 0 },
      mass: 0.01303,
      color: [209, 176, 143],
      density: 1854,
      scale: 500,
      isToDrawForceVector: false,
    },
  ],
  Chaotic: [
    {
      name: 'Sun One',
      position: { x: 0.746156 * 1000, y: 0, z: 0 },
      velocity: { x: 0, y: 0.324677 * 1000, z: 0 },
      color: [254, 223, 107],
      density: 1854,
      mass: chaoticMass,
      scale: 5,
    },
    {
      name: 'Sun Two',
      position: { x: -0.373078 * 1000, y: 0.238313 * 1000, z: 0 },
      velocity: { x: 0.764226 * 1000, y: -0.162339 * 1000, z: 0 },
      density: 1854,
      color: [242, 74, 40],
      mass: chaoticMass,
      scale: 10,
    },
    {
      name: 'Sun Three',
      position: { x: -0.373078 * 1000, y: -0.238313 * 1000, z: 0 },
      velocity: { x: -0.764226 * 1000, y: -0.162339 * 1000, z: 0 },
      density: 1854,
      color: [67, 121, 200],
      mass: chaoticMass,
      scale: 10,
    },
  ],
};

function generatePhysicsBodies(scenarioKey) {
  physicsBodies = planetData[scenarioKey].map((data) => {
    const planet = JSON.parse(JSON.stringify(data));
    planet.mass *= massUnitMultiplier;
    planet.position.x *= distanceUnitMultiplier;
    planet.position.y *= distanceUnitMultiplier;

    return new PhysicsBody(planet);
  });
  return physicsBodies;
}

function handleYearCount() {
  const earth = physicsBodies.find((body) => body.name === 'Earth');
  const sun = physicsBodies.find((body) => body.name === 'Sun');
  const earthPosition = ((earth || {}).position || {});
  const sunPosition = ((sun || {}).position || {});
  const isInXWindow = earthPosition.x > sunPosition.x;
  if (isInXWindow && !isYearCounted) {
    yearCount += 1;
    isYearCounted = true;
    const yearEl = document.getElementById('year-count')
      .getElementsByTagName('span')[0];
    yearEl.innerHTML = yearCount;
  }
  if (earthPosition.x < sunPosition.x) {
    isYearCounted = false;
  }
}

function setInitialTimeScale(scenarioKey) {
  if (scenarioKey === 'Chaotic') {
    timeScale = 2500;
  } else {
    timeScale = 10;
  }
  intitialTimeScale = timeScale;
}

const windowScale = {
  x: window.innerWidth,
  y: window.innerHeight,
  z: window.innerHeight,
};
const diagramScale = {
  x: ((window.innerWidth * 2) * distanceUnitMultiplier),
  y: ((window.innerHeight * 2) * distanceUnitMultiplier),
  z: ((window.innerHeight * 2) * distanceUnitMultiplier),
};

const denormalizer = new Denormalizer(windowScale, diagramScale);
let isOrbiting = false;
let currentlyOpenBody = {};

function code(p5) {
  generatePhysicsBodies(currentScenario);
  setInitialTimeScale(currentScenario);

  return {
    setup() {
      p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL);
      setTimeout(() => {
        const el = document.getElementById('defaultCanvas0');
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
      }, 10);

      const updateTimeConstant = (sliderValue, initialPosition, sliderEl) => {
        const getTimeScale = () => timeScale
          + (Math.exp(1) * sliderValue * (intitialTimeScale / 35) * 5);

        if (initialPosition < sliderEl.getBoundingClientRect().top) {
          timeScale = Math.min(timeScale, intitialTimeScale);

          timeScale = Math.max(timeScale + ((sliderValue * (intitialTimeScale / 6)) / 10), 0);
          return;
        }
        timeScale = getTimeScale();
      };

      const updateZoom = (sliderValue) => {
        zoom += 0.01 * sliderValue;
      };

      const zoomSliderEl = document.getElementById('zoom-slider');
      const zoomHandler = handleSlider(updateZoom, zoomSliderEl);

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
        // Reset sliders
        timeSliderEl.style.transform = 'translateY(0px)';
        zoomSliderEl.style.transform = 'translateY(0px)';
        timeHandler.currentPosition = 0;
        zoomHandler.currentPosition = 0;

        setInitialTimeScale(currentScenario);
        generatePhysicsBodies(currentScenario);
      };

      scenarioSelectEl.addEventListener('change', handleScenarioSelect);

      p5.pixelDensity(4);
      p5.noStroke();
      // p5.camera(0, 0, 50 * p5.sqrt(3), 0, 0, 0, 0, 1, 0);
      // p5.perspective(p5.PI / 3, 1, 5 * p5.sqrt(3), 500 * p5.sqrt(3));

      p5.background(8, 4, 4);

      physicsBodies.forEach((body) => body.draw(p5, denormalizer, isScaled));
    },

    draw() {
      p5.smooth();
      p5.frameRate(60);
      // stopper
      // if (j > 1) { return; }
      const variableCount = 4;

      const getInitial = (bodies) => {
        const dataArray = [];
        bodies.forEach((body, index) => {
          dataArray[index * variableCount] = body.position.x;
          dataArray[index * variableCount + 1] = body.position.y;
          dataArray[index * variableCount + 2] = body.velocity.x;
          dataArray[index * variableCount + 3] = body.velocity.y;
        });
        return dataArray;
      };

      const updateBodies = (y) => {
        let bodyIndex = 0;
        y.forEach((value, index) => {
          if (index % variableCount !== 0) { return; }

          const bodyDataIndex = bodyIndex * variableCount;
          const body = physicsBodies[bodyIndex];
          if (typeof body !== 'object') {
            console.warn('THIS BODY WAS NOT DEFINED'); // eslint-disable-line
          }
          body.position.x = y[bodyDataIndex];
          body.position.y = y[bodyDataIndex + 1];
          body.velocity.x = y[bodyDataIndex + 2];
          body.velocity.y = y[bodyDataIndex + 3];
          bodyIndex += 1;
        });
      };

      const differentialEquation = (t, y) => {
        updateBodies(y);
        const data = [];
        physicsBodies.forEach((b, index) => {
          const body = b;
          const a = body.getAcceleration(physicsBodies, gravitationConstant);

          const v = body.getVelocityWithDelta(1, a);
          body.velocity = v;

          body.position.x += v.x;
          body.position.y += v.y;

          body.acceleration = a;
          data[(index * variableCount)] = v.x;
          data[(index * variableCount) + 1] = v.y;
          data[(index * variableCount) + 2] = a.x;
          data[(index * variableCount) + 3] = a.y;
        });

        return data;
      };

      const initialConditions = getInitial(physicsBodies);
      const range = [0, Math.max(1000 * parseInt(timeScale, 10), 1000)];

      const steps = Math.max(100 * parseInt(timeScale, 10), 20);
      rungeKutta(differentialEquation, initialConditions, range, steps);

      handleYearCount();

      const scaleEl = document.getElementById('scale-checkbox').getElementsByTagName('input')[0];
      isScaled = scaleEl.checked;

      p5.background(8, 4, 4);
      p5.noStroke();
      p5.pixelDensity(4);
      if (isOrbiting) {
        p5.orbitControl();
      }

      p5.scale(zoom + 1);
      p5.ambientLight(128);
      // const { color } = physicsBodies[0];

      physicsBodies.forEach((body) => body.drawForceVector(p5, denormalizer));

      physicsBodies.forEach((body) => body.draw(p5, denormalizer, isScaled));
    },
    keyPressed() {
      if (p5.keyCode === p5.SHIFT) {
        isOrbiting = true;
        return;
      }
      isOrbiting = false;
    },
    keyReleased() {
      isOrbiting = false;
    },

    mouseClicked(parentEvent) {
      const infoEl = document.getElementById('info-box');
      const massInfoEl = document.getElementById('mass');
      const scaleInfoEl = document.getElementById('scale');
      const nameInfoEl = document.getElementById('name');
      const densityInfoEl = document.getElementById('density');
      const positionInfoEl = document.getElementById('position');
      const velocityInfoEl = document.getElementById('velocity');

      const handleBoxClick = () => {
        isInfoBoxClicked = true;
      };

      // ***************************************************************************
      // ***************************************************************************
      // Handling Input Boxes
      // ***************************************************************************
      // ***************************************************************************
      if ((massInput.value || {}).length > 0) {
        const exponentSeparator = 'e+';
        const massString = String(currentlyOpenBody.mass);
        let exp = 1;

        if (massString.includes(exponentSeparator)) {
          const expString = massString.split(exponentSeparator)[1];

          exp = parseInt(expString, 10);
        } else {
          exp = massString.length;
        }

        currentlyOpenBody.mass = parseInt(massInput.value, 10) * 10 ** exp;
        massInfoEl
          .getElementsByClassName('value')[0].innerHTML = `${Number(currentlyOpenBody.mass.toPrecision(5))} kg`;
        massInput.value = '';
      }

      if ((scaleInput.value || {}).length > 0) {
        currentlyOpenBody.scale = parseFloat(scaleInput.value, 10);
        scaleInfoEl
          .getElementsByClassName('value')[0].innerHTML = `${Number(currentlyOpenBody.scale)}`;
        scaleInput.value = '';
      }

      if ((nameInput.value || {}).length > 0) {
        currentlyOpenBody.name = nameInput.value;
        nameInfoEl
          .getElementsByClassName('value')[0].innerHTML = `${Number(currentlyOpenBody.name)}`;
        nameInput.value = '';
      }

      if ((densityInput.value || {}).length > 0) {
        currentlyOpenBody.density = parseFloat(densityInput.value, 10);
        densityInfoEl
          .getElementsByClassName('value')[0].innerHTML = `${Number(currentlyOpenBody.density)}`;
        densityInput.value = '';
      }

      if ((positionXInput.value || {}).length > 0) {
        currentlyOpenBody.position.x = parseFloat(positionXInput.value, 10) * 10 ** 9;
        positionInfoEl
          .getElementsByClassName('value')[0].innerHTML = `
            x: ${Number(currentlyOpenBody.position.x.toPrecision(5) / 10 ** 9)} million km<br>
            y: ${Number(currentlyOpenBody.position.y.toPrecision(5) / 10 ** 9)} million km`;
        positionXInput.value = '';
      }
      if ((positionYInput.value || {}).length > 0) {
        currentlyOpenBody.position.y = parseFloat(positionYInput.value, 10) * 1000;
        positionInfoEl
          .getElementsByClassName('value')[0].innerHTML = `
            x: ${Number(currentlyOpenBody.position.x.toPrecision(5) / 10 ** 9)} million km<br>
            y: ${Number(currentlyOpenBody.position.y.toPrecision(5) / 10 ** 9)} million kn`;
        positionYInput.value = '';
      }

      if ((velocityXInput.value || {}).length > 0) {
        currentlyOpenBody.velocity.x = parseFloat(velocityXInput.value, 10) * 1000;
        velocityInfoEl
          .getElementsByClassName('value')[0].innerHTML = `
           &nbsp; &nbsp; x: ${Number(currentlyOpenBody.velocity.x.toPrecision(5) / 1000)} km/s<br>
           &nbsp; &nbsp; y: ${Number(currentlyOpenBody.velocity.y.toPrecision(5) / 1000)} km/s`;
        velocityXInput.value = '';
      }

      if ((velocityYInput.value || {}).length > 0) {
        currentlyOpenBody.velocity.y = parseFloat(velocityYInput.value, 10) * 1000;
        velocityInfoEl
          .getElementsByClassName('value')[0].innerHTML = `
            &nbsp; &nbsp; x: ${Number(currentlyOpenBody.velocity.x.toPrecision(5) / 1000)} km/s<br>
            &nbsp; &nbsp; y: ${Number(currentlyOpenBody.velocity.y.toPrecision(5) / 1000)} km/s`;
        velocityYInput.value = '';
      }

      // ***************************************************************************
      // ***************************************************************************
      //
      // Handling Clicks
      //
      // ***************************************************************************
      // ***************************************************************************
      if (parentEvent.target.id === 'name' || parentEvent.target.parentElement.id === 'name') {
        nameInfoEl
          .getElementsByTagName('span')[0].style.display = 'none';
        [nameInput] = nameInfoEl
          .getElementsByTagName('input');
        nameInput.style.display = 'initial';

        nameInput.placeholder = currentlyOpenBody.name;
        nameInput.focus();
      } else {
        nameInfoEl
          .getElementsByTagName('span')[0].value = '';
        nameInfoEl
          .getElementsByTagName('span')[0].style.display = 'initial';
        nameInfoEl
          .getElementsByTagName('input')[0].style.display = 'none';
      }

      if (parentEvent.target.id === 'mass' || parentEvent.target.parentElement.id === 'mass') {
        massInfoEl
          .getElementsByTagName('span')[0].style.display = 'none';
        [massInput] = massInfoEl
          .getElementsByTagName('input');
        massInput.style.display = 'initial';

        massInput.placeholder = Number(currentlyOpenBody.mass.toPrecision(5));
        massInput.focus();
      } else {
        massInfoEl
          .getElementsByTagName('span')[0].value = '';
        massInfoEl
          .getElementsByTagName('span')[0].style.display = 'initial';
        massInfoEl
          .getElementsByTagName('input')[0].style.display = 'none';
      }

      if (parentEvent.target.id === 'scale' || parentEvent.target.parentElement.id === 'scale') {
        scaleInfoEl
          .getElementsByTagName('span')[0].style.display = 'none';
        [scaleInput] = scaleInfoEl
          .getElementsByTagName('input');
        scaleInput.style.display = 'initial';

        scaleInput.placeholder = Number(currentlyOpenBody.scale.toPrecision(5));
        scaleInput.focus();
      } else {
        scaleInfoEl
          .getElementsByTagName('span')[0].value = '';
        scaleInfoEl
          .getElementsByTagName('span')[0].style.display = 'initial';
        scaleInfoEl
          .getElementsByTagName('input')[0].style.display = 'none';
      }

      if (parentEvent.target.id === 'density' || parentEvent.target.parentElement.id === 'density') {
        densityInfoEl
          .getElementsByTagName('span')[0].style.display = 'none';
        [densityInput] = densityInfoEl
          .getElementsByTagName('input');
        densityInput.style.display = 'initial';

        densityInput.placeholder = Number(currentlyOpenBody.density.toPrecision(5));
        densityInput.focus();
      } else {
        densityInfoEl
          .getElementsByTagName('span')[0].value = '';
        densityInfoEl
          .getElementsByTagName('span')[0].style.display = 'initial';
        densityInfoEl
          .getElementsByTagName('input')[0].style.display = 'none';
      }

      if (
        parentEvent.target.id === 'position'
        || parentEvent.target.parentElement.parentElement.id === 'position'
        || parentEvent.target.parentElement.id === 'position'
      ) {
        positionInfoEl
          .getElementsByTagName('span')[0].style.display = 'none';
        [positionXInput, positionYInput] = positionInfoEl
          .getElementsByTagName('input');

        positionXInput.style.display = 'initial';
        positionYInput.style.display = 'initial';

        positionXInput.placeholder = Number(currentlyOpenBody.position.x.toPrecision(4) / 10 ** 9);
        positionYInput.placeholder = Number(currentlyOpenBody.position.y.toPrecision(4) / 10 ** 9);
      } else {
        positionInfoEl
          .getElementsByTagName('span')[0].value = '';
        positionInfoEl
          .getElementsByTagName('span')[0].style.display = 'initial';
        positionInfoEl
          .getElementsByTagName('input')[0].style.display = 'none';
        positionInfoEl
          .getElementsByTagName('input')[1].style.display = 'none';
      }

      if (
        parentEvent.target.id === 'velocity'
        || parentEvent.target.parentElement.parentElement.id === 'velocity'
        || parentEvent.target.parentElement.id === 'velocity'
      ) {
        velocityInfoEl
          .getElementsByTagName('span')[0].style.display = 'none';
        [velocityXInput, velocityYInput] = velocityInfoEl
          .getElementsByTagName('input');

        velocityXInput.style.display = 'initial';
        velocityYInput.style.display = 'initial';

        velocityXInput.placeholder = Number(currentlyOpenBody.velocity.x.toPrecision(5) / 1000);
        velocityYInput.placeholder = Number(currentlyOpenBody.velocity.y.toPrecision(5) / 1000);
      } else {
        velocityInfoEl
          .getElementsByTagName('span')[0].value = '';
        velocityInfoEl
          .getElementsByTagName('span')[0].style.display = 'initial';
        velocityInfoEl
          .getElementsByTagName('input')[0].style.display = 'none';
        velocityInfoEl
          .getElementsByTagName('input')[1].style.display = 'none';
      }

      infoEl.addEventListener('click', handleBoxClick);

      const [clickedBody] = physicsBodies.filter((body) => {
        const d = denormalizer;
        const distance = p5.dist(
          d.dnx(body.position.x) * (zoom + 1),
          d.dny(body.position.y) * (zoom + 1),
          p5.mouseX - (d.windowScale.x / 2),
          p5.mouseY - (d.windowScale.y / 2),
        );

        if (distance < (body.getSize(d.windowScale.x, isScaled) + 2)) {
          return true;
        }
        return false;
      }).sort((a, b) => a.mass - b.mass);

      let massHandler = {};
      if (typeof clickedBody === 'object' && !isInfoBoxOpen) {
        currentlyOpenBody = clickedBody;
        clickedTimeScale = timeScale;
        isInfoBoxOpen = true;
        const els = Array.from(infoEl.getElementsByTagName('div'));
        infoEl.style.display = 'initial';
        infoEl.style.background = `rgb(${currentlyOpenBody.color[0]}, ${currentlyOpenBody.color[1]}, ${currentlyOpenBody.color[2]})`;
        infoEl.parentElement.style.top = `${p5.mouseY}px`;
        infoEl.parentElement.style.left = `${p5.mouseX}px`;

        const box = infoEl.getBoundingClientRect();
        if (box.right > window.innerWidth) {
          infoEl.parentElement.style.left = `${p5.mouseX - box.width}px`;
        }

        if (box.left <= 0) {
          infoEl.parentElement.style.left = `${p5.mouseX + box.width}px`;
        }

        if (box.bottom > window.innerHeight) {
          infoEl.parentElement.style.top = `${p5.mouseY - box.height}px`;
        }

        if (box.top <= 0) {
          infoEl.parentElement.style.top = `${p5.mouseY + box.height}px`;
        }

        Object.keys(currentlyOpenBody).forEach((key) => {
          const keyEl = els.find((el) => el.id === key);
          if (typeof keyEl !== 'object') { return; }
          let valueString = currentlyOpenBody[key].toString();
          if (key === 'velocity') {
            valueString = valueString.replaceAll('units', 'km/s');
          }

          if (key === 'mass') {
            valueString += 'kg';
          }

          if (key === 'position') {
            valueString = valueString.replaceAll('units', 'million km');
            valueString = `
            &nbsp; &nbsp x: ${Number(currentlyOpenBody[key].x.toPrecision(4) / 10 ** 9)} million km<br>
            &nbsp; &nbsp y: ${Number(currentlyOpenBody[key].y.toPrecision(4) / 10 ** 9)} million km`;
          }

          if (key === 'acceleration') {
            const x = Number(currentlyOpenBody[key].x.toPrecision(5));
            const y = Number(currentlyOpenBody[key].y.toPrecision(5));
            valueString = `&nbsp; &nbsp; x: ${x} m&sup2; <br> &nbsp; &nbsp;y: ${y} m&sup2;`;
          }

          if (key === 'density') {
            valueString += ' kg/m&sup3;';
          }
          if (key === 'mass') {
            valueString = `${Number(currentlyOpenBody[key].toPrecision(5))} kg`;
          }

          keyEl.getElementsByClassName('value')[0].innerHTML = valueString;
        });
        const massSliderEl = infoEl.getElementsByClassName('mass-slider--handle')[0];

        const updateMass = (sliderValue) => {
          const massString = String(currentlyOpenBody.mass);
          let exp = 1;
          const exponentSeparator = 'e+';
          if (massString.includes(exponentSeparator)) {
            const expString = massString.split(exponentSeparator)[1];

            exp = parseInt(expString, 10);
          } else {
            exp = massString.length;
          }

          const newMass = currentlyOpenBody.mass - sliderValue * (10 ** (exp - 1));

          if (newMass < 0) {
            currentlyOpenBody.mass = Math
              .max(currentlyOpenBody.mass - sliderValue * (10 ** (exp - 2)), 0);
          } else {
            currentlyOpenBody.mass = Math.min(
              newMass,
              10 * 10 ** 33,
            );
          }

          massInfoEl
            .getElementsByClassName('value')[0].innerHTML = `${Number(currentlyOpenBody.mass.toPrecision(5))} kg`;

          scaleInfoEl
            .getElementsByClassName('value')[0].innerHTML = Math.round(currentlyOpenBody.scale * 100) / 100;
        };

        massHandler = handleSlider(updateMass, massSliderEl, true);
        timeScale = 0;
        isInfoBoxClicked = false;
        return;
      }

      if (isInfoBoxOpen && !isInfoBoxClicked) {
        currentlyOpenBody = {};
        infoEl.style.display = 'none';
        timeScale = clickedTimeScale;
        isInfoBoxOpen = false;
        isInfoBoxClicked = false;

        massHandler.currentPosition = 0;
        infoEl.getElementsByClassName('mass-slider--handle')[0].style.transform = 'translateX(0px)';
      }
    },
    mouseReleased() {
      isInfoBoxClicked = false;
    },
  };
}

function main() {
  const canvas1 = (p5) => Object.assign(p5, code(p5));

  return {
    one: new P5(canvas1),
  };
}

export default main;
