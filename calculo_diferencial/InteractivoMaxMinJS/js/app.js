document.addEventListener('DOMContentLoaded', () => {
    // 1. STATE MANAGEMENT
    const state = {
        currentFuncKey: 'f1',
        showSolution: false,
        lastInterval: null,
        plotData: {
            xs: [],
            ys: []
        }
    };

    // 2. PREDEFINED FUNCTIONS DATA
    const funcs = {
        f1: {
            text: 'f(x) = -x³ + 3x',
            defaultInterval: [-3, 3],
            f: x => -Math.pow(x, 3) + 3 * x,
            criticalPoints: [{ x: -1, type: 'min' }, { x: 1, type: 'max' }]
        },
        f2: {
            text: 'f(x) = x⁴ - 4x² + 1',
            defaultInterval: [-3, 3],
            f: x => Math.pow(x, 4) - 4 * Math.pow(x, 2) + 1,
            criticalPoints: [{ x: -Math.sqrt(2), type: 'min' }, { x: 0, type: 'max' }, { x: Math.sqrt(2), type: 'min' }]
        },
        f3: {
            text: 'f(x) = sin(x)',
            defaultInterval: [-2 * Math.PI, 2 * Math.PI],
            f: x => Math.sin(x),
            criticalPoints: [
                { x: -3 * Math.PI / 2, type: 'max' }, { x: -Math.PI / 2, type: 'min' },
                { x: Math.PI / 2, type: 'max' }, { x: 3 * Math.PI / 2, type: 'min' }
            ]
        },
        f4: {
            text: 'f(x) = x / (x² + 1)',
            defaultInterval: [-4, 4],
            f: x => x / (Math.pow(x, 2) + 1),
            criticalPoints: [{ x: -1, type: 'min' }, { x: 1, type: 'max' }]
        },
        f5: {
            text: 'f(x) = x·e⁻ˣ',
            defaultInterval: [0, 5],
            f: x => x * Math.exp(-x),
            criticalPoints: [{ x: 1, type: 'max' }]
        }
    };
    const CUSTOM_FUNC_KEY = 'custom';
    const DEFAULT_CUSTOM_INTERVAL = [-5, 5];

    // 3. DOM ELEMENTS
    const dom = {
        funcSelect: document.getElementById('func-select'),
        intervalA: document.getElementById('interval-a'),
        intervalB: document.getElementById('interval-b'),
        customFuncContainer: document.getElementById('custom-func-container'),
        customInput: document.getElementById('custom-f'),
        plotButton: document.getElementById('btn-plot'),
        toggleSolutionButton: document.getElementById('btn-toggle-solution'),
        funcText: document.getElementById('func-text'),
        intervalDefaultText: document.getElementById('interval-default-text'),
        intervalError: document.getElementById('interval-error'),
        graph: document.getElementById('graph'),
        solutionDescription: document.getElementById('solution-description'),
    };

    // 4. UI LOGIC
    function populateFuncSelect() {
        Object.keys(funcs).forEach(key => {
            const option = new Option(funcs[key].text, key);
            dom.funcSelect.add(option);
        });
        dom.funcSelect.add(new Option('Función personalizada', CUSTOM_FUNC_KEY));
    }

    function updateUIForCurrentFunction() {
        const isCustom = state.currentFuncKey === CUSTOM_FUNC_KEY;
        dom.customFuncContainer.style.display = isCustom ? 'block' : 'none';

        if (isCustom) {
            const expr = dom.customInput.value.trim() || '(expresión pendiente)';
            dom.funcText.textContent = `f(x) = ${expr}`;
            const [a, b] = DEFAULT_CUSTOM_INTERVAL;
            dom.intervalDefaultText.textContent = `Intervalo sugerido: [${a.toFixed(2)}, ${b.toFixed(2)}]`;
            if (!dom.intervalA.value || !dom.intervalB.value) {
                dom.intervalA.value = a;
                dom.intervalB.value = b;
            }
        } else {
            const funcData = funcs[state.currentFuncKey];
            dom.funcText.textContent = funcData.text;
            const [a, b] = funcData.defaultInterval;
            dom.intervalDefaultText.textContent = `Intervalo sugerido: [${a.toFixed(2)}, ${b.toFixed(2)}]`;
            dom.intervalA.value = a.toFixed(2);
            dom.intervalB.value = b.toFixed(2);
        }
    }

    // 5. PARSING & CALCULATION LOGIC
    function getInterval() {
        let a = parseFloat(dom.intervalA.value);
        let b = parseFloat(dom.intervalB.value);

        const defaultInterval = state.currentFuncKey === CUSTOM_FUNC_KEY 
            ? DEFAULT_CUSTOM_INTERVAL 
            : funcs[state.currentFuncKey].defaultInterval;

        if (isNaN(a) || isNaN(b)) [a, b] = defaultInterval;
        if (a > b) [a, b] = [b, a];
        if (a === b) b = a + 1;

        dom.intervalA.value = a.toFixed(2);
        dom.intervalB.value = b.toFixed(2);
        state.lastInterval = [a, b];
        return [a, b];
    }
    
    function buildSafeEvaluator(expr) {
        if (!expr.trim()) return null;
        const sanitizedExpr = expr.replace(/\^/g, '**')
            .replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(').replace(/exp\(/g, 'Math.exp(')
            .replace(/log\(/g, 'Math.log(').replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/pi/g, 'Math.PI');
        try {
            const func = new Function('x', `return ${sanitizedExpr}`);
            func(0); // Test call to catch syntax errors
            return func;
        } catch (error) {
            console.error("Function creation error:", error);
            return null;
        }
    }

    // 6. PLOTTING & SOLUTION LOGIC
    function generatePlotData(evaluator, interval) {
        const [a, b] = interval;
        const N = 401;
        state.plotData.xs = new Array(N);
        state.plotData.ys = new Array(N);

        for (let i = 0; i < N; i++) {
            const x = a + (b - a) * i / (N - 1);
            state.plotData.xs[i] = x;
            try {
                const y = evaluator(x);
                state.plotData.ys[i] = isFinite(y) ? y : null;
            } catch {
                state.plotData.ys[i] = null;
            }
        }
    }

    function renderPlot() {
        dom.intervalError.textContent = '';
        const isCustom = state.currentFuncKey === CUSTOM_FUNC_KEY;

        let evaluator = isCustom ? buildSafeEvaluator(dom.customInput.value) : funcs[state.currentFuncKey].f;
        if (!evaluator) {
            dom.intervalError.textContent = 'Error de sintaxis en la función personalizada.';
            Plotly.newPlot(dom.graph, []);
            return;
        }
        
        const interval = state.lastInterval || getInterval();
        generatePlotData(evaluator, interval);

        const funcData = funcs[state.currentFuncKey];
        const eqText = isCustom ? `f(x) = ${dom.customInput.value || '...'}` : funcData.text;

        const traces = [{
            x: state.plotData.xs, y: state.plotData.ys, mode: 'lines', name: eqText, line: { width: 2.5 }
        }];

        if (state.showSolution) {
            const solution = calculateSolution(evaluator, interval);
            addSolutionTraces(traces, solution);
            dom.solutionDescription.innerHTML = buildSolutionDescription(solution, interval);
        } else {
            dom.solutionDescription.innerHTML = '(Activa “Mostrar solución” para ver los extremos).';
        }

        const layout = {
            title: eqText,
            xaxis: { title: 'x', zeroline: true },
            yaxis: { title: 'f(x)', zeroline: true },
            margin: { l: 60, r: 20, t: 40, b: 60 },
            showlegend: true,
            legend: { x: 0.05, y: 0.95 }
        };

        Plotly.newPlot(dom.graph, traces, layout, { responsive: true });
    }

    function calculateSolution(evaluator, interval) {
        const [a, b] = interval;
        const isCustom = state.currentFuncKey === CUSTOM_FUNC_KEY;
        const solution = {
            relMin: [], relMax: [], absMin: [], absMax: [],
        };

        if (isCustom) {
            // Approx relative extrema
            for (let i = 1; i < state.plotData.ys.length - 1; i++) {
                const [y0, y1, y2] = [state.plotData.ys[i-1], state.plotData.ys[i], state.plotData.ys[i+1]];
                if (y0 === null || y1 === null || y2 === null) continue;
                const p = { x: state.plotData.xs[i], y: y1 };
                if (y1 > y0 && y1 > y2) solution.relMax.push(p);
                else if (y1 < y0 && y1 < y2) solution.relMin.push(p);
            }
        } else {
            // Exact relative extrema from critical points
            const funcData = funcs[state.currentFuncKey];
            funcData.criticalPoints.forEach(p => {
                if (p.x >= a && p.x <= b) {
                    const point = { x: p.x, y: evaluator(p.x) };
                    if (p.type === 'max') solution.relMax.push(point);
                    else solution.relMin.push(point);
                }
            });
        }

        // Absolute extrema
        const candidates = [
            { x: a, y: evaluator(a) }, { x: b, y: evaluator(b) },
            ...solution.relMin, ...solution.relMax
        ].filter(p => p.y !== null && isFinite(p.y));

        if (candidates.length > 0) {
            const yMin = Math.min(...candidates.map(p => p.y));
            const yMax = Math.max(...candidates.map(p => p.y));
            const eps = 1e-9;
            solution.absMin = candidates.filter(p => Math.abs(p.y - yMin) < eps);
            solution.absMax = candidates.filter(p => Math.abs(p.y - yMax) < eps);
        }
        return solution;
    }

    function addSolutionTraces(traces, solution) {
        if (solution.relMin.length) traces.push({ name: 'Mínimos relativos', x: solution.relMin.map(p=>p.x), y: solution.relMin.map(p=>p.y), mode: 'markers', type: 'scatter', marker: { color: 'blue', symbol: 'circle-open', size: 10 } });
        if (solution.relMax.length) traces.push({ name: 'Máximos relativos', x: solution.relMax.map(p=>p.x), y: solution.relMax.map(p=>p.y), mode: 'markers', type: 'scatter', marker: { color: 'red', symbol: 'circle-open', size: 10 } });
        const absPoints = [...solution.absMin, ...solution.absMax];
        if (absPoints.length) traces.push({ name: 'Extremos absolutos', x: absPoints.map(p=>p.x), y: absPoints.map(p=>p.y), mode: 'markers', type: 'scatter', marker: { color: 'green', symbol: 'diamond', size: 12 } });
    }

    function buildSolutionDescription(solution, interval) {
        const [a, b] = interval;
        const isCustom = state.currentFuncKey === CUSTOM_FUNC_KEY;
        const funcData = funcs[state.currentFuncKey];
        const funcTitle = isCustom ? `f(x) = ${dom.customInput.value}` : funcData.text;

        let html = `<strong>Función:</strong> ${funcTitle}<br>`;
        html += `<strong>Intervalo:</strong> [${a.toFixed(2)}, ${b.toFixed(2)}]<br><br>`;
        
        const relExtrema = [...solution.relMax, ...solution.relMin];
        if (relExtrema.length) {
            html += `<strong>Extremos relativos ${isCustom ? 'aprox.' : ''}:</strong><ul>`;
            relExtrema.forEach(p => {
                const type = solution.relMax.includes(p) ? 'max' : 'min';
                html += `<li>x ≈ ${p.x.toFixed(3)}, f(x) ≈ ${p.y.toFixed(3)} <span class="badge badge-${type}">${type === 'max' ? 'Máximo' : 'Mínimo'} relativo</span></li>`;
            });
            html += '</ul>';
        }

        html += `<strong>Extremos absolutos ${isCustom ? 'aprox.' : ''}:</strong><ul>`;
        solution.absMin.forEach(p => html += `<li>x ≈ ${p.x.toFixed(3)}, f(x) ≈ ${p.y.toFixed(3)} <span class="badge badge-min">Mínimo absoluto</span></li>`);
        solution.absMax.forEach(p => html += `<li>x ≈ ${p.x.toFixed(3)}, f(x) ≈ ${p.y.toFixed(3)} <span class="badge badge-max">Máximo absoluto</span></li>`);
        html += '</ul>';
        
        if (isCustom) {
            html += '<br><span class="hint">Los extremos para funciones personalizadas son aproximados.</span>';
        }
        return html;
    }
    
    function plotInitialView() {
        Plotly.newPlot(dom.graph, [], {
            title: 'Pulsa "Graficar" para ver la función',
            xaxis: { title: 'x', zeroline: true },
            yaxis: { title: 'f(x)', zeroline: true },
            margin: { l: 60, r: 20, t: 40, b: 60 }
        });
    }

    // 7. EVENT LISTENERS
    dom.funcSelect.addEventListener('change', (e) => {
        state.currentFuncKey = e.target.value;
        updateUIForCurrentFunction();
        getInterval();
        renderPlot();
    });

    dom.customInput.addEventListener('input', () => {
        if (state.currentFuncKey === CUSTOM_FUNC_KEY) {
            dom.funcText.textContent = `f(x) = ${dom.customInput.value || '...'}`;
        }
    });

    dom.plotButton.addEventListener('click', () => {
        getInterval();
        renderPlot();
    });

    dom.toggleSolutionButton.addEventListener('click', () => {
        state.showSolution = !state.showSolution;
        dom.toggleSolutionButton.textContent = state.showSolution ? 'Ocultar solución' : 'Mostrar solución';
        renderPlot();
    });
    
    [dom.intervalA, dom.intervalB].forEach(input => {
        input.addEventListener('change', () => {
            getInterval();
            renderPlot();
        });
    });


    // 8. INITIALIZATION
    function init() {
        populateFuncSelect();
        updateUIForCurrentFunction();
        plotInitialView();
    }

    init();
});