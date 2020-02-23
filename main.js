let theShader;
let c;
let timeout = false, // holder for timeout id
    delay = 50

function preload(){
    // load the shader
    theShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
    pixelDensity(1)
    // shaders require WEBGL mode to work
    c = createCanvas(innerWidth, innerHeight, WEBGL);
    noStroke();
}

function draw() {
    // shader() sets the active shader with our shader
    shader(theShader);
    theShader.setUniform("u_resolution", [width , height]);
    theShader.setUniform("u_time", millis() / 10000.0); // we divide millis by 1000 to convert it to seconds
    // rect gives us some geometry on the screen
    rect(0, 0, width, height);
}

function r() {
    resizeCanvas(windowWidth, windowHeight);
}

function windowResized() {
    clearTimeout(timeout);
    // start timing for event "completion"
    timeout = setTimeout(r, delay)
}

addEventListener('scroll', () => {
    const canvas = document.querySelector('canvas')
    canvas.style.opacity = map(constrain(scrollY, 0, 100), 0, 100, 0.2, 0.05)
})
