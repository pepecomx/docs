// Configuracion de rangos
const tMin = -1;
const tMax = 5;
const H = 0.001; // paso para derivada numerica

// Elementos del DOM
const tRange = document.getElementById('tRange');
const tValue = document.getElementById('tValue');
const pValue = document.getElementById('pValue');
const vValue = document.getElementById('vValue');
const aValue = document.getElementById('aValue');
const zeroMessage = document.getElementById('zeroMessage');

const posCanvas = document.getElementById('positionCanvas');
const velCanvas = document.getElementById('velocityCanvas');
const accCanvas = document.getElementById('accelerationCanvas');

const posCtx = posCanvas.getContext('2d');
const velCtx = velCanvas.getContext('2d');
const accCtx = accCanvas.getContext('2d');

const exampleSelect = document.getElementById('exampleSelect');
const exprInput = document.getElementById('exprInput');
const applyBtn = document.getElementById('applyBtn');
const errorBox = document.getElementById('errorBox');
const currentExprText = document.getElementById('currentExprText');
const exampleDescription = document.getElementById('exampleDescription');

let fPos = null; // funcion P(t)
let fVel = null; // derivada numerica (velocidad)
let fAcc = null; // segunda derivada numerica (aceleracion)

const EXAMPLES = {
  parabola: {
    expr: 't*t - 4*t',
    desc: 'Parabola: movimiento con cambio de direccion y punto minimo.',
  },
  cubic: {
    expr: 't*t*t - 3*t',
    desc: 'Funcion cubica: puede tener cambios de concavidad y varios comportamientos.',
  },
  sine: {
    expr: 'sin(t)',
    desc: 'Movimiento oscilatorio, como un pendulo aproximado.',
  },
  cosine: {
    expr: 'cos(t)',
    desc: 'Movimiento oscilatorio desfasado respecto a sin(t).',
  },
  exp: {
    expr: 'exp(0.5*t)',
    desc: 'Crecimiento acelerado, util para modelar ciertos procesos.',
  },
  log: {
    expr: 'log(t + 2)',
    desc: 'Crecimiento lento, definido aqui para t > -2.',
  },
};

