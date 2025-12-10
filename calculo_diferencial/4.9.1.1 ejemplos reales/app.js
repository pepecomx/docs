// Versión JS auto-contenida del interactivo "4.9.1.1 ejemplos reales".
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
      width: 80px;
    }
    input[type="range"] {
      width: 260px;
    }
    .values {
      margin-top: 8px;
      font-size: 14px;
    }
    .values span {
      display: inline-block;
      min-width: 140px;
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
    select {
      padding: 4px 6px;
      font-size: 14px;
      min-width: 260px;
    }
  </style>

  <h1>Problema de optimización: área máxima de un rectángulo</h1>

  <p>
    Se desea un rectángulo con perímetro fijo <strong>P</strong>.
    Sabemos que:
    <br>Perímetro: <code>2x + 2y = P</code> → <code>x + y = P/2</code> → <code>y = P/2 - x</code>.
    <br>Área: <code>A(x) = x · y</code>.
  </p>

  <div class="panel">
    <h2>1. Elegir un problema de la vida real</h2>
    <label for="problemSelect"><strong>Seleccione un escenario:</strong></label><br>
    <select id="problemSelect">
      <option value="none" data-perimeter="40">(Sin problema seleccionado)</option>
      <option value="corral" data-perimeter="40">Corral para animales (P = 40 m)</option>
      <option value="jardin" data-perimeter="30">Jardín con borde decorativo (P = 30 m)</option>
      <option value="anuncio" data-perimeter="50">Anuncio publicitario (P = 50 m)</option>
      <option value="bodega" data-perimeter="36">Piso de una bodega (P = 36 m)</option>
      <option value="marco" data-perimeter="2">Marco de una fotografía (P = 2 m)</option>
    </select>

    <div id="problemDescription" class="small" style="margin-top:8px;">
      Seleccione un problema para ver la descripción y ajustar automáticamente el perímetro.
    </div>
  </div>

  <div class="panel">
    <h2>2. Parámetros del rectángulo</h2>
    <label for="perimeterInput">
      Perímetro P (m):
    </label>
    <input type="number" id="perimeterInput" value="40" min="4" step="1" />
    <span class="small">(puede modificarlo manualmente)</span>
    <br><br>

    <label for="xRange"><strong>Elija el largo x:</strong></label><br>
    <input type="range" id="xRange" min="0" max="20" step="0.1" value="10" />
    <span id="xValue"></span> m

    <div class="values">
      <span>Ancho y: <strong><span id="yValue"></span> m</strong></span>
      <span>Área A(x): <strong><span id="areaValue"></span> m²</strong></span>
    </div>

    <div class="values small">
      Punto óptimo teórico (máximo área):<br>
      <span>x<sub>opt</sub> = y<sub>opt</sub> = <strong><span id="xOptValue"></span> m</strong></span>
      <span>A<sub>max</sub> = <strong><span id="areaMaxValue"></span> m²</strong></span>
    </div>
  </div>

  <div class="panel">
    <h2>3. Gráfica del área A(x)</h2>
    <p class="small">
      La curva muestra el área del rectángulo para cada posible valor de x
      (con el perímetro P fijo). El punto rojo es el área para el x actual
      y el punto morado marca el máximo.
    </p>
    <canvas id="areaCanvas" width="500" height="320"></canvas>
  </div>

  <div class="panel">
    <h2>4. Vista del rectángulo con las dimensiones actuales</h2>
    <p class="small">
      El ancho horizontal representa <strong>x</strong> (largo) y el vertical <strong>y</strong> (ancho).
      La figura se dibuja a escala para visualizar cómo cambia la forma al mover el deslizador.
    </p>
    <canvas id="rectCanvas" width="400" height="260"></canvas>
  </div>
`;

function renderEjemplosReales(root = document.body) {
  root.innerHTML = template;

  const perimeterInput = root.querySelector('#perimeterInput');
  const xRange = root.querySelector('#xRange');
  const xValue = root.querySelector('#xValue');
  const yValue = root.querySelector('#yValue');
  const areaValue = root.querySelector('#areaValue');
  const xOptValue = root.querySelector('#xOptValue');
  const areaMaxValue = root.querySelector('#areaMaxValue');

  const areaCanvas = root.querySelector('#areaCanvas');
  const areaCtx = areaCanvas.getContext('2d');

  const rectCanvas = root.querySelector('#rectCanvas');
  const rectCtx = rectCanvas.getContext('2d');

  const problemSelect = root.querySelector('#problemSelect');
  const problemDescription = root.querySelector('#problemDescription');

  const descriptions = {
    none: 'Seleccione un problema para ver la descripción y ajustar automáticamente el perímetro.',
    corral: 'Un granjero tiene 40 metros de cerca para construir un corral rectangular para sus ovejas. ¿Qué dimensiones debe tener el corral para que el área sea máxima?',
    jardin: 'Una persona quiere hacer un jardín rectangular rodeado por una franja de piedra decorativa. Tiene 30 metros de piedra para rodear el jardín. ¿Qué dimensiones debe tener el jardín para que el área de césped sea máxima?',
    anuncio: 'Una empresa de publicidad diseña un anuncio rectangular enmarcado con luces LED. Solo puede usar 50 metros de luces para el contorno. ¿Qué dimensiones deben tener el anuncio para maximizar el área visible?',
    bodega: 'Se construirá una bodega rectangular y la longitud total de muros (perímetro) no puede exceder 36 metros. ¿Qué dimensiones debe tener la bodega para maximizar el área del piso?',
    marco: 'Una persona manda a hacer un marco rectangular para una fotografía. Por costo de la madera, solo puede usar 2 metros de moldura para el contorno. ¿Qué dimensiones permiten maximizar el área interior del marco?'
  };

  function area(x, P) {
    return x * (P / 2 - x);
  }

  function drawGraph() {
    const P = parseFloat(perimeterInput.value);
    const xMin = 0;
    const xMax = P / 2;

    xRange.min = xMin.toString();
    xRange.max = xMax.toString();

    let x = parseFloat(xRange.value);
    if (x < xMin || x > xMax) {
      x = xMin;
      xRange.value = x;
    }

    const y = P / 2 - x;
    const A = area(x, P);

    const xOpt = P / 4;
    const Amax = area(xOpt, P);

    xValue.textContent = x.toFixed(2);
    yValue.textContent = y.toFixed(2);
    areaValue.textContent = A.toFixed(2);
    xOptValue.textContent = xOpt.toFixed(2);
    areaMaxValue.textContent = Amax.toFixed(2);

    drawAreaGraph(P, x, A, xOpt, Amax, xMin, xMax);
    drawRectangle(x, y);
  }

  function drawAreaGraph(P, x, A, xOpt, Amax, xMin, xMax) {
    const ctx = areaCtx;
    const canvas = areaCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const steps = 300;
    let yMin = 0;
    let yMax = Amax * 1.1;
    if (yMax <= 0) yMax = 1;

    const w = canvas.width;
    const h = canvas.height;

    const toCanvasX = xv => ((xv - xMin) / (xMax - xMin)) * (w - 40) + 30;
    const toCanvasY = yv => h - 30 - ((yv - yMin) / (yMax - yMin)) * (h - 60);

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(xMin), toCanvasY(0));
    ctx.lineTo(toCanvasX(xMax), toCanvasY(0));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(yMin));
    ctx.lineTo(toCanvasX(0), toCanvasY(yMax));
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let i = 0; i <= steps; i++) {
      const xi = xMin + (i / steps) * (xMax - xMin);
      const yi = area(xi, P);
      const cx = toCanvasX(xi);
      const cy = toCanvasY(yi);
      if (first) {
        ctx.moveTo(cx, cy);
        first = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    ctx.fillStyle = '#7b1fa2';
    const cxOpt = toCanvasX(xOpt);
    const cyOpt = toCanvasY(Amax);
    ctx.beginPath();
    ctx.arc(cxOpt, cyOpt, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d32f2f';
    const cx = toCanvasX(x);
    const cy = toCanvasY(A);
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '13px Arial';
    ctx.fillText('x', w - 25, toCanvasY(0) + 15);
    ctx.fillText('Área A(x)', toCanvasX(0) - 40, 20);
  }

  function drawRectangle(x, y) {
    const ctx = rectCtx;
    const canvas = rectCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (x <= 0 || y <= 0) {
      ctx.fillStyle = '#555';
      ctx.font = '14px Arial';
      ctx.fillText('No se puede formar un rectángulo con estas dimensiones.', 20, canvas.height / 2);
      return;
    }

    const margin = 40;
    const availW = canvas.width - 2 * margin;
    const availH = canvas.height - 2 * margin;

    const maxDim = Math.max(x, y);
    const scale = Math.min(availW, availH) / maxDim;

    const rectW = x * scale;
    const rectH = y * scale;

    const startX = (canvas.width - rectW) / 2;
    const startY = (canvas.height - rectH) / 2;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, rectW, rectH);

    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.fillText(`x = ${x.toFixed(2)} m`, canvas.width / 2 - 50, startY + rectH + 20);

    ctx.save();
    ctx.translate(startX - 15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`y = ${y.toFixed(2)} m`, -40, 0);
    ctx.restore();
  }

  problemSelect.addEventListener('change', () => {
    const option = problemSelect.options[problemSelect.selectedIndex];
    const P = parseFloat(option.getAttribute('data-perimeter'));
    if (!isNaN(P)) {
      perimeterInput.value = P;
    }
    problemDescription.textContent = descriptions[problemSelect.value] || descriptions.none;
    drawGraph();
  });

  perimeterInput.addEventListener('input', drawGraph);
  xRange.addEventListener('input', drawGraph);

  drawGraph();
}

function init() {
  renderEjemplosReales(document.getElementById('app') || document.body);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
