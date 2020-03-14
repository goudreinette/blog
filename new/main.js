let theShader;
let c;
let timeout = false // holder for timeout id
let delay = 50

function preload(){
    // load the shader
    let rs = random(['shader.frag', 'helix.frag', 'squares-in-circle.frag'])// 'squares-in-circle.frag' //
    let base = `/wp-content/themes/rein.computer/shaders`
    theShader = loadShader(`${base}/shader.vert`, `${base}/${rs}`);
}

function setup() {
    frameRate(60)
    // shaders require WEBGL mode to work
    c = createCanvas(innerWidth, innerHeight, WEBGL);
    noStroke();
}

function draw() {
    // shader() sets the active shader with our shader
    shader(theShader);
    theShader.setUniform("u_resolution", [width* pixelDensity(), height * pixelDensity() ]);
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
    canvas.style.opacity = map(constrain(scrollY, 0, 200), 0, 200, 0.2, 0.025)
})

/**
 * Filter
 */
let links = document.querySelectorAll('.catalog a')
let filter = document.querySelector('#filter')

filter.addEventListener('keydown', updateFilter)
filter.addEventListener('keyup', updateFilter)

function updateFilter(e) {
    let val = e.target.value.toLowerCase()
    for (const a of links) {
        let containsCharacter = a.textContent.toLowerCase().includes(val)
        a.classList.toggle('hidden', !containsCharacter)
    }
}
