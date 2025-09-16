const vertexShaderSourceLines = `
    attribute vec2 a_position;
    void main(){
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const fragmentShaderSourceLines = `
    precision mediump float;
    void main(){
        gl_FragColor = vec4(0.5, 0.3, 1.0, 1.0);
    }
`;

function createShaderLines(gl, type, source){
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

function createProgramLines(gl, vertexShader, fragmentShader){
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('Erro ao vincular o programa:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function mainLines(){
    const canvas = document.getElementById('glCanvas7');
    const gl = canvas.getContext('webgl');

    if(!gl){
        console.error('WebGL não suportado');
        return;
    }

    const vertexShader = createShaderLines(gl, gl.VERTEX_SHADER, vertexShaderSourceLines);
    const fragmentShader = createShaderLines(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceLines);
    const program = createProgramLines(gl, vertexShader, fragmentShader);

    const vertices = new Float32Array([
        -0.8,  0.5,   0.0,  0.8,  // First line: top-left to center-right
        -0.5, -0.2,   0.5, -0.2,  // Second line: horizontal middle
         0.2, -0.8,   0.8,  0.0   // Third line: bottom-right to right-middle
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, 6);
}

window.addEventListener('load', mainLines);