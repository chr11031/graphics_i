#version 300 es
precision mediump float;

uniform sampler2D albedo_map;
uniform sampler2D metal_map;
uniform sampler2D rough_map;
uniform sampler2D ao_map;
uniform float specular_only;

in vec3 world_pos;
in vec3 world_normal;
in vec2 uv_interp;


layout (location=0) out vec4 g_buffer_pos_flux;
layout (location=1) out vec3 g_buffer_normal;
layout (location=2) out vec3 g_buffer_albedo;
layout (location=3) out vec4 g_buffer_metal_rough_ao_so;


void main(void)
{
	g_buffer_pos_flux 				= vec4(world_pos, 1.0);
	g_buffer_normal 				= normalize(world_normal);
	g_buffer_albedo 				= texture(albedo_map, uv_interp).rgb;
	g_buffer_metal_rough_ao_so.r	= texture(metal_map, uv_interp).r;
	g_buffer_metal_rough_ao_so.g	= texture(rough_map, uv_interp).r;
	g_buffer_metal_rough_ao_so.b	= texture(ao_map, uv_interp).r;
	g_buffer_metal_rough_ao_so.a 	= specular_only;
}