#version 300 es
precision highp float;
layout(location=0) in vec2 pos;
layout(location=1) in vec2 uv;

smooth out vec2 interp_uv;

void main()
{
	interp_uv = uv;
	gl_Position = vec4(pos, 0.5, 1.0);								
}
