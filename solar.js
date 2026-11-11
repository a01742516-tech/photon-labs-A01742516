const readings = {
  down: {
    voltage: '0.000',
    photo: 1,
    alt: 'Parte posterior del panel apoyado sobre el césped junto al multímetro',
    caption: 'Foto 1 · Panel boca abajo.',
    description: 'La cara activa apunta hacia el suelo.'
  },
  up: {
    voltage: '0.085',
    photo: 3,
    alt: 'Cara activa del panel sobre el césped junto al multímetro',
    caption: 'Foto 3 · Panel boca arriba sobre el césped.',
    description: 'La cara activa queda horizontal y apunta hacia el cielo.'
  },
  sun: {
    voltage: '0.085',
    photo: 5,
    alt: 'Panel sostenido en ángulo y multímetro durante el ensayo',
    caption: 'Foto 5 · Lectura asociada provisionalmente a la prueba perpendicular.',
    description: 'Orientación ilustrativa. La inclinación exacta no se midió en las fotos.'
  }
};

const buttons = document.querySelectorAll('.choices button');
const scene = document.querySelector('.scene');
const voltage = document.querySelector('#voltage');
const photo = document.querySelector('#photo');
const photoLink = document.querySelector('#photo-link');
const caption = document.querySelector('#caption');
const condition = document.querySelector('#condition');

for (const button of buttons) {
  button.addEventListener('click', () => {
    const mode = button.dataset.mode;
    const reading = readings[mode];
    for (const choice of buttons) {
      choice.setAttribute('aria-pressed', String(choice === button));
    }
    scene.dataset.mode = mode;
    voltage.textContent = `${reading.voltage} V CC`;
    condition.textContent = reading.description;
    photo.src = photoLink.href = `assets/solar/${reading.photo}.jpeg`;
    photo.alt = reading.alt;
    caption.textContent = reading.caption;
  });
}

const gallery = document.querySelector('#gallery');
for (let number = 1; number <= 12; number++) {
  const link = document.createElement('a');
  const image = document.createElement('img');
  link.href = image.src = `assets/solar/${number}.jpeg`;
  image.alt = `Abrir foto de campo ${number}`;
  image.loading = 'lazy';
  link.append(image, `Foto ${number}`);
  gallery.append(link);
}

const incidence = document.querySelector('#incidence');
const simulatedVoltage = document.querySelector('#sim-voltage');
const simulatedCurrent = document.querySelector('#sim-current');
const projection = document.querySelector('#projection');
const playSolar = document.querySelector('#play-solar');
const schematicAngles = { down: -119, up: 61, sun: 0 };
let animationFrame = null;

function renderIncidence(angle) {
  const lightFraction = Math.max(0, Math.cos(angle * Math.PI / 180));
  const directLight = Math.round(lightFraction * 100);
  const current = 3.52 * lightFraction;
  const voltage = 0.119 * Math.log1p(9 * lightFraction) / Math.log(10);
  simulatedVoltage.textContent = voltage.toFixed(3) + ' V';
  simulatedCurrent.textContent = current.toFixed(2) + ' mA';
  incidence.value = angle;
  incidence.setAttribute('aria-valuetext', `${angle} grados`);
  projection.textContent = `${angle}° · ${directLight} % de luz directa`;
  scene.style.setProperty('--panel-angle', `${61 - angle}deg`);
  scene.style.setProperty('--light', directLight / 100);
  scene.classList.toggle('rear-face', Math.abs(angle) > 90);
}

function stopAnimation() {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  playSolar.textContent = 'Animar giro';
}

incidence.addEventListener('input', () => {
  stopAnimation();
  renderIncidence(Number(incidence.value));
});

for (const button of buttons) {
  button.addEventListener('click', () => {
    stopAnimation();
    renderIncidence(schematicAngles[button.dataset.mode]);
  });
}

playSolar.addEventListener('click', () => {
  if (animationFrame !== null) {
    stopAnimation();
    return;
  }

  const angle = Number(incidence.value);
  const startAngle = angle === 180 ? 0 : angle;
  let startTime;
  playSolar.textContent = 'Pausar giro';

  function animate(time) {
    startTime ??= time;
    const nextAngle = Math.min(180, startAngle + Math.floor((time - startTime) * 0.045));
    renderIncidence(nextAngle);
    if (nextAngle === 180) stopAnimation();
    else animationFrame = requestAnimationFrame(animate);
  }

  animationFrame = requestAnimationFrame(animate);
});

renderIncidence(0);
