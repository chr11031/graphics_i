class Software_Renderer
{	
	// Constants values here (same values as used in WebGL)
	TRIANGLES = 4;

	FLOAT = 5126;

	COLOR_BUFFER_BIT = 16384;
	DEPTH_BUFFER_BIT = 256;
	
	VERTEX_SHADER = 35633;
	FRAGMENT_SHADER = 35632;
	
	CULL_FACE = 2884;
	SCISSOR_TEST = 3089;
	DEPTH_TEST = 2929;

	ARRAY_BUFFER = 34962;
	UNIFORM_BUFFER = 35345;
	
	STATIC_DRAW =  35044;
	DYNAMIC_DRAW = 35048;
	
	INVALID_INDEX = 4294967295;

	UNIFORM_BLOCK_DATA_SIZE = 35392;
	UNIFORM_OFFSET = 35387;

	COMPILE_STATUS = 35713;
	LINK_STATUS = 35714;
	
	
	// CONTEXT for default framebuffer
	_ctx = null;
	_ctx_width = null;
	_ctx_height = null;
	
	_clear_color = null;
	
	// DEPTH buffer
	_default_depth_buffer = null;
	
	// VIEWPORT
	_viewport_x = null;
	_viewport_y = null;
	_viewport_w = null;
	_viewport_h = null;	

	// SCISSOR
	_scissor_x = null;
	_scissor_y = null;
	_scissor_w = null;
	_scissor_h = null;
	
	// TESTS
	_cull_face_enable = false;
	_scissor_test_enable = false;
	_depth_test_enable = false;

	// BUFFERS
	_buffers = null;
	
	// VAOs
	_vaos = null;

	// BINDINGS 
	_active_vbo = null;
	_active_ubo = null;
	_active_vao = null;
	_active_program = null;
	
	
	constructor(canvas_element)
	{
		this._ctx = canvas_element.getContext("2d");		
		this._ctx_width = canvas_element.width;
		this._ctx_height = canvas_element.height;

		this._clear_color = new RGBA(0.0, 0.0, 0.0, 255.0);
		this._clear_depth = 1.0;

		this._default_depth_buffer = this._create_2d_buffer(this._ctx_width, this._ctx_height, 1);
		
		this._viewport_x = 0;
		this._viewport_y = 0;
		this._viewport_w = this._ctx_width;
		this._viewport_h = this._ctx_height;
		
		this._scissor_x = 0;
		this._scissor_y = 0;
		this._scissor_w = this._ctx_width;
		this._scissor_h = this._ctx_height;


		this._buffers = [];
		this._vaos = [];

		
		// Guard-Band coefficients
		this._gb_max_x =  32767 / this.viewport_width;
		this._gb_min_x = -32768 / this.viewport_width;
		this._gb_max_y =  32767 / this.viewport_height;
		this._gb_min_y = -32768 / this.viewport_height;
		this._clip_min_z = -1;
		this._clip_max_z =  1;
	}
	

	///////////////////////////////////
	// API Calls
	///////////////////////////////////
	enable(test)
	{
		if (test == this.CULL_FACE)
		{
			this._cull_face_enable = true;
		}
		else if (test == this.SCISSOR_TEST)
		{
			this._scissor_test_enable = true;
		}
		else if (test == this.DEPTH_TEST)
		{
			this._depth_test_enable = true;
		}
		else
		{
			throw new Error("Invalid function argument");
		}
	}

	
	scissor(x, y, w, h)
	{
		x = Math.min(this._ctx_width  - 1, Math.max(x, 0));
		y = Math.min(this._ctx_height - 1, Math.max(y, 0));

		var ex = x + w;
		var ey = y + w;
		
		ex = Math.min(this._ctx_width - 1,  ex);
		ey = Math.min(this._ctx_height - 1, ey);
		
		w = ex - x;
		h = ey - y;		
		
		this._scissor_x = x;
		this._scissor_y = y;
		this._scissor_w = w;
		this._scissor_h = h;
	}


	clear(targets)
	{
		var sx = 0;
		var sy = 0;
		var ex = this._ctx_width;
		var ey = this._ctx_height;
		
		if (this._scissor_test_enable)
		{
			sx = this._scissor_x;
			sy = this._scissor_y;
			ex = this._scissor_x + this._scissor_w;
			ey = this._scissor_y + this._scissor_h;
		}
		
		if (targets & this.COLOR_BUFFER_BIT)
		{
			for (var y = sy; y < ey; y++)
			{
				for (var x = sx; x < ex; x++)
				{
					this._draw_pixel(x, y, this._clear_color);
				}
			}			
		}
		
		if (targets & this.DEPTH_BUFFER_BIT)
		{
			for (var y = sy; y < ey; y++)
			{
				for (var x = sx; x < ex; x++)
				{
					this._default_depth_buffer[y][x][0] = this._clear_depth;
				}
			}	
		}
	}
	

	clearColor(color_r, color_g, color_b, color_a)
	{
		this._clear_color.r = 255 * color_r;
		this._clear_color.g = 255 * color_g;
		this._clear_color.b = 255 * color_b;
		this._clear_color.a = 255 * color_a;
	}

		
	viewport(x, y, w, h)
	{
		x = Math.min(this.ctx_width  - 1, Math.max(x, 0));
		y = Math.min(this.ctx_height - 1, Math.max(y, 0));

		var ex = x + w;
		var ey = y + w;
		
		ex = Math.min(this.ctx_width - 1,  ex);
		ey = Math.min(this.ctx_height - 1, ey);
		
		w = ex - x;
		h = ey - y;		
		
		this._viewport_x = x;
		this._viewport_h = y;
		this._viewport_w = w;
		this._viewport_h = h;
	}
	

	useProgram(program)
	{
		this._active_program = program;
	}
	
	
	getUniformIndices(program, uniformNames)
	{
		var indices = [];
		
		for (var i = 0; i < uniformNames.length; i++)
		{
			indices.push( this._get_uniform_index(program, uniformNames[i]) );			
		}		

		return indices;
	}
	
	
	_get_uniform_index(program, uniform_name)
	{
		for (const block_name in program.uniform_blocks)
		{		
			for (const member_name in program.uniform_blocks[block_name])
			{
				if (uniform_name == member_name)
				{
					return { block_name: block_name, member_name: member_name };
				}
			}
		}			

		return this.INVALID_INDEX;
	}

	
	getActiveUniforms(program, uniformIndices, pname)
	{
		if (pname == this.UNIFORM_OFFSET)
		{
			var parameters = [];
			
			for (var i = 0; i < uniformIndices.length; i++)
			{
				parameters.push( uniformIndices[i] );
			}
			
			return parameters;
		}
		else
		{
			throw new Error("Unsupported pname provided to getActiveUniforms");			
		}
	}
	
	
	drawArrays(mode, first, count)
	{
		if (mode != this.TRIANGLES)
		{
			throw Error("Unsupported drawArrays function call");			
		}
		if (first < 0)
		{
			throw Error("Unsupported 'first' offset parameter to function call");			
		}
		if (count < 0)
		{
			throw Error("Unsupported 'first' offset parameter to function call");			
		}
		
		alert("Drawing time!");
	}
	
	
	createBuffer()
	{
		this._buffers.push( [] );
		
		return this._buffers.length - 1;
	}
	
	
	bindBuffer(target, buffer)
	{
		if (target == this.ARRAY_BUFFER)
		{
			this._active_vbo = buffer;
		}
		else if (target == this.UNIFORM_BUFFER)
		{
			this._active_ubo = buffer;
		}
		else
		{
			throw Error("Unsupported buffer bind");
		}		
	}
	
	
	bufferData(target, size_or_srcData, usage)
	{
		if (size_or_srcData.constructor !== Array)
		{
			size_or_srcData = new Array(size_or_srcData);
		}
		
		
		if (target == this.ARRAY_BUFFER)
		{
			for (var i = 0; i < size_or_srcData.length; i++)
			{
				this._buffers[this._active_vbo].push( size_or_srcData[i] );
			}
		}
		else if (target == this.UNIFORM_BUFFER)
		{
			for (var i = 0; i < size_or_srcData.length; i++)
			{
				this._buffers[this._active_ubo].push( size_or_srcData[i] );
			}			
		}
		else
		{
			throw Error("Unsupported buffer data fill");
		}		
	}
	
	
	bufferSubData(target, member_location, srcData)
	{
		if (target == this.UNIFORM_BUFFER)
		{
			; // YOUR CODE HERE - Do something with the bound UBO/'
		}
		else
		{
			throw Error("Unsupported bufferSubData function call");			
		}
	}
	
	
	createVertexArray()
	{
		var vao = {
			enabled_attribs: [],
			attrib_ptrs: [],			
		};
				
		this._vaos.push( vao );
		return this._vaos.length - 1;
	}
	
	
	bindVertexArray(vertexArray)
	{
		this._active_vao = vertexArray;
	}
	
	
	enableVertexAttribArray(index)
	{
		if ( this._vaos[ this._active_vao ].enabled_attribs.includes(index) == false)
		{
			this._vaos[ this._active_vao ].enabled_attribs.push( index );
		}
	}

	
	vertexAttribPointer(index, size, type, normalized, stride, offset)
	{
		if (normalized == true)
		{
			throw new Error("Normalization not supported by this implementation");
		}
		
		var match = -1;
		for (var i = 0; i < this._vaos[ this._active_vao ].attrib_ptrs.length; i++)
		{
			if (this._vaos[ this._active_vao ].attrib_ptrs.index == index)
			{
				match = i;
				break;
			}
		}

		var attrib_ptr = {
				vbo_ref: this._active_vbo,
			
				index: index,
				size: size,
				type: type,
				normalized: normalized,
				stride: stride, 
				offset: offset,
		};
		
		if (match == -1)
		{
			this._vaos[ this._active_vao ].attrib_ptrs.push( attrib_ptr );
		}
		else
		{
			this._vaos[ this._active_vao ].attrib_ptrs[match] = attrib_ptr;
		}
	}




	///////////////////////////////////
	// Private Methods
	///////////////////////////////////
	
	_create_2d_buffer(width, height, num_components)
	{
		var buffer = [];
		for (var y = 0; y < height; y++)
		{
			var row = [];
			for (var x = 0; x < width; x++)
			{
				var components = [];
				for (var c = 0; c < num_components; c++)
				{
					components.push(0.0);
				}								
		
				row.push( components );
			}
		
			buffer.push( row );
		}
		
		return buffer;
	}


	

	_draw_pixel(x, y, color)
	{
		this._ctx.fillStyle = "rgba("+color.r+","+color.g+","+color.b+","+(color.a/255)+")";
		this._ctx.fillRect(x, this._ctx_height - 1 - y, 1, 1);
	}


	_edge_is_top_or_left(pt_a, pt_b, other_pt)
	{
		var dy = pt_b.y - pt_a.y;
	
		// Is top 
		if (dy == 0 && pt_a.x > pt_b.x)
		{
			return 1;
		}
		
		// Is left					
		if (dy < 0 && pt_b.y >= other_pt.y)
		{
			return 1;
		}
	
		// Neither
		return 0;
	}
			
		
	_pipeline_raster_triangle(pt_a, pt_b, pt_c, color_a, color_b, color_c)
	{
		var pt_min = new vec2( Math.max(this.viewport_x_offset, min_of_3(Math.floor(pt_a.x), Math.floor(pt_b.x), Math.floor(pt_c.x))), 
							   Math.max(this.viewport_y_offset, min_of_3(Math.floor(pt_a.y), Math.floor(pt_b.y), Math.floor(pt_c.y))) );

		var pt_max = new vec2( Math.min(this.viewport_x_offset + this.viewport_width,  max_of_3(Math.ceil(pt_a.x), Math.ceil(pt_b.x), Math.ceil(pt_c.x))), 
							   Math.min(this.viewport_y_offset + this.viewport_height, max_of_3(Math.ceil(pt_a.y), Math.ceil(pt_b.y), Math.ceil(pt_c.y))) );


		var edge_ab = new vec2(pt_b.x - pt_a.x, pt_b.y - pt_a.y);
		var edge_bc = new vec2(pt_c.x - pt_b.x, pt_c.y - pt_b.y);
		var edge_ca = new vec2(pt_a.x - pt_c.x, pt_a.y - pt_c.y);
		
		var tri_area = vec2_determinant(edge_ab, new vec2(pt_c.x - pt_a.x, pt_c.y - pt_a.y));
		
		// Back-Face Culling
		if (tri_area < 0)
		{
			return; 
		}

		var tri_coef = 1.0 / tri_area;
		
		
		// Barycentric coverage test 
		var bias_ab = this._edge_is_top_or_left(pt_a, pt_b, pt_c);
		var bias_bc = this._edge_is_top_or_left(pt_b, pt_c, pt_a);
		var bias_ca = this._edge_is_top_or_left(pt_c, pt_a, pt_b);


		var it = new vec2(pt_min.x + 0.5, pt_min.y + 0.5);
		while (it.y < pt_max.y)
		{
			while (it.x < pt_max.x)
			{
				var edge_ax = new vec2(it.x - pt_a.x, it.y - pt_a.y);
				var edge_bx = new vec2(it.x - pt_b.x, it.y - pt_b.y);
				var edge_cx = new vec2(it.x - pt_c.x, it.y - pt_c.y);

				
				var det_c = vec2_determinant(edge_ab, edge_ax) ;
				var det_a = vec2_determinant(edge_bc, edge_bx) ;
				var det_b = vec2_determinant(edge_ca, edge_cx) ;
		
									
				if (det_a - bias_bc >= 0 && det_b - bias_ca >= 0 && det_c - bias_ab >= 0)
				{
					var interp_c = tri_coef * det_c;
					var interp_a = tri_coef * det_a;
					var interp_b = tri_coef * det_b;
					
					this._draw_pixel( it, mix_3(interp_a, interp_b, interp_c, color_a, color_b, color_c) );
				}			
				
				it.x += 1;
			}
			
			it.x = pt_min.x;
			it.y += 1;				
		}
		
		
		// X-Y Coordinate space interpolation
	}

	
	_project_clip_coordinate_and_attributes_to_ndc(vert)
	{
		var inv_w = 1.0 / vert.fragCoord.w;						
		var xyz_coef = inv_w;						
		
		// For our vertex, project X/Y/Z. Use W for interpolating 1/W
		vert.fragCoord.x *= xyz_coef;
		vert.fragCoord.y *= xyz_coef;
		vert.fragCoord.z *= xyz_coef;
		vert.fragCoord.w  = inv_w;					
		
		
		// For all perspective-corrected attributes, Multiply attribute by 1/W
		vert.fragColor.r *= inv_w;
		vert.fragColor.g *= inv_w;
		vert.fragColor.b *= inv_w;
		vert.fragColor.a *= inv_w;		
	}
	
	
		
	// TODO: SUBSUME THIS INTO THE RIGHT SPOTS...
	_draw_triangles(verts_with_attributes, num_verts, vertex_shader, uniforms)
	{
		var i = 0;
		while (i < num_verts)
		{
			// Vertex Shader
			var vert_a = vertex_shader(verts_with_attributes[i+0], uniforms);
			var vert_b = vertex_shader(verts_with_attributes[i+1], uniforms);
			var vert_c = vertex_shader(verts_with_attributes[i+2], uniforms);
			

			// Clipping	& Homogeneous normalization			
			var verts = this._clip_triangle(vert_a, vert_b, vert_c);
			
			
			// Normalization & Attribute Correction
			this._project_clip_coordinate_and_attributes_to_ndc(verts[0]);
			this._project_clip_coordinate_and_attributes_to_ndc(verts[1]);
			this._project_clip_coordinate_and_attributes_to_ndc(verts[2]);


			// Viewport Transform
			for (var v = 0; v < verts.length; v++)
			{
				this._viewport_transform(verts[v]);
			}
			
			
			// Rasterize
			for (var v = 0; v < verts.length - 2; v++)
			{
				this._pipeline_raster_triangle(verts[  0].fragCoord,
											   verts[v+1].fragCoord,
											   verts[v+2].fragCoord,
											   verts[  0].fragColor,
											   verts[v+1].fragColor,
											   verts[v+2].fragColor);
			}

			
			i += 3;
		}
	}


	_viewport_transform(ndc)
	{
		// As specified on: https://registry.khronos.org/OpenGL-Refpages/gl4/html/glViewport.xhtml
		var new_x = (ndc.fragCoord.x + 1) * (this.viewport_width  / 2) + this.viewport_x_offset;
		var new_y = (ndc.fragCoord.y + 1) * (this.viewport_height / 2) + this.viewport_y_offset;

		// Avoid possible off-by-one errors here (seen in simulation)
		ndc.fragCoord.x = Math.round(new_x, 1);
		ndc.fragCoord.y = Math.round(new_y, 1);
		
		// Treat points so they are at the 'center' of the pixel 
		ndc.fragCoord.x += 0.5;
		ndc.fragCoord.y += 0.5;
		
	}


	_clip_x_left(clip_in)
	{
		var clip_out = [];
		
		var prev_idx = clip_in.length - 1;
		var prev_out = (clip_in[prev_idx].fragCoord.x < this._gb_min_x * clip_in[prev_idx].fragCoord.w);	

		var curr_idx = 0;
		while (curr_idx < clip_in.length)
		{					
			var curr_out = (clip_in[curr_idx].fragCoord.x < this._gb_min_x * clip_in[curr_idx].fragCoord.w);
		
		
			if (curr_out != prev_out)
			{
				var in_idx = curr_out ? prev_idx : curr_idx;
				var ot_idx = curr_out ? curr_idx : prev_idx;
			
			
				var G  = this._gb_min_x;
				var X0 = clip_in[in_idx].fragCoord.x;
				var X1 = clip_in[ot_idx].fragCoord.x;						
				var W0 = clip_in[in_idx].fragCoord.w;
				var W1 = clip_in[ot_idx].fragCoord.w;
				var T  = (G * W0 - X0) / ( X1 - X0 - G * (W1 - W0) );							
				
				
				var new_coord = new vec4(clip_in[in_idx].fragCoord.x + T * (clip_in[ot_idx].fragCoord.x - clip_in[in_idx].fragCoord.x),
										 clip_in[in_idx].fragCoord.y + T * (clip_in[ot_idx].fragCoord.y - clip_in[in_idx].fragCoord.y),
										 clip_in[in_idx].fragCoord.z + T * (clip_in[ot_idx].fragCoord.z - clip_in[in_idx].fragCoord.z),
										 1.0);
				
				var new_color = new rgba(clip_in[in_idx].fragColor.r + T * (clip_in[ot_idx].fragColor.r - clip_in[in_idx].fragColor.r),
										 clip_in[in_idx].fragColor.g + T * (clip_in[ot_idx].fragColor.g - clip_in[in_idx].fragColor.g),
										 clip_in[in_idx].fragColor.b + T * (clip_in[ot_idx].fragColor.b - clip_in[in_idx].fragColor.b),
										 clip_in[in_idx].fragColor.a + T * (clip_in[ot_idx].fragColor.a - clip_in[in_idx].fragColor.a));

				clip_out.push( new vertex_with_attribute(new_coord, new_color) );
			}

			if (curr_out == false)
			{
				clip_out.push( clip_in[curr_idx] );						
			}


			prev_idx = curr_idx;
			prev_out = curr_out;
								
			curr_idx += 1;
		}
		
		return clip_out;			
	}


	_clip_x_right(clip_in)
	{
		var clip_out = [];
		
		var prev_idx = clip_in.length - 1;
		var prev_out = (clip_in[prev_idx].fragCoord.x > this._gb_max_x * clip_in[prev_idx].fragCoord.w);	

		var curr_idx = 0;
		while (curr_idx < clip_in.length)
		{					
			var curr_out = (clip_in[curr_idx].fragCoord.x > this._gb_max_x * clip_in[curr_idx].fragCoord.w);
		
		
			if (curr_out != prev_out)
			{
				var in_idx = curr_out ? prev_idx : curr_idx;
				var ot_idx = curr_out ? curr_idx : prev_idx;
			
			
				var G  = this._gb_max_x;
				var X0 = clip_in[in_idx].fragCoord.x;
				var X1 = clip_in[ot_idx].fragCoord.x;						
				var W0 = clip_in[in_idx].fragCoord.w;
				var W1 = clip_in[ot_idx].fragCoord.w;
				var T  = (G * W0 - X0) / ( X1 - X0 - G * (W1 - W0) );							
				
				
				var new_coord = new vec4(clip_in[in_idx].fragCoord.x + T * (clip_in[ot_idx].fragCoord.x - clip_in[in_idx].fragCoord.x),
										 clip_in[in_idx].fragCoord.y + T * (clip_in[ot_idx].fragCoord.y - clip_in[in_idx].fragCoord.y),
										 clip_in[in_idx].fragCoord.z + T * (clip_in[ot_idx].fragCoord.z - clip_in[in_idx].fragCoord.z),
										 1.0);
				
				var new_color = new rgba(clip_in[in_idx].fragColor.r + T * (clip_in[ot_idx].fragColor.r - clip_in[in_idx].fragColor.r),
										 clip_in[in_idx].fragColor.g + T * (clip_in[ot_idx].fragColor.g - clip_in[in_idx].fragColor.g),
										 clip_in[in_idx].fragColor.b + T * (clip_in[ot_idx].fragColor.b - clip_in[in_idx].fragColor.b),
										 clip_in[in_idx].fragColor.a + T * (clip_in[ot_idx].fragColor.a - clip_in[in_idx].fragColor.a));

				clip_out.push( new vertex_with_attribute(new_coord, new_color) );
			}

			if (curr_out == false)
			{
				clip_out.push( clip_in[curr_idx] );						
			}


			prev_idx = curr_idx;
			prev_out = curr_out;
								
			curr_idx += 1;
		}
		
		return clip_out;			
	}


	_clip_y_bottom(clip_in)
	{
		var clip_out = [];
		
		var prev_idx = clip_in.length - 1;
		var prev_out = (clip_in[prev_idx].fragCoord.y < this._gb_min_y * clip_in[prev_idx].fragCoord.w);	

		var curr_idx = 0;
		while (curr_idx < clip_in.length)
		{					
			var curr_out = (clip_in[curr_idx].fragCoord.y < this._gb_min_y * clip_in[curr_idx].fragCoord.w);
		
		
			if (curr_out != prev_out)
			{
				var in_idx = curr_out ? prev_idx : curr_idx;
				var ot_idx = curr_out ? curr_idx : prev_idx;
			
			
				var G  = this._gb_min_x;
				var Y0 = clip_in[in_idx].fragCoord.y;
				var Y1 = clip_in[ot_idx].fragCoord.y;						
				var W0 = clip_in[in_idx].fragCoord.w;
				var W1 = clip_in[ot_idx].fragCoord.w;
				var T  = (G * W0 - Y0) / ( Y1 - Y0 - G * (W1 - W0) );							
				
				
				var new_coord = new vec4(clip_in[in_idx].fragCoord.x + T * (clip_in[ot_idx].fragCoord.x - clip_in[in_idx].fragCoord.x),
										 clip_in[in_idx].fragCoord.y + T * (clip_in[ot_idx].fragCoord.y - clip_in[in_idx].fragCoord.y),
										 clip_in[in_idx].fragCoord.z + T * (clip_in[ot_idx].fragCoord.z - clip_in[in_idx].fragCoord.z),
										 1.0);
				
				var new_color = new rgba(clip_in[in_idx].fragColor.r + T * (clip_in[ot_idx].fragColor.r - clip_in[in_idx].fragColor.r),
										 clip_in[in_idx].fragColor.g + T * (clip_in[ot_idx].fragColor.g - clip_in[in_idx].fragColor.g),
										 clip_in[in_idx].fragColor.b + T * (clip_in[ot_idx].fragColor.b - clip_in[in_idx].fragColor.b),
										 clip_in[in_idx].fragColor.a + T * (clip_in[ot_idx].fragColor.a - clip_in[in_idx].fragColor.a));

				clip_out.push( new vertex_with_attribute(new_coord, new_color) );
			}

			if (curr_out == false)
			{
				clip_out.push( clip_in[curr_idx] );						
			}


			prev_idx = curr_idx;
			prev_out = curr_out;
								
			curr_idx += 1;
		}
		
		return clip_out;			
	}


	_clip_y_top(clip_in)
	{
		var clip_out = [];
		
		var prev_idx = clip_in.length - 1;
		var prev_out = (clip_in[prev_idx].fragCoord.y > this._gb_max_y * clip_in[prev_idx].fragCoord.w);	

		var curr_idx = 0;
		while (curr_idx < clip_in.length)
		{					
			var curr_out = (clip_in[curr_idx].fragCoord.y > this._gb_max_y * clip_in[curr_idx].fragCoord.w);
		
		
			if (curr_out != prev_out)
			{
				var in_idx = curr_out ? prev_idx : curr_idx;
				var ot_idx = curr_out ? curr_idx : prev_idx;
			
			
				var G  = this._gb_max_y;
				var Y0 = clip_in[in_idx].fragCoord.y;
				var Y1 = clip_in[ot_idx].fragCoord.y;						
				var W0 = clip_in[in_idx].fragCoord.w;
				var W1 = clip_in[ot_idx].fragCoord.w;
				var T  = (G * W0 - Y0) / ( Y1 - Y0 - G * (W1 - W0) );							
				
				
				var new_coord = new vec4(clip_in[in_idx].fragCoord.x + T * (clip_in[ot_idx].fragCoord.x - clip_in[in_idx].fragCoord.x),
										 clip_in[in_idx].fragCoord.y + T * (clip_in[ot_idx].fragCoord.y - clip_in[in_idx].fragCoord.y),
										 clip_in[in_idx].fragCoord.z + T * (clip_in[ot_idx].fragCoord.z - clip_in[in_idx].fragCoord.z),
										 1.0);
				
				var new_color = new rgba(clip_in[in_idx].fragColor.r + T * (clip_in[ot_idx].fragColor.r - clip_in[in_idx].fragColor.r),
										 clip_in[in_idx].fragColor.g + T * (clip_in[ot_idx].fragColor.g - clip_in[in_idx].fragColor.g),
										 clip_in[in_idx].fragColor.b + T * (clip_in[ot_idx].fragColor.b - clip_in[in_idx].fragColor.b),
										 clip_in[in_idx].fragColor.a + T * (clip_in[ot_idx].fragColor.a - clip_in[in_idx].fragColor.a));

				clip_out.push( new vertex_with_attribute(new_coord, new_color) );
			}

			if (curr_out == false)
			{
				clip_out.push( clip_in[curr_idx] );						
			}


			prev_idx = curr_idx;
			prev_out = curr_out;
								
			curr_idx += 1;
		}
		
		return clip_out;			
	}
	

	_clip_z_low(clip_in)
	{
		var clip_out = [];
		
		var prev_idx = clip_in.length - 1;
		var prev_out = (clip_in[prev_idx].fragCoord.z < this._clip_min_z * clip_in[prev_idx].fragCoord.w);	

		var curr_idx = 0;
		while (curr_idx < clip_in.length)
		{					
			var curr_out = (clip_in[curr_idx].fragCoord.z < this._clip_min_z * clip_in[curr_idx].fragCoord.w);
		
		
			if (curr_out != prev_out)
			{
				var in_idx = curr_out ? prev_idx : curr_idx;
				var ot_idx = curr_out ? curr_idx : prev_idx;
			
			
				var G  = this._clip_min_z;
				var Z0 = clip_in[in_idx].fragCoord.y;
				var Z1 = clip_in[ot_idx].fragCoord.y;						
				var W0 = clip_in[in_idx].fragCoord.w;
				var W1 = clip_in[ot_idx].fragCoord.w;
				var T  = (G * W0 - Z0) / ( Z1 - Z0 - G * (W1 - W0) );							
				
				
				var new_coord = new vec4(clip_in[in_idx].fragCoord.x + T * (clip_in[ot_idx].fragCoord.x - clip_in[in_idx].fragCoord.x),
										 clip_in[in_idx].fragCoord.y + T * (clip_in[ot_idx].fragCoord.y - clip_in[in_idx].fragCoord.y),
										 clip_in[in_idx].fragCoord.z + T * (clip_in[ot_idx].fragCoord.z - clip_in[in_idx].fragCoord.z),
										 1.0);
				
				var new_color = new rgba(clip_in[in_idx].fragColor.r + T * (clip_in[ot_idx].fragColor.r - clip_in[in_idx].fragColor.r),
										 clip_in[in_idx].fragColor.g + T * (clip_in[ot_idx].fragColor.g - clip_in[in_idx].fragColor.g),
										 clip_in[in_idx].fragColor.b + T * (clip_in[ot_idx].fragColor.b - clip_in[in_idx].fragColor.b),
										 clip_in[in_idx].fragColor.a + T * (clip_in[ot_idx].fragColor.a - clip_in[in_idx].fragColor.a));

				clip_out.push( new vertex_with_attribute(new_coord, new_color) );
			}

			if (curr_out == false)
			{
				clip_out.push( clip_in[curr_idx] );						
			}


			prev_idx = curr_idx;
			prev_out = curr_out;
								
			curr_idx += 1;
		}
		
		return clip_out;			
	}


	_clip_z_high(clip_in)
	{
		var clip_out = [];
		
		var prev_idx = clip_in.length - 1;
		var prev_out = (clip_in[prev_idx].fragCoord.z > this._clip_max_z * clip_in[prev_idx].fragCoord.w);	

		var curr_idx = 0;
		while (curr_idx < clip_in.length)
		{					
			var curr_out = (clip_in[curr_idx].fragCoord.z > this._clip_max_z * clip_in[curr_idx].fragCoord.w);
		
		
			if (curr_out != prev_out)
			{
				var in_idx = curr_out ? prev_idx : curr_idx;
				var ot_idx = curr_out ? curr_idx : prev_idx;
			
			
				var G  = this._clip_max_z;
				var Z0 = clip_in[in_idx].fragCoord.y;
				var Z1 = clip_in[ot_idx].fragCoord.y;						
				var W0 = clip_in[in_idx].fragCoord.w;
				var W1 = clip_in[ot_idx].fragCoord.w;
				var T  = (G * W0 - Z0) / ( Z1 - Z0 - G * (W1 - W0) );							
				
				
				var new_coord = new vec4(clip_in[in_idx].fragCoord.x + T * (clip_in[ot_idx].fragCoord.x - clip_in[in_idx].fragCoord.x),
										 clip_in[in_idx].fragCoord.y + T * (clip_in[ot_idx].fragCoord.y - clip_in[in_idx].fragCoord.y),
										 clip_in[in_idx].fragCoord.z + T * (clip_in[ot_idx].fragCoord.z - clip_in[in_idx].fragCoord.z),
										 1.0);
				
				var new_color = new rgba(clip_in[in_idx].fragColor.r + T * (clip_in[ot_idx].fragColor.r - clip_in[in_idx].fragColor.r),
										 clip_in[in_idx].fragColor.g + T * (clip_in[ot_idx].fragColor.g - clip_in[in_idx].fragColor.g),
										 clip_in[in_idx].fragColor.b + T * (clip_in[ot_idx].fragColor.b - clip_in[in_idx].fragColor.b),
										 clip_in[in_idx].fragColor.a + T * (clip_in[ot_idx].fragColor.a - clip_in[in_idx].fragColor.a));

				clip_out.push( new vertex_with_attribute(new_coord, new_color) );
			}

			if (curr_out == false)
			{
				clip_out.push( clip_in[curr_idx] );						
			}


			prev_idx = curr_idx;
			prev_out = curr_out;
								
			curr_idx += 1;
		}
		
		return clip_out;			
	}
	
	_simplify_w(clip_in)
	{
		var clip_out = [];
	
		for (var v = 0; v < clip_in.length; v++)
		{
			// Does 2 things:
			// 1. Makes 'W' non-negative
			// 2. Clamps 'W' to non-inf values where we cannot differntiate between 
			// that and infinity for resolutions up to 32,768 @ MSAAx8 (1/2^-18)
			var mag = Math.abs(clip_in[v].fragCoord.w);						
			var sign = Math.sign(clip_in[v].fragCoord.w);
			var mag_clamped = mag < 0.000003814697265625 ? 0.000003814697265625 : mag;						

			var new_coord = new vec4(sign * clip_in[v].fragCoord.x,
									 sign * clip_in[v].fragCoord.y,
									 sign * clip_in[v].fragCoord.z,
									 sign * mag_clamped);

			var new_color = new rgba(sign * clip_in[v].fragColor.r,
									 sign * clip_in[v].fragColor.g,
									 sign * clip_in[v].fragColor.b,
									 sign * clip_in[v].fragColor.a);
									 
			clip_out.push( new vertex_with_attribute(new_coord, new_color) );
		}
		
		return clip_out;
	}
	

	_clip_triangle(vert_a, vert_b, vert_c)
	{
		// Simplify W
		var clip = this._simplify_w([vert_a, vert_b, vert_c]);
		
		
		// Boolean tests to save us from clipping (more efficient in HW)
		var x_left_a   = clip[0].fragCoord.x < this._gb_min_x * clip[0].fragCoord.w;
		var x_left_b   = clip[1].fragCoord.x < this._gb_min_x * clip[1].fragCoord.w;
		var x_left_c   = clip[2].fragCoord.x < this._gb_min_x * clip[2].fragCoord.w;
		if (x_left_a && x_left_b && x_left_c)
		{
			return [];
		}
		
		
		var x_right_a  = clip[0].fragCoord.x > this._gb_max_x * clip[0].fragCoord.w;
		var x_right_b  = clip[1].fragCoord.x > this._gb_max_x * clip[1].fragCoord.w;
		var x_right_c  = clip[2].fragCoord.x > this._gb_max_x * clip[2].fragCoord.w;
		if (x_right_a && x_right_b && x_right_c)
		{
			return [];
		}

		
		var y_top_a    = clip[0].fragCoord.y < this._gb_min_y * clip[0].fragCoord.w;
		var y_top_b    = clip[1].fragCoord.y < this._gb_min_y * clip[1].fragCoord.w;
		var y_top_c    = clip[2].fragCoord.y < this._gb_min_y * clip[2].fragCoord.w;
		if (y_top_a && y_tob_b && y_top_c)
		{
			return [];
		}
		
		
		var y_bottom_a = clip[0].fragCoord.y > this._gb_max_y * clip[0].fragCoord.w;
		var y_bottom_b = clip[1].fragCoord.y > this._gb_max_y * clip[1].fragCoord.w;
		var y_bottom_c = clip[2].fragCoord.y > this._gb_max_y * clip[2].fragCoord.w;
		if (y_top_a && y_tob_b && y_top_c)
		{
			return [];
		}
		
		
		var z_low_a  = clip[0].fragCoord.z   < this._clip_min_z * clip[0].fragCoord.w;
		var z_low_b  = clip[1].fragCoord.z   < this._clip_min_z * clip[1].fragCoord.w;
		var z_low_c  = clip[2].fragCoord.z   < this._clip_min_z * clip[2].fragCoord.w;
		if (z_low_a && z_low_b && z_low_c)
		{
			return [];
		}
		
		
		var z_high_a = clip[0].fragCoord.z   >  this._clip_max_z * clip[0].fragCoord.w;
		var z_high_b = clip[1].fragCoord.z   >  this._clip_max_z * clip[1].fragCoord.w;
		var z_high_c = clip[2].fragCoord.z   >  this._clip_max_z * clip[2].fragCoord.w;
		if (z_high_a && z_high_b && z_high_c)
		{
			return [];
		}
		
		
		// X sides
		if (x_left_a || x_left_b || x_left_c)
		{
			clip = this._clip_x_left(clip);
		}
		if (x_right_a || x_right_b || x_right_c)
		{
			clip = this._clip_x_right(clip);
		}
		
		
		// Y sides
		if (y_bottom_a || y_bottom_b || y_bottom_c)
		{
			clip = this._clip_y_bottom(clip);
		}
		if (y_top_a || y_top_b || y_top_c)
		{
			clip = this._clip_y_top(clip);
		}
		
		
		// Z sides
		if (z_low_a || z_low_b || z_low_c)
		{
			clip = this._clip_z_low(clip);
		}
		if (z_high_a || z_high_b || z_high_c)
		{
			clip = this._clip_z_high(clip);
		}
		
		
		// Return filtered
		return clip;
	}
	
}
