class Render_Engine
{
    constructor()
    {
        this._gl = gl;
        this._shader_programs = {};

        this._vao_lut = {};
    }

    register_gl(gl)
    {
        this._gl = gl;
    }

    register_shaders(shader_definitions)
    {
        for (var i = 0; i < shader_definitions.length; i++)
            {
                var id              = shader_definitions[i].id;
                var vertex_shader   = shader_definitions[i].vertex_shader;
                var frag_shader     = shader_definitions[i].frag_shader;

                this._shader_programs[id] = get_shader_program(this._gl, id, vertex_shader, frag_shader);
                this._vao_lut[id] = {};
            }
    }

    shader(id)
    {
        return this._shader_programs[id];
    }

    register_geometry(geometry_shader_mappings)
    {
        for (var i = 0; i < geometry_shader_mappings.length; i++)
        {
            var geometry    = geometry_shader_mappings[i].geometry;
            var geometry_id = geometry.id();

            var shaders     = geometry_shader_mappings[i].shaders;

            for (var j = 0; j < shaders.length; j++)
            {
                var shader_id = shaders[j];

                if (!Object.keys(this._vao_lut).includes(shader_id))
                {
                    alert('Error: Shader ' + shader_id + ' not in registered shaders');
                    return;
                }

                var shader_program = this._shader_programs[shader_id];
                var buffer_set = geometry.buffer_set();
                this._vao_lut[shader_id][geometry_id] = generate_vao(this._gl, shader_program, buffer_set);
            }
        }
    }    

    vao(shader_id, geometry_id)
    {
        if (!Object.keys(this._vao_lut).includes(shader_id))
        {
            alert('Error: Shader ' + shader_id + ' not in registered shaders');
            return null;
        }

        if (!Object.keys(this._vao_lut[shader_id]).includes(geometry_id.toString()))
        {
            alert('Error: Geometry with id ' + geometry_id + ' not in vao lut');
            return null;
        }

        return this._vao_lut[shader_id][geometry_id];
    }
}