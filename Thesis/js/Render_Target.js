class Render_Target
{
    constructor(gl, width, height, texture_attachments)
    {
        this._width = width;
        this._height = height;

        this._framebuffer = generate_framebuffer(gl, texture_attachments);
    }

    framebuffer()
    {
        return this._framebuffer;
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