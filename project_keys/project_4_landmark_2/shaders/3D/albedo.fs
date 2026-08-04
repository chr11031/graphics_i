#version 300 es
precision highp float;

uniform sampler2D albedo;

smooth in vec2 interp_uv;		
smooth in vec3 interp_normal;	

layout (location=0) out vec4 out_color;

void main() {

	// Surface shading...				
	out_color = vec4(texture(albedo, interp_uv).rgb, 1.0);

}
