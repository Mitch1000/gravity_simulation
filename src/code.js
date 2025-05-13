import P5 from 'p5';
import rungeKutta from 'runge-kutta';
import handleSlider from './helpers/handleSlider';
import Denormalizer from './denormalizer';
import { inputHandler } from './helpers/inputHandler';
import { clickHandler, setupInputs } from './helpers/clickHandler';
import {
  setYearCount,
  handleYearCount,
  setInitialTimeScale,
  setupScenarioUI,
  generatePhysicsBodies,
} from './helpers/renderHelpers';

// N⋅m^2⋅kg^2
// Newtons, meter, kilogram - These are the units we are using.
// For time we are using seconds.
const gravitationConstant = 6.6738410 * (10 ** -11);
let currentScenario = 'Solar System';
let physicsBodies = [];
let zoom = 0.01;
const distanceUnitMultiplier = 10 ** 9; // Meters
let timeScale = 10;
let clickedTimeScale = timeScale;
let isInfoBoxOpen = false;
let isInfoBoxClicked = false;
let isScaled = true;
let inputs = {};
let canvas = {};


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

  return {
    setup() {
      p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL);
      setTimeout(() => {
        canvas = document.getElementById('defaultCanvas0');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
      }, 10);

      physicsBodies = generatePhysicsBodies(currentScenario, distanceUnitMultiplier);
      timeScale = setInitialTimeScale(currentScenario);

      const setPhysicsBodies = (value) => {
        physicsBodies = value;
      };

      const setTimeScale = (value) => {
        timeScale = value;
      };

      const setZoom = (value) => {
        zoom = value;
      };

      setupScenarioUI({
        currentScenario,
        timeScale,
        zoom,
        distanceUnitMultiplier,
        setPhysicsBodies,
        setTimeScale,
        setZoom,
      });

      setYearCount();

      p5.pixelDensity(4);
      p5.noStroke();

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
        y.forEach((_value, index) => {
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

      const differentialEquation = (_t, y) => {
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
      if (timeScale !== 0) {
        rungeKutta(differentialEquation, initialConditions, range, steps);
      }

      const scaleEl = document.getElementById('scale-checkbox').getElementsByTagName('input')[0];
      isScaled = scaleEl.checked;
      handleYearCount(physicsBodies);

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

      const handleBoxClick = () => {
        isInfoBoxClicked = true;
      };

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

      if (isInfoBoxOpen) {
        clickHandler(parentEvent, currentlyOpenBody);

        const infoBoxHandler = inputHandler(inputs);
        infoBoxHandler.handlePlanetInputs(currentlyOpenBody);
        infoBoxHandler.setInfoBoxValues(currentlyOpenBody, infoEl);
      }


      if (typeof clickedBody === 'object' && !isInfoBoxOpen) {
        currentlyOpenBody = clickedBody;
        clickedTimeScale = timeScale;
        isInfoBoxOpen = true;
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
        };

        massHandler = handleSlider(updateMass, massSliderEl, true);
        timeScale = 0;
        isInfoBoxClicked = false;
        inputs = setupInputs(currentlyOpenBody);
        // Handle Input Boxes
        const infoBoxHandler = inputHandler(inputs);

        infoBoxHandler.setInfoBoxValues(currentlyOpenBody, infoEl);

        infoEl.addEventListener('click', handleBoxClick);

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
  const canvas1 = (p5) => {
    addEventListener('resize', () => {
      p5.resizeCanvas(window.innerWidth, window.innerHeight);
    });
    Object.assign(p5, code(p5));
  };

  return {
    one: new P5(canvas1),
  };
}

export default main;
