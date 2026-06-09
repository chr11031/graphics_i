function find_max_radius(mesh_data)
{
    var mesh_keys = Object.keys(mesh_data);
    if (mesh_keys.includes('vertex_count') == false)
    {
        alert('Invalid geometry passed to find_max_radius(): missing \'vertex_count\' attribute');
        return null;
    }

    if (mesh_keys.includes('position') == false)
    {
        alert('Invalid geometry passed to find_max_radius(): missing \'position\' attribute');
        return null;        
    }

    var max_len = mesh_data.position[0]*mesh_data.position[0] + 
                  mesh_data.position[1]*mesh_data.position[1] + 
                  mesh_data.position[2]*mesh_data.position[2];


    for (var i = 3; i < mesh_data.vertex_count; i+= 3)
    {
        var tmp_len = mesh_data.position[i  ] * mesh_data.position[i  ] + 
                      mesh_data.position[i+1] * mesh_data.position[i+1] +   
                      mesh_data.position[i+2] * mesh_data.position[i+2];  

        if (tmp_len > max_len)
        {
            max_len = tmp_len;
        }
    }
    
    return Math.sqrt(max_len);
}