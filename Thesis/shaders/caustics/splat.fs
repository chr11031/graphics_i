#version 300 es
precision mediump float;

in vec3 irradiance;

layout (location=4) out vec3 frag_color;

void main(void)
{
    frag_color = irradiance;
}