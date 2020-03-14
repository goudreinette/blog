#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;



void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    st.x *= u_resolution.x/u_resolution.y;
    // should these be ints?
    float xi = floor(st.x * 4.) / 4.;
    float yi = floor(st.y * 4.) / 4.;

    st *= 1.;
    st = fract(st);

    float brightness = step(distance(st, vec2(.5)), .3);
    brightness *= sin(u_time * 10. + xi + yi);



    gl_FragColor = vec4(vec3(brightness),1.0);
}