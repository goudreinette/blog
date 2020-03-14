#ifdef GL_ES
precision lowp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


#define count 20.


float square(vec2 st) {
    float brightness = 1.0;

    // chop off all the edges
    brightness *= step(st.x, .9);
    brightness *= step(.1, st.x);
    brightness *= step(.1, st.y);
    brightness *= step(st.y, .9);
    return brightness;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    // should these be ints?
    float xi = floor(st.x * count) / count;
    float yi = floor(st.y * count) / count;

    // scale up, fract trick
    st *= count;
    st = fract(st);

    float square = square(st);
    float brightness = square;

    // using the index to calculate brightness for each shape
    brightness *= sin(u_time * 8.0 + xi + yi);

    gl_FragColor = vec4(vec3(brightness + 0.2),1.0);
}