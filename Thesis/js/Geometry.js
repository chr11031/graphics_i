class Geometry
{
    constructor(gl, id, geometry_dict, properties)
    {
        this._gl = gl;
        this._id = id;
        this._type = null;
        this._raw_geometry = {};
        this._buffer_set = {};
        this._properties = {};

        var geometry_keys = Object.keys(geometry_dict);

        if (geometry_keys.includes("index"))
        {
            alert("Error: Implelmentation reserves 'index' as keyword, cannot use in this object");
            return;            
        }

        // Parse TYPE
        this._type = geometry_dict['type'];
        if (this._type != 'POINTS' && this._type != 'LINES' && this._type != 'TRIANGLES')
        {
            alert('Error: Invalid Geometry configuration! ' + this._type + ' is not a valid geometry type');
            return;           
        }
        geometry_keys.splice( geometry_keys.indexOf('type'), 1 );

        // Parse NUMBER of elements
        this._buffer_set.vertex_count = geometry_dict['vertex_count'];
        if (this._buffer_set.vertex_count === null || this._buffer_set.vertex_count < 1)
        {
            alert('Error: Invalid Geometry configuration! ' + this._buffer_set.vertex_count + ' is not a valid count of geometry data points');
            return;           
        }
        geometry_keys.splice( geometry_keys.indexOf('vertex_count'), 1 );

        // COPY geometry
        for (var i = 0; i < geometry_keys.length; i++)
        {
            var key = geometry_keys[i];
            this._raw_geometry[key] = structuredClone(geometry_dict[key]);
        }

        this._build_buffer_set();

        // COPY properties
        var property_keys = Object.keys(properties);
        for (var i = 0; i < property_keys.length; i++)
        {
            var key = property_keys[i];
            this._properties[key] = properties[key];            
        }
    }

    _build_buffer_set()
    {
        var raw_keys = Object.keys(this._raw_geometry);
        for (var i = 0; i < raw_keys.length; i++)
        {
            var key = raw_keys[i];
            var raw_data = this._raw_geometry[key];
            
            var data_buf = this._gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, data_buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(raw_data), gl.STATIC_DRAW, 0);

            this._buffer_set[key] = data_buf;
        }

        // Build fixed INDEX list
        var indices = [];
        for (var i = 0; i < this._buffer_set.vertex_count; i++)
        {
            indices.push(i);
        }
        var idx_buf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx_buf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW, 0);
        this._buffer_set['index'] = idx_buf;        
        
        // 'this._buffer_set.vertex_count' is already set beforehand
    }

    id()
    {
        return this._id;
    }

    buffer_set()
    {
        return this._buffer_set;
    }

    list_properties()
    {
        return Object.keys(this._properties);
    }

    property(key)
    {
        return this._properties[key];
    }

    set_property(key, value)
    {
        this._properties[key] = value;
    }

    vertex_count()
    {
        return this._buffer_set.vertex_count;
    }

    primitive_type()
    {
        if (this._type == 'TRIANGLES')
        {
            return this._gl.TRIANGLES;            
        }
        else if (this._type == 'LINES')
        {
            return this._gl.LINES;            
        }
        else if (this._type == 'POINTS')
        {
            return this._gl.POINTS;            
        }
        else
        {
            return null;
        }
    }
}