// Código do vertex shader
const vertexShaderSource3 = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

// Código do fragment shader
const fragmentShaderSource3 = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
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
function createProgram3(gl, vertexShader, fragmentShader){
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

function squareVertices3(){
    return new Float32Array([
        -0.5,  0.5,
         0.5,  0.5,
         0.5, -0.5,
        -0.5, -0.5,
        -0.5,  0.5,
         0.5, -0.5
    ]);
}

function squareColors(){
    // Cores RGBA para cada vértice
    let color = [Math.random(), Math.random(), Math.random(), 1.0];
    let colorValues = [];
    for(let i = 0; i < 6; i++){
        colorValues.push(color[0], color[1], color[2], color[3]);
    }
    return new Float32Array(colorValues);
}

function main3(){
    const canvas = document.getElementById('glCanvas3');
    const gl = canvas.getContext('webgl');

    if(!gl){
        console.error('WebGL não suportado');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource3);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource3);
    const program = createProgram3(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    const ColorBuffer = gl.createBuffer();

    let vertices = [];
    let colors = [];

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(positionLocation);
    vertices = squareVertices3();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorLocation);
    colors = squareColors();
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

window.addEventListener('load', main3);
