// Versión JS auto-contenida de "4.9.1.2 ejemplos reales costos"
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
    input[type="number"] {
      padding: 4px 6px;
      font-size: 14px;
      width: 90px;
      margin-right: 8px;
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
      min-width: 170px;
    }
    canvas {
      border: 1px solid #eee;
      background-color: #ffffff;
      margin-top: 10px;
    }
    .small {
      font-size: 13px;
      color: #555;
    }
    .highlight {
      font-weight: bold;
      color: #b22222;
    }
  </style>

  <h1>Optimizaci\u00f3n econ\u00f3mica: utilidad en funci\u00f3n de la producci\u00f3n</h1>

  <p>Modelo general:</p>
  <ul>
    <li>Precio por unidad: <code>p</code></li>
    <li>Costo total: <code>C(x) = C_f + C_v \u00b7 x</code></li>
    <li>Ingreso total: <code>I(x) = p \u00b7 x</code></li>
    <li>Utilidad: <code>U(x) = I(x) - C(x)</code></li>
  </ul>
  <p class="small">
    Donde <strong>C<sub>f</sub></strong> es el costo fijo (no depende de cu\u00e1ntas unidades se producen) y
    <strong>C<sub>v</sub></strong> es el costo variable por unidad.
  </p>

  <div class="panel">
    <h2>1. Par\u00e1metros del problema</h2>

    <div class="row">
      <label for="precioInput">Precio por unidad (p):</label>
      <input type="number" id="precioInput" value="80" step="1" />
    </div>

    <div class="row">
      <label for="costoFijoInput">Costo fijo (C_f):</label>
      <input type="number" id="costoFijoInput" value="1000" step="50" />
    </div>

    <div class="row">
      <label for="costoVarInput">Costo variable por unidad (C_v):</label>
      <input type="number" id="costoVarInput" value="20" step="1" />
    </div>

    <div class="row">
      <label for="capacidadInput">Capacidad m\u00e1xima de producci\u00f3n (x m\u00e1x):</label>
      <input type="number" id="capacidadInput" value="50" step="1" min="1" />
    </div>

    <p class="small">
      Interprete los par\u00e1metros como una empresa real: el costo fijo puede ser renta, sueldos administrativos,
      servicios b\u00e1sicos, etc.; el costo variable puede ser materia prima, mano de obra directa, empaque, etc.
    </p>
  </div>

  <div class="panel">
    <h2>2. Producci\u00f3n actual y valores econ\u00f3micos</h2>

    <div class="row">
      <label for="xRange"><strong>Producci\u00f3n x (unidades):</strong></label><br />
      <input type="range" id="xRange" min="0" max="50" step="1" value="10" />
      <span id="xValue"></span> unidades
    </div>

    <div class="values">
      <span>Ingreso I(x): <strong><span id="ingresoValue"></span> pesos</strong></span>
      <span>Costo C(x): <strong><span id="costoValue"></span> pesos</strong></span>
    </div>
    <div class="values">
      <span>Utilidad U(x): <strong><span id="utilidadValue"></span> pesos</strong></span>
      <span>Margen por unidad: <strong><span id="margenValue"></span> pesos/unidad</strong></span>
    </div>

    <div class="values small">
      <div>Producci\u00f3n "optima" dentro de la capacidad (seg\u00fan el modelo lineal):</div>
      <span>x<sub>opt</sub> = <strong><span id="xOptValue"></span> unidades</strong></span>
      <span>U(x<sub>opt</sub>) = <strong><span id="uOptValue"></span> pesos</strong></span>
      <div id="interpretacionOpt" class="small" style="margin-top:4px;"></div>
    </div>
  </div>

  <div class="panel">
    <h2>3. Gr\u00e1fica de ingresos, costos y utilidad</h2>
    <p class="small">
      Se grafican:
      <br>\u2022 Ingreso total I(x) (l\u00ednea azul)
      <br>\u2022 Costo total C(x) (l\u00ednea naranja)
      <br>\u2022 Utilidad U(x) (l\u00ednea verde)
      <br>El punto rojo corresponde a la producci\u00f3n actual x, y el punto morado al valor "optimo" dentro de la capacidad.
    </p>
    <canvas id="econCanvas" width="600" height="360"></canvas>
  </div>
