#version 300 es
uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;

in vec3 position;
in vec2 uv;
in vec3 normal;


out vec3 world_pos;
out vec3 world_normal;
out vec2 uv_interp;

void main(void)
{
	vec4 world_pos4  = model * vec4(position, 1.0);
	vec4 world_norm4 = model * vec4(normal,   0.0);
	gl_Position = proj * view * world_pos4;
	
	world_pos     = world_pos4.xyz;
	world_normal  = normalize(world_norm4.xyz);
	uv_interp     = uv;
}    
