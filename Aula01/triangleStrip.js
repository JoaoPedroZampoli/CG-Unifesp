const vertexShaderSourceTStrip = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSourceTStrip = `
    precision mediump float;
    void main(){
        gl_FragColor = vec4(0.5, 1.0, 0.0, 1.0);
    }
`;

function createShaderTStrip(gl, type, source){
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

function createProgramTStrip(gl, vertexShader, fragmentShader){
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Erro ao vincular o programa:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function mainTStrip(){
    const canvas = document.getElementById('glCanvas6');
    const gl = canvas.getContext('webgl');

    if(!gl){
        console.error('WebGL não suportado');
        return;
    }

    const vertexShader = createShaderTStrip(gl, gl.VERTEX_SHADER, vertexShaderSourceTStrip);
    const fragmentShader = createShaderTStrip(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceTStrip);
    const program = createProgramTStrip(gl, vertexShader, fragmentShader);

    const vertices = new Float32Array([
        -0.8,  0.2,  // 0: Top-left
        -0.8, -0.2,  // 1: Bottom-left
        -0.4,  0.4,  // 2: Top-center-left
        -0.4, -0.4,  // 3: Bottom-center-left
         0.0,  0.2,  // 4: Top-center
         0.0, -0.2,  // 5: Bottom-center
         0.4,  0.4,  // 6: Top-center-right
         0.4, -0.4,  // 7: Bottom-center-right
         0.8,  0.2,  // 8: Top-right
         0.8, -0.2   // 9: Bottom-right
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

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);
}

window.addEventListener('load', mainTStrip);

