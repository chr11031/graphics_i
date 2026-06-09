#version 300 es
precision mediump float;

uniform sampler2D the_texture;
//uniform samplerCube the_texture;


in vec2 uv_interp;

out vec4 frag_color;

void main(void)
{
	
	// vec2 uv_interp_prime = 2.0*uv_interp - vec2(1.0);
	// vec3 color = texture(the_texture, vec3(-1.0, uv_interp_prime.x, uv_interp_prime.y)).xyz;
	// color = pow(color, vec3(16));
	vec3 color = texture(the_texture, uv_interp).rgb;

	if (color == vec3(0.0))
	{
		discard;
	}

	color = abs(color);
	// if (texture(the_texture, uv_interp).a <= 1.0)
	// {
	// 	discard;
	// }

	// float exposure = 1.0;
	// color = vec3(1.0) - exp(-color * exposure );
	frag_color = vec4(color, 1.0);
} 
