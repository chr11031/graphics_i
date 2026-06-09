class Render_Target_Null
{
    constructor(width, height)
    {
        this._width = width;
        this._height = height;

        this._framebuffer = null;
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