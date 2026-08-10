class Cook_Torrance_BRDF
{		
	static external_resources()
	{
		var resources = [
				
				["cook_torrance_brdf.vs",	"shaders/3D/cook_torrance_brdf.vs",		"text"],
				["cook_torrance_brdf.fs",	"shaders/3D/cook_torrance_brdf.fs",		"text"],
		];
		
		return resources;
	}
	
	
	constructor(gl, width, height)
	{	
		this.gl = gl;
	
		this.ctx_width  = width;
		this.ctx_height = height;
							
		this.msaa_texture = null;
		this.msaa_depth   = null;
		this.msaa_fbo     = null;
		
		this.cook_torrance_brdf = 
		{
			progam: null,						
			block_idx: null,
			ubo: null,
			proj_ubo_offset: null,
			view_ubo_offset: null,
			model_ubo_offset: null,
			
			light_pos_offset: null,
			camera_pos_offset: null,
			
			albedo_location: null,
			
		};			
	
	
		this._init();
	}
	
	
	_init_framebuffers()
	{
		var num_samples = gl.getParameter(gl.MAX_SAMPLES)
		this.msaa_texture = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.msaa_texture);
		gl.renderbufferStorageMultisample(gl.RENDERBUFFER, num_samples, gl.RGBA8, this.ctx_width, this.ctx_height);
		
		
		this.msaa_depth = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.msaa_depth);
		gl.renderbufferStorageMultisample(gl.RENDERBUFFER, num_samples, gl.DEPTH_COMPONENT24, this.ctx_width, this.ctx_height);

		this.msaa_fbo = _make_framebuffer(gl, [
											   { renderbuffer: this.msaa_texture, att: gl.COLOR_ATTACHMENT0 },
											   { renderbuffer: this.msaa_depth,   att: gl.DEPTH_ATTACHMENT  },
											  ] );					
	}

				
	_init_cook_torrance_brdf()
	{				
		// Program
		var vs = _make_gl_shader(gl, resources["cook_torrance_brdf.vs"], gl.VERTEX_SHADER);
		var fs = _make_gl_shader(gl, resources["cook_torrance_brdf.fs"], gl.FRAGMENT_SHADER);
		this.cook_torrance_brdf.program = _make_gl_program(gl, vs, fs);					

		// UBO todos....
		this.cook_torrance_brdf.ubo = gl.createBuffer();
		gl.bindBuffer(gl.UNIFORM_BUFFER, this.cook_torrance_brdf.ubo);

		this.cook_torrance_brdf.block_idx = gl.getUniformBlockIndex(this.cook_torrance_brdf.program, 
												  "matrix_data");
												  
		var block_size = gl.getActiveUniformBlockParameter(this.cook_torrance_brdf.program,
														   this.cook_torrance_brdf.block_idx,
														   gl.UNIFORM_BLOCK_DATA_SIZE);

		gl.bufferData(gl.UNIFORM_BUFFER, block_size, gl.DYNAMIC_DRAW);

		gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, this.cook_torrance_brdf.ubo);
		gl.uniformBlockBinding(this.cook_torrance_brdf.program, this.cook_torrance_brdf.block_idx, 1);
		


		
		var ubo_names = ["proj", "view", "model", "light_pos", "camera_pos"];
		var ubo_indices = gl.getUniformIndices(this.cook_torrance_brdf.program,
											   ubo_names);
		var ubo_offsets = gl.getActiveUniforms(this.cook_torrance_brdf.program,
											   ubo_indices,
											   gl.UNIFORM_OFFSET);



		this.cook_torrance_brdf.proj_ubo_offset   = ubo_offsets[0];
		this.cook_torrance_brdf.view_ubo_offset   = ubo_offsets[1];
		this.cook_torrance_brdf.model_ubo_offset  = ubo_offsets[2];
		this.cook_torrance_brdf.light_pos_offset  = ubo_offsets[3];
		this.cook_torrance_brdf.camera_pos_offset = ubo_offsets[4];
		

		// Texture locations
		this.cook_torrance_brdf.albedo_location = gl.getUniformLocation(this.cook_torrance_brdf.program, "albedo");			
		this.cook_torrance_brdf.metal_location  = gl.getUniformLocation(this.cook_torrance_brdf.program, "metal");			
		this.cook_torrance_brdf.rough_location  = gl.getUniformLocation(this.cook_torrance_brdf.program, "rough");			
	}
	
	
	_init()
	{
		this._init_framebuffers();
		
		this._init_cook_torrance_brdf();
	}
	

	_draw_cook_torrance_brdf(proj_mat, view_mat, 
							 light_pos, camera_pos,
							 drawables)
	{	
		// Progam & Uniforms common to both objects
		gl.useProgram(this.cook_torrance_brdf.program);

		gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this.cook_torrance_brdf.ubo);
		gl.uniformBlockBinding(this.cook_torrance_brdf.program, this.cook_torrance_brdf.block_idx, 0);

		gl.bindBuffer(gl.UNIFORM_BUFFER, this.cook_torrance_brdf.ubo);					
		gl.bufferSubData(gl.UNIFORM_BUFFER, this.cook_torrance_brdf.proj_ubo_offset,  		proj_mat.data,  				0);
		gl.bufferSubData(gl.UNIFORM_BUFFER, this.cook_torrance_brdf.view_ubo_offset,  		view_mat.data,		  			0);
		gl.bufferSubData(gl.UNIFORM_BUFFER, this.cook_torrance_brdf.light_pos_offset,  		new Float32Array(light_pos),	0);
		gl.bufferSubData(gl.UNIFORM_BUFFER, this.cook_torrance_brdf.camera_pos_offset,  	new Float32Array(camera_pos),	0);



		// Bind cubemap texture
		

		for (var i = 0; i < drawables.length; i++)
		{
			// Model matrix update
			gl.bufferSubData(gl.UNIFORM_BUFFER, this.cook_torrance_brdf.model_ubo_offset, drawables[i].uniforms.model.data, 0);

			// Texture update
			gl.activeTexture(gl.TEXTURE0 + 1);
			gl.bindTexture(gl.TEXTURE_2D, drawables[i].uniforms.albedo);
			gl.uniform1i(this.cook_torrance_brdf.albedo_location, 1);

			gl.activeTexture(gl.TEXTURE0 + 2);
			gl.bindTexture(gl.TEXTURE_2D, drawables[i].uniforms.metal);
			gl.uniform1i(this.cook_torrance_brdf.metal_location, 2);


			gl.activeTexture(gl.TEXTURE0 + 3);
			gl.bindTexture(gl.TEXTURE_2D, drawables[i].uniforms.rough);
			gl.uniform1i(this.cook_torrance_brdf.rough_location, 3);


			gl.bindVertexArray(drawables[i].vao);
			
					
			
			if (drawables[i].indexed)
			{
				gl.drawElements(
					drawables[i].primitive_type,
					drawables[i].num_verts,
					gl.UNSIGNED_INT,
					0,					
				);
			}
			else
			{
				gl.drawArrays(
					drawables[i].primitive_type,
					0,
					drawables[i].num_verts
				);								
			}
		}
		

		// Unbind VAO 
		gl.bindVertexArray(null);
	}
	

	draw(framebuffer_target,
		 user_proj_mat, 
		 user_view_mat,
		 light_pos,
		 camera_pos,
		 drawables, 
		 clear_color)
	{
		
		

		// 4. Draw the right side part with the cell shader, targeting the argument framebuffer
		//gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer_target);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.msaa_fbo);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.viewport(0, 0, this.ctx_width, this.ctx_height);
		this._draw_cook_torrance_brdf(user_proj_mat, user_view_mat, 
									  light_pos, camera_pos,
									  drawables);
		


		// Blit the nice version over...
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.msaa_fbo);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer_target);
		gl.blitFramebuffer(0, 0, this.ctx_width, this.ctx_height, 	// <-- src
						   0, 0, this.ctx_width, this.ctx_height,  // <-- dst 
						   gl.COLOR_BUFFER_BIT, gl.NEAREST);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);


	}	
}
	
	
