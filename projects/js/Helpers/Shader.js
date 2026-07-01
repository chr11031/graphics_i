function _make_gl_shader(gl, shader_text, type)
{
	var i = 0;
	while (shader_text[i] == ' ' || shader_text[i] == '\t' || shader_text[i] == '\r' || shader_text[i] == '\n')
	{
		i += 1;
	}
	shader_text = shader_text.substr(i);
	
	
	var shader = gl.createShader(type);
	gl.shaderSource(shader, shader_text);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		alert('Failed to compile shader:' + name + ' of type: ' + type + ': ' + gl.getShaderInfoLog(shader));
		return null;
	}								
						
	return shader;
}


function _make_gl_program(gl, vert_shader, frag_shader)
{
	var program = gl.createProgram();
	gl.attachShader(program, vert_shader);
	gl.attachShader(program, frag_shader);
	gl.linkProgram(program);
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS))
	{
		alert('Failed to link shader program:' + gl.getProgramInfoLog(program));
		return null;
	}
	
	return program;
}


