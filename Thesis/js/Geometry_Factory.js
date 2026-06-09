class Geometry_Factory
{
    constructor(gl)
    {
        this._gl = gl;
        this._id = 0;
    }

    generate(geometry_dict, properties)
    {
        var rv = new Geometry(this._gl, this._id, geometry_dict, properties);
        this._id += 1;
        return rv;
    }
}