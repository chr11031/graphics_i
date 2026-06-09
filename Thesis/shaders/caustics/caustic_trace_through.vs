#version 300 es
uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;

in vec3 position;

out vec3 world_pos;

void main(void)
{
	vec4 world_pos4  = model * vec4(position, 1.0);
	gl_Position = proj * view * world_pos4;
	world_pos     = world_pos4.xyz;
}    
