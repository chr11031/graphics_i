#version 300 es
precision highp float;

const vec3 light_pos = vec3(-5.0, 5.0, 5.0);

smooth in vec3 interp_normal;
smooth in vec3 interp_pos;

layout (location=0) out vec4 out_color;

void main() {

	// Ambient
	vec3 color = vec3(0.1, 0.1, 0.1);

	// Diffuse
	vec3 light_dir = normalize( light_pos - interp_pos.xyz );	
	vec3 normal = normalize(interp_normal);
	float align = dot(light_dir, normal);
	align = max(0.0, align);
	color += align * vec3(1.0, 0.5, 0.5);
	
	// Specular
	vec3 reflected = reflect(-light_dir, interp_normal); 
	vec3 look_dir = normalize(interp_pos);
	align = dot(look_dir, -normalize(reflected));
	align = max(0.0, align);
	align = pow(align, 128.0);
	color += align * vec3(1.0, 1.0, 1.0);

	
	out_color = vec4(color, 1.0);
}
