// Código do vertex shader
const vertexShaderSource2= `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_Position;
        v_color = a_Color;
    }
`;

// Código do fragment shader
const fragmentShaderSource2 = `
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
function createProgram2(gl, vertexShader, fragmentShader){
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

function figureVertices(){
    const vertices = [];
    vertices.push(0.0, 0.0); // Centro da figura
    
    // Cálculo das vértices
    const radius = 0.2;
    const numSides = 100;

    for(let i = 0; i <= numSides; i++){
        const angle = i * 2 * Math.PI / numSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x,y)
    }
    return new Float32Array(vertices);
}

function figureColors(red, green, blue, alpha, figureSides){
    const colors = [];
    for (let i = 0; i <= figureSides; i++){
        colors.push(red, green, blue, alpha);
    }
    return new Float32Array(colors);
}

function stemVertices(){
    return new Float32Array([
        -0.025, -0.7,
        0.025, -0.7,
        0.025, -0.2,
        -0.025, -0.2
    ]);
}

function petalsVertices(centerX, centerY){
    const vertices = [];
    vertices.push(centerX, centerY); // Centro da pétala
    
    const radius = 0.1;
    const numSides = 20;

    for(let i = 0; i <= numSides; i++){
        const angle = i * 2 * Math.PI / numSides;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        vertices.push(x, y);
    }
    return new Float32Array(vertices);
}

// Função principal
function main2(){
    const canvas = document.getElementById('FlorCanvas');
    const gl = canvas.getContext('webgl');
    if(!gl){
        console.error('WebGL não suportado');
        return;
    }
    // Criar e compilar os shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource2);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource2);
    const program = createProgram2(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    let vertices = [];

    const buffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, 'a_Position');
    const colorLocation = gl.getAttribLocation(program, 'a_Color');

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);

    // Desenhando o centro da flor
    vertices = Array.from(figureVertices());
    const colors = Array.from(figureColors(1.0, 0.86, 0.07, 1.0, 102));
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.concat(colors)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, vertices.length * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 102);

    // Desenhando a haste
    vertices = Array.from(stemVertices());
    const stemColors = Array.from(figureColors(0.0, 0.5, 0.0, 1.0, 4));
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.concat(stemColors)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, vertices.length * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Desenhando as pétalas
    const numPetals = 8; // Número de pétalas
    const petalDistance = 0.20; // Distância do centro da flor

    for(let i = 0; i < numPetals; i++){
        const angle = i * 2 * Math.PI / numPetals;
        const petalX = petalDistance * Math.cos(angle);
        const petalY = petalDistance * Math.sin(angle);
        
        vertices = Array.from(petalsVertices(petalX, petalY));
        const petalColors = Array.from(figureColors(1.0, 0.0, 0.0, 1.0, 22));
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.concat(petalColors)), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, vertices.length * Float32Array.BYTES_PER_ELEMENT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 22);
    }
    
}

window.addEventListener('load', main2);