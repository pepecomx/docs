// Interactivo no lineal con parámetros editables para ingreso, costo y utilidad.
const template = `
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      line-height: 1.5;
    }
    h1 { font-size: 22px; margin-bottom: 8px; }
    h2 { font-size: 18px; margin-top: 18px; margin-bottom: 6px; }
    h3 { font-size: 16px; margin-top: 12px; margin-bottom: 4px; }
    .panel {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 12px;
      margin-top: 10px;
      background-color: #fafafa;
    }
    label { font-size: 14px; }
    select {
      padding: 4px 6px;
      font-size: 14px;
      min-width: 260px;
    }
    input[type="range"] { width: 260px; margin-top: 4px; }
    input[type="number"] {
      padding: 3px 6px;
      font-size: 13px;
      width: 90px;
      margin-left: 4px;
      margin-right: 12px;
    }
    .row { margin-top: 6px; margin-bottom: 4px; }
    .values { margin-top: 8px; font-size: 14px; }
    .values span { display: inline-block; min-width: 180px; }
    .small { font-size: 13px; color: #555; }
    canvas { border: 1px solid #eee; background-color: #ffffff; margin-top: 10px; }
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
    .param-row { margin-top: 3px; margin-bottom: 3px; }
  </style>

  <h1>Problemas de optimizacion economica con funciones no lineales</h1>

  <p>
    En todos estos ejemplos se quiere elegir un valor de <strong>x</strong>
    (cantidad producida, inversion, descuento, etc.) para <strong>maximizar la utilidad</strong>:
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

    <h3>Formas funcionales (simbolicas)</h3>
    <div>
      <span class="formula" id="revenueFormula"></span>
      <span class="formula" id="costFormula"></span>
      <span class="formula" id="profitFormula"></span>
    </div>

    <h3>Parametros del modelo</h3>
    <div id="paramContainer" class="small"></div>
    <div id="paramInfo" class="small" style="margin-top:4px;"></div>
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
      <div><strong>Maximo aproximado dentro del rango:</strong></div>
      <span>x<sub>max</sub> ≈ <strong><span id="xOptValue"></span></strong></span>
      <span>U(x<sub>max</sub>) ≈ <strong><span id="uOptValue"></span></strong></span>
      <div id="optComment" style="margin-top:4px;"></div>
    </div>
  </div>

  <div class="panel">
    <h2>3. Graficas de ingreso, costo y utilidad</h2>
    <p class="small">
      Se grafican ingreso, costo y utilidad; punto rojo = valor actual, morado = maximo aproximado.
    </p>
    <canvas id="profitCanvas" width="600" height="360"></canvas>
  </div>
`;