`;

function renderEjemplosCostos(root = document.body) {
  root.innerHTML = template;

  const precioInput = root.querySelector('#precioInput');
  const costoFijoInput = root.querySelector('#costoFijoInput');
  const costoVarInput = root.querySelector('#costoVarInput');
  const capacidadInput = root.querySelector('#capacidadInput');

  const xRange = root.querySelector('#xRange');
  const xValue = root.querySelector('#xValue');
  const ingresoValue = root.querySelector('#ingresoValue');
  const costoValue = root.querySelector('#costoValue');
  const utilidadValue = root.querySelector('#utilidadValue');
  const margenValue = root.querySelector('#margenValue');
  const xOptValue = root.querySelector('#xOptValue');
  const uOptValue = root.querySelector('#uOptValue');
  const interpretacionOpt = root.querySelector('#interpretacionOpt');

  const econCanvas = root.querySelector('#econCanvas');
  const econCtx = econCanvas.getContext('2d');

  const ingreso = (x, p) => p * x;
  const costo = (x, cf, cv) => cf + cv * x;
  const utilidad = (x, p, cf, cv) => ingreso(x, p) - costo(x, cf, cv);

  function actualizar() {
    const p = parseFloat(precioInput.value);
    const cf = parseFloat(costoFijoInput.value);
    const cv = parseFloat(costoVarInput.value);
    let xmax = parseFloat(capacidadInput.value);

    if (xmax <= 0 || isNaN(xmax)) {
      xmax = 1;
      capacidadInput.value = 1;
    }

    xRange.max = xmax.toString();
    if (parseFloat(xRange.value) > xmax) {
      xRange.value = xmax;
    }

    const x = parseFloat(xRange.value);

    const I = ingreso(x, p);
    const C = costo(x, cf, cv);
    const U = utilidad(x, p, cf, cv);
    const margen = p - cv;

    xValue.textContent = x.toFixed(0);
    ingresoValue.textContent = I.toFixed(2);
    costoValue.textContent = C.toFixed(2);
    utilidadValue.textContent = U.toFixed(2);
    margenValue.textContent = margen.toFixed(2);

    let xOpt;
    let Uopt;
    let interpretacion;

    if (margen > 0) {
      xOpt = xmax;
      Uopt = utilidad(xOpt, p, cf, cv);
      interpretacion =
        'Como el margen por unidad es positivo, la utilidad crece con x. Dentro de la capacidad, conviene producir el maximo posible.';
    } else if (margen < 0) {
      xOpt = 0;
      Uopt = utilidad(xOpt, p, cf, cv);
      interpretacion =
        'El margen por unidad es negativo: cada unidad adicional hace perder dinero. En este modelo, lo "mejor" seria no producir (x = 0).';
    } else {
      xOpt = 0;
      Uopt = utilidad(xOpt, p, cf, cv);
      interpretacion =
        'El margen por unidad es cero: la utilidad no cambia con x. Cualquier nivel de produccion dentro de la capacidad da la misma utilidad.';
    }

    xOptValue.textContent = xOpt.toFixed(0);
    uOptValue.textContent = Uopt.toFixed(2);
    interpretacionOpt.textContent = interpretacion;

    dibujarGrafica(p, cf, cv, xmax, x, xOpt);
  }

  function dibujarGrafica(p, cf, cv, xmax, xActual, xOpt) {
    const ctx = econCtx;
    const canvas = econCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const pasos = 200;
    const xs = [];
    const Is = [];
    const Cs = [];
    const Us = [];

    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i <= pasos; i++) {
      const x = (xmax * i) / pasos;
      const I = ingreso(x, p);
      const C = costo(x, cf, cv);
      const U = utilidad(x, p, cf, cv);

      xs.push(x);
      Is.push(I);
      Cs.push(C);
      Us.push(U);

      yMin = Math.min(yMin, I, C, U);
      yMax = Math.max(yMax, I, C, U);
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

    const xMin = 0;
    const toCanvasX = x => 40 + ((x - xMin) / (xmax - xMin)) * (w - 70);
    const toCanvasY = y => h - 40 - ((y - yMin) / (yMax - yMin)) * (h - 70);

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;

    if (yMin < 0 && yMax > 0) {
      const y0 = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(xMin), y0);
      ctx.lineTo(toCanvasX(xmax), y0);
      ctx.stroke();
    }

    const x0 = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(x0, toCanvasY(yMin));
    ctx.lineTo(x0, toCanvasY(yMax));
    ctx.stroke();

    const drawLine = (arr, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= pasos; i++) {
        const cx = toCanvasX(xs[i]);
        const cy = toCanvasY(arr[i]);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    };

    drawLine(Is, '#1565c0'); // Ingreso
    drawLine(Cs, '#ef6c00'); // Costo
    drawLine(Us, '#2e7d32'); // Utilidad

    const Uactual = utilidad(xActual, p, cf, cv);
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc(toCanvasX(xActual), toCanvasY(Uactual), 5, 0, Math.PI * 2);
    ctx.fill();

    const Uopt = utilidad(xOpt, p, cf, cv);
    ctx.fillStyle = '#7b1fa2';
    ctx.beginPath();
    ctx.arc(toCanvasX(xOpt), toCanvasY(Uopt), 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '13px Arial';
    ctx.fillText('Produccion x', w - 110, h - 15);
    ctx.save();
    ctx.translate(15, 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Pesos', 0, 0);
    ctx.restore();

    ctx.font = '12px Arial';
    ctx.fillStyle = '#1565c0';
    ctx.fillText('Ingreso I(x)', 50, 20);
    ctx.fillStyle = '#ef6c00';
    ctx.fillText('Costo C(x)', 150, 20);
    ctx.fillStyle = '#2e7d32';
    ctx.fillText('Utilidad U(x)', 250, 20);
  }

  precioInput.addEventListener('input', actualizar);
  costoFijoInput.addEventListener('input', actualizar);
  costoVarInput.addEventListener('input', actualizar);
  capacidadInput.addEventListener('input', actualizar);
  xRange.addEventListener('input', actualizar);

  actualizar();
}

function init() {
  renderEjemplosCostos(document.getElementById('app') || document.body);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
