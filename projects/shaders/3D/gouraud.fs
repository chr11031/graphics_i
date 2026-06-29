#version 300 es
precision highp float;

smooth in vec3 interp_color;		

layout (location=0) out vec4 out_color;

void main() {

	// Surface shading...				
	out_color = vec4(interp_color, 1.0);

}
