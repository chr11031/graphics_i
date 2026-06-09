#version 300 es

uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;

in vec3 position;

void main(void)
{
	gl_Position = proj * view * model * vec4(position, 1.0);
}    
