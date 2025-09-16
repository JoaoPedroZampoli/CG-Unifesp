// Código do vertex shader
const vertexShaderSource1 = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

// Código do fragment shader
const fragmentShaderSource1 = `
    precision mediump float;
    void main(){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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
function createProgram1(gl, vertexShader, fragmentShader){
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

// Função principal
function main1(){
    const canvas = document.getElementById('glCanvas1');
    const gl = canvas.getContext('webgl');
    if(!gl){
        console.error('WebGL não suportado');
        return;
    }

    // Criar e compilar os shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource1);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource1);
    const program = createProgram1(gl, vertexShader, fragmentShader);
    const vertices = new Float32Array([
        0.0,  0.5,
       -0.5, -0.5,
        0.5, -0.5
    ]);

    // Criar buffer e carregar os dados dos vértices
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Obter Localização do atributo
    const positionLocation = gl.getAttribLocation(program, "a_position");

    // Configurar Viewport e limpar a cor
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Usar o programa de shader
    gl.useProgram(program);

    // Habilitar e setar a posição dos atributos
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Desenhar o triângulo
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Carregar a função principal quando a página carrega
window.addEventListener('load', main1);