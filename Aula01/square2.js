// Código do vertex shader
const vertexShaderSource4 = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

// Código do fragment shader
const fragmentShaderSource4 = `
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

// Função para definir os vértices do quadrado
function squareVertices4(x, y, weight, height){
    return new Float32Array([
        x, y,
        x + weight, y,
        x + weight, y - height,
        x, y,
        x, y - height,
        x + weight, y - height
    ]);
}

// Função para definir as cores dos vértices do quadrado
function squareColors4(){
    let color = [Math.random(), Math.random(), Math.random(), 1.0];
    let colorValues = [];
    for(let i = 0; i < 6; i++){
        colorValues.push(...color);
    }
    return new Float32Array(colorValues);
}

// Função principal
function main4(){
    const canvas = document.getElementById('glCanvas4');
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

    // Obter os locais dos atributos
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    // Criar os buffers
    const VertexBuffer = gl.createBuffer();
    let vertices = [];
    const ColorBuffer = gl.createBuffer();
    let colors = [];

    // Definir a cor de fundo e limpar o canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Habilitar os atributos e ligar os buffers de vértices
    gl.enableVertexAttribArray(positionLocation);
    vertices = squareVertices4(-0.75, 0.0, 0.5, 0.5);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Habilitar os atributos e ligar os buffers de cor
    gl.enableVertexAttribArray(colorLocation);
    colors = squareColors4();
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    // Desenhar o quadrado
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Desenhar outro quadrado
    gl.enableVertexAttribArray(positionLocation);
    vertices = squareVertices4(0.25, 0.25, 0.5, 0.5);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Habilitar os atributos e ligar os buffers de cor
    gl.enableVertexAttribArray(colorLocation);
    colors = squareColors4();
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    // Desenhar o 2º quadrado
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

window.addEventListener('load', main4);

