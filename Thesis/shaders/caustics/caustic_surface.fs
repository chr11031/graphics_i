#version 300 es
precision mediump float;

// GEOMETRY_TRANSMISSIVE
uniform vec3 photon_source;

// REFRACTIVE_SDFV_MARCH
uniform highp sampler3D sdfv;
uniform mat4 world_to_sdfv_mat;
uniform float eta;
uniform float sdfv_voxel_size;

// IMPACT
uniform int shah_max_steps;
uniform vec3 subject_world_pos;
uniform samplerCube subj_env_pos_cubemap;

// SHADE REFRACTED
uniform mediump samplerCube subject_env_normal;
uniform mediump samplerCube subject_env_albedo;
uniform mediump samplerCube subject_env_metal_rough_ao;
uniform mediump samplerCube shadow_map;
uniform vec3 shadow_light_pos;
uniform float shadow_proj_scale;
uniform float shadow_proj_trans;
uniform mediump samplerCube irradiance_depth_map;
uniform mediump samplerCube irradiance_map;
uniform vec3 irradiance_light_pos;
uniform float irradiance_proj_scale;
uniform float irradiance_proj_trans;


in vec3 world_pos;
in vec3 world_normal_interp;

layout (location=0) out vec4 frag_color;
layout (location=1) out vec4 DEBUG;

#define PI 3.14159265359
#define OUTSIDE(low,high,val) (val<low)||(val>high)
#define SDF_EPSILON   0.001
#define SDF_MAX_STEPS 32


float Fresnel_Schlick(float cos_theta, float F0)
{
	return F0 + (1.0 - F0) * pow(1.0 - cos_theta, 5.0);
}

// Modified version of Khronos implementation as described at:
// https://registry.khronos.org/OpenGL-Refpages/gl4/html/refract.xhtml
// 'flux' is the energy after each fresnel interaction
// 'S' is the sign of the current position (negative = in, pos=out)
vec3 refract_reflect(inout float flux, vec3 I, vec3 N, float S)
{
	N = S * N;
	float eta = (S > 0.0) ? eta : (1.0/eta);
	
	float reflect_coef = Fresnel_Schlick(dot(N,-I), 0.04);
	float refract_coef = 1.0 - reflect_coef;

	float k = 1.0 - eta * eta * (1.0 - dot(N, I)*dot(N, I));
	if (k < 0.0)
	{
		// FLUX stays the same
		return reflect(I, N);
	}
	else
	{
		flux *= refract_coef;
		return (	eta * I - (eta * dot(N, I) + sqrt(k)) * N	);
	}
}

vec3 sdfv_normal(vec3 pos)
{
	vec3 N;
	N.x = 	texture(sdfv, vec3(pos.x+sdfv_voxel_size, pos.y, pos.z)).r - 
			texture(sdfv, vec3(pos.x-sdfv_voxel_size, pos.y, pos.z)).r;
	N.y = 	texture(sdfv, vec3(pos.x, pos.y+sdfv_voxel_size, pos.z)).r - 
			texture(sdfv, vec3(pos.x, pos.y-sdfv_voxel_size, pos.z)).r;
	N.z = 	texture(sdfv, vec3(pos.x, pos.y, pos.z+sdfv_voxel_size)).r - 
			texture(sdfv, vec3(pos.x, pos.y, pos.z-sdfv_voxel_size)).r;
	N = normalize(N);	
	return N;
}


#define NUM_ITERATIONS 4
vec3 find_surface_crossing(vec3 prev_pos, float prev_dist, vec3 next_pos, float next_dist)
{
	bool increasing = next_dist > prev_dist;
	vec3 guess_pos;
	float guess_dist;

	// Secant method
	for (int i = 0; i < NUM_ITERATIONS; i++)
	{
		float range    = next_dist - prev_dist;
		float lin_coef = -prev_dist / range;
		guess_pos      = prev_pos + lin_coef * (next_pos - prev_pos);	
		guess_dist     = texture(sdfv, guess_pos).r;
		if ( (increasing && guess_dist > 0.0) || (!increasing && guess_dist < 0.0) )
		{
			next_pos  = guess_pos;
			next_dist = guess_dist;
		}
		else
		{
			prev_pos  = guess_pos;
			prev_dist = guess_dist;
		}
	}
	return guess_pos;
}


void march_refractions(inout vec3 pos, inout float flux, inout vec3 dir)
{
    vec3 prev_pos;
    float prev_dist;

	float COUNT = 0.0;

    float dist = texture(sdfv, pos).r;
    for (int i = 0; i < SDF_MAX_STEPS; i++)
    {
        prev_pos = pos;
        prev_dist = dist;
        pos += ( max(sdfv_voxel_size, abs(dist)) *dir );
        dist = texture(sdfv, pos).r;

        if (sign(prev_dist) != sign(dist))
        {
            pos = find_surface_crossing(prev_pos, prev_dist, pos, dist);
            dir = refract_reflect(flux, dir, sdfv_normal(pos), sign(prev_dist));
            pos = pos + (sdfv_voxel_size * dir);
        }

		COUNT += (1.0 / 255.0);

        if ( OUTSIDE(0.0,1.0,pos.x) || OUTSIDE(0.0,1.0,pos.y) || OUTSIDE(0.0,1.0,pos.z) )
        {	
			DEBUG = vec4(vec3(COUNT), 1.0);
            return;
        }
    }

	DEBUG = vec4(vec3(COUNT), 1.0);

}


