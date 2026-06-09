#version 300 es
precision mediump float;

uniform int shah_max_steps;
uniform vec3 subject_world_pos;
uniform sampler2D photon_exit_pos_flux;
uniform sampler2D photon_exit_dir;
uniform samplerCube subj_env_pos_cubemap;

in vec2 uv_interp;

layout (location=0) out vec4 world_impact_pos_flux;
layout (location=1) out vec3 world_impact_dir;

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



void main(void)
{
    vec4 exit_pos_flux = texture(photon_exit_pos_flux, uv_interp).rgba;

    if (exit_pos_flux.a != 0.0)
    {
        vec3 exit_dir      = texture(photon_exit_dir, uv_interp).rgb;
        vec3 env_world_pos;

        // SHAH'S METHOD
        env_world_pos = shah_find_world_intersection(subj_env_pos_cubemap, exit_pos_flux.rgb, exit_dir);

        world_impact_pos_flux  = vec4(env_world_pos, exit_pos_flux.a);
        world_impact_dir       = normalize(exit_pos_flux.rgb - env_world_pos);  
    }
}
