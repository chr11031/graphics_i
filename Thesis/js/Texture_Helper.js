function generate_2d_RGBA_HFLOAT_texture_from_img(gl, img)
{
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	return texture;
}

function generate_2d_float_texture(gl, width, height)
{
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, width, height, 0, gl.RED, gl.HALF_FLOAT, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;	
}


function generate_2d_float_texture_from_img(gl, img)
{
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, gl.RED, gl.HALF_FLOAT, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;	
}

function generate_2d_RGBA_UINT_texture(gl, width, height)
{
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4*width*height));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;
}

function generate_2d_RGBA_HFLOAT_texture(gl, width, height)
{
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, new Uint16Array(4*width*height));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;
}

function generate_2d_depth_texture(gl, width, height)
{
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;
}

function generate_2d_depth_stencil_texture(gl, width, height)
{
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH24_STENCIL8, width, height, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return texture;
}



function generate_3d_float_texture(gl, raw_data, size_x, size_y, size_z)
{
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	var texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0); // TODO VERIFY this is necessary
	gl.bindTexture(gl.TEXTURE_3D, texture);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // ???
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// The following line is completely legal but fails for reasons only David Lynch might be able to palette:
	// gl.texImage3D(gl.TEXTURE_3D, 1, gl.R32F, size_x, size_y, size_z, 0, gl.RED, gl.FLOAT, raw_data, 0); // ???

	// WORKS, but sucks
	//gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));
	
	// The following gold came from this angel: https://www.reddit.com/r/webgl/comments/wp3p4z/problems_using_internal_formats_other_than_r8_for/
	gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R32F, size_x, size_y, size_z);
	gl.texSubImage3D(gl.TEXTURE_3D, 0, 0,0,0, size_x, size_y, size_z, gl.RED, gl.FLOAT, raw_data);

	// Vanilla case that works
	//gl.texStorage3D(gl.TEXTURE_3D, 1, gl.R32F, 4, 1,1);
	//gl.texSubImage3D(gl.TEXTURE_3D, 0, 0,0,0, 4,1,1, gl.RED, gl.FLOAT, new Float32Array([0.49, 0.2, 0.3, 0.2]));
	
	return texture;
}

function generate_empty_cubemap_RGBA_HFLOAT_texture(gl, width_height)
{			
	// function generate_2d_RGBA_HFLOAT_texture(gl, width, height)
	// {
	// 	var texture = gl.createTexture();
	// 	gl.bindTexture(gl.TEXTURE_2D, texture);
	// 	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, new Uint16Array(4*width*height));
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	// 	return texture;
	// }

	var texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	var internal_format = gl.RGBA16F;
	var format = gl.RGBA;
	var data_type = gl.HALF_FLOAT;
	var filler_texture = null;

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);


	return texture;
}

function generate_empty_cubemap_RGBA_texture(gl, width_height)
{			
	var texture = gl.createTexture();

	var filler_texture = new Uint8Array(4*width_height*width_height);

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, width_height, width_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, width_height, width_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, width_height, width_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, width_height, width_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, width_height, width_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, width_height, width_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, filler_texture);
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);


	return texture;

}

function generate_empty_cubemap_depth_texture(gl, width_height)
{			
	var texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// DEBUG: alert(gl.getTexParameteri(texture, GL_TEXTURE_COMPARE_MODE));

	var internal_format = gl.DEPTH_COMPONENT32F;
	var format = gl.DEPTH_COMPONENT;
	var data_type = gl.FLOAT;
	var filler_texture = null;


	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, internal_format, width_height, width_height, 0, format, data_type, filler_texture);


	return texture;

}


function generate_cubemap_texture(gl, neg_x, neg_y, neg_z, pos_x, pos_y, pos_z)
{			
	var texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, neg_x.width, neg_y.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, neg_x);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, neg_x.width, neg_y.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, neg_y);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, neg_x.width, neg_y.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, neg_z);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, neg_x.width, neg_y.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pos_x);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, neg_x.width, neg_y.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pos_y);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, neg_x.width, neg_y.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pos_z);
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);


	return texture;
}
