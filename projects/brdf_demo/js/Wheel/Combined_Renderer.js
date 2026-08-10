/**********************************************************
* Combined_Renderer:
* 
* Provides a single interface point for webGL API calls, 
* which in turn:
*		A) Calls the webGL API with all appropriate flags
*		B) Calls the Software_Renderer equivalent as needed
*
* NOTE: All API calls, except for the shader related calls 
* are invoked identically.
**********************************************************/

class Combined_Renderer
{
	GLSL_VEC3 = 500000;
	GLSL_MAT4 = 500001;
	
	constructor(webGL_canvas, software_renderer_canvas)
	{
		this.webGL = webGL_canvas.getContext("webgl2", {preserveDrawingBuffer: true, antialias: false});		
		this.jsGL = new Software_Renderer(software_renderer_canvas);

		if ((webGL_canvas.width  != jsGL_canvas.width ) ||
			(webGL_canvas.height != jsGL_canvas.height))
		{
			alert("Error: webGL & jsGL canvases are of mismatched sizes");
			throw Error("Unsupported buffer bind");
		}
		
		this.ctx_width = webGL_canvas.width;
		this.ctx_height = webGL_canvas.height;
		
		// Constants to verify between this class and the Software_Renderer:
		var proprietary_constants = [
										"GLSL_VEC3",
										"GLSL_MAT4",
									];
		for (var i = 0; i < proprietary_constants.length; i++)
		{
			var name = proprietary_constants[i];
			
			if (this[name] != this.jsGL[name])
			{
				var mismatch_msg = "Mismatched Constant: " + name + 
								   " has Combined_Renderer value " + this[name] + 
								   " vs Software_Renderer value: " + this.jsGL[name]; 

				alert(mismatch_msg);
				throw new Error(mismatch_msg);
			}				
		}

		
		// Constants to add to this class and to verify in Software_Renderer:
		var shared_constants = [
								"TRIANGLES", 
								
								"FLOAT",
								
								"COLOR_BUFFER_BIT",
								"DEPTH_BUFFER_BIT",
		
								"CULL_FACE", 
								"DEPTH_TEST", 
								"SCISSOR_TEST", 
		
								"VERTEX_SHADER", 
								"FRAGMENT_SHADER", 
								"COMPILE_STATUS", 
								"LINK_STATUS", 

								"ARRAY_BUFFER",
								"UNIFORM_BUFFER",
								
								"STATIC_DRAW",
								"DYNAMIC_DRAW",
								
								"INVALID_INDEX",
								
								"UNIFORM_BLOCK_DATA_SIZE",
								"UNIFORM_OFFSET",
								];

		for (var i = 0; i < shared_constants.length; i++)
		{
			var name = shared_constants[i];
			this[name] = this.webGL[name];			
			
			if (this.jsGL[name] != this.webGL[name])
			{
				var mismatch_msg = "Mismatched Constant: " + name + 
								   " has webGL value " + this.webGL[name] + 
								   " vs Software_Renderer value: " + this.jsGL[name]; 

				alert(mismatch_msg);
				throw new Error(mismatch_msg);
			}				
		}
	}
		

	///////////////////////////////////
	// Shared API calls
	///////////////////////////////////
	enable(cap)
	{
		this.webGL.enable(cap);
		
		this.jsGL.enable(cap);
	}
	

	scissor(x, y, width, height)
	{
		this.webGL.scissor(x, y, width, height);
		
		this.jsGL.scissor(x, y, width, height);
	}
	
	
	clear(mask)
	{
		this.webGL.clear(mask);
		
		this.jsGL.clear(mask);
	}

	
	clearColor(red, green, blue, alpha)
	{
		this.webGL.clearColor(red, green, blue, alpha);
		
		this.jsGL.clearColor(red, green, blue, alpha);
	}
	
	
	viewport(x, y, width, height)
	{
		this.webGL.viewport(x, y, width, height);
		
		this.jsGL.viewport(x, y, width, height);
	}
	
	
	useProgram(program)
	{
		this.webGL.useProgram(program.webGL);
				
		this.jsGL.useProgram(program.jsGL);
	}


	getUniformIndices(program, uniformNames)
	{
		var webGL_indices = this.webGL.getUniformIndices(program.webGL, uniformNames);

		var jsGL_indices = this.jsGL.getUniformIndices(program.jsGL, uniformNames);

		if (webGL_indices.length != jsGL_indices.length)
		{
			throw Error("Mismatch between webGL and Software_Renderer for 'getUniformIndices'");
		}

		var combined_indices = [];

		for (var i = 0; i < webGL_indices.length; i++)
		{
			var entry = { webGL: webGL_indices[i], jsGL: jsGL_indices[i] };
			combined_indices.push( entry );
		}
		
		return combined_indices;
	}
	

