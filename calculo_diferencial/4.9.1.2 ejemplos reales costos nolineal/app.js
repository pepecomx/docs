// Interactivo no lineal de ingresos, costos y utilidad.
const template = `
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      line-height: 1.5;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 8px;
    }
    h2 {
      font-size: 18px;
      margin-top: 18px;
      margin-bottom: 6px;
    }
    .panel {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 12px;
      margin-top: 10px;
      background-color: #fafafa;
    }
    label {
      font-size: 14px;
    }
    select {
      padding: 4px 6px;
      font-size: 14px;
      min-width: 260px;
    }
    input[type="range"] {
      width: 260px;
      margin-top: 4px;
    }
    .row {
      margin-top: 6px;
      margin-bottom: 4px;
    }
    .values {
      margin-top: 8px;
      font-size: 14px;
    }
    .values span {
      display: inline-block;
      min-width: 180px;
    }
    .small {
      font-size: 13px;
      color: #555;
    }
    canvas {
      border: 1px solid #eee;
      background-color: #ffffff;
      margin-top: 10px;
    }
    .formula {
      font-family: Consolas, "Courier New", monospace;
      font-size: 13px;
      background-color: #f0f0f0;
      padding: 4px 6px;
      border-radius: 4px;
      display: block;
      margin-top: 2px;
      margin-bottom: 2px;
    }
  </style>

  <h1>Problemas de optimizacion economica con funciones no lineales</h1>

  <p>
    En todos estos ejemplos, una empresa o persona quiere elegir un valor de
    <strong>x</strong> para maximizar la utilidad:
  </p>
  <p class="formula">
    U(x) = Ingreso(x) - Costo(x)
  </p>

  <div class="panel">
    <h2>1. Seleccione un ejemplo</h2>
    <label for="exampleSelect"><strong>Ejemplo:</strong></label><br />
    <select id="exampleSelect">
      <option value="e1">Ejemplo 1: Precio baja con la cantidad (demanda) - cuadratica</option>
      <option value="e2">Ejemplo 2: Costos crecientes por produccion - cuadratica</option>
      <option value="e3">Ejemplo 3: Publicidad digital - funcion exponencial</option>
      <option value="e4">Ejemplo 4: Descuento a clientes - utilidad no lineal</option>
      <option value="e5">Ejemplo 5: Inversion en mantenimiento - funcion logaritmica</option>
    </select>

    <div id="exampleText" class="small" style="margin-top:8px;"></div>

    <h3 style="margin-top:10px;">Formas funcionales</h3>
    <div>
      <span class="formula" id="revenueFormula"></span>
      <span class="formula" id="costFormula"></span>
      <span class="formula" id="profitFormula"></span>
    </div>
  </div>

  <div class="panel">
    <h2>2. Explorar la utilidad variando x</h2>
    <div class="row">
      <label for="xRange"><strong>Valor de x:</strong></label><br />
      <input type="range" id="xRange" min="0" max="100" step="0.5" value="10" />
      <span id="xValue"></span>
    </div>

    <div class="values">
      <span>Ingreso I(x): <strong><span id="revValue"></span></strong></span>
      <span>Costo C(x): <strong><span id="costValue"></span></strong></span>
    </div>
    <div class="values">
      <span>Utilidad U(x): <strong><span id="profitValue"></span></strong></span>
    </div>

    <div class="values small" style="margin-top:10px;">
      <div><strong>Maximo aproximado dentro del rango del ejemplo:</strong></div>
      <span>x<sub>max</sub> ≈ <strong><span id="xOptValue"></span></strong></span>
      <span>U(x<sub>max</sub>) ≈ <strong><span id="uOptValue"></span></strong></span>
      <div id="optComment" style="margin-top:4px;"></div>
    </div>
  </div>

  <div class="panel">
    <h2>3. Grafica de la utilidad U(x)</h2>
    <p class="small">
      La curva muestra la utilidad U(x). El punto rojo es el valor actual que elijas con el deslizador.
      El punto morado marca el maximo aproximado dentro del intervalo considerado.
    </p>
    <canvas id="profitCanvas" width="600" height="360"></canvas>
  </div>
`;

