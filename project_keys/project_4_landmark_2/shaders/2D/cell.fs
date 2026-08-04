#version 300 es
precision highp float;

uniform sampler2D source_texture;

smooth in vec2 interp_uv;

layout (location=0) out vec4 out_color;

const float uv_offset = 1.0 / 512.0;
const float border_threshold = 0.2;

void main() {
	
	vec3 off_l = texture(source_texture, interp_uv + vec2(-uv_offset,  0.00)).rgb;
	vec3 off_r = texture(source_texture, interp_uv + vec2(+uv_offset,  0.00)).rgb;
	vec3 off_t = texture(source_texture, interp_uv + vec2( 0.00, +uv_offset)).rgb;
	vec3 off_d = texture(source_texture, interp_uv + vec2( 0.00, -uv_offset)).rgb;


	// Make borders black
	if (length(off_r - off_l) > border_threshold || length(off_t - off_d) > border_threshold)
	{
		out_color = vec4(0.0, 0.0, 0.0, 1.0);
	}
	// Clamp color shades to fixed number of tones
	else
	{
		vec3 tex_color = texture(source_texture, interp_uv).rgb;
		out_color = vec4(tex_color, 1.0);
	}
	
	// Make it B & W
	float avg = (out_color.r + out_color.g + out_color.b) / 3.0;
	vec3 bw_color = vec3(avg);

	float bw_f = 0.7;
	float clr_f = 1.0 - bw_f;
	out_color.xyz = clr_f * out_color.xyz + bw_f * bw_color;
}
