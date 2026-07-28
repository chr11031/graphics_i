#version 300 es
precision highp float;
layout(location=0) in vec3 pos;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 uv;


layout(std140) uniform phong_data
{
	mat4 proj;
	mat4 view;
	mat4 model;
	vec3 camera_pos;
};

smooth out vec3 interp_pos;
smooth out vec3 interp_normal;
smooth out vec2 interp_uv;

void main()
{
	interp_normal = (model * vec4(normal, 0.0)).xyz;

	vec4 tmp = model * vec4(pos, 1.0);
	interp_pos = tmp.xyz;

	interp_uv = uv;
	
	gl_Position = proj * view * tmp;								
}