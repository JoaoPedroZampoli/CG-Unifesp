// Vertex shader source code
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_viewingMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        gl_Position = u_projectionMatrix * u_viewingMatrix * u_modelViewMatrix * vec4(a_position,1.0);
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderSource = `
    precision mediump float;
    varying vec3 v_color;
    void main() {
        gl_FragColor = vec4(v_color,1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function setCubeVertices(side){
  let v = side/2;
  return new Float32Array([
      // Front
      v, v, v,
      v, -v, v,
      -v, v, v,
      -v, v, v,
      v, -v, v,
      -v, -v, v,
  
      // Left
      -v, v, v,
      -v, -v, v,
      -v, v, -v,
      -v, v, -v,
      -v, -v, v,
      -v, -v, -v,
  
      // Back
      -v, v, -v,
      -v, -v, -v,
      v, v, -v,
      v, v, -v,
      -v, -v, -v,
      v, -v, -v,
  
      // Right
      v, v, -v,
      v, -v, -v,
      v, v, v,
      v, v, v,
      v, -v, v,
      v, -v, -v,
  
      // Top
      v, v, v,
      v, v, -v,
      -v, v, v,
      -v, v, v,
      v, v, -v,
      -v, v, -v,
  
      // Bottom
      v, -v, v,
      v, -v, -v,
      -v, -v, v,
      -v, -v, v,
      v, -v, -v,
      -v, -v, -v,
  ]);
}

function setCubeColors(){
  let colors = [];
  let color = [];
  for(let i=0;i<6;i++){
    color = [Math.random(),Math.random(),Math.random()];
    for(let j=0;j<6;j++)
      colors.push(...color);
  }

  return new Float32Array(colors);
}

function setGroundPlane(size){
  let s = size/2;
  return new Float32Array([
      s, -1.0, s,
      s, -1.0, -s,
      -s, -1.0, s,
      -s, -1.0, s,
      s, -1.0, -s,
      -s, -1.0, -s,
  ]);
}

function setGroundPlaneColors(){
  let colors = [];
  let color = [0.6,0.6,0.6];
  for(let i=0;i<6;i++)
    colors.push(...color);
  return new Float32Array(colors);
}

function defineCoordinateAxes(){
    return new Float32Array([
      // X axis
      -5.0, 0.0, 0.0,
      5.0, 0.0, 0.0,
      // Y axis
      0.0, -5.0, 0.0,
      0.0, 5.0, 0.0,
      // Z axis
      0.0, 0.0, -5.0,
      0.0, 0.0, 5.0,
    ]);
}

function defineCoordinateAxesColors(){
    return new Float32Array([
      // X axis
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      // Y axis
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      // Z axis
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
    ]);
}

function main() {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL não suportado');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    const ColorBuffer = gl.createBuffer();
    
    const modelViewMatrixUniformLocation = gl.getUniformLocation(program,'u_modelViewMatrix');
    const viewingMatrixUniformLocation = gl.getUniformLocation(program,'u_viewingMatrix');
    const projectionMatrixUniformLocation = gl.getUniformLocation(program,'u_projectionMatrix');

    let cubeVertices = setCubeVertices(1.0);
    let cubeColors = setCubeColors();
    let groundPlaneVertices = setGroundPlane(10.0);
    let groundPlaneColors = setGroundPlaneColors();
    let coordinateAxes = defineCoordinateAxes();
    let coordinateAxesColors = defineCoordinateAxesColors();

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    let cameraPosition = [0.0, 2.0, 5.0];
    let cameraYRotation = 0.0;
    let cameraXRotation = 0.0;
    let cameraPitch = 0.0;

    let fov = 60.0;
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let near = 0.1;
    let far = 100.0;

    function updateProjectionMatrix() {
        let top = near * Math.tan(degToRad(fov) / 2);
        let bottom = -top;
        let right = top * aspect;
        let left = -right;
        
        console.log('Atualizando projeção:');
        console.log('FOV:', fov, '° | Near:', near, '| Far:', far);
        console.log('Window: L:', left.toFixed(2), 'R:', right.toFixed(2), 'B:', bottom.toFixed(2), 'T:', top.toFixed(2));
        
        return m4.setPerspectiveProjectionMatrix(left, right, bottom, top, near, far);
    }

    let projectionMatrix = updateProjectionMatrix();

    const fovSlider = document.getElementById('fov');
    const fovValue = document.getElementById('fovValue');
    const nearSlider = document.getElementById('near');
    const nearValue = document.getElementById('nearValue');
    const farSlider = document.getElementById('far');
    const farValue = document.getElementById('farValue');

    fovSlider.addEventListener('input', (e) => {
        fov = parseFloat(e.target.value);
        fovValue.textContent = fov;
        projectionMatrix = updateProjectionMatrix();
    });
    
    nearSlider.addEventListener('input', (e) => {
        near = parseFloat(e.target.value);
        nearValue.textContent = near.toFixed(2);
        projectionMatrix = updateProjectionMatrix();
    });
    
    farSlider.addEventListener('input', (e) => {
        far = parseFloat(e.target.value);
        farValue.textContent = far;
        projectionMatrix = updateProjectionMatrix();
    });
    
// Controles do teclado
    let keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Controle do mouse para rotação
    let mouseDown = false;
    let lastMouseX = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            let deltaX = e.clientX - lastMouseX;
            let deltaY = e.clientY - lastMouseY;

            cameraYRotation += deltaX * 0.3;
            cameraXRotation -= deltaY * 0.3;

            cameraXRotation = Math.max(-89, Math.min(89, cameraXRotation));

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    function updateCamera() {
        let moveSpeed = 0.1;
        
        let forward = [
            Math.sin(degToRad(cameraYRotation)) * Math.cos(degToRad(cameraXRotation)),
            Math.sin(degToRad(cameraXRotation)),
            -Math.cos(degToRad(cameraYRotation)) * Math.cos(degToRad(cameraXRotation))
        ];
        
        let right = [
            Math.cos(degToRad(cameraYRotation)),
            0,
            Math.sin(degToRad(cameraYRotation))
        ];
        
        // W - Frente
        if (keys['w']) {
            cameraPosition[0] += forward[0] * moveSpeed;
            cameraPosition[2] += forward[2] * moveSpeed;
        }
        // S - Trás
        if (keys['s']) {
            cameraPosition[0] -= forward[0] * moveSpeed;
            cameraPosition[2] -= forward[2] * moveSpeed;
        }
        // A - Esquerda
        if (keys['a']) {
            cameraPosition[0] -= right[0] * moveSpeed;
            cameraPosition[2] -= right[2] * moveSpeed;
        }
        // D - Direita
        if (keys['d']) {
            cameraPosition[0] += right[0] * moveSpeed;
            cameraPosition[2] += right[2] * moveSpeed;
        }
        // Q - Baixo
        if (keys['q']) {
            cameraPosition[1] -= moveSpeed;
        }
        // E - Cima
        if (keys['e']) {
            cameraPosition[1] += moveSpeed;
        }
        
        // Setas para rotação (alternativa ao mouse)
        if (keys['arrowleft']) {
            cameraYRotation -= 2;
        }
        if (keys['arrowright']) {
            cameraYRotation += 2;
        }
        if (keys['arrowup']) {
            cameraXRotation += 2;
            cameraXRotation = Math.min(89, cameraXRotation);
        }
        if (keys['arrowdown']) {
            cameraXRotation -= 2;
            cameraXRotation = Math.max(-89, cameraXRotation);
        }
        
        // Calculando o ponto de referência baseado na direção da câmera
        let lookAt = [
            cameraPosition[0] + forward[0],
            cameraPosition[1] + forward[1],
            cameraPosition[2] + forward[2]
        ];
        
        return m4.setViewingMatrix(cameraPosition, lookAt, [0, 1, 0]);
    }

    function drawObject(vertices, colors, mode, count){
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
        gl.enableVertexAttribArray(colorLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.uniformMatrix4fv(viewingMatrixUniformLocation, false, viewingMatrix);
        gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
        
        gl.drawArrays(mode, 0, count);
    }

    function drawCube(){
        let modelViewMatrix = m4.identity();
        // Cubo na origem
        modelViewMatrix = m4.translate(modelViewMatrix, 0, 0, 0);
        
        gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
        drawObject(cubeVertices, cubeColors, gl.TRIANGLES, 36);
    }

    function drawGround(){
        let modelViewMatrix = m4.identity();
        gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
        drawObject(groundPlaneVertices, groundPlaneColors, gl.TRIANGLES, 6);
    }

    function drawCoordinateAxes(){
        let modelViewMatrix = m4.identity();
        gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
        drawObject(coordinateAxes, coordinateAxesColors, gl.LINES, 6);
    }

    let viewingMatrix = m4.identity();

    function drawScene(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Atualizando a câmera
        viewingMatrix = updateCamera();
        
        // Renderizando a cena
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        drawGround();
        drawCoordinateAxes();
        drawCube();

        requestAnimationFrame(drawScene);
    }

    // Exibir informações da projeção
    console.log('=== Parâmetros da Projeção Perspectiva ===');
    console.log('FOV:', fov, 'graus');
    console.log('Aspect Ratio:', aspect);
    console.log('Near plane:', near);
    console.log('Far plane:', far);
    console.log('\n=== Controles ===');
    console.log('W/S: Mover frente/trás');
    console.log('A/D: Mover esquerda/direita');
    console.log('Q/E: Mover baixo/cima');
    console.log('Mouse (arrastar): Rotacionar câmera');
    console.log('Setas ←/→: Rotacionar câmera');

    drawScene();
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

window.addEventListener('load', main);