function preprocessExpression(expr) {
  return expr
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/exp\(/g, 'Math.exp(')
    .replace(/log\(/g, 'Math.log(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/abs\(/g, 'Math.abs(');
}

function compileExpression(expr) {
  const body = 'return ' + preprocessExpression(expr) + ';';
  return new Function('t', body);
}

function setExample(exampleKey) {
  if (exampleKey === 'custom') {
    exampleDescription.textContent = 'Escribe tu propia funcion P(t) y haz clic en "Aplicar funcion".';
    return;
  }
  const data = EXAMPLES[exampleKey];
  if (!data) return;
  exprInput.value = data.expr;
  exampleDescription.textContent = data.desc;
}

function buildDerivatives() {
  if (!fPos) return;
  fVel = t => (fPos(t + H) - fPos(t - H)) / (2 * H);
  fAcc = t => (fPos(t + H) - 2 * fPos(t) + fPos(t - H)) / (H * H);
}

function applyExpression() {
  const expr = exprInput.value.trim();
  if (!expr) {
    errorBox.textContent = 'Por favor, escribe una funcion para P(t).';
    return;
  }
  try {
    const testF = compileExpression(expr);
    // validar con un valor
    const testVal = testF(0);
    if (!isFinite(testVal)) {
      // se permite, pero avisamos visualmente
    }
    fPos = testF;
    buildDerivatives();
    errorBox.textContent = '';
    currentExprText.textContent = 'P(t) = ' + expr;
    update();
  } catch (e) {
    console.error(e);
    errorBox.textContent = 'Error en la expresion. Revisa la sintaxis.';
  }
}

function computeRange(func) {
  let yMin = Infinity;
  let yMax = -Infinity;
  const steps = 300;
  for (let i = 0; i <= steps; i++) {
    const t = tMin + (i / steps) * (tMax - tMin);
    let y;
    try {
      y = func(t);
    } catch (e) {
      continue;
    }
    if (!isFinite(y)) continue;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  if (!isFinite(yMin) || !isFinite(yMax)) {
    yMin = -1;
    yMax = 1;
  }
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  } else {
    const padding = 0.1 * (yMax - yMin);
    yMin -= padding;
    yMax += padding;
  }
  return { yMin, yMax };
}

function toCanvasCoords(t, y, canvas, yMin, yMax) {
  const w = canvas.width;
  const h = canvas.height;
  const x = ((t - tMin) / (tMax - tMin)) * w;
  const yCanvas = h - ((y - yMin) / (yMax - yMin)) * h;
  return { x, y: yCanvas };
}

function drawAxes(ctx, canvas, yMin, yMax) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;

  if (yMin < 0 && yMax > 0) {
    const p0 = toCanvasCoords(0, 0, canvas, yMin, yMax);
    ctx.beginPath();
    ctx.moveTo(0, p0.y);
    ctx.lineTo(w, p0.y);
    ctx.stroke();
  }

  if (tMin < 0 && tMax > 0) {
    const p0 = toCanvasCoords(0, yMin, canvas, yMin, yMax);
    const p1 = toCanvasCoords(0, yMax, canvas, yMin, yMax);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
}

function drawFunction(ctx, canvas, func, yMin, yMax) {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  let first = true;
  const steps = 300;
  for (let i = 0; i <= steps; i++) {
    const t = tMin + (i / steps) * (tMax - tMin);
    let y;
    try {
      y = func(t);
    } catch (e) {
      continue;
    }
    if (!isFinite(y)) continue;
    const p = toCanvasCoords(t, y, canvas, yMin, yMax);
    if (first) {
      ctx.moveTo(p.x, p.y);
      first = false;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();
}

function drawCurrentPoint(ctx, canvas, func, t, yMin, yMax) {
  let y;
  try {
    y = func(t);
  } catch (e) {
    return;
  }
  if (!isFinite(y)) return;
  const p = toCanvasCoords(t, y, canvas, yMin, yMax);

  ctx.strokeStyle = '#888';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(p.x, 0);
  ctx.lineTo(p.x, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#d22';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  if (!fPos || !fVel || !fAcc) return;

  const t = parseFloat(tRange.value);
  tValue.textContent = t.toFixed(1);

  let p;
  let v;
  let a;
  try {
    p = fPos(t);
    v = fVel(t);
    a = fAcc(t);
  } catch (e) {
    return;
  }

  pValue.textContent = isFinite(p) ? p.toFixed(4) : 'NaN';
  vValue.textContent = isFinite(v) ? v.toFixed(4) : 'NaN';
  aValue.textContent = isFinite(a) ? a.toFixed(4) : 'NaN';

  const rangePos = computeRange(fPos);
  const rangeVel = computeRange(fVel);
  const rangeAcc = computeRange(fAcc);

  drawAxes(posCtx, posCanvas, rangePos.yMin, rangePos.yMax);
  drawFunction(posCtx, posCanvas, fPos, rangePos.yMin, rangePos.yMax);
  drawCurrentPoint(posCtx, posCanvas, fPos, t, rangePos.yMin, rangePos.yMax);

  drawAxes(velCtx, velCanvas, rangeVel.yMin, rangeVel.yMax);
  drawFunction(velCtx, velCanvas, fVel, rangeVel.yMin, rangeVel.yMax);
  drawCurrentPoint(velCtx, velCanvas, fVel, t, rangeVel.yMin, rangeVel.yMax);

  drawAxes(accCtx, accCanvas, rangeAcc.yMin, rangeAcc.yMax);
  drawFunction(accCtx, accCanvas, fAcc, rangeAcc.yMin, rangeAcc.yMax);
  drawCurrentPoint(accCtx, accCanvas, fAcc, t, rangeAcc.yMin, rangeAcc.yMax);

  if (isFinite(v) && Math.abs(v) < 0.1) {
    zeroMessage.innerHTML =
      '<span class="highlight">La velocidad es aproximadamente cero en este instante.</span><br>' +
      'Aqui el objeto se detiene un momento o esta cambiando de direccion.';
  } else {
    zeroMessage.textContent = '';
  }
}

// Eventos
tRange.addEventListener('input', update);
applyBtn.addEventListener('click', applyExpression);
exampleSelect.addEventListener('change', function () {
  setExample(this.value);
  if (this.value !== 'custom') {
    applyExpression();
  }
});

// Inicializacion
setExample('parabola');
applyExpression();
