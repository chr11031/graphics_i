#version 300 es
precision mediump float;

uniform vec3 world_eye_pos;
uniform sampler2D g_buffer_pos;
uniform sampler2D g_buffer_normal;
uniform sampler2D g_buffer_albedo;
uniform sampler2D g_buffer_metal_rough_ao_so;

uniform mediump samplerCube shadow_map;
uniform vec3 shadow_light_pos;
uniform float shadow_proj_scale;
uniform float shadow_proj_trans;

uniform mediump samplerCube irradiance_depth_map;
uniform mediump samplerCube irradiance_map;
uniform vec3 irradiance_light_pos;
uniform float irradiance_proj_scale;
uniform float irradiance_proj_trans;

in vec2 uv_interp;

layout (location=0) out vec4 frag_color;

#define PI 3.14159265359

float fragment_world_to_cubemap_z_val(vec3 world_pos, vec3 source_pos, float source_proj_scale, float source_proj_trans)
{
	vec3 frag_to_light = (world_pos - source_pos);

	vec3 abs_rel = abs(frag_to_light);
	float cubemap_view_z;
	if (abs_rel.x > abs_rel.y && abs_rel.x > abs_rel.z)
	{
		cubemap_view_z = abs_rel.x;
	}
	else if (abs_rel.y > abs_rel.x && abs_rel.y > abs_rel.z)
	{
		cubemap_view_z = abs_rel.y;
	}
	else
	{
		cubemap_view_z = abs_rel.z;
	}

	float cubemap_proj_z = (source_proj_scale * cubemap_view_z + source_proj_trans) / (cubemap_view_z);
	float mapped_z = (cubemap_proj_z * 0.5) + 0.5;

	return mapped_z;
}

float fragment_depth_map_z_val(vec3 world_pos, vec3 source_pos, in samplerCube source_map)
{
	vec3 frag_to_light_norm = normalize(world_pos - source_pos);
	float depth = texture(source_map, frag_to_light_norm).r;
	return depth;
}


bool visible_to_source(vec3 world_pos, vec3 source_pos, in samplerCube source_map, float source_proj_scale, float source_proj_trans)
{
	// Replicate the depth estimate for this world space position, 
	// matching the perspective projection matrix:

	float offset = 0.01; // World units offset
	float dim_steps = 2.0;
	float step_size = (offset + offset) / (dim_steps - 1.0);

	float num_visible = 0.0;
	float half_samples = 0.5 * dim_steps * dim_steps * dim_steps;

	for (float x_off = -offset; x_off <= offset; x_off += step_size)
	{
		for (float y_off = -offset; y_off <= offset; y_off += step_size)
		{
			for (float z_off = -offset; z_off <= offset; z_off += step_size)
			{
				vec3 sample_pos = world_pos + vec3(x_off, y_off, z_off);

				float frag_depth = fragment_world_to_cubemap_z_val(sample_pos, source_pos, source_proj_scale, source_proj_trans);
				float frag_source_depth = fragment_depth_map_z_val(sample_pos, source_pos, source_map);

				if (abs(frag_depth - frag_source_depth) < 0.001)
				{
					num_visible += 1.0;
				}
			}
		}
	}

	return num_visible >= half_samples;
}





vec3 Fresnel_Schlick(float cos_theta, vec3 F0)
{
	return F0 + (1.0 - F0) * pow(1.0 - cos_theta, 5.0);
}


// Trowbridge-Reitz Normal Distribution
float Distribution_GGX(vec3 N, vec3 H, float roughness)
{
	float a 		= roughness;
	float a2 		= a*a;
	float NdotH 	= max(dot(N,H), 0.0);
	float NdotH2	= NdotH*NdotH;
	
	float num 		= a2;
	float denom 	= (NdotH2 * (a2 - 1.0) + 1.0);
	denom = PI * denom * denom;
	
	return num / denom;
}


// GGX Schlick Geometry Shadowing function
float Geometry_Schlick_GGX(float NdotV, float roughness)
{
	float r = (roughness + 1.0);
	float k = (r*r) / 8.0;
	
	float num = NdotV;	
	float denom = NdotV * (1.0 - k) + k;
	
	return num / denom;
}


// Geometry Smith approximation accounting for V and L shadowing
float Geometry_Smith(vec3 N, vec3 V, vec3 L, float roughness)
{
	float NdotV = max(dot(N, V), 0.0);
	float NdotL = max(dot(N, L), 0.0);
	float ggx2 = Geometry_Schlick_GGX(NdotV, roughness);
	float ggx1 = Geometry_Schlick_GGX(NdotL, roughness);
	
	return ggx1 * ggx2;
}


