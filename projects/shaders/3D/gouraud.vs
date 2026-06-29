#version 300 es
precision highp float;
layout(location=0) in vec3 pos;
layout(location=1) in vec3 normal;


layout(std140) uniform gouraud_data
{
	mat4 proj;
	mat4 view;
	vec3 light_pos;
};


smooth out vec2 interp_color;

void main()
{
	vec3 light_dir = normalize( light_pos - pos );
	
	float align = dot(light_dir, normal);
	align = max(0.0, align);

	interp_color = align * vec3(1.0, 0.0, 0.0);
	gl_Position = proj * view * vec4(pos, 1.0);								
}