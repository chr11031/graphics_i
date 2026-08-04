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
	
	mat4 shadow_view;
	mat4 shadow_proj;
};


smooth out vec2 interp_uv;
smooth out vec3 interp_normal;
smooth out vec3 interp_world_pos;


void main()
{
	interp_uv = uv;
	interp_normal = normal; 
	
	vec4 world_pos = model * vec4(pos, 1.0);
	
	interp_world_pos = world_pos.xyz;
	gl_Position = proj * view * world_pos;								
}