function map_uniforms(gl, shader_program, program_params)
{
	var params_keys     = Object.keys(program_params);
	var shader_uniforms = Object.keys(shader_program.uniforms);
	var next_text_free  = 0;	
	
	for (var i = 0; i < shader_uniforms.length; i++)
	{
		var uniform_name = shader_uniforms[i];
		var shader_uniform = shader_program.uniforms[uniform_name];
		var param_idx = params_keys.indexOf(uniform_name);
		if (param_idx == -1)
		{
			alert('Unsupported uniform required for shader not found in parameters: ' + uniform_name + ' of type: ' + shader_uniform.type);
			return null;
		}
		var param_data = program_params[uniform_name];
		

		switch(shader_uniform.type)
		{
			case gl.INT:
				gl.uniform1i(shader_uniform.loc, param_data);
				break;
			case gl.FLOAT:
				gl.uniform1f(shader_uniform.loc, param_data);
				break;
			case gl.FLOAT_VEC2:
				gl.uniform2fv(shader_uniform.loc, param_data);
				break;
			case gl.FLOAT_VEC3:
				gl.uniform3fv(shader_uniform.loc, param_data);
				break;				
			case gl.FLOAT_MAT2:
				gl.uniformMatrix2fv(shader_uniform.loc, false, param_data);			
				break;
			case gl.FLOAT_MAT3:
				gl.uniformMatrix3fv(shader_uniform.loc, false, param_data);
				break;
			case gl.FLOAT_MAT4:
				gl.uniformMatrix4fv(shader_uniform.loc, false, param_data);
				break;
			case gl.SAMPLER_CUBE:
				gl.activeTexture(gl.TEXTURE0 + next_text_free);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, param_data);
				gl.uniform1i(shader_uniform.loc, next_text_free);
				next_text_free += 1;
				break;
			case gl.SAMPLER_CUBE_SHADOW:
				// This call and the related methods gave me a lot of grief/bugs, possibly related:
				// https://github.com/KhronosGroup/WebGL/issues/1870
				alert('Unsupported WebGL mode!');
				// gl.activeTexture(gl.TEXTURE0 + next_text_free);
				// gl.bindTexture(gl.TODO, param_data);
				// gl.uniform1i(shader_uniform.loc, next_text_free);
				next_text_free += 1;
				break;
			case gl.SAMPLER_2D:
				gl.activeTexture(gl.TEXTURE0 + next_text_free);
				gl.bindTexture(gl.TEXTURE_2D, param_data);
				gl.uniform1i(shader_uniform.loc, next_text_free);
				next_text_free += 1;
				break;
			case gl.SAMPLER_3D:
				gl.activeTexture(gl.TEXTURE0 + next_text_free);
				gl.bindTexture(gl.TEXTURE_3D, param_data);
				gl.uniform1i(shader_uniform.loc, next_text_free);
				next_text_free += 1;
				break;
			default:
				alert('Unexpected shader uniform type: ' + shader_uniform.type + ' consult: https://registry.khronos.org/webgl/specs/latest/1.0/#DOM-WebGLActiveInfo-type');
				return null;
		}
	}
}
