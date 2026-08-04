#version 300 es
precision highp float;

uniform sampler2D albedo;
uniform sampler2D shadow_map;

layout(std140) uniform matrix_data
{
	mat4 model;
	mat4 view;
	mat4 proj;
	
	mat4 shadow_view;
	mat4 shadow_proj;
};

smooth in vec2 interp_uv;		
smooth in vec3 interp_normal;	
smooth in vec3 interp_world_pos;

layout (location=0) out vec4 out_color;


vec3 shadow_samples()
{
	vec4 T_view = shadow_view * vec4(interp_world_pos, 1.0);
	vec4 T_proj = shadow_proj * T_view;
	vec4 T = T_proj;
	
	float rW = 1.0 / T.w;
	T.x = T.x * rW;
	T.y = T.y * rW;
	T.z = T.z * rW;
	
	T.x = 0.5 + (T.x * 0.5);
	T.y = 0.5 + (T.y * 0.5);
	T.z = 0.5 + (T.z * 0.5);

	// Outside the boundaries of the view area
	if (T_proj.w < 0.0 ||
		T.x < 0.0 || T.x > 1.0 ||
		T.y < 0.0 || T.y > 1.0)
		return vec3(0.0, 0.0, 0.0);
		

	float lit = 0.0;
	float r;
	float c;
	for (r = -2.0; r <= 2.0; r += 1.0)
	{
		for (c = -2.0; c <= 2.0; c += 1.0)
		{
			vec2 uv = vec2(T.x, T.y);
			uv.x += c/256.0;
			uv.y += r/512.0;
			float light_depth = texture(shadow_map, vec2(T.x, T.y)).x;

			float fudge = 0.00025;
			float depth_min = light_depth + fudge; 

			// Check circle radius 
			float l = length(uv - vec2(0.5, 0.5));
			bool in_circle = l < 0.5;
			bool is_lit = (T.z < depth_min); 
			if (in_circle && is_lit)
			{
				lit = lit + 1.0;
			}
		}
	}
	
	lit /= 25.0;	
	return vec3(lit, lit, lit);
}


void main() 
{
	
	vec3 lit = shadow_samples();


//	if (mod(gl_FragCoord.y, 50.0) < 25.0)
	if (true)
	{
		out_color = vec4(lit, 1.0);
	}
	else
	{
		// Surface shading...				
		out_color = vec4(texture(albedo, interp_uv).rgb, 1.0);	
	}
}
