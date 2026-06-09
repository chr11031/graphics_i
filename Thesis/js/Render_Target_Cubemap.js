class Render_Target_Cubemap
{
    constructor(gl, width, height, texture_attachments)
    {
        this._width = width;
        this._height = height;
        this._framebuffers = {};

        // Build each framebuffer
        var positive_x_attachments = this._texture_attachments_list_with_tex_param(texture_attachments, gl.TEXTURE_CUBE_MAP_POSITIVE_X);
        this._framebuffers.px = generate_framebuffer(gl, positive_x_attachments);

        var positive_y_attachments = this._texture_attachments_list_with_tex_param(texture_attachments, gl.TEXTURE_CUBE_MAP_POSITIVE_Y);
        this._framebuffers.py = generate_framebuffer(gl, positive_y_attachments);

        var positive_z_attachments = this._texture_attachments_list_with_tex_param(texture_attachments, gl.TEXTURE_CUBE_MAP_POSITIVE_Z);
        this._framebuffers.pz = generate_framebuffer(gl, positive_z_attachments);

        var negative_x_attachments = this._texture_attachments_list_with_tex_param(texture_attachments, gl.TEXTURE_CUBE_MAP_NEGATIVE_X);
        this._framebuffers.nx = generate_framebuffer(gl, negative_x_attachments);

        var negative_y_attachments = this._texture_attachments_list_with_tex_param(texture_attachments, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y);
        this._framebuffers.ny = generate_framebuffer(gl, negative_y_attachments);

        var negative_z_attachments = this._texture_attachments_list_with_tex_param(texture_attachments, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);
        this._framebuffers.nz = generate_framebuffer(gl, negative_z_attachments);
    }

    _texture_attachments_list_with_tex_param(texture_attachments, tex_param)
    {
        var rv = [];
        for (var i = 0; i < texture_attachments.length; i++)
            {
                var attachment = {};
                attachment.texture  = texture_attachments[i].texture;
                attachment.att      = texture_attachments[i].att;
                attachment.tex      = tex_param;
                rv.push(attachment); 
            }

        return rv;
    }

    framebuffers()
    {
        return this._framebuffers;
    }

    width()
    {
        return this._width;
    }

    height()
    {
        return this._height;
    }


}