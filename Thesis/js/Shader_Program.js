class Shader_Program
{
	constructor()
	{
		// NA
	}
	
	_get_shader(gl, name, shader_type, shader_source)
	{
		var shader;
		if (shader_type == "vertex")
		{
			shader = gl.createShader(gl.VERTEX_SHADER);
		}
		else if (shader_type == "fragment")
		{
			shader = gl.createShader(gl.FRAGMENT_SHADER);     
		}
		else
		{
			alert("Invalid " + name + " shader type: "+ shader_type);
			return null;
		}

		gl.shaderSource(shader, shader_source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		{
			alert("Error compiling " + name + " shader " + "(" + shader_type + " shader): " + gl.getShaderInfoLog(shader) + shader_source);
			console.log(shader_source);
			return null;
		}
		return shader;
	}
	
	init(gl, name, vert_text, frag_text, feedback_args=[])
	{
		// Create shaders
		var vert_shader = this._get_shader(gl, name, "vertex", vert_text);
		if (vert_shader == null) 
		{	
			return false;
		}
		
		var frag_shader = this._get_shader(gl, name, "fragment", frag_text);
		if (frag_shader == null)
		{
			return false;
		}
		
		// Link shaders
        this.program = gl.createProgram();
		gl.attachShader(this.program, vert_shader);
		gl.attachShader(this.program, frag_shader);

		// Setup transform feedback values (if any) // <-- DEBUG REMOVE
		if (feedback_args.length != 0)
		{					
			gl.transformFeedbackVaryings(this.program, feedback_args, gl.INTERLEAVE_ATTRIBS);
		}


		gl.linkProgram(this.program);		
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
		{
			alert("Error linking " + name + " shader program: " + gl.getProgramInfoLog(this.program) + '\n' + frag_text);
		}
		
		
		// Map attributes
		var num_attributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
		this.attributes = {};
		for (var i = 0; i < num_attributes; i++)
		{
			var info = gl.getActiveAttrib(this.program, i);
			var attrib_loc = gl.getAttribLocation(this.program, info.name)

			this.attributes[info.name] 		= new Object();
			this.attributes[info.name].loc  = attrib_loc;
			this.attributes[info.name].type = info.type;
			this.attributes[info.name].size = info.size;
		}
		
		// Map uniforms
		var num_uniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
		this.uniforms = {};
		for (var i = 0; i < num_uniforms; i++)
		{
			var info = gl.getActiveUniform(this.program, i);
			var uniform_loc = gl.getUniformLocation(this.program, info.name);
			
			this.uniforms[info.name]      = new Object();
			this.uniforms[info.name].loc  = uniform_loc;
			this.uniforms[info.name].type = info.type;
			this.uniforms[info.name].size = info.size;
		}
		
		return true;		
	}
}


function get_shader_program(gl, name, vert_text, frag_text, feedback_args=[])
{
	var program = new Shader_Program();
	if (program.init(gl, name, vert_text, frag_text) == false)
	{
		return null;
	}
	
	return program;
}