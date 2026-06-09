#version 300 es
precision mediump float;

uniform highp sampler3D sdfv;
uniform sampler2D photon_pos_flux;
uniform sampler2D photon_dir;
uniform mat4 world_to_sdfv_mat;
uniform float eta;
uniform float sdfv_voxel_size;

in vec2 uv_interp;

layout (location=0) out vec4 world_pos_flux;
layout (location=1) out vec3 world_dir;

#define OUTSIDE(low,high,val) (val<low)||(val>high)
#define SDF_EPSILON   0.001
#define SDF_MAX_STEPS 64



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
		flux *= reflect_coef;
		return reflect(I, N);
	}
	else
	{
		flux *= refract_coef;
		return (	eta * I - (eta * dot(N, I) + sqrt(k)) * N	);
	}
}

#define SDF_DELTA 1.0/64.0
vec3 sdfv_normal(vec3 pos)
{
	vec3 N;
	N.x = 	texture(sdfv, vec3(pos.x+SDF_DELTA, pos.y, pos.z)).r - 
			texture(sdfv, vec3(pos.x-SDF_DELTA, pos.y, pos.z)).r;
	N.y = 	texture(sdfv, vec3(pos.x, pos.y+SDF_DELTA, pos.z)).r - 
			texture(sdfv, vec3(pos.x, pos.y-SDF_DELTA, pos.z)).r;
	N.z = 	texture(sdfv, vec3(pos.x, pos.y, pos.z+SDF_DELTA)).r - 
			texture(sdfv, vec3(pos.x, pos.y, pos.z-SDF_DELTA)).r;
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

        if ( OUTSIDE(0.0,1.0,pos.x) || OUTSIDE(0.0,1.0,pos.y) || OUTSIDE(0.0,1.0,pos.z) )
        {	
            return;
        }
    }
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

void main(void)
{
	vec4 world_start_pos_flux = texture(photon_pos_flux, uv_interp).rgba;
	vec3 world_start_dir 	  = texture(photon_dir, uv_interp).rgb;

	if (length(world_start_dir) != 0.0)
	{
		// Find pos, direction, flux
		vec3 pos_sdfv = ( world_to_sdfv_mat * vec4(world_start_pos_flux.rgb,1.0) ).xyz;
		vec3 dir_sdfv = normalize( mat3(world_to_sdfv_mat) * world_start_dir );

		float flux 	  = world_start_pos_flux.a;
		pos_sdfv 	  = retract_pos_to_sdfv_bbox(pos_sdfv, dir_sdfv);

		// March through	
		march_refractions(pos_sdfv, flux, dir_sdfv);

		// Write outputs
		mat4 sdfv_to_world = inverse(world_to_sdfv_mat);
		world_pos_flux = vec4( (sdfv_to_world * vec4(pos_sdfv, 1.0)).xyz, (flux == 1.0 ? 0.0 : flux) );
		world_dir = normalize( mat3(sdfv_to_world) * dir_sdfv );
	}
	else
	{
		world_dir = vec3(0.0, 0.0, 0.0); // Indicate 'NA' status
	}
}