#version 300 es
uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;

in vec3 position;
in vec3 normal;

out vec3 world_pos;
out vec3 world_normal_interp;

void main(void)
{
	vec4 world_pos4  = model * vec4(position, 1.0);
	gl_Position = proj * view * world_pos4;
	world_pos     = world_pos4.xyz;
	world_normal_interp = (model * vec4(normal, 0.0)).xyz;
}    
