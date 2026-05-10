        // Shared logical canvas and render constants.
        // Render Configuration
        const LOGICAL_W = 750;
        const LOGICAL_H = 1000;
        const HUD_HEIGHT = 48;
        const HUD_BAR_BLOCKS = 20;
        const CANVAS_BORDER = 2;
        let width = LOGICAL_W;
        let height = LOGICAL_H;
        let charW = 0, charH = 0;
        const FONT_SIZE = 14;
        let hudWeaponCellSize = 14;
        let canvasRenderScale = 1;

        function setCanvasBaseTransform(targetCtx) {
            const target = targetCtx || ctx;
            const scale = Number.isFinite(canvasRenderScale) ? Math.max(1, canvasRenderScale) : 1;
            target.setTransform(scale, 0, 0, scale, 0, 0);
        }
