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

function defineCoordinateAxes(){
    return new Float32Array([
      // X axis
      -1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      // Y axis
      0.0, -1.0, 0.0,
      0.0, 1.0, 0.0,
      // Z axis
      0.0, 0.0, -1.0,
      0.0, 0.0, 1.0,
    ]);
}

function defineCoordinateAxesColors(){
    return new Float32Array([
      // X axis
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      // Y axis
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      // Z axis
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
    ]);
}

function main() {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    let cubeVertices = [];

    const ColorBuffer = gl.createBuffer();
    let cubeColors = [];
    
    const modelViewMatrixUniformLocation = gl.getUniformLocation(program,'u_modelViewMatrix');
    const viewingMatrixUniformLocation = gl.getUniformLocation(program,'u_viewingMatrix');
    const projectionMatrixUniformLocation = gl.getUniformLocation(program,'u_projectionMatrix');

    let coordinateAxes = defineCoordinateAxes();
    let coordinateAxesColors = defineCoordinateAxesColors();

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let modelViewMatrix = m4.identity();

    // Configurações de câmera
    let cameraMode = 0; // 0-7 para diferentes modos
    let P0 = [2.0, 2.0, 2.0];
    let Pref = [0.0, 0.0, 0.0];
    let V = [0.0, 1.0, 0.0];
    let viewingMatrix = m4.setViewingMatrix(P0, Pref, V);
    
    // Parâmetros para animação de pan
    let panAngle = 0;
    let rotateAroundAngle = 0;
    
    let xw_min = -1.0;
    let xw_max = 1.0;
    let yw_min = -1.0;
    let yw_max = 1.0;
    let z_near = -1.0;
    let z_far = -8.0;
    let projectionMatrix = m4.setOrthographicProjectionMatrix(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
    let projectionType = 'Ortográfica'; // ADICIONE ESTA LINHA

    let theta = 0.0;
    let tx = 0.0;
    let ty = 0.0;
    let tz = 0.0;
    let tx_offset = 0.05;

    cubeColors = setCubeColors();
    cubeVertices = setCubeVertices(0.5);

    // Função para atualizar a câmera baseado no modo
    function updateCamera() {
        const radius = 3.0;
        
        switch(cameraMode) {
            case 0: // Vista padrão (perspectiva isométrica)
                P0 = [2.0, 2.0, 2.0];
                Pref = [0.0, 0.0, 0.0];
                V = [0.0, 1.0, 0.0];
                break;
                
            case 1: // Vista frontal (olhando de frente no eixo Z)
                P0 = [0.0, 0.0, 3.0];
                Pref = [0.0, 0.0, 0.0];
                V = [0.0, 1.0, 0.0];
                break;
                
            case 2: // Vista lateral direita (olhando do eixo X)
                P0 = [3.0, 0.0, 0.0];
                Pref = [0.0, 0.0, 0.0];
                V = [0.0, 1.0, 0.0];
                break;
                
            case 3: // Vista superior (olhando de cima do eixo Y)
                P0 = [0.0, 3.0, 0.0];
                Pref = [0.0, 0.0, 0.0];
                V = [0.0, 0.0, -1.0]; // V aponta para -Z para manter orientação correta
                break;
                
            case 4: // Vista lateral esquerda
                P0 = [-3.0, 0.0, 0.0];
                Pref = [0.0, 0.0, 0.0];
                V = [0.0, 1.0, 0.0];
                break;
                
            case 5: // Vista traseira
                P0 = [0.0, 0.0, -3.0];
                Pref = [0.0, 0.0, 0.0];
                V = [0.0, 1.0, 0.0];
                break;
                
            case 6: // Pan animado - câmera gira ao redor mantendo N fixo
                panAngle += 0.02;
                P0 = [radius * Math.cos(panAngle), 1.5, radius * Math.sin(panAngle)];
                Pref = [0.0, 0.0, 0.0];
                V = [0.0, 1.0, 0.0];
                break;
                
            case 7: // Rotação ao redor do objeto (várias visões)
                rotateAroundAngle += 0.01;
                P0 = [
                    radius * Math.cos(rotateAroundAngle),
                    radius * Math.sin(rotateAroundAngle * 0.5),
                    radius * Math.sin(rotateAroundAngle)
                ];
                Pref = [0.0, 0.0, 0.0];
                // V precisa ser ajustado para manter orientação correta
                V = [0.0, 1.0, 0.0];
                break;
        }
        
        viewingMatrix = m4.setViewingMatrix(P0, Pref, V);
    }

    // Função para atualizar display do modo atual
    function updateModeDisplay() {
        const modeNames = [
            'Vista Isométrica Padrão',
            'Vista Frontal (Eixo Z)',
            'Vista Lateral Direita (Eixo X)',
            'Vista Superior (Eixo Y)',
            'Vista Lateral Esquerda (-X)',
            'Vista Traseira (-Z)',
            'Pan Animado (Câmera Girando)',
            'Rotação ao Redor do Objeto'
        ];
        
        const modeDisplay = document.getElementById('currentMode');
        if (modeDisplay) {
            modeDisplay.textContent = `Modo Atual: ${modeNames[cameraMode]} | Projeção: ${projectionType}`;
        }
    }

    // Interação de teclado
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
                cameraMode = parseInt(event.key);
                panAngle = 0;
                rotateAroundAngle = 0;
                updateCamera();
                updateModeDisplay();
                console.log(`Modo de câmera: ${cameraMode}`);
                break;
            case 'o':
            case 'O':
                projectionMatrix = m4.setOrthographicProjectionMatrix(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
                projectionType = 'Ortográfica';
                updateModeDisplay();
                console.log('Projeção ortográfica');
                break;
            case 'p':
            case 'P':
                projectionMatrix = m4.setPerspectiveProjectionMatrix(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
                projectionType = 'Perspectiva';
                updateModeDisplay();
                console.log('Projeção perspectiva');
                break;
        }
    });

    function drawCube(){
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
      gl.enableVertexAttribArray(colorLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      
      modelViewMatrix = m4.identity();
      modelViewMatrix = m4.yRotate(modelViewMatrix,degToRad(theta));
      modelViewMatrix = m4.translate(modelViewMatrix,tx,ty,tz);

      gl.uniformMatrix4fv(modelViewMatrixUniformLocation,false,modelViewMatrix);
      gl.uniformMatrix4fv(viewingMatrixUniformLocation,false,viewingMatrix);
      gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);

      gl.drawArrays(gl.TRIANGLES, 0, 6*6);
    }

    function drawCoordinateAxes(){
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, coordinateAxes, gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, coordinateAxesColors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      
      modelViewMatrix = m4.identity();

      gl.uniformMatrix4fv(modelViewMatrixUniformLocation,false,modelViewMatrix);
      gl.uniformMatrix4fv(viewingMatrixUniformLocation,false,viewingMatrix);
      gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);

      gl.drawArrays(gl.LINES, 0, 6);
    }

    function drawScene(){
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      theta += 5;
      if(tx>2.0 || tx<-2.0)
        tx_offset = -tx_offset;
      tx += tx_offset;

      // Atualizar câmera para modos animados
      if(cameraMode === 6 || cameraMode === 7) {
          updateCamera();
      }

      // Vista única em tela cheia
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      drawCube();
      drawCoordinateAxes();

      requestAnimationFrame(drawScene);
    }

    // Exibir instruções
    console.log('=== Controles de Câmera ===');
    console.log('Teclas 0-7: Alternar modos de visualização');
    console.log('0: Vista isométrica padrão');
    console.log('1: Vista frontal (Z)');
    console.log('2: Vista lateral direita (X)');
    console.log('3: Vista superior (Y)');
    console.log('4: Vista lateral esquerda (-X)');
    console.log('5: Vista traseira (-Z)');
    console.log('6: Pan animado (câmera gira ao redor)');
    console.log('7: Rotação ao redor do objeto');
    console.log('O: Projeção ortográfica');
    console.log('P: Projeção perspectiva');

    // Inicializar display do modo
    updateModeDisplay();

    drawScene();
}

function unitVector(v){ 
    let vModulus = vectorModulus(v);
    return v.map(function(x) { return x/vModulus; });
}

function vectorModulus(v){
    return Math.sqrt(Math.pow(v[0],2)+Math.pow(v[1],2)+Math.pow(v[2],2));
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

window.addEventListener('load', main);