// Código do vertex shader
const vertexShaderSource4= `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_Position;
        v_color = a_Color;
    }
`;

// Código do fragment shader
const fragmentShaderSource4 = `
    precision mediump float;
    varying vec4 v_color;
    void main(){
        gl_FragColor = v_color;
    }
`;

// Função para criar e compilar um shader
function createShader(gl, type, source){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.error('Erro ao compilar o shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Função para criar um programa de shader
function createProgram4(gl, vertexShader, fragmentShader){
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('Erro ao linkar o programa:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function figureVertices4(){
    const vertices = [];
    vertices.push(0.0, 0.0); // Centro da figura
    
    // Cálculo das vértices
    const radius = 0.1;
    const numSides = 100;

    for(let i = 0; i <= numSides; i++){
        const angle = i * 2 * Math.PI / numSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x,y)
    }
    return new Float32Array(vertices);
}

function figureColors4(red, green, blue, alpha, figureSides){
    const colors = [];
    for (let i = 0; i <= figureSides; i++){
        colors.push(red, green, blue, alpha);
    }
    return new Float32Array(colors);
}

function stemVertices4(){
    return new Float32Array([
        -0.025, -0.9,
        0.025, -0.9,
        0.025, -0.1,
        -0.025, -0.1
    ]);
}

function pinwheelTipsVertices(centerX, centerY){
    const vertices = [];
    const tipAngle = Math.atan2(centerY, centerX);
    const tipLength = 0.38; // comprimento da ponta
    const baseLength = 0.28; // largura da base da ponta
    const baseAngleOffset = Math.PI / 5; // abertura da base

    // Vértice do centro (origem do catavento)
    vertices.push(0.0, 0.0);

    // Vértice da ponta (externa)
    vertices.push(
        centerX + tipLength * Math.cos(tipAngle),
        centerY + tipLength * Math.sin(tipAngle)
    );

    // Vértice lateral 1
    vertices.push(
        centerX + baseLength * Math.cos(tipAngle + baseAngleOffset),
        centerY + baseLength * Math.sin(tipAngle + baseAngleOffset)
    );

    // Vértice lateral 2
    vertices.push(
        centerX + baseLength * Math.cos(tipAngle - baseAngleOffset),
        centerY + baseLength * Math.sin(tipAngle - baseAngleOffset)
    );
    return new Float32Array(vertices);
}

// Função principal
function main4(){
    const canvas = document.getElementById('CataventoCanvas');
    const gl = canvas.getContext('webgl');
    if(!gl){
        console.error('WebGL não suportado');
        return;
    }
    // Criar e compilar os shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource4);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource4);
    const program = createProgram4(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    let vertices = [];

    const buffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, 'a_Position');
    const colorLocation = gl.getAttribLocation(program, 'a_Color');

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);

    // Desenhando o centro do catavento
    vertices = Array.from(figureVertices4());
    const colors = Array.from(figureColors4(1.0, 1.0, 1.0, 1.0, 102));
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.concat(colors)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, vertices.length * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 102);

    // Desenhando a haste
    vertices = Array.from(stemVertices4());
    const stemColors = Array.from(figureColors4(0.0, 0.5, 0.5, 1.0, 4));
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.concat(stemColors)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, vertices.length * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Desenhando as pontas do catavento
    const numTips = 8; // Número de pontas
    const tipDistance = 0.20; // Distância do centro do catavento

    for(let i = 0; i < numTips; i++){
        const angle = i * 2 * Math.PI / numTips;
        const tipX = tipDistance * Math.cos(angle);
        const tipY = tipDistance * Math.sin(angle);

        vertices = Array.from(pinwheelTipsVertices(tipX, tipY));
        // const tipColors = Array.from(figureColors4(1.0, 0.0, 0.0, 1.0, 22));  -- Todo vermelho
        const r = Math.abs(Math.sin((3 * Math.PI * i) / numTips));
        const g = Math.abs(Math.sin((3 * Math.PI * i) / numTips + 2));
        const b = Math.abs(Math.sin((3 * Math.PI * i) / numTips + 4));
        const tipColors = [];
        for (let v = 0; v < 4; v++) { // 4 vértices por aba
            tipColors.push(r, g, b, 1.0);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.concat(tipColors)), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, vertices.length * Float32Array.BYTES_PER_ELEMENT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    
}

window.addEventListener('load', main4);