vec3 irradiance_sample_blurred(vec3 dir)
{
	float offset = 1.0 / 512.0; // (PIXEL SIZE OF CUBEMAP) TODO: GENERALIZE
	float dim_steps = 4.0;
	float step_size = (offset + offset) / (dim_steps - 1.0);

	vec3 avg = vec3(0.0);
	float num_samples = dim_steps * dim_steps * dim_steps;

	for (float x_off = -offset; x_off <= offset; x_off += step_size)
	{
		for (float y_off = -offset; y_off <= offset; y_off += step_size)
		{
			for (float z_off = -offset; z_off <= offset; z_off += step_size)
			{
				vec3 sample_dir = dir + vec3(x_off, y_off, z_off);
				sample_dir = normalize(sample_dir);
				avg += texture(irradiance_map, sample_dir).rgb;
			}
		}
	}

	return avg / num_samples;
}


vec3 shade()
{
	vec3 world_pos    	= texture(g_buffer_pos, uv_interp).rgb;
	vec3 world_normal 	= texture(g_buffer_normal, uv_interp).rgb;
	vec3 albedo       	= texture(g_buffer_albedo, uv_interp).rgb;
	float metallic	  	= texture(g_buffer_metal_rough_ao_so, uv_interp).r;
	float roughness		= texture(g_buffer_metal_rough_ao_so, uv_interp).g;
	float ao	  		= texture(g_buffer_metal_rough_ao_so, uv_interp).b;
	bool specular_only  = texture(g_buffer_metal_rough_ao_so, uv_interp).a == 1.0;

	vec3 N = normalize(world_normal);
	vec3 V = normalize(world_eye_pos - world_pos);	
	vec3 Lo = vec3(0.0);
	
	vec3 F0 = vec3(0.04);
	F0 = mix(F0, albedo, metallic);

	// Empty space is rendered black
	if (world_normal == vec3(0.0))
	{
		return vec3(0.0);
	}

	// Improvised ambient lighting term
	vec3 ambient = vec3(0.1) * albedo * ao;	


	// CAUSTIC CONTRIBUTION
	vec3 irradiance_sample_vec = normalize(world_pos - irradiance_light_pos);
	vec3 extra = vec3(0.0);
	if (visible_to_source(world_pos, irradiance_light_pos, irradiance_depth_map, irradiance_proj_scale, irradiance_proj_trans))
	{
		vec3 irradiance_sample_vec = normalize(world_pos - irradiance_light_pos);
		extra += texture(irradiance_map, irradiance_sample_vec).rgb;
		//irradiance_sample_blurred(irradiance_sample_vec);
	}

	// SHADOWS CONTRIBUTION
	vec3 radiance = vec3(0.0);
	if (visible_to_source(world_pos, shadow_light_pos, shadow_map, shadow_proj_scale, shadow_proj_trans))
	{
		float distance = length(shadow_light_pos - world_pos);
		float attenuation = 1.0 / (distance * distance);
		float intensity = 5.0;
		radiance += vec3(intensity, intensity, intensity) * attenuation;
	}

	vec3 L = normalize(shadow_light_pos - world_pos);
	vec3 H = normalize(V + L);
	

	
	float NDF = Distribution_GGX(N, H, roughness);
	float G = Geometry_Smith(N, V, L, roughness);
	vec3 F = Fresnel_Schlick(max(dot(H,V), 0.0), F0);
	
	vec3 kS = F;
	vec3 kD = vec3(1.0) - kS;
	kD 		*= 1.0 - metallic;

	vec3 numerator 		= NDF * G * F;
	// numerator = vec3(1.0);
	float denominator 	= 4.0 * max(dot(N,V), 0.0) * max(dot(N,L), 0.0);
	vec3 specular 		= numerator / max(denominator, 0.001);

	// Specular objects are handled differently from opaque ones (No diffuse contribution)
	if (specular_only)
	{
		return vec3(0.0);
	}

	float NdotL = max(dot(N,L), 0.0);
	Lo 			+= (kD * albedo / PI + specular) * radiance * NdotL;	

	return Lo + ambient + extra;
}


void main(void)
{
	// vec3 world_pos    	= texture(g_buffer_pos, uv_interp).rgb;
	// color = texture(shadow_map, world_pos - shadow_light_pos).xyz;
	// color = vec3( fragment_world_to_cubemap_z_val(world_pos, shadow_light_pos, shadow_proj_scale, shadow_proj_trans) );
	// color = pow(color, vec3(32.0));

	vec3 color = shade();
	color = color / (color + vec3(1.0));	// HDR
	color = pow(color, vec3(1.0/2.2));		// GAMMA
	frag_color = vec4(color, 1.0);
}