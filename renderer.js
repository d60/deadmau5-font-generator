class MultilineRendererBase {
    constructor({canvas, lines, ...kwargs}) {
        this.canvas = canvas;
        this.lines = lines;
        this.data = kwargs;
        this.ctx = canvas.getContext('2d');
        this.ctx.textBaseline = 'alphabetic';
    }

    setSizeAndFont(width = null, height = null, font = null) {
        if (width !== null) {
            this.canvas.width = width;
        }
        if (height !== null) {
            this.canvas.height = height;
        }
        if (font !== null) {
            this.ctx.font = font;
        }
    }

    setFont(font) {
        this.ctx.font = font;
    }
}


class CircleTextMultiLineRenderer extends MultilineRendererBase {
    constructor({...kwargs}) {
        super(kwargs)
    }

    calcCanvasSize() {
        this.ctx.save();
        const firstLine = this.lines[0];
        this.setFont(firstLine.font);
        const metrics = this.ctx.measureText(firstLine.text);
        const height = (metrics.actualBoundingBoxAscent) * firstLine.vscale;
        const length = (this.data.radius + height) * 2;
        return { width: length, height: length };
    }

    renderLine(line, y) {
        // r = r_0 - y
        this.setFont(line.font);
        this.ctx.fillStyle = line.color;

        const metrics = this.ctx.measureText(line.text);
        y += line.lineSpacing;
        const radius = this.data.radius - y;

        let theta = line.xShift / radius;

        for (const c of line.text) {
            this.ctx.save()
            const chmetrics = this.ctx.measureText(c);
            const chWidth = chmetrics.width * line.letterspaceRate;
            const deltaTheta = chWidth / radius;

            this.ctx.rotate(theta + deltaTheta / 2);

            this.ctx.translate(0, -radius);
            this.ctx.scale(1, line.vscale);
            this.ctx.fillText(c, 0, 0);

            theta += deltaTheta;
            this.ctx.restore()
        }

        y += (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)*line.vscale + line.lineSpacing;
        return y
    }

    renderAll() {
        const canvasSize = this.calcCanvasSize();
        this.setSizeAndFont(canvasSize.width, canvasSize.height);

        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'center';

        this.setFont(this.lines[0].font);
        let y = 0
        for (const line of this.lines) {
            y = this.renderLine(line, y)
        }
    }
}


class LineTextMultiLineRenderer extends MultilineRendererBase {
    constructor({...kwargs}) {
        super(kwargs)
    }

    measureLineSize(line) {
        this.ctx.save();
        this.ctx.scale(1, line.vscale);
        this.setFont(line.font);

        const metrics = this.ctx.measureText(line.text);
        const height = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)*line.vscale;
        const fullWidth = metrics.width;
        let width = fullWidth;
        this.setSizeAndFont(fullWidth, height, line.font);
        Array.from(line.text).slice(0, -1).forEach(c => {
            const chmetrics = this.ctx.measureText(c);
            width -= chmetrics.width * (1 - line.letterspaceRate);
        });
        this.ctx.restore();
        return {
            width: width,
            height: height
        }
    }

    calcCanvasSize() {
        const firstLineSize = this.measureLineSize(this.lines[0]);
        const baseXLeft = 0;
        const baseXRight = firstLineSize.width;
        let xMin = baseXLeft;
        let xMax = baseXRight;
        let height = firstLineSize.height;
        for (const line of this.lines.slice(1)) {
            const lineSize = this.measureLineSize(line);
            const xLeft = line.xShift;
            const xRight = xLeft + lineSize.width;

            if (xLeft < xMin) {
                xMin = xLeft;
            }
            if (xMax < xRight) {
                xMax = xRight;
            }
            height += lineSize.height + line.lineSpacing;
        }
        const baseX = -xMin;
        const width = xMax - xMin;

        return {
            baseX: baseX,
            width: width,
            height: height
        }
    }

    renderLine(line, y) {
        this.setFont(line.font);
        this.ctx.fillStyle = line.color;

        let x = line.xShift;
        const metrics = this.ctx.measureText(line.text);

        y += line.lineSpacing + (metrics.actualBoundingBoxAscent)*line.vscale

        for (const c of line.text) {
            const chmetrics = this.ctx.measureText(c);
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.scale(1, line.vscale);
            this.ctx.fillText(c, 0, 0);
            this.ctx.restore();
            x += chmetrics.width * line.letterspaceRate;
        }
        y += metrics.actualBoundingBoxDescent*line.vscale
        return y;
    }

    renderAll() {
        const canvasSize = this.calcCanvasSize();
        this.setSizeAndFont(canvasSize.width, canvasSize.height);
        this.ctx.translate(canvasSize.baseX, 0);

        let y = 0;
        for (const line of this.lines) {
            y = this.renderLine(line, y)
        }
    }
}
