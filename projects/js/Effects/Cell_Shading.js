class Cell_Shading
{		
	static external_resources()
	{
		var resources = [
		
				["albedo.vs",		"shaders/3D/albedo.vs",		"text"],
				["albedo.fs",		"shaders/3D/albedo.fs",		"text"],		
				["cell.vs",			"shaders/2D/cell.vs",		"text"],
				["cell.fs",			"shaders/2D/cell.fs",		"text"],
				
		];
		
		return resources;
	}
	
	
	constructor(width, height)
	{	
		this.ctx_width  = width;
		this.ctx_height = height;
							
		this.first_pass_texture = null;
		this.first_pass_depth   = null;
		this.first_pass_fbo     = null;					

		
		this.albedo_pass = 
		{			
			progam: null,						
			ubo: null,
			proj_ubo_offset: null,
			view_ubo_offset: null,
			model_ubo_offset: null,
			
			albedo_location: null,
		};
		
		
		this.cell_pass = 
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
		this.first_pass_texture = _make_2d_RGBA_UINT_texture(this.ctx_width/2, this.ctx_height);
		this.first_pass_depth   = _make_2d_depth_texture(this.ctx_width/2, this.ctx_height);
		this.first_pass_fbo     = _make_framebuffer( [
														{ texture: this.first_pass_texture, att: gl.COLOR_ATTACHMENT0, tex: gl.TEXTURE_2D },
														{ texture: this.first_pass_depth, 	att: gl.DEPTH_ATTACHMENT,  tex: gl.TEXTURE_2D },
													 ] );					
	}

	
	_init_albedo_pass_obj()
	{

	}
	
	
	_init_albedo_pass_floor()
	{				

	}
	
	
	_init_albedo_pass()
	{
		this._init_albedo_pass_obj();
	
		this._init_albedo_pass_floor();

		// Program
		var vs = _make_gl_shader(resources["albedo.vs"], gl.VERTEX_SHADER);
		var fs = _make_gl_shader(resources["albedo.fs"], gl.FRAGMENT_SHADER);
		this.albedo_pass.program = _make_gl_program(vs, fs);					
		

		// UBO todos....
		this.albedo_pass.ubo = gl.createBuffer();
		gl.bindBuffer(gl.UNIFORM_BUFFER, this.albedo_pass.ubo);

		var block_index = gl.getUniformBlockIndex(this.albedo_pass.program, 
												  "matrix_data");
												  
		
		var block_size = gl.getActiveUniformBlockParameter(this.albedo_pass.program,
														   block_index,
														   gl.UNIFORM_BLOCK_DATA_SIZE);

		gl.bufferData(gl.UNIFORM_BUFFER, block_size, gl.DYNAMIC_DRAW);

		gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this.albedo_pass.ubo);
		gl.uniformBlockBinding(this.albedo_pass.program, block_index, 0);

		

		
		var ubo_names = ["proj", "view", "model"];
		var ubo_indices = gl.getUniformIndices(this.albedo_pass.program,
											   ubo_names);
		var ubo_offsets = gl.getActiveUniforms(this.albedo_pass.program,
											   ubo_indices,
											   gl.UNIFORM_OFFSET);



		this.albedo_pass.proj_ubo_offset  = ubo_offsets[0];
		this.albedo_pass.view_ubo_offset  = ubo_offsets[1];
		this.albedo_pass.model_ubo_offset = ubo_offsets[2];
		

		// Texture location
		this.albedo_pass.albedo_location = gl.getUniformLocation(this.albedo_pass.program, "albedo");						
	}
	
				
	_init_cell_pass()
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

		this.cell_pass.verts_vbo = gl.createBuffer();
		
		gl.bindBuffer(
			gl.ARRAY_BUFFER,
			this.cell_pass.verts_vbo
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

		this.cell_pass.uvs_vbo = gl.createBuffer();
		
		gl.bindBuffer(
			gl.ARRAY_BUFFER,
			this.cell_pass.uvs_vbo
		);
		
		gl.bufferData(
			gl.ARRAY_BUFFER, 
			uvs, 
			gl.STATIC_DRAW
		);
		
		
		// vao
		this.cell_pass.vao = gl.createVertexArray();
		gl.bindVertexArray(this.cell_pass.vao);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cell_pass.verts_vbo);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(
			0,
			2,
			gl.FLOAT,
			false,
			0,
			0				
		);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cell_pass.uvs_vbo);
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
		this.cell_pass.vert_count = 6;


		// Program
		var vs = _make_gl_shader(resources["cell.vs"], gl.VERTEX_SHADER);
		var fs = _make_gl_shader(resources["cell.fs"], gl.FRAGMENT_SHADER);
		this.cell_pass.program = _make_gl_program(vs, fs);					


		// source_texture 
		this.cell_pass.source_texture_location = gl.getUniformLocation(this.cell_pass.program,
																	   "source_texture");
	}
	
	
	_init()
	{
		this._init_framebuffer();
		
		this._init_albedo_pass();
		this._init_cell_pass();
	}
	

	_draw_albedo_pass(proj_mat, view_mat, drawables)
	{
		// Progam & Uniforms common to both objects
		gl.useProgram(this.albedo_pass.program);
		gl.bindBuffer(gl.UNIFORM_BUFFER, this.albedo_pass.ubo);					
		gl.bufferSubData(gl.UNIFORM_BUFFER, this.albedo_pass.proj_ubo_offset,  proj_mat.data,  0);
		gl.bufferSubData(gl.UNIFORM_BUFFER, this.albedo_pass.view_ubo_offset,  view_mat.data,  0);

		for (var i = 0; i < drawables.length; i++)
		{
			// Model matrix update
			gl.bufferSubData(gl.UNIFORM_BUFFER, this.albedo_pass.model_ubo_offset, drawables[i].uniforms.model.data, 0);

			// Texture update
			gl.activeTexture(gl.TEXTURE0 + 0);
			gl.bindTexture(gl.TEXTURE_2D, drawables[i].uniforms.albedo);
			gl.uniform1i(this.albedo_pass.albedo_location, 0);

			gl.bindVertexArray(drawables[i].vao);
			
					
			
			if (drawables[i].indexed)
			{
				gl.drawElements(
					drawables[i].primitive_type,
					drawables[i].num_verts,
					0,
					gl.UNSIGNED_INT
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
	
	
	_draw_cell_pass()
	{
		// Setup program and uniform resources
		gl.useProgram(this.cell_pass.program);
		gl.activeTexture(gl.TEXTURE0 + 0);
		gl.bindTexture(gl.TEXTURE_2D, this.first_pass_texture);
		gl.uniform1i(this.cell_pass.source_texture_location, 0);
		
		
		// Draw triangles with their attributes
		gl.bindVertexArray(this.cell_pass.vao);
		gl.drawArrays(
			gl.TRIANGLES,
			0,
			this.cell_pass.vert_count
		);				
	}
	

	draw(framebuffer_target,
		 proj_mat,
		 view_mat,
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
		this._draw_albedo_pass(proj_mat, view_mat, drawables);




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
		this._draw_cell_pass();
		



		// 5. Draw line in middle (using scissor boundary), then reset scissor bounds
		gl.scissor(this.ctx_width/2-2, 0, 4, this.ctx_height);
		gl.clearColor(1.0, 1.0, 1.0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);										
		gl.scissor(0, 0, this.ctx_width, this.ctx_height);					
	}	
}