// Código do vertex shader
const vertexShaderSource3= `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat3 u_matrix;
    varying vec4 v_color;
    void main() {
        vec2 position = (u_matrix * vec3(a_Position.xy, 1)).xy;
        gl_Position = vec4(position, 0, 1);
        v_color = a_Color;
    }
`;

// Código do fragment shader
const fragmentShaderSource3 = `
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

function figureVertices2(centerX, centerY){
    const vertices = [];
    vertices.push(centerX, centerY); // Centro da figura
    
    // Cálculo dos vértices
    const radius = 0.125;
    const numSides = 100;

    for(let i = 0; i <= numSides; i++){
        const angle = i * 2 * Math.PI / numSides;
        const x = centerX + radius * Math.cos(angle); // Uso de centerX + offset
        const y = centerY + radius * Math.sin(angle); // Uso de centerY + offset
        vertices.push(x, y);
    }
    return new Float32Array(vertices);
}

function figureColors(red, green, blue, alpha, figureSides){
    const colors = [];
    for (let i = 0; i < figureSides; i++){
        colors.push(red, green, blue, alpha);
    }
    return new Float32Array(colors);
}

// Função principal
function main3(){
    const canvas = document.getElementById('CarroCanvas');
    const gl = canvas.getContext('webgl');
    if(!gl){
        console.error('WebGL não suportado');
        return;
    }

    // Criar e compilar os shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource3);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource3);
    const program = createProgram3(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_Position');
    const colorLocation = gl.getAttribLocation(program, 'a_Color');
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

    // Criar buffers para os vértices e cores
    const VertexBuffer = gl.createBuffer();
    const ColorBuffer = gl.createBuffer();

    let vertices = [];
    let colors = [];

    // Desenhar o corpo do carro
    const carBody = squareVertices1(-0.5, 0.0, 1.0, 0.4);
    vertices = vertices.concat(Array.from(carBody));
    colors = colors.concat(Array.from(figureColors(1.0, 0.0, 0.0, 1.0, 6)));

    const carTop = squareVertices1(-0.3, 0.25, 0.6, 0.25);
    vertices = vertices.concat(Array.from(carTop));
    colors = colors.concat(Array.from(figureColors(0.2, 0.5, 0.6, 1.0, 6)));

    // Desenhar lanternas do carro
    const leftLight = squareVertices1(-0.5, -0.1, 0.1, 0.1);
    vertices = vertices.concat(Array.from(leftLight));
    colors = colors.concat(Array.from(figureColors(1.0, 1.0, 0.0, 1.0, 6)));
    
    const rightLight = squareVertices1(0.45, -0.1, 0.05, 0.1);
    vertices = vertices.concat(Array.from(rightLight));
    colors = colors.concat(Array.from(figureColors(1.0, 1.0, 1.0, 1.0, 6)));

    // Desenhar rodas do carro usando TRIANGLE_FAN
    const wheel1 = figureVertices2(-0.3, -0.5);
    const wheel2 = figureVertices2(0.3, -0.5);
    
    vertices = vertices.concat(Array.from(wheel1));
    colors = colors.concat(Array.from(figureColors(0.6, 0.6, 0.6, 1.0, 102)));
    
    vertices = vertices.concat(Array.from(wheel2));
    colors = colors.concat(Array.from(figureColors(0.6, 0.6, 0.6, 1.0, 102)));

    // Configurar buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Variáveis de animação
    let carX = -1.5; // Posição inicial fora da tela à esquerda
    let wheelRotation = 0;
    let bounceOffset = 0;
    let direction = 1; // 1 para direita, -1 para esquerda
    const carSpeed = 0.01;
    const wheelSpeed = 0.1;
    const bounceSpeed = 0.05;
    const bounceAmount = 0.02;

    function animate() {
        // Movimento horizontal do carro
        carX += carSpeed * direction;
        
        // Inverter direção quando chegar nas bordas
        if (carX > 1.5) {
            direction = -1;
        } else if (carX < -1.5) {
            direction = 1;
        }
        
        // Rotação das rodas
        wheelRotation += wheelSpeed * direction;
        
        // Efeito de "quique" sutil
        bounceOffset = Math.sin(Date.now() * bounceSpeed * 0.01) * bounceAmount;

        // Criar matriz de transformação
        let matrix = m3.identity();
        
        // Aplicar transformações na ordem: translação horizontal, translação vertical (bounce), escala para direção
        matrix = m3.translate(matrix, carX, bounceOffset);
        matrix = m3.scale(matrix, direction, 1); // Espelhar quando indo para esquerda

        // Aplicar matriz ao shader
        gl.uniformMatrix3fv(matrixLocation, false, matrix);

        // Limpar tela
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Desenhar o carro
        gl.drawArrays(gl.TRIANGLES, 0, 12);  // Corpo do carro
        gl.drawArrays(gl.TRIANGLES, 12, 6);  // Lanterna esquerda
        gl.drawArrays(gl.TRIANGLES, 18, 6);  // Lanterna direita
        
        // Para as rodas, aplicar rotação adicional
        let wheelMatrix = m3.multiply(matrix, m3.translation(-0.3, -0.5));
        wheelMatrix = m3.multiply(wheelMatrix, m3.rotation(wheelRotation));
        wheelMatrix = m3.multiply(wheelMatrix, m3.translation(0.3, 0.5));
        
        gl.uniformMatrix3fv(matrixLocation, false, wheelMatrix);
        gl.drawArrays(gl.TRIANGLE_FAN, 24, 102);  // Primeira roda
        
        wheelMatrix = m3.multiply(matrix, m3.translation(0.3, -0.5));
        wheelMatrix = m3.multiply(wheelMatrix, m3.rotation(wheelRotation));
        wheelMatrix = m3.multiply(wheelMatrix, m3.translation(-0.3, 0.5));
        
        gl.uniformMatrix3fv(matrixLocation, false, wheelMatrix);
        gl.drawArrays(gl.TRIANGLE_FAN, 126, 102); // Segunda roda

        requestAnimationFrame(animate);
    }

    // Iniciar animação
    animate();
}

window.addEventListener('load', main3);