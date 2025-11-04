const fontsConfig = {
    arial5: {
        letterspaceRate: 0.8,
        vscaleCorrection: 1.0,
        file: 'fonts/arial.ttf',
        default: true
    },
    helvetica5: {
        letterspaceRate: 0.85,
        vscaleCorrection: 0.9,
        file: 'fonts/helvetica.ttf'
    }
}

async function loadFonts() {
    let i = 0;
    for (const name of Object.keys(fontsConfig)) {
        i += 1;
        const fontConf = fontsConfig[name];
        const font = new FontFace(name, `url(${fontConf.file})`)
        document.fonts.add(font)
        await font.load()
    };
}


function createLineConfigElement() {
    function labelAndInput(labelText, input) {
        const div = document.createElement('div');
        const label = document.createElement('label');
        const inputID = Math.random();
        label.htmlFor = inputID;
        label.innerText = labelText;
        div.append(label);
        div.innerHTML += input;
        const inputElement = div.lastChild;
        inputElement.id = inputID;
        return div;
    }

    const wrap = document.createElement('div');
    wrap.append(labelAndInput('text', '<input class="text" type="text">'));
    const configWrap = document.createElement('div');

    configWrap.append(labelAndInput('color', '<input class="color" type="color">'));
    configWrap.append(labelAndInput('font', '<div class="font radio-row"></div>'));
    configWrap.append(labelAndInput('font size', '<input class="font-size" type="number" value=86>'));
    configWrap.append(labelAndInput('vertical scale(x)', '<input id="vscale" type="number" min="0" step="0.1" class="vscale" value="1.0">'));
    configWrap.append(labelAndInput('line spacing', '<input class="line-spacing" type="number" value=0>'));
    configWrap.append(labelAndInput('x shift', '<input class="x-shift" type="number" value=0>'));
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-button');
    removeButton.innerText = 'remove';
    removeButton.onclick = () => {
        wrap.remove();
    }
    configWrap.append(removeButton);

    const name = Math.random();
    let i = 0;
    for (const fontName of Object.keys(fontsConfig)) {
        i++;
        const fontConf = fontsConfig[fontName];
        configWrap.querySelector('.font').append(
            labelAndInput(`font${i}`, `<input type="radio" name="${name}" value="${fontName}" ${fontConf.default ? "checked" : ""}>`)
        );
    }
    wrap.append(configWrap);
    return wrap;
}


window.addEventListener('load', async () => {
    await loadFonts();

    const firstLineConfig = createLineConfigElement();
    firstLineConfig.querySelector('.line-spacing').parentElement.classList.add('display-none');
    firstLineConfig.querySelector('.x-shift').parentElement.classList.add('display-none');
    firstLineConfig.querySelector('.remove-button').classList.add('display-none');
    document.querySelector('.lines').append(firstLineConfig);

    const renderer = new LineTextMultiLineRenderer({
        canvas: document.querySelector('.main-canvas'),
        lines: [
            {
                text: 'deadmau5',
                font: '86px arial5',
                letterspaceRate: fontsConfig.arial5.letterspaceRate,
                vscale: 1.0,
                lineSpacing:0,
                xShift: 0,
                color: '#000'
            },
            {
                text: 'FONT GENERATOR',
                font: '74px helvetica5',
                letterspaceRate: fontsConfig.helvetica5.letterspaceRate,
                vscale: fontsConfig.helvetica5.vscaleCorrection,
                lineSpacing: 5,
                xShift: 0,
                color: '#0084cb'
            }
        ]
    })
    renderer.renderAll();
});

document.querySelector('.add-line').onclick = () => {
    const lineConfig = createLineConfigElement();
    document.querySelector('.lines').append(lineConfig);
}

document.querySelector('.draw-btn').onclick = () => {
    const canvas = document.querySelector('.main-canvas');

    const lines = document.querySelector('.lines').children;
    const linesConfig = [];
    for (const line of lines) {
        const text = line.querySelector('.text').value;
        const color = line.querySelector('.color').value;
        const font = line.querySelector('.font input[type="radio"]:checked').value;
        const fontSize = line.querySelector('.font-size').value;
        const vscale = line.querySelector('.vscale').value;
        const lineSpacing = line.querySelector('.line-spacing').value;
        const xShift = line.querySelector('.x-shift').value;

        linesConfig.push( {
            text: text,
            font: `${fontSize}px ${font}`,
            letterspaceRate: fontsConfig[font].letterspaceRate,
            vscale: Number(vscale) * fontsConfig[font].vscaleCorrection,
            lineSpacing: Number(lineSpacing),
            xShift: Number(xShift),
            color: color
        });
    }
    const options = {
        canvas: canvas,
        lines: linesConfig
    }
    const mode = document.querySelector('.mode-select input[type="radio"]:checked').value;
    let rendererCls;
    if (mode == 'line') {
        rendererCls = LineTextMultiLineRenderer;
    } else {
        rendererCls = CircleTextMultiLineRenderer;
        options.radius = Number(document.querySelector('.radius').value);
    }
    const renderer = new rendererCls(options);
    renderer.renderAll();


    document.querySelector('.download-img').src = canvas.toDataURL('image/png');
};

document.querySelector('.black-preview-toggle').addEventListener('change', e => {
    let color
    if (e.target.checked) {
        color = '#000000';
    } else {
        color = null;
    }
    document.querySelector('.main-canvas').style.backgroundColor = color;
});

document.querySelector('.mode-select').addEventListener('change', e => {
    const radiusInput = document.querySelector('.radius-input');
    if (e.target.value == 'circle') {
        radiusInput.style.display = 'block';
    } else {
        radiusInput.style.display = 'none';
    }
});