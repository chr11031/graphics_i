#version 300 es

uniform mat4 proj;
uniform mat4 view;
uniform int num_wide;
uniform int num_tall;
uniform vec3 splat_color;
uniform vec3 subject_pos;
uniform samplerCube subject_env_normal; 
uniform sampler2D photon_leave_pos_flux;
uniform sampler2D photon_impact_pos_flux;

in vec3 position;
in vec3 normal;

out float stretch;
out vec3 interp_pos;
out vec3 interp_normal;
out vec3 world_center;
out vec3 color;



mat4 rotation_from_direction(vec3 in_vec)
{
    vec3 the_vec = normalize(in_vec);
    vec4 x_basis;
    if (the_vec.x == 0.0)
    {
        x_basis = vec4(1.0, 0.0, 0.0, 0.0);
    }
    else if (the_vec.y == 0.0)
    {
        x_basis = vec4(0.0, 1.0, 0.0, 0.0);
    }
    else if (the_vec.z == 0.0)
    {
        x_basis = vec4(0.0, 0.0, 1.0, 0.0);
    }
    else
    {
        x_basis = vec4(1.0, the_vec.x/the_vec.y, -2.0*the_vec.x/the_vec.z, 0.0);
        x_basis = normalize(x_basis);
    }

    vec4 y_basis = vec4( cross(x_basis.xyz, the_vec), 0.0);
    vec4 z_basis = vec4(-the_vec, 0.0);

    mat4 rv = mat4(x_basis, y_basis, z_basis, vec4(0.0, 0.0, 0.0, 1.0));
    return rv;    
}

mat4 splat_transform(vec3 world_pos, vec3 world_dir)
{
    float z_scale = 0.125;
    mat4 S = mat4(  1.0,    0.0,    0.0,        0.0,
                    0.0,    1.0,    0.0,        0.0,
                    0.0,    0.0,    z_scale,    0.0,
                    0.0,    0.0,    0.0,        1.0 );

    mat4 R = rotation_from_direction( world_dir );

    mat4 T = mat4(  1.0,            0.0,            0.0,            0.0,
                    0.0,            1.0,            0.0,            0.0,
                    0.0,            0.0,            1.0,            0.0,
                    world_pos.x,    world_pos.y,    world_pos.z,    1.0 );    

    return T * R * S;
}

void main(void)
{
    // Map vertex to grid-specific instance of geometry
    int unique_id = gl_InstanceID;
    int row_no = unique_id / num_wide;
    int col_no = unique_id % num_wide;
    float u = float(row_no) / ( float(num_wide) - 1.0 );
    float v = float(col_no) / ( float(num_tall) - 1.0 );
    vec2 uv = vec2( u, v );

    // vec4 leave_pos_flux  = texture(photon_leave_pos_flux, uv);      // ??? NEEDED ???
    vec4 impact_pos_flux = texture(photon_impact_pos_flux, uv); 


    // TODO ______MOVE_TO_IF______
    vec3 env_dir = impact_pos_flux.xyz - subject_pos;
    vec3 world_normal = texture(subject_env_normal, env_dir).rgb;
    // TODO ^^^^^^MOVE_TO_IF^^^^^^

    if (gl_InstanceID == 0)
    {
        impact_pos_flux = vec4(0.0,-1.0,0.0,    0.5);
        world_normal = vec3(0.0, 1.0, 0.0);
    }



    if (impact_pos_flux.a == 0.0)
    {
        // CLIP THIS GEOMETRY
        gl_Position = vec4(-2.0, 0.0, 1.0, 1.0); 
    }
    else
    {
        mat4 M = splat_transform(impact_pos_flux.xyz, world_normal);

        float s = 0.1;
        float t_x = 1.0;
        M = mat4(   vec4(  s, 0.0, 0.0, 0.0),
                    vec4(0.0,   s, 0.0, 0.0),
                    vec4(0.0, 0.0,   s, 0.0),
                    vec4(t_x, 0.0, 0.0, 1.0) );



        stretch = length( impact_pos_flux.xyz - subject_pos );


        gl_Position = proj * view * M * vec4(position, 1.0);
        interp_pos = (M * vec4(position, 1.0)).xyz;
        interp_normal = (M * vec4(normal, 0.0)).xyz;
        // world_center = impact_pos_flux.xyz;
        world_center = vec3(1.0, 0.0, 0.0);
        color = vec3(0.5, 0.1, 0.7);
    }
}    
