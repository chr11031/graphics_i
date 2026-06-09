#version 300 es
precision mediump float;


// TODO: PRUNE AND MINIMALIZE
in float stretch;
in vec3 interp_pos;
in vec3 interp_normal;
in vec3 world_center;
in vec3 color;

layout (location=4) out vec4 frag_color;

void main(void)
{
    vec3 out_color = color;
    out_color = vec3(0.0);
    vec3 N = normalize( interp_normal );
    vec3 L = normalize( vec3(0.0, 1.0, 0.0) - interp_pos );
    float diffuse = max(0.0, dot( L, N ));
//    out_color = vec3(0.0, 0.0, diffuse);



    float dist = length(interp_pos - world_center);

    if (dist < 0.04)
        out_color.b = 1.0;

    frag_color = vec4(out_color, 0.5);
}