	getActiveUniforms(program, uniformIndices, pname)
	{
		var webGL_indices = [];
		var jsGL_indices = [];
		for (var i = 0; i < uniformIndices.length; i++)
		{
			webGL_indices.push( uniformIndices[i].webGL );
			jsGL_indices.push(  uniformIndices[i].jsGL  );
		}
		
		
		var webGL_uniforms = this.webGL.getActiveUniforms(program.webGL, webGL_indices, pname);		

		var jsGL_uniforms = this.jsGL.getActiveUniforms(program.jsGL, jsGL_indices, pname);
		
		if (webGL_uniforms.length != jsGL_uniforms.length)
		{
			throw Error("Mismatch between webGL and Software_Renderer for 'getActiveUniforms'");
		}

		var combined_offsets = [];
		
		for (var i = 0; i < webGL_uniforms.length; i++)
		{
			var entry = { webGL: webGL_uniforms[i], jsGL: jsGL_uniforms[i] };
			combined_offsets.push( entry );
		}
		
		return combined_offsets;
	}
	

	drawArrays(mode, first, count)
	{
		this.webGL.drawArrays(mode, first, count);
		
		this.jsGL.drawArrays(mode, first, count);		
	}
	
	
	createBuffer()
	{
		var webgl_rv = this.webGL.createBuffer();
		
		var jsgl_rv = this.jsGL.createBuffer();
		
		return  { webGL: webgl_rv, jsGL: jsgl_rv };
	}
	
	
	bindBuffer(target, buffer)
	{
		this.webGL.bindBuffer(target, buffer == null ? null : buffer.webGL);
		
		this.jsGL.bindBuffer(target, buffer == null ? null : buffer.jsGL);
	}
	

	bufferData(target, size_or_srcData, usage)
	{
		this.webGL.bufferData(target, size_or_srcData, usage);
		
		this.jsGL.bufferData(target, size_or_srcData, usage);
	}
	

	bufferSubData(target, offset, srcData)
	{
		this.webGL.bufferSubData(target, offset.webGL, srcData);
		
		this.jsGL.bufferSubData(target, offset.jsGL, srcData);
	}
	
	
	createVertexArray()
	{
		var webgl_rv = this.webGL.createVertexArray();
		
		var jsgl_rv = this.jsGL.createVertexArray();
		
		return { webGL: webgl_rv, jsGL: jsgl_rv };		
	}
	
	
	bindVertexArray(vertexArray)
	{
		this.webGL.bindVertexArray(vertexArray == null ? null : vertexArray.webGL);
		
		this.jsGL.bindVertexArray(vertexArray == null ? null : vertexArray.jsGL);
	}
		
	
	enableVertexAttribArray(index)
	{
		this.webGL.enableVertexAttribArray(index);
		
		this.jsGL.enableVertexAttribArray(index);
	}
	
	
	vertexAttribPointer(index, size, type, normalized, stride, offset)
	{
		this.webGL.vertexAttribPointer(index, size, type, normalized, stride, offset);
		
		this.jsGL.vertexAttribPointer(index, size, type, normalized, stride, offset);
	}
		
		
	///////////////////////////////////
	// webGL only shader calls
	///////////////////////////////////
	createShader(type)
	{
		return this.webGL.createShader(type);
		
		// No Software_Renderer equivalent
	}
	
	
	shaderSource(shader, source)
	{
		this.webGL.shaderSource(shader, source);

		// No Software_Renderer equivalent
	}
	
	
	compileShader(shader)
	{
		this.webGL.compileShader(shader);
		
		// No Software_Renderer equivalent
	}
	
	
	getShaderParameter(shader, pname)
	{
		return this.webGL.getShaderParameter(shader, pname);
		
		// No Software_Renderer equivalent
	}
	
	
	getShaderInfoLog(shader)
	{
		return this.webGL.getShaderInfoLog(shader);
		
		// No Software_Renderer equivalent
	}
	
	
	createProgram()
	{
		return this.webGL.createProgram();
		
		// No Software_Renderer equivalent
	}
	
	
	attachShader(program, shader)
	{
		this.webGL.attachShader(program, shader);
			
		// No Software_Renderer equivalent
	}
	
	
	linkProgram(program)
	{
		this.webGL.linkProgram(program);
		
		// No Software_Renderer equivalent
	}
	
	
	getProgramParameter(program, pname)
	{
		return this.webGL.getProgramParameter(program, pname);
		
		// No Software_Renderer equivalent
	}
		
	
	getProgramInfoLog(program)
	{
		return this.webGL.getProgramInfoLog(program);	
		
		// No Software_Renderer equivalent
	}
		

	getUniformBlockIndex(program, uniformBlockName)
	{
		return this.webGL.getUniformBlockIndex(program.webGL, uniformBlockName);

		// No Software_Renderer equivalent
	}
	
	
	getActiveUniformBlockParameter(program, uniformBlockIndex, pname)
	{
		return this.webGL.getActiveUniformBlockParameter(program.webGL, uniformBlockIndex, pname);

		// No Software_Renderer equivalent
	}
	
	
	bindBufferBase(target, index, buffer)
	{
		this.webGL.bindBufferBase(target, index, buffer.webGL);

		// No Software_Renderer equivalent
	}
	
	
	uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding)
	{
		this.webGL.uniformBlockBinding(program.webGL, uniformBlockBinding, uniformBlockBinding);

		// No Software_Renderer equivalent
	}		
}


