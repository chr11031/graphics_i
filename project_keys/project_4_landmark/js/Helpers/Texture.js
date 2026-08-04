function _make_2d_depth_texture(gl, width, height, filter_type, edge_rule)
{
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter_type);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter_type);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, edge_rule);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, edge_rule);

	return texture;
}


function _make_2d_RGBA_UINT_texture(gl, width, height, filter_type, edge_rule)
{
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4*width*height));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter_type);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter_type);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, edge_rule);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, edge_rule);

	return texture;
}


function _make_2d_RGBA_UINT_texture_from_img(gl, img, filter_type, edge_rule)
{
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter_type);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter_type);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, edge_rule);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, edge_rule);

	return texture;
}


