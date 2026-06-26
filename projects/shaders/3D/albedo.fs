#version 300 es
precision highp float;

uniform sampler2D albedo;

smooth in vec2 interp_uv;		
smooth in vec3 interp_normal;	

layout (location=0) out vec4 out_color;

const vec3 light_source = vec3(0.0, 100.0, 0.0);

void main() {

	// Surface shading...				
	out_color = vec4(texture(albedo, interp_uv).rgb, 1.0);

}
