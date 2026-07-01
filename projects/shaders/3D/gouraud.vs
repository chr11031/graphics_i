#version 300 es
precision highp float;
layout(location=0) in vec3 pos;
layout(location=1) in vec3 normal;


layout(std140) uniform gouraud_data
{
	mat4 proj;
	mat4 view;
	mat4 model;
};

const vec3 light_pos = vec3(-5.0, 5.0, 5.0);

smooth out vec3 interp_color;

void main()
{
	vec3 light_dir = normalize( light_pos - pos );

	vec3 normal_delta = (model * vec4(normal, 0.0)).xyz;
	float align = dot(light_dir, normal_delta);
	align = max(0.0, align);

	interp_color =  align * vec3(0.5, 0.5, 1.0) + vec3(0.1, 0.1, 0.1);
	gl_Position = proj * view * model * vec4(pos, 1.0);								
}