function generate_vao(gl, shader_program, geometry_buffers)
{
	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	var geometry_attributes = Object.keys(geometry_buffers);
	var shader_attributes = Object.keys(shader_program.attributes);

	for (var i = 0; i < shader_attributes.length; i++)
	{
		var attribute_name = shader_attributes[i];
		var shader_attribute = shader_program.attributes[attribute_name];
		if (attribute_name.startsWith('gl_'))
		{
			// Built-in attributes are included here and we don't want to map to them
			continue;
		}
		
		var geometry_idx = geometry_attributes.indexOf(attribute_name);
		if (geometry_idx == -1)
		{
			alert('Unsupported attribute ' + attribute_name + ' not found in geometry buffer set');
			return null;
		}
		var geometry_buf = geometry_buffers[attribute_name];

		var type = null;
		var size = 0;
		switch(shader_attribute.type)
		{
			case gl.FLOAT_VEC2:
				type = gl.FLOAT;
				size = 2;
				break;
			case gl.FLOAT_VEC3:
				type = gl.FLOAT;
				size = 3;
				break;
			case gl.FLOAT_VEC4:
				type = gl.FLOAT;
				size = 4;
				break;
			default:
				alert('Unexpected shader attribute type: ' + shader_attribute.type + ' consult: https://registry.khronos.org/webgl/specs/latest/1.0/#DOM-WebGLActiveInfo-type');
				return null;
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, geometry_buf);		
		gl.vertexAttribPointer(shader_attribute.loc, size, type, false, 0, 0);
		gl.enableVertexAttribArray(shader_attribute.loc);
	}
	
	// End by binding the element buffer object
	if (geometry_attributes.indexOf('index') == -1)
	{
		alert('Geometry buffer must include index buffer object');
		return null;
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry_buffers['index']);	
	gl.bindVertexArray(null);

	return vao;
}
