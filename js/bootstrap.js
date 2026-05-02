        // DOM and canvas bootstrap references.
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        const hud = document.getElementById('hud');
        const fpsElement = document.getElementById('fps-val');
        const fpsLowPerf = document.getElementById('fps-low-perf');
        const statsPanel = document.getElementById('stats-panel');