function renderCostosNoLineal(root = document.body) {
  root.innerHTML = template;

  const EXAMPLES = {
    e1: {
      title: 'Ejemplo 1: Precio baja con la cantidad (demanda) - cuadratica',
      description:
        'p(x) = 120 - 0.5x, C(x) = 500 + 20x. Modelo tipico cuando bajar el precio aumenta las ventas, pero no indefinidamente.',
      xMax: 200,
      revenueFormula: 'I(x) = (120 - 0.5x) * x',
      costFormula: 'C(x) = 500 + 20x',
      profitFormula: 'U(x) = I(x) - C(x)',
      revenue: x => {
        const price = 120 - 0.5 * x;
        return price < 0 ? 0 : price * x;
      },
      cost: x => 500 + 20 * x
    },
    e2: {
      title: 'Ejemplo 2: Costos crecientes por produccion - cuadratica',
      description:
        'Precio fijo p = 80, costos no lineales C(x) = 400 + 20x + 0.8x^2. Puede aparecer un maximo interno.',
      xMax: 60,
      revenueFormula: 'I(x) = 80x',
      costFormula: 'C(x) = 400 + 20x + 0.8x^2',
      profitFormula: 'U(x) = I(x) - C(x)',
      revenue: x => 80 * x,
      cost: x => 400 + 20 * x + 0.8 * x * x
    },
    e3: {
      title: 'Ejemplo 3: Publicidad digital - exponencial',
      description:
        'Beneficio bruto B(x) = 500 * (1 - e^{-0.4x}), costo de campaña = 100x. Hay un punto donde deja de ser rentable seguir invirtiendo.',
      xMax: 10,
      revenueFormula: 'I(x) = 500 * (1 - e^{-0.4x})',
      costFormula: 'C(x) = 100x',
      profitFormula: 'U(x) = I(x) - C(x)',
      revenue: x => 500 * (1 - Math.exp(-0.4 * x)),
      cost: x => 100 * x
    },
    e4: {
      title: 'Ejemplo 4: Descuento a clientes - no lineal',
      description:
        'Beneficio adicional B(x) = 2000 * (1 - e^{-0.1x}), costo del descuento = 50x. x es el % de descuento entre 0 y 40.',
      xMax: 40,
      revenueFormula: 'I(x) = 2000 * (1 - e^{-0.1x})',
      costFormula: 'C(x) = 50x',
      profitFormula: 'U(x) = I(x) - C(x)',
      revenue: x => 2000 * (1 - Math.exp(-0.1 * x)),
      cost: x => 50 * x
    },
    e5: {
      title: 'Ejemplo 5: Inversion en mantenimiento - logaritmica',
      description:
        'Ahorro esperado A(x) = 300 * ln(1 + x), costo de mantenimiento = 80x. Beneficio decreciente al aumentar x.',
      xMax: 15,
      revenueFormula: 'I(x) = 300 * ln(1 + x)',
      costFormula: 'C(x) = 80x',
      profitFormula: 'U(x) = I(x) - C(x)',
      revenue: x => (x <= -1 ? NaN : 300 * Math.log(1 + x)),
      cost: x => 80 * x
    }
  };

  const exampleSelect = root.querySelector('#exampleSelect');
  const exampleText = root.querySelector('#exampleText');
  const revenueFormula = root.querySelector('#revenueFormula');
  const costFormula = root.querySelector('#costFormula');
  const profitFormula = root.querySelector('#profitFormula');

  const xRange = root.querySelector('#xRange');
  const xValue = root.querySelector('#xValue');
  const revValue = root.querySelector('#revValue');
  const costValue = root.querySelector('#costValue');
  const profitValue = root.querySelector('#profitValue');
  const xOptValue = root.querySelector('#xOptValue');
  const uOptValue = root.querySelector('#uOptValue');
  const optComment = root.querySelector('#optComment');

  const profitCanvas = root.querySelector('#profitCanvas');
  const profitCtx = profitCanvas.getContext('2d');

  let currentExampleKey = 'e1';

  const getCurrentExample = () => EXAMPLES[currentExampleKey];

  function setExample(key) {
    currentExampleKey = key;
    const ex = getCurrentExample();

    exampleText.textContent = ex.description;
    revenueFormula.textContent = ex.revenueFormula;
    costFormula.textContent = ex.costFormula;
    profitFormula.textContent = ex.profitFormula;

    xRange.min = '0';
    xRange.max = ex.xMax.toString();
    xRange.step = ex.xMax <= 20 ? '0.1' : '0.5';
    xRange.value = (ex.xMax / 4).toString();

    actualizar();
  }

  function actualizar() {
    const ex = getCurrentExample();
    const xMax = ex.xMax;
    const x = parseFloat(xRange.value);

    const I = ex.revenue(x);
    const C = ex.cost(x);
    const U = I - C;

    xValue.textContent = x.toFixed(2);
    revValue.textContent = isFinite(I) ? I.toFixed(2) : 'NaN';
    costValue.textContent = isFinite(C) ? C.toFixed(2) : 'NaN';
    profitValue.textContent = isFinite(U) ? U.toFixed(2) : 'NaN';

    let bestX = 0;
    let bestU = -Infinity;
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
      const t = (xMax * i) / steps;
      const Ut = ex.revenue(t) - ex.cost(t);
      if (!isFinite(Ut)) continue;
      if (Ut > bestU) {
        bestU = Ut;
        bestX = t;
      }
    }

    xOptValue.textContent = bestX.toFixed(2);
    uOptValue.textContent = isFinite(bestU) ? bestU.toFixed(2) : 'NaN';
    optComment.textContent =
      'Maximo aproximado evaluando puntos dentro del intervalo permitido para x.';

    dibujarGrafica(ex, x, bestX);
  }

  function dibujarGrafica(ex, xActual, xOpt) {
    const canvas = profitCanvas;
    const ctx = profitCtx;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const xMax = ex.xMax;
    const steps = 400;
    const xs = [];
    const Us = [];
    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i <= steps; i++) {
      const x = (xMax * i) / steps;
      const U = ex.revenue(x) - ex.cost(x);
      xs.push(x);
      Us.push(U);
      if (!isFinite(U)) continue;
      yMin = Math.min(yMin, U);
      yMax = Math.max(yMax, U);
    }

    if (!isFinite(yMin) || !isFinite(yMax)) {
      yMin = -1;
      yMax = 1;
    }
    if (yMin === yMax) {
      yMin -= 1;
      yMax += 1;
    } else {
      const pad = 0.1 * (yMax - yMin);
      yMin -= pad;
      yMax += pad;
    }

    const xMin = 0;
    const toCanvasX = x => 40 + ((x - xMin) / (xMax - xMin)) * (w - 70);
    const toCanvasY = y => h - 40 - ((y - yMin) / (yMax - yMin)) * (h - 70);

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;

    if (yMin < 0 && yMax > 0) {
      const y0 = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(xMin), y0);
      ctx.lineTo(toCanvasX(xMax), y0);
      ctx.stroke();
    }

    const x0 = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(x0, toCanvasY(yMin));
    ctx.lineTo(x0, toCanvasY(yMax));
    ctx.stroke();

    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let i = 0; i <= steps; i++) {
      if (!isFinite(Us[i])) continue;
      const cx = toCanvasX(xs[i]);
      const cy = toCanvasY(Us[i]);
      if (first) {
        ctx.moveTo(cx, cy);
        first = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    const Uactual = ex.revenue(xActual) - ex.cost(xActual);
    if (isFinite(Uactual)) {
      ctx.fillStyle = '#d32f2f';
      ctx.beginPath();
      ctx.arc(toCanvasX(xActual), toCanvasY(Uactual), 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const Uopt = ex.revenue(xOpt) - ex.cost(xOpt);
    if (isFinite(Uopt)) {
      ctx.fillStyle = '#7b1fa2';
      ctx.beginPath();
      ctx.arc(toCanvasX(xOpt), toCanvasY(Uopt), 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#000000';
    ctx.font = '13px Arial';
    ctx.fillText('x', w - 25, h - 15);
    ctx.save();
    ctx.translate(15, 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('U(x)', 0, 0);
    ctx.restore();
  }

  exampleSelect.addEventListener('change', e => setExample(e.target.value));
  xRange.addEventListener('input', actualizar);

  setExample('e1');
}

function init() {
  renderCostosNoLineal(document.getElementById('app') || document.body);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
