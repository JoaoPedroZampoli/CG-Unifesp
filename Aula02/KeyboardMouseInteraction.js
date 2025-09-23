// Vertex shader source code
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute float a_pointSize;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    gl_PointSize = a_pointSize;
  }
`;

// Fragment shader source code
const fragmentShaderSource = `
  precision mediump float;
  uniform vec3 u_color;

  void main() {
    gl_FragColor = vec4(u_color,1.0);
  }
`;

function createShader1(gl, type, source) {
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

function createProgram1(gl, vertexShader, fragmentShader) {
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

function bresenham(x0, y0, x1, y1) {
    const points = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;
    while (true) {
        points.push([x, y]);
        if (x === x1 && y === y1) break;
        const err2 = err * 2;
        if (err2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (err2 < dx) {
            err += dx;
            y += sy;
        }
    }
    return points;
}

function bresenhamCircle(xc, yc, radius) {
    const points = [];
    let x = 0;
    let y = radius;
    let d = 3 - 2 * radius;

    // "Pushando" os pontos iniciais
    function plotCirclePoints(xc, yc, x, y) {
        points.push([xc + x, yc + y]);
        points.push([xc - x, yc + y]);
        points.push([xc + x, yc - y]);
        points.push([xc - x, yc - y]);
        points.push([xc + y, yc + x]);
        points.push([xc - y, yc + x]);
        points.push([xc + y, yc - x]);
        points.push([xc - y, yc - x]);
    }

    plotCirclePoints(xc, yc, x, y);
    while (y >= x) {
        x++;
        if (d > 0) {
            y--;
            d = d + 4 * (x - y) + 10;
        } else {
            d = d + 4 * x + 6;
        }
        plotCirclePoints(xc, yc, x, y);
    }
    return points;
}

function convertScreenToWebGL(x, y, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: x - rect.left,
        y: y - rect.top
    };
}

function convertWebGLToNormalized(x, y, canvas) {
    return{
        x: (2 * x / canvas.width) - 1,
        y: 1 - (2 * y / canvas.height)
    }
}


function main(){
  const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShader1(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader1(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    const program = createProgram1(gl, vertexShader, fragmentShader);
    
    gl.useProgram(program);

    const vertex = new Float32Array([
         0.0,  0.0
    ]);

    let drawMode = "line";
    let clickCount = 0;
    let firstPoint = null;
    let trianglePoints = [];
    let currentPoints = [];
    let circleRadius = 25;

    currentPoints = bresenham(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2).flat();

    const VertexBuffer = gl.createBuffer();
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);

    const pointSizeLocation = gl.getAttribLocation(program, 'a_pointSize');
    gl.vertexAttrib1f(pointSizeLocation, 1.0);

    let colorVector = [0.0,0.0,1.0];

    // Estados dos modos
    let colorMode = false;
    let sizeMode = false;

    const predefinedColors = [
        [1.0, 1.0, 1.0], // 0 - Branco
        [1.0, 0.0, 0.0], // 1 - Vermelho
        [0.0, 1.0, 0.0], // 2 - Verde
        [0.0, 0.0, 1.0], // 3 - Azul
        [1.0, 1.0, 0.0], // 4 - Amarelo
        [1.0, 0.0, 1.0], // 5 - Magenta
        [0.0, 1.0, 1.0], // 6 - Ciano
        [0.5, 0.5, 0.5], // 7 - Cinza
        [1.0, 0.5, 0.0], // 8 - Laranja
        [0.5, 0.0, 0.5]  // 9 - Roxo
    ];

    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform3fv(colorUniformLocation,colorVector);

    canvas.addEventListener("mousedown",mouseClick,false);
  
    function mouseClick(event){
        if (event.button !== 0){
            return;
        }
        
        const screenCoord = convertScreenToWebGL(event.clientX, event.clientY, canvas);
        if(drawMode === 'line'){
            if(clickCount === 0){
                firstPoint = screenCoord;
                clickCount = 1;
            } else if(clickCount === 1){
                const linePoints = bresenham(firstPoint.x, firstPoint.y, screenCoord.x, screenCoord.y);
                currentPoints = linePoints.flat();
                drawShape();
                clickCount = 0;
                firstPoint = null;
            }
        } else if(drawMode === 'triangle'){
            trianglePoints.push(screenCoord);
            clickCount++;
            if(clickCount === 3){
                const line1 = bresenham(trianglePoints[0].x, trianglePoints[0].y, trianglePoints[1].x, trianglePoints[1].y);
                const line2 = bresenham(trianglePoints[1].x, trianglePoints[1].y, trianglePoints[2].x, trianglePoints[2].y);
                const line3 = bresenham(trianglePoints[2].x, trianglePoints[2].y, trianglePoints[0].x, trianglePoints[0].y);
                currentPoints = [...line1.flat(), ...line2.flat(), ...line3.flat()];
                drawShape();
                clickCount = 0;
                trianglePoints = [];
            }
        } else if(drawMode === 'circle'){
            const circlePoints = bresenhamCircle(screenCoord.x, screenCoord.y, circleRadius);
            currentPoints = circlePoints.flat();
            drawShape();
        }
    }
  
    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown",keyDown,false);
  
    function keyDown(event){
      switch(event.key.toLowerCase()){
        case 'r':
            drawMode = 'line';
            clickCount = 0;
            firstPoint = null;
            trianglePoints = [];
            console.log('Modo: Traçar retas');
            break;
        case 't':
            drawMode = 'triangle';
            clickCount = 0;
            firstPoint = null;
            trianglePoints = [];
            console.log('Modo: Traçar triângulos');
            break;
        case 'c':
            drawMode = 'circle';
            clickCount = 0;
            firstPoint = null;
            trianglePoints = [];
            console.log('Modo: Desenhar círculos');
            break;
        case 'e':
            colorMode = !colorMode;
            sizeMode = false;
            console.log('Modo cor:', colorMode);
            break;
        case 'k':
            sizeMode = !sizeMode;
            colorMode = false;
            console.log('Modo tamanho:', sizeMode);
            break;
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
            let index = parseInt(event.key);
            if(colorMode){
                colorVector = predefinedColors[index];
                console.log('Cor selecionada:', colorVector);
            }
            if(sizeMode && index >= 1){
                let newSize = index * 5.0;
                gl.vertexAttrib1f(pointSizeLocation, newSize);
                console.log('Tamanho selecionado:', newSize);
            }
            if(drawMode === 'circle' && index >= 1){
                circleRadius = index * 10;
                console.log('Raio da circunferência:', circleRadius);
            }
            break;
        }
      gl.uniform3fv(colorUniformLocation,colorVector);
      drawShape();
    }

    function drawShape(){
        if (currentPoints.length === 0) {
            return;
        }

        const normalizedPoints = [];
        for (let i = 0; i < currentPoints.length; i += 2) {
            const normalized = convertWebGLToNormalized(currentPoints[i], currentPoints[i + 1], canvas);
            normalizedPoints.push(normalized.x, normalized.y);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalizedPoints), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, normalizedPoints.length / 2);
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawShape();
}

main();