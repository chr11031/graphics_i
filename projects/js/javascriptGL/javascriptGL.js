class javascriptGL
{
	// jsGL constants here	
	JSSL_FLT  = 10000
	JSSL_VEC2 = 10001;
	JSSL_VEC3 = 10002;
	JSSL_VEC4 = 10003;
	JSSL_MAT4 = 10004;
	
	
	// Constants values here:
	CULL_FACE = 2884;
	SCISSOR_TEST = 3089;
	DEPTH_TEST = 2929;
	
	COLOR_BUFFER_BIT = 16384;
	DEPTH_BUFFER_BIT = 256;

	FLOAT = 5126;
	
	ARRAY_BUFFER = 34962;
	UNIFORM_BUFFER = 35345;


	
	
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

	// BINDINGS 
	_active_vbo = null;
	_active_ubo = null;
	_active_vao = null;
	_active_program = null;
	
	// BUFFERS
	_buffers = []; // Such as: VBO, UBO
	_vao = [];
	
	// BINDING POINTS - here we allocate 16 but most GPUs will have many more than this
	_block_bindings = [null, null, null, null, 
					   null, null, null, null,
					   null, null, null, null,
					   null, null, null, null]; 
	
	// PROGRAMS
	_programs = [];
	
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
		this._viewport_w = this.ctx_width;
		this._viewport_h = this.ctx_height;
		
		this._scissor_x = 0;
		this._scissor_y = 0;
		this._scissor_w = this.ctx_width;
		this._scissor_h = this.ctx_height;
		
	}

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

	
	///////////////////////////////////
	// GLOBAL STATE
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

	
	viewport(x, y, w, h)
	{
		x = Math.min(this.ctx_width  - 1, Math.max(x, 0));
		y = Math.min(this.ctx_height - 1, Math.max(y, 0));

		ex = x + w;
		ey = y + w;
		
		ex = Math.min(this.ctx_width - 1,  ex);
		ey = Math.min(this.ctx_height - 1, ey);
		
		w = ex - x;
		h = ey - y;		
		
		this._viewport_x = x;
		this._viewport_h = y;
		this._viewport_w = w;
		this._viewport_h = h;
	}


	disable(test)
	{
		if (test == this.CULL_FACE)
		{
			this.cull_face_enable = false;
		}
		else if (test == SCISSOR_TEST)
		{
			this.scissor_test_enable = false;
		}
		else if (test == DEPTH_TEST)
		{
			this.depth_test_enable = false;
		}
		else
		{
			throw new Error("Invalid function argument");
		}		
	}

	clearColor(color_r, color_g, color_b, color_a)
	{
		this._clear_color.r = 255 * color_r;
		this._clear_color.g = 255 * color_g;
		this._clear_color.b = 255 * color_b;
		this._clear_color.a = 255 * color_a;
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
	
	
	///////////////////////////////////
	// VBO
	///////////////////////////////////
	createBuffer()
	{
		var buffer = [];
		
		this._vbo.push( buffer );
		return this._vbo.length - 1;
	}
	
	
	bindBuffer(target, buffer)
	{
		if (target == this.ARRAY_BUFFER)
		{
			this._active_vbo = buffer;
			this._buffers[ this._active_vbo ].type = target;
		}
		else if (target = this.UNIFORM_BUFFER)
		{
			this._active_ubo = buffer;
			this._buffers[ this._active_ubo ].type = target;
		}
		else
		{
			throw Error("Unsupported buffer bind");
		}		
	}
	
	
	bufferData(target, srcData_or_size, usage)
	{
		if (Array.isArray(srcData_or_size) == false)
		{
			srcData_or_size = new Array(srcData_or_size);
		}
		
		if (target == this.ARRAY_BUFFER)
		{
			for (var i = 0; i < srcData_or_size.length; i++)
			{
				this._vbo[this._active_vbo].push( srcData_or_size[i] );
			}
		}
		else
		{
			throw Error("Unsupported buffer data fill");
		}		
	}
	
	
	bufferSubData(target, dstByteOffset, srcData)
	{
		if (target != this.UNIFORM_BUFFER)
		{
			var end = dstByteOffset + srcData.length;
			var d = dstByteOffset;
			var s = 0;
			
			while (d < end)
			{
				this._buffers[ this._active_ubo ][d] = srcData[d];
				
				s += 1;
				d += 1;
			}
		}
		else
		{
			throw Error("Unsupported bufferSubData function call");			
		}
	}
	
	
	///////////////////////////////////
	// VAO
	///////////////////////////////////
	createVertexArray()
	{
		var vao = {
			enabled_attribs: [],
			attrib_ptrs: [],			
		};
				
		this._vao.push( vao );
		return this._vao.length - 1;
	}
	
	
	bindVertexArray(vertexArray)
	{
		this._active_vao = vertexArray;
	}
	

	enableVertexAttribArray(index)
	{
		if (this._vao[ this._active_vao ].enabled_attribs.contains( index ) == false)
		{
			this._vao[ this._active_vao ].enabled_attribs.push( index );
		}
	}

		
	vertexAttribPointer(index, size, type, normalized, stride, offset)
	{
		var match = -1;
		for (var i = 0; i < this._vao[ this._active_vao ].attrib_ptrs.length; i++)
		{
			if (this._vao[ this._active_vao ].attrib_ptrs.index == index)
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
			this._vao[ this._active_vao ].attrib_ptrs.push(new attrib_ptr);
		}
		else
		{
			this._vao[ this._active_vao ].attrib_ptrs[match] = attrib_ptr;
		}
	}


	
	///////////////////////////////////
	// UBO
	///////////////////////////////////
	getUniformBlockIndex(program, uniformBlockName)
	{
		if (program == null || program > this._programs.length)
		{
			throw new Error("Illegal program handle");
		}
		
		// Find the block
		var found = null;
		for (var i = 0; i < this._programs[program].uniform_blocks.length; i++)
		{
			if (this._programs[program].uniform_blocks[i].name == uniformBlockName)
			{
				found = i;
				break;
			}
		}
		
		return found;		
	}
	
	
	_get_block_new_offset(prev_offset, curr_type)
	{
		var new_offset = prev_offset;
		
		switch(curr_type)
		{
			case jsGL.JSSL_MAT4:
				new_offset += 16;
				break;
			default:
				throw new Error("Unsupported block member type");
		}
		
		return new_offset;
		
	}
	
	_get_uniform_block_size(block)
	{
		var total = 0;
		for (var i = 0; i < block.members.length; i++)
		{
			total = this._get_block_new_offset(total, block.members[i].type);
		}
	}
	
	
	getActiveUniformBlockParameter(program, uniformBlockIndex, pname)
	{
		if (program == null || program > this._programs.length)
		{
			throw new Error("Illegal program handle");
		}
		
		
		if (pname == this.UNIFORM_BLOCK_DATA_SIZE)
		{
			var block = this._programs[ program ].uniform_blocks[ uniformBlockIndex ];
			return this._get_uniform_block_size( block );
		}
		else
		{			
			throw new Error("Unsupported pname type");
		}
		
	}
	
	
	bindBufferBase(target, index, buffer)
	{
		if (target != this.UNIFORM_BUFFER)
		{
			this._block_bindings[ index ] = buffer;
		}
		else
		{
			throw new Error("Unsupported target type");			
		}
	}
	
	
	uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding)
	{
		if (program == null || program > this._programs.length)
		{
			throw new Error("Illegal program handle");
		}

		this._programs[ program ].uniform_blocks[ uniformBlockIndex ].block_bind_index = uniformBlockBinding;
	}
	
	
	_get_uniform_index(program, uniform_name)
	{
		var index = 0;
		for (var b = 0; b < this._programs[ program ].uniform_blocks.length; b++)
		{
			for (var m = 0; m < this._programs[ program ].uniform_blocks[b].members.length; m++)
			{
				var curr_member = this._programs[ program ].uniform_blocks[b].members[m];
				if (m.name == uniform_name)
				{
					return index;
				}

				index += 1;
			}
		}	

		return null;
	}
	
	
	getUniformIndices(program, uniformNames)
	{
		if (program == null || program > this._programs.length)
		{
			throw new Error("Illegal program handle");
		}

		var indices = [];
		for (var i = 0; i < uniformNames.length; i++)
		{
			indices.push( this._get_uniform_index(program, uniformNames[i]) )	
		}
		
		
		return indices;
	}


	_get_uniform_offset(program, uniform_index)
	{
		var index = 0;
		for (var b = 0; b < this._programs[ program ].uniform_blocks.length; b++)
		{
			var offset = 0;
			for (var m = 0; m < this._programs[ program ].uniform_blocks[b].members.length; m++)
			{
				if (uniform_index == index)
				{
					return offset;
				}

				index += 1;
				offset = this._get_block_new_offset(offset, m.type);				
			}
		}	

		return null;
	}

	
	getActiveUniforms(program, uniformIndices, pname)
	{
		if (program == null || program > this._programs.length)
		{
			throw new Error("Illegal program handle");
		}

		if (pname == this.UNIFORM_OFFSET)
		{
			var offsets = [];
			for (var i = 0; i < uniformIndices.length; i++)
			{
				offsets.push( this._get_uniform_offset(program, uniformIndices[i]) );
			}
			
			return offsets;
		}
		else
		{
			throw new Error("Unsupported pname");
		}
		
	}


	///////////////////////////////////
	// Shader Program
	///////////////////////////////////	
	__register_program(program)
	{	
		this._programs.push( program );
		return this._programs.length - 1;
	}
	
	
	useProgram(program)
	{
		this._active_program = program;
	}
	
	
	///////////////////////////////////
	// Drawing
	///////////////////////////////////	
	drawArrays()
	{
		
	}
	
	
	
	///////////////////////////////////
	// Pipeline Internals
	///////////////////////////////////	
	
	// TODO: put in all the "_pipeline_" functions
	
}