vec3 retract_pos_to_sdfv_bbox(vec3 pos, vec3 dir)
{
    float near_coef = -1000000.0;

    if (dir.x != 0.0)
	{
        float left_x  = -pos.x / dir.x;
        if (left_x < 0.0 && left_x > near_coef)
            near_coef = left_x;
        float right_x = (1.0 - pos.x) / dir.x;
        if (right_x < 0.0 && right_x > near_coef)
            near_coef = right_x;
	}
    if (dir.y != 0.0)
	{
        float left_y  = -pos.y / dir.y;
        if (left_y < 0.0 && left_y > near_coef)
            near_coef = left_y;
        float right_y = (1.0 - pos.y) / dir.y;
        if (right_y < 0.0 && right_y > near_coef)
            near_coef = right_y;    
	}
    if (dir.z != 0.0)
	{
        float left_z  = -pos.z / dir.z;
        if (left_z < 0.0 && left_z > near_coef)
            near_coef = left_z;
        float right_z = (1.0 - pos.z) / dir.z;
        if (right_z < 0.0 && right_z > near_coef)
            near_coef = right_z;
	}
    
	return pos + (near_coef*dir);
}


vec3 shah_find_world_intersection(in samplerCube env_pos_map, vec3 world_pos, vec3 world_dir)
{
    // Setup 
    vec3 pos = world_pos - subject_world_pos;
    vec3 dir = world_dir;

    // First step is fixed
    vec3 dir_p = pos + 1.00*dir;    
    vec3 guess_pos = texture(env_pos_map, dir_p).rgb;

    // Remaining iterations are dynamic
    for (int i = 0; i < shah_max_steps; i++)
    {
        dir_p = pos + length(guess_pos - pos) * dir;
        guess_pos = texture(env_pos_map, dir_p).rgb;
    }

    return dir_p;    
}


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


vec3 shade(vec3 subj_exit_pos, vec3 world_pos)
{
	vec3 V 				= normalize(world_pos - subj_exit_pos);
	vec3 cm_vec 		= world_pos - irradiance_light_pos;

	vec3 world_normal 	= texture(subject_env_normal, cm_vec).rgb;
	vec3 albedo       	= texture(subject_env_albedo, cm_vec).rgb;
	float metallic	  	= texture(subject_env_metal_rough_ao, cm_vec).r;
	float roughness		= texture(subject_env_metal_rough_ao, cm_vec).g;
	float ao	  		= texture(subject_env_metal_rough_ao, cm_vec).b;


	vec3 N = normalize(world_normal);
	vec3 Lo = vec3(0.0);
	
	vec3 F0 = vec3(0.04);
	F0 = mix(F0, albedo, metallic);

	// Empty space is rendered black
	if (world_normal == vec3(0.0))
	{
		return vec3(0.0);
	}

	// Improvised ambient lighting term
	vec3 ambient = vec3(0.15) * albedo * (1.0-ao);	

	// CAUSTIC CONTRIBUTION
	vec3 irradiance_sample_vec = normalize(world_pos - irradiance_light_pos);
	vec3 extra = vec3(0.0);
	if (visible_to_source(world_pos, irradiance_light_pos, irradiance_depth_map, irradiance_proj_scale, irradiance_proj_trans))
	{
		vec3 irradiance_sample_vec = normalize(world_pos - irradiance_light_pos);
		vec3 tmp = texture(irradiance_map, irradiance_sample_vec).rgb;
		if (any(isinf(tmp)) || any(isnan(tmp)))
		{
			tmp = vec3(100.0);
		}
		extra += tmp;
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
	float denominator 	= 4.0 * max(dot(N,V), 0.0) * max(dot(N,L), 0.0);
	vec3 specular 		= numerator / max(denominator, 0.001);


	float NdotL = max(dot(N,L), 0.0);
	Lo 			+= (kD * albedo / PI + specular) * radiance * NdotL;	

	return Lo + ambient + extra;
}

// EXTRA:
vec3 shade_reflection(vec3 world_pos, vec3 I, vec3 N)
{
	// USE SHAH'S METHOD TO FIND WORLD COLLISIONS
	float reflect_coef = Fresnel_Schlick(dot(N,-I), 0.04);
	vec3 reflect_dir = reflect(I, N);

	vec3 intersect_world_pos = shah_find_world_intersection(subj_env_pos_cubemap, world_pos, reflect_dir);

	vec3 color = reflect_coef * shade(world_pos, intersect_world_pos);
	return color;	
}


void main(void)
{
    // 1. SURFACE MAPPING
    vec3 world_start_pos = world_pos;
    vec3 world_start_dir = normalize(world_pos - photon_source);

    // 2. REFRACTIVE MARCHING
    vec3 sdfv_pos = ( world_to_sdfv_mat * vec4(world_start_pos, 1.0) ).xyz;
    vec3 sdfv_dir = normalize( mat3(world_to_sdfv_mat) * world_start_dir );
    float flux 	  = 1.0;
    sdfv_pos 	  = retract_pos_to_sdfv_bbox(sdfv_pos, sdfv_dir);
    march_refractions(sdfv_pos, flux, sdfv_dir);
    mat4 sdfv_to_world = inverse(world_to_sdfv_mat);
    vec3 world_exit_pos = (sdfv_to_world * vec4(sdfv_pos, 1.0)).xyz;
    vec3 world_exit_dir = normalize( mat3(sdfv_to_world) * sdfv_dir );
    if (flux == 1.0)
    {
        discard;
    }

    // 3. SHAH'S METHOD
    vec3 intersect_world_pos = shah_find_world_intersection(subj_env_pos_cubemap, world_exit_pos, world_exit_dir);

    // 4. SHADE
    vec3 color = flux * shade(world_exit_pos, intersect_world_pos);
	color += shade_reflection(world_start_pos, world_start_dir, normalize(world_normal_interp) );
   // color = color / (color + vec3(1.0));	// HDR
    color = pow(color, vec3(1.0/2.2));		// GAMMA
    frag_color = vec4(color, 1.0);		
}