#version 300 es
precision highp float;
layout(location=0) in vec3 pos;
layout(location=1) in vec3 normal;


layout(std140) uniform phong_data
{
	mat4 proj;
	mat4 view;
	mat4 model;
};

smooth out vec3 interp_normal;
smooth out vec3 interp_pos;


void main()
{
	interp_normal = (view * model * vec4(normal, 0.0)).xyz;
	vec4 tmp = view * model * vec4(pos, 1.0);
	interp_pos = tmp.xyz;
	
	gl_Position = proj * tmp;								
}