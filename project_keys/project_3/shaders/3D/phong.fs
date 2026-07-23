#version 300 es
precision highp float;

layout(std140) uniform phong_data
{
	mat4 proj;
	mat4 view;
	mat4 model;
	mediump vec3 camera_pos;
};

const vec3 light_pos = vec3(-5.0, 5.0, 5.0);

smooth in vec3 interp_pos;
smooth in vec3 interp_normal;
smooth in vec2 interp_uv;

layout (location=0) out vec4 out_color;

void main() {

	int uv_checker_x = int(interp_uv.x * 8.0);
	int uv_checker_y = int(interp_uv.y * 8.0);
	
	vec3 base_color = vec3(1.0, 1.0, 1.0);
	if (uv_checker_x % 2 == uv_checker_y % 2)
	{
		base_color = vec3(1.0, 0.0, 0.0);
	}

	
	// Ambient
	vec3 color = vec3(0.1, 0.1, 0.1);


	// Diffuse
	vec3 light_dir = normalize( light_pos - interp_pos.xyz );	
	vec3 normal = normalize(interp_normal);


	float align = dot(light_dir, normal);
	align = max(0.0, align);
	color += align * base_color;
	
	// Specular
	vec3 reflected = reflect(-light_dir, normal); 
	vec3 look_dir = normalize(interp_pos - camera_pos);
	align = dot(look_dir, -normalize(reflected));
	align = max(0.0, align);
	align = pow(align, 256.0);
	color += align * vec3(1.0, 1.0, 1.0);

	
	out_color = vec4(color, 1.0);
}
