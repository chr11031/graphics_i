#version 300 es
precision highp float;
layout(location=0) in vec3 pos;
layout(location=1) in vec2 uv;
layout(location=2) in vec3 normal;


layout(std140) uniform matrix_data
{
	mat4 model;
	mat4 view;
	mat4 proj;
};


smooth out vec2 interp_uv;
smooth out vec3 interp_normal;

void main()
{
	interp_uv = uv;
	interp_normal = (model * vec4(normal, 0.0)).xyz; 
	gl_Position = proj * view * model * vec4(pos, 1.0);								
}