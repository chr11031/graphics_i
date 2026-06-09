#version 300 es

uniform mat4 proj;
uniform mat4 view;
uniform int num_instances;
uniform int source_width;
uniform int source_height;
uniform vec3 color;
uniform sampler2D photon_enter_pos_flux;
uniform sampler2D photon_impact_pos_flux;

in vec3 position;

out vec3 irradiance;

float triangle_surface_area(vec3 a, vec3 b, vec3 c)
{
    vec3 left = b - a;
    vec3 right = c - a;
    float len = 0.5 * length( cross(left, right) );
    return len;
}

void main(void)
{
    // Map vertex to triangulated texture space grid
    int unique_id = 3*gl_InstanceID + gl_VertexID;
    int six_width = 6*(source_width-1);
    int box_row = unique_id / six_width;
    int box_col = (unique_id % six_width) / 6;

    // Check all 3 coordinates for partial occlusion
    vec2 step_size = vec2( 1.0 / float(source_width), 1.0 / float(source_height) );
    vec2 first_coord = 0.5 * step_size + vec2(step_size.x*float(box_col), step_size.y*float(box_row));

    vec2 second_coord;
    vec2 third_coord;
    int box_rem = unique_id % 6;
    if (box_rem < 3)
    {
        second_coord = first_coord + step_size;
        third_coord  = first_coord + vec2(0.0, step_size.y);
    }
    else
    {   
        second_coord = first_coord + vec2(step_size.x, 0.0);
        third_coord  = first_coord + step_size;
    }


    // if (box_rem < 3)
    // {
    //     first_coord = vec2(0.5, 0.5);
    //     second_coord = vec2(0.6, 0.6);
    //     third_coord = vec2(0.5, 0.6);
    // }
    // else
    // {
    //     first_coord = vec2(0.5, 0.5);
    //     second_coord = vec2(0.6, 0.5);
    //     third_coord = vec2(0.6, 0.6);
    // }


    // World SOURCE INFORMATION
    vec3 world_src_pos_1 = texture(photon_enter_pos_flux, first_coord).rgb;
    vec3 world_src_pos_2 = texture(photon_enter_pos_flux, second_coord).rgb;
    vec3 world_src_pos_3 = texture(photon_enter_pos_flux, third_coord).rgb;
    float source_area = triangle_surface_area(world_src_pos_1,
                                              world_src_pos_2,
                                              world_src_pos_3);

    // World SPLAT INFORMATION
    vec4 world_pos_flux;
    vec4 world_pos_flux_1 = texture(photon_impact_pos_flux, first_coord).rgba;
    vec4 world_pos_flux_2 = texture(photon_impact_pos_flux, second_coord).rgba;
    vec4 world_pos_flux_3 = texture(photon_impact_pos_flux, third_coord).rgba;
    if (box_rem == 0 || box_rem == 3)
    {
        world_pos_flux = world_pos_flux_1;
    }
    else if (box_rem == 1 || box_rem == 4)
    {
        world_pos_flux = world_pos_flux_2;
    }
    else
    {
        world_pos_flux = world_pos_flux_3;
    }
    float splat_area = triangle_surface_area(world_pos_flux_1.rgb, 
                                             world_pos_flux_2.rgb, 
                                             world_pos_flux_3.rgb);



    // Clip or render
    if (world_pos_flux_1.a == 0.0 || world_pos_flux_2.a == 0.0 || world_pos_flux_3.a == 0.0)
    {
        // CLIP THIS TRIANGLE
        gl_Position = vec4(-2.0, position.z, 1.0, 1.0); // HINT: Position.z = 0
    }
    else
    {
        gl_Position = proj * view * vec4(world_pos_flux.xyz, 1.0);
        irradiance = (source_area * world_pos_flux.a / splat_area) * color;
    }
}    
