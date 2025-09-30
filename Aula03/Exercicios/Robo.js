// Código do vertex shader com matriz de transformação
const vertexShaderSource1 = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat3 u_matrix;
    varying vec4 v_color;
    void main() {
        vec2 position = (u_matrix * vec3(a_position.xy, 1)).xy;
        gl_Position = vec4(position, 0, 1);
        v_color = a_color;
    }
`;

// Código do fragment shader
const fragmentShaderSource1 = `
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

function squareVertices1(x, y, width, height){
    return new Float32Array([
        x, y,
        x + width, y,
        x + width, y - height,
        x, y,
        x, y - height,
        x + width, y - height
    ]);
}

function squareColors(red, green, blue, alpha){
    let colorValues = [];
    for(let i = 0; i < 6; i++){
        colorValues.push(red, green, blue, alpha);
    }
    return new Float32Array(colorValues);
}

// Função principal
function main1(){
    const canvas = document.getElementById('RoboCanvas');
    const gl = canvas.getContext('webgl');
    if(!gl){
        console.error('WebGL não suportado');
        return;
    }

    // Criar e compilar os shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource1);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource1);
    const program = createProgram1(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Criar buffers para todas as partes do robô juntas
    let vertices = [];
    let colors = [];

    // Corpo
    vertices = vertices.concat(Array.from(squareVertices1(-0.2, 0.5, 0.4, 0.6)));
    colors = colors.concat(Array.from(squareColors(0.05, 0.32, 0.55, 1.0)));

    // Cabeça
    vertices = vertices.concat(Array.from(squareVertices1(-0.15, 0.75, 0.3, 0.3)));
    colors = colors.concat(Array.from(squareColors(0.64, 0.64, 0.64, 1.0)));

    // Braço esquerdo
    vertices = vertices.concat(Array.from(squareVertices1(-0.35, 0.4, 0.15, 0.4)));
    colors = colors.concat(Array.from(squareColors(0.64, 0.64, 0.64, 1.0)));

    // Braço direito
    vertices = vertices.concat(Array.from(squareVertices1(0.2, 0.4, 0.15, 0.4)));
    colors = colors.concat(Array.from(squareColors(0.64, 0.64, 0.64, 1.0)));

    // Perna esquerda
    vertices = vertices.concat(Array.from(squareVertices1(-0.2, -0.1, 0.15, 0.4)));
    colors = colors.concat(Array.from(squareColors(0.64, 0.64, 0.64, 1.0)));

    // Perna direita
    vertices = vertices.concat(Array.from(squareVertices1(0.05, -0.1, 0.15, 0.4)));
    colors = colors.concat(Array.from(squareColors(0.64, 0.64, 0.64, 1.0)));

    // Olho esquerdo
    vertices = vertices.concat(Array.from(squareVertices1(-0.1, 0.65, 0.05, 0.05)));
    colors = colors.concat(Array.from(squareColors(1.0, 1.0, 1.0, 1.0)));

    // Olho direito
    vertices = vertices.concat(Array.from(squareVertices1(0.05, 0.65, 0.05, 0.05)));
    colors = colors.concat(Array.from(squareColors(1.0, 1.0, 1.0, 1.0)));

    // Boca
    vertices = vertices.concat(Array.from(squareVertices1(-0.05, 0.55, 0.1, 0.06)));
    colors = colors.concat(Array.from(squareColors(1.0, 1.0, 1.0, 1.0)));

    // Configurar buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);

    // Variável de tempo para animação
    let time = 0;

    function animate() {
        // Incrementar tempo
        time += 0.1;

        gl.clear(gl.COLOR_BUFFER_BIT);
        let walkOffset = Math.sin(time) * 0.05; // Amplitude pequena
        let matrix = m3.translation(0, walkOffset);

        // Aplicar matriz aos shaders
        gl.uniformMatrix3fv(matrixLocation, false, matrix);

        // Configurar atributos de posição
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Configurar atributos de cor
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

        // Desenhar o robô inteiro
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

        requestAnimationFrame(animate);
    }

    // Iniciar animação
    animate();
}

window.addEventListener('load', main1);