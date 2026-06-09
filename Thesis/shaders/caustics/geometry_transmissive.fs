#version 300 es
precision mediump float;

uniform vec3 photon_source;

in vec3 world_pos;


layout (location=0) out vec4 g_buffer_pos_flux;
layout (location=1) out vec3 g_buffer_normal;


void main(void)
{
	vec3 I = normalize(world_pos - photon_source);
	g_buffer_pos_flux 	= vec4(world_pos, 1.0);
	g_buffer_normal 	= I;
}