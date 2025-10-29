class TextRendererBase {
    constructor({canvas, text, font, color, letterspaceRate, vscale, ...kwargs}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.text = text;
        this.font = font;
        this.color = color;
        this.letterspaceRate = letterspaceRate;
        this.vscale = vscale;
        this.data = kwargs;

        this.setFont();
        this.ctx.textBaseline = 'alphabetic';
        const canvasSize = this.calcCanvasSize();
        this.setSize(canvasSize.width, canvasSize.height);
        this.ctx.save();
        this.ctx.fillStyle = this.color;
    }

    setFont() {
        this.ctx.font = this.font;
    }

    setSize(w = null, h = null) {
        if (w !== null) {
            this.canvas.width = w;
        }
        if (h !== null) {
            this.canvas.height = h;
        }
        this.setFont();
    }

    getMetrics() {
        return this.ctx.measureText(this.text);
    }

    render() {
        for (const c of this.text) {
            this.renderCharacter(c);
        }
    }

    calcCanvasSize() {
        // overrride
    }

    renderCharacter(c) {
        // override
    }
}

class CircleTextRenderer extends TextRendererBase {
    constructor({...kwargs}) {
        super(kwargs);

        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'center';
        this.currentAngle = 0;
    }

    calcCanvasSize() {
        const metrics = this.getMetrics();
        const height = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * this.vscale;
        const length = (this.data.radius + height) * 2;
        return { width: length, height: length };
    }

    renderCharacter(c) {
        const ctx = this.ctx;
        const chmetrics = ctx.measureText(c);
        const chWidth = chmetrics.width * this.letterspaceRate;
        const theta = chWidth / this.data.radius;

        ctx.rotate(theta / 2);

        ctx.save();
        ctx.translate(0, -this.data.radius);
        ctx.scale(1, this.vscale);
        ctx.fillText(c, 0, 0);
        ctx.restore();

        ctx.rotate(theta / 2);
    }
}


class LineTextRenderer extends TextRendererBase {
    constructor({...kwargs}) {
        super(kwargs);

        this.ctx.scale(1, this.vscale);
        this.currentX = 0;
        this.currentY = this.getMetrics().actualBoundingBoxAscent;
    }

    calcCanvasSize() {
        const metrics = this.getMetrics();
        const height = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)*this.vscale;
        const fullWidth = metrics.width;
        let width = fullWidth;
        this.setSize(fullWidth, height);
        Array.from(this.text).slice(0, -1).forEach(c => {
            const chmetrics = this.ctx.measureText(c);
            width -= chmetrics.width * (1 - this.letterspaceRate);
        })

        return {
            width: width,
            height: height
        }
    }

    renderCharacter(c) {
        const chmetrics = this.ctx.measureText(c);
        this.ctx.fillText(c, this.currentX, this.currentY);
        this.currentX += chmetrics.width * this.letterspaceRate;
    }
}