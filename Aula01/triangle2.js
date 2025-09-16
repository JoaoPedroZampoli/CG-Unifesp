// Vertex shader program
const vertexShaderSource2 = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = a_Position;
        v_Color = a_Color;
    }
`;

// Fragment shader program
const fragmentShaderSource2 = `
    precision mediump float;
    varying vec4 v_Color;
    void main(){
        gl_FragColor = v_Color;
    }
`;

function createShader2(gl, type, source){
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

function main2(){
    const canvas = document.getElementById('glCanvas2');
    const gl = canvas.getContext('webgl');

    if(!gl){
        console.error('WebGL não suportado');
        return;
    }

    const vertexShader = createShader2(gl, gl.VERTEX_SHADER, vertexShaderSource2);
    const fragmentShader = createShader2(gl, gl.FRAGMENT_SHADER, fragmentShaderSource2);

    const program = createProgram2(gl, vertexShader, fragmentShader);
    
    // Definindo os vértices do triângulo
    const vertices = new Float32Array([
        0.0,  0.5,
       -0.5, -0.5,
        0.5, -0.5
    ]);

    // Criar buffer e carregar os dados dos vértices
    const VertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Pegando a localização do atributo a_Position no shader
    const positionLocation = gl.getAttribLocation(program, 'a_Position');

    // Definindo as cores para cada vértice
    const colors = new Float32Array([
        1.0, 0.0, 0.0, 1.0, // Vermelho
        0.0, 1.0, 0.0, 1.0, // Verde
        0.0, 0.0, 1.0, 1.0  // Azul
    ]);

    // Criar buffer e carregar os dados das cores
    const ColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // Pegando a localização do atributo a_Color no shader
    const colorLocation = gl.getAttribLocation(program, 'a_Color');

    // Configurações de viewport e limpeza do canvas
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Usar o programa de shader
    gl.useProgram(program);

    // Habilitar os atributos e ligar os buffers
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Habilitar os atributos e ligar os buffers de cor
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    // Desenhar o triângulo
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

window.addEventListener('load', main2);