function renderNoLinealInteractivo(root = document.body) {
  root.innerHTML = template;

  const EXAMPLES = {
    e1: {
      description:
        'p(x) = a - b*x; costo C(x) = Cf + Cv*x. Precio baja al aumentar la cantidad.',
      xMax: 200,
      revenueFormula: 'Ingreso: I(x) = (a - b*x) * x',
      costFormula: 'Costo: C(x) = Cf + Cv*x',
      profitFormula: 'Utilidad: U(x) = I(x) - C(x)',
      params: [
        { key: 'a', label: 'a (precio base)', default: 120, step: 1 },
        { key: 'b', label: 'b (sensibilidad precio)', default: 0.5, step: 0.1 },
        { key: 'cf', label: 'Cf (costo fijo)', default: 500, step: 50 },
        { key: 'cv', label: 'Cv (costo variable)', default: 20, step: 1 }
      ],
      revenue: (x, p) => {
        const price = p.a - p.b * x;
        return price < 0 ? 0 : price * x;
      },
      cost: (x, p) => p.cf + p.cv * x
    },
    e2: {
      description:
        'Costo cuadratico: C(x) = Cf + Cv*x + c2*x^2; precio fijo p.',
      xMax: 60,
      revenueFormula: 'Ingreso: I(x) = p*x',
      costFormula: 'Costo: C(x) = Cf + Cv*x + c2*x^2',
      profitFormula: 'Utilidad: U(x) = I(x) - C(x)',
      params: [
        { key: 'p', label: 'p (precio)', default: 80, step: 1 },
        { key: 'cf', label: 'Cf (costo fijo)', default: 400, step: 50 },
        { key: 'cv', label: 'Cv (costo lineal)', default: 20, step: 1 },
        { key: 'c2', label: 'c2 (coeficiente cuadratico)', default: 0.8, step: 0.1 }
      ],
      revenue: (x, p) => p.p * x,
      cost: (x, p) => p.cf + p.cv * x + p.c2 * x * x
    },
    e3: {
      description:
        'Publicidad digital: I(x) = B*(1 - e^{-k*x}); costo lineal c*x.',
      xMax: 10,
      revenueFormula: 'Ingreso: I(x) = B*(1 - e^{-k*x})',
      costFormula: 'Costo: C(x) = c*x',
      profitFormula: 'Utilidad: U(x) = I(x) - C(x)',
      params: [
        { key: 'B', label: 'B (beneficio max)', default: 500, step: 10 },
        { key: 'k', label: 'k (saturacion)', default: 0.4, step: 0.05 },
        { key: 'c', label: 'c (costo unitario)', default: 100, step: 5 }
      ],
      revenue: (x, p) => p.B * (1 - Math.exp(-p.k * x)),
      cost: (x, p) => p.c * x
    },
    e4: {
      description:
        'Descuento a clientes: I(x) = B*(1 - e^{-k*x}), costo del descuento c*x.',
      xMax: 40,
      revenueFormula: 'Ingreso: I(x) = B*(1 - e^{-k*x})',
      costFormula: 'Costo: C(x) = c*x',
      profitFormula: 'Utilidad: U(x) = I(x) - C(x)',
      params: [
        { key: 'B', label: 'B (beneficio max)', default: 2000, step: 50 },
        { key: 'k', label: 'k (sensibilidad)', default: 0.1, step: 0.01 },
        { key: 'c', label: 'c (costo por descuento)', default: 50, step: 1 }
      ],
      revenue: (x, p) => p.B * (1 - Math.exp(-p.k * x)),
      cost: (x, p) => p.c * x
    },
    e5: {
      description:
        'Mantenimiento logaritmico: I(x) = A*ln(1+x); costo lineal c*x.',
      xMax: 15,
      revenueFormula: 'Ingreso: I(x) = A*ln(1+x)',
      costFormula: 'Costo: C(x) = c*x',
      profitFormula: 'Utilidad: U(x) = I(x) - C(x)',
      params: [
        { key: 'A', label: 'A (escala ahorro)', default: 300, step: 10 },
        { key: 'c', label: 'c (costo unitario)', default: 80, step: 5 }
      ],
      revenue: (x, p) => (x <= -1 ? NaN : p.A * Math.log(1 + x)),
      cost: (x, p) => p.c * x
    }
  };

  const exampleSelect = root.querySelector('#exampleSelect');
  const exampleText = root.querySelector('#exampleText');
  const revenueFormula = root.querySelector('#revenueFormula');
  const costFormula = root.querySelector('#costFormula');
  const profitFormula = root.querySelector('#profitFormula');
  const paramContainer = root.querySelector('#paramContainer');
  const paramInfo = root.querySelector('#paramInfo');

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

  function buildParamInputs(ex) {
    paramContainer.innerHTML = '';
    if (!ex.params || ex.params.length === 0) {
      paramInfo.textContent = 'Este ejemplo no tiene parametros editables.';
      return;
    }
    ex.params.forEach(p => {
      const row = document.createElement('div');
      row.className = 'param-row';
      const label = document.createElement('label');
      label.textContent = `${p.label}:`;
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'param-input';
      input.dataset.key = p.key;
      input.value = p.default;
      if (p.step !== undefined) input.step = p.step;
      row.appendChild(label);
      row.appendChild(input);
      paramContainer.appendChild(row);
    });
  }

  function readParams(ex) {
    const inputs = paramContainer.querySelectorAll('.param-input');
    const params = {};
    inputs.forEach(inp => {
      const key = inp.dataset.key;
      let val = parseFloat(inp.value);
      if (!isFinite(val)) {
        const def = ex.params.find(p => p.key === key)?.default ?? 0;
        val = def;
        inp.value = def;
      }
      params[key] = val;
    });
    paramInfo.textContent = 'Valores actuales: ' + Object.entries(params).map(([k, v]) => `${k}=${v.toFixed(2)}`).join(', ');
    return params;
  }

  function setExample(key) {
    currentExampleKey = key;
    const ex = getCurrentExample();

    exampleText.textContent = ex.description;
    revenueFormula.textContent = ex.revenueFormula;
    costFormula.textContent = ex.costFormula;
    profitFormula.textContent = ex.profitFormula;

    buildParamInputs(ex);

    xRange.min = '0';
    xRange.max = ex.xMax.toString();
    xRange.step = ex.xMax <= 20 ? '0.1' : '0.5';
    xRange.value = (ex.xMax / 4).toString();

    actualizar();
  }

  function actualizar() {
    const ex = getCurrentExample();
    const params = readParams(ex);
    const xMax = ex.xMax;
    const x = parseFloat(xRange.value);

    const I = ex.revenue(x, params);
    const C = ex.cost(x, params);
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
      const Ut = ex.revenue(t, params) - ex.cost(t, params);
      if (!isFinite(Ut)) continue;
      if (Ut > bestU) {
        bestU = Ut;
        bestX = t;
      }
    }

    xOptValue.textContent = bestX.toFixed(2);
    uOptValue.textContent = isFinite(bestU) ? bestU.toFixed(2) : 'NaN';
    optComment.textContent = 'Maximo calculado evaluando muchos puntos en el intervalo de x.';

    dibujarGrafica(ex, params, x, bestX);
  }

  function dibujarGrafica(ex, params, xActual, xOpt) {
    const canvas = profitCanvas;
    const ctx = profitCtx;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const xMax = ex.xMax;
    const steps = 400;
    const xs = [];
    const Is = [];
    const Cs = [];
    const Us = [];
    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i <= steps; i++) {
      const x = (xMax * i) / steps;
      const I = ex.revenue(x, params);
      const C = ex.cost(x, params);
      const U = I - C;
      xs.push(x); Is.push(I); Cs.push(C); Us.push(U);
      if (!isFinite(I) || !isFinite(C) || !isFinite(U)) continue;
      yMin = Math.min(yMin, I, C, U);
      yMax = Math.max(yMax, I, C, U);
    }

    if (!isFinite(yMin) || !isFinite(yMax)) { yMin = -1; yMax = 1; }
    if (yMin === yMax) { yMin -= 1; yMax += 1; }
    else {
      const pad = 0.1 * (yMax - yMin);
      yMin -= pad; yMax += pad;
    }

    const xMin = 0;
    const toCanvasX = x => 40 + ((x - xMin) / (xMax - xMin)) * (w - 70);
    const toCanvasY = y => h - 40 - ((y - yMin) / (yMax - yMin)) * (h - 70);

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    if (yMin < 0 && yMax > 0) {
      const y0 = toCanvasY(0);
      ctx.beginPath(); ctx.moveTo(toCanvasX(xMin), y0); ctx.lineTo(toCanvasX(xMax), y0); ctx.stroke();
    }
    const x0 = toCanvasX(0);
    ctx.beginPath(); ctx.moveTo(x0, toCanvasY(yMin)); ctx.lineTo(x0, toCanvasY(yMax)); ctx.stroke();

    const drawLine = (arr, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      let first = true;
      for (let i = 0; i <= steps; i++) {
        if (!isFinite(arr[i])) continue;
        const cx = toCanvasX(xs[i]); const cy = toCanvasY(arr[i]);
        if (first) { ctx.moveTo(cx, cy); first = false; } else { ctx.lineTo(cx, cy); }
      }
      ctx.stroke();
    };

    drawLine(Is, '#1565c0');
    drawLine(Cs, '#ef6c00');
    drawLine(Us, '#2e7d32');

    const Uactual = ex.revenue(xActual, params) - ex.cost(xActual, params);
    if (isFinite(Uactual)) {
      ctx.fillStyle = '#d32f2f';
      ctx.beginPath(); ctx.arc(toCanvasX(xActual), toCanvasY(Uactual), 5, 0, Math.PI * 2); ctx.fill();
    }

    const Uopt = ex.revenue(xOpt, params) - ex.cost(xOpt, params);
    if (isFinite(Uopt)) {
      ctx.fillStyle = '#7b1fa2';
      ctx.beginPath(); ctx.arc(toCanvasX(xOpt), toCanvasY(Uopt), 5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = '#000000';
    ctx.font = '13px Arial';
    ctx.fillText('x', w - 25, h - 15);
    ctx.save(); ctx.translate(15, 40); ctx.rotate(-Math.PI / 2); ctx.fillText('Pesos / utilidad', 0, 0); ctx.restore();

    ctx.font = '12px Arial';
    ctx.fillStyle = '#1565c0'; ctx.fillText('Ingreso I(x)', 60, 20);
    ctx.fillStyle = '#ef6c00'; ctx.fillText('Costo C(x)', 160, 20);
    ctx.fillStyle = '#2e7d32'; ctx.fillText('Utilidad U(x)', 260, 20);
  }

  exampleSelect.addEventListener('change', e => setExample(e.target.value));
  xRange.addEventListener('input', actualizar);
  paramContainer.addEventListener('input', e => {
    if (e.target.classList.contains('param-input')) actualizar();
  });

  setExample('e1');
}

function init() {
  renderNoLinealInteractivo(document.getElementById('app') || document.body);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
