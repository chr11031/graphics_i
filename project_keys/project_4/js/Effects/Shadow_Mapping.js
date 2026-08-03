class Shadow_Mapping
{		
	static external_resources()
	{
		var resources = [
				
				["shadow_first.vs",		"shaders/3D/shadow_first.vs",		"text"],
				["shadow_first.fs",		"shaders/3D/shadow_first.fs",		"text"],		
				["shadow_second.vs",	"shaders/3D/shadow_second.vs",		"text"],
				["shadow_second.fs",	"shaders/3D/shadow_second.fs",		"text"],
		];
		
		return resources;
	}
	
	
	constructor(gl, width, height)
	{	
		this.gl = gl;
	
		this.ctx_width  = width;
		this.ctx_height = height;
							
		this.first_pass_texture = null;
		this.first_pass_depth   = null;
		this.first_pass_fbo     = null;					

		
		this.shadow_first = 
		{			
			progam: null,						
			ubo: null,
			proj_ubo_offset: null,
			view_ubo_offset: null,
			model_ubo_offset: null,
			
			albedo_location: null,
		};
		
		
		this.shadow_second = 
		{
			verts_vbo: null,
			uvs_vbo: null,
			vao: null,
			vert_count: null,
			
			program: null,	

			source_texture_location: null,
		};			
	
	
		this._init();
	}
	
	
	_init_framebuffer()
	{
		this.first_pass_texture = _make_2d_RGBA_UINT_texture(gl, this.ctx_width/2, this.ctx_height, gl.LINEAR, gl.CLAMP_TO_EDGE);
		this.first_pass_depth   = _make_2d_depth_texture(gl, this.ctx_width/2, this.ctx_height, gl.LINEAR, gl.CLAMP_TO_EDGE);
		this.first_pass_fbo     = _make_framebuffer(gl, [
															{ texture: this.first_pass_texture, att: gl.COLOR_ATTACHMENT0, tex: gl.TEXTURE_2D },
															{ texture: this.first_pass_depth, 	att: gl.DEPTH_ATTACHMENT,  tex: gl.TEXTURE_2D },
														] );					
	}

	
	_init_shadow_first()
	{		
		// Program
		var vs = _make_gl_shader(gl, resources["shadow_first.vs"], gl.VERTEX_SHADER);
		var fs = _make_gl_shader(gl, resources["shadow_first.fs"], gl.FRAGMENT_SHADER);
		this.shadow_first.program = _make_gl_program(gl, vs, fs);					
		

		// UBO todos....
		this.shadow_first.ubo = gl.createBuffer();
		gl.bindBuffer(gl.UNIFORM_BUFFER, this.shadow_first.ubo);

		var block_index = gl.getUniformBlockIndex(this.shadow_first.program, 
												  "matrix_data");
												  
		
		var block_size = gl.getActiveUniformBlockParameter(this.shadow_first.program,
														   block_index,
														   gl.UNIFORM_BLOCK_DATA_SIZE);

		gl.bufferData(gl.UNIFORM_BUFFER, block_size, gl.DYNAMIC_DRAW);

		gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this.shadow_first.ubo);
		gl.uniformBlockBinding(this.shadow_first.program, block_index, 0);

		

		
		var ubo_names = ["proj", "view", "model"];
		var ubo_indices = gl.getUniformIndices(this.shadow_first.program,
											   ubo_names);
		var ubo_offsets = gl.getActiveUniforms(this.shadow_first.program,
											   ubo_indices,
											   gl.UNIFORM_OFFSET);



		this.shadow_first.proj_ubo_offset  = ubo_offsets[0];
		this.shadow_first.view_ubo_offset  = ubo_offsets[1];
		this.shadow_first.model_ubo_offset = ubo_offsets[2];
		

		// Texture location
		this.shadow_first.albedo_location = gl.getUniformLocation(this.shadow_first.program, "albedo");						
	}
	
				
	_init_shadow_second()
	{				
		// VERTs
		var verts = new Float32Array([
			-1.0, -1.0,
			 1.0, -1.0,
			 1.0,  1.0,
			 
			 1.0,  1.0,
			-1.0,  1.0,
			-1.0, -1.0,
		]);

		this.shadow_second.verts_vbo = gl.createBuffer();
		
		gl.bindBuffer(
			gl.ARRAY_BUFFER,
			this.shadow_second.verts_vbo
		);
						
		gl.bufferData(
			gl.ARRAY_BUFFER,
			verts,
			gl.STATIC_DRAW
		);
		
		
		// UVs
		var uvs = new Float32Array([
			 0.0,  0.0,
			 1.0,  0.0,
			 1.0,  1.0,
			 
			 1.0,  1.0,
			 0.0,  1.0,
			 0.0,  0.0,
		]);

		this.shadow_second.uvs_vbo = gl.createBuffer();
		
		gl.bindBuffer(
			gl.ARRAY_BUFFER,
			this.shadow_second.uvs_vbo
		);
		
		gl.bufferData(
			gl.ARRAY_BUFFER, 
			uvs, 
			gl.STATIC_DRAW
		);
		
		
		// vao
		this.shadow_second.vao = gl.createVertexArray();
		gl.bindVertexArray(this.shadow_second.vao);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.shadow_second.verts_vbo);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(
			0,
			2,
			gl.FLOAT,
			false,
			0,
			0				
		);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.shadow_second.uvs_vbo);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(
			1,
			2,
			gl.FLOAT,
			false,
			0,
			0					
		);
		
		gl.bindVertexArray(null);					

		
		// Vert Count 
		this.shadow_second.vert_count = 6;


		// Program
		var vs = _make_gl_shader(gl, resources["shadow_second.vs"], gl.VERTEX_SHADER);
		var fs = _make_gl_shader(gl, resources["shadow_second.fs"], gl.FRAGMENT_SHADER);
		this.shadow_second.program = _make_gl_program(gl, vs, fs);					


		// source_texture 
		this.shadow_second.source_texture_location = gl.getUniformLocation(this.shadow_second.program,
																	   "source_texture");
	}
	
	
	_init()
	{
		this._init_framebuffer();
		
		this._init_shadow_first();
		this._init_shadow_second();
	}
	

	_draw_shadow_first(proj_mat, view_mat, drawables)
	{
		var gl = this.gl; // (Alias for brevity)

		// Progam & Uniforms common to both objects
		gl.useProgram(this.shadow_first.program);
		gl.bindBuffer(gl.UNIFORM_BUFFER, this.shadow_first.ubo);					
		gl.bufferSubData(gl.UNIFORM_BUFFER, this.shadow_first.proj_ubo_offset,  proj_mat.data,  0);
		gl.bufferSubData(gl.UNIFORM_BUFFER, this.shadow_first.view_ubo_offset,  view_mat.data,  0);

		for (var i = 0; i < drawables.length; i++)
		{
			// Model matrix update
			gl.bufferSubData(gl.UNIFORM_BUFFER, this.shadow_first.model_ubo_offset, drawables[i].uniforms.model.data, 0);

			// Texture update
			gl.activeTexture(gl.TEXTURE0 + 0);
			gl.bindTexture(gl.TEXTURE_2D, drawables[i].uniforms.albedo);
			gl.uniform1i(this.shadow_first.albedo_location, 0);

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
	
	
	_draw_shadow_second()
	{
		return;
	
		var gl = this.gl; // (Alias for brevity)

		// Setup program and uniform resources
		gl.useProgram(this.shadow_second.program);
		gl.activeTexture(gl.TEXTURE0 + 0);
		gl.bindTexture(gl.TEXTURE_2D, this.first_pass_texture);
		gl.uniform1i(this.shadow_second.source_texture_location, 0);
		
		
		// Draw triangles with their attributes
		gl.bindVertexArray(this.shadow_second.vao);
		gl.drawArrays(
			gl.TRIANGLES,
			0,
			this.shadow_second.vert_count
		);				
	}
	

	draw(framebuffer_target,
		 shadow_proj_mat, 
		 shadow_view_mat, 
		 user_proj_mat, 
		 user_view_mat,
		 drawables, 
		 clear_color)
	{
		
		
		
		
		// #1. BIND to offscreen Framebuffer, Clear it 
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.first_pass_fbo);
		gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
	
		gl.clearColor(clear_color.r, clear_color.g, clear_color.b, clear_color.a);				
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		
		
		
		// #2. Draw the Albedo effect on the left half of the offscreen viewport/write to a texture
		gl.viewport(0, 0, this.ctx_width/2, this.ctx_height);
		//this._draw_shadow_first(shadow_proj_mat, user_view_mat, drawables);
		this._draw_shadow_first(shadow_proj_mat, shadow_view_mat, drawables);




		// 3. Blit (copy) to the argument framebuffer_target (must NOT be a MULTISAMPLE target)
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.first_pass_fbo);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer_target);
		gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		gl.clearBufferfv(gl.DEPTH, 0, [1.0]);  
		gl.blitFramebuffer(0, 0, this.ctx_width/2, this.ctx_height, 
						   0, 0, this.ctx_width/2, this.ctx_height,
						   gl.COLOR_BUFFER_BIT, gl.LINEAR);




		// 4. Draw the right side part with the cell shader, targeting the argument framebuffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer_target);

		gl.viewport(this.ctx_width/2, 0, this.ctx_width/2, this.ctx_height);
		this._draw_shadow_second();
		



		// 5. Draw line in middle (using scissor boundary), then reset scissor bounds
		gl.scissor(this.ctx_width/2-2, 0, 4, this.ctx_height);
		gl.clearColor(1.0, 1.0, 1.0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);										
		gl.scissor(0, 0, this.ctx_width, this.ctx_height);					
	}	
}
	
	
