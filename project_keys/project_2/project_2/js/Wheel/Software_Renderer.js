class Software_Renderer
{	
	// CONTEXT for default framebuffer
	_ctx = null;
	_ctx_width = null;
	_ctx_height = null;

	_viewport_x = null;
	_viewport_y = null;
	_viewport_w = null;
	_viewport_h = null;
	
	_depth_buf = null;
	
	
	constructor(canvas_element)
	{
		this._ctx = canvas_element.getContext("2d");		
		this._ctx_width = canvas_element.width;
		this._ctx_height = canvas_element.height;

		this._viewport_x = 0;
		this._viewport_y = 0;
		this._viewport_w = this._ctx_width - 1;
		this._viewport_h = this._ctx_height - 1;


		this._build_depth_buf();
	}
	
	_build_depth_buf()
	{
		this._depth_buf = [];
		
		for (var r = 0; r < this._ctx_height; r++)
		{
			var row = [];
			for (var c = 0; c < this._ctx_width; c++)
			{
				row.push(1.0);
			}
			this._depth_buf.push( row );
		}
	}


	_draw_pixel(x, y, color)
	{
		this._ctx.fillStyle = "rgba("+color.r+","+color.g+","+color.b+","+(color.a/255)+")";
		this._ctx.fillRect(x, this._ctx_height - 1 - y, 1, 1);
	}

	clear_depth()
	{
		for (var r = 0; r < _ctx_height; r++)
		{
			for (var c = 0; c < _ctx_width; c++)
			{
				this._depth_buf[r][c] = 1.0;
				
			}
		}
	}
	
	
	clear_target(color){
		
		this.draw_rect(0, 0, ctx_width, ctx_height, color);
		
	}
		

	draw_rect(x, y, x_size, y_size, color)
	{
		this._ctx.fillStyle = "rgba("+color.r+","+color.g+","+color.b+","+(color.a/255)+")";
		this._ctx.fillRect(x, this._ctx_height - (y + y_size) - 1, x_size, y_size);		
	}


	set_viewport(x, y, width, height)
	{
		this._viewport_x = Math.max(0, Math.min(0, _ctx_width-1 ));
		this._viewport_y = Math.max(0, Math.min(0, _ctx_height-1));
		
		var max_w = this._ctx_width  -1 - this._viewport_x;
		var max_y = this._ctx_height -1 - this._viewport_y;
		
		this._viewport_w = Math.max(0, Math.min(width,  max_w));
		this._viewport_h = Math.max(0, Math.min(height, max_h));
		
	}
	

	// Your function calls here
	draw_triangles(vertex_inputs, uniform_data, vertex_shader, fragment_shader)
	{
		// Vertex Shader output with interpolants 
		var out_data = [];
		for (var i = 0; i < vertex_inputs.length; i++)
		{
			out_data.push( vertex_shader(vertex_inputs[i], uniform_data) );			
		}
		
		
		// No clipping (SKIP)
		
		
		var ndc_data = [];
		for (var i = 0; i < out_data.length; i++)
		{
			ndc_data.push( this._ndc_convert(out_data[i]) );
		}
		

		var viewport_data = [];
		for (var i = 0; i < ndc_data.length; i++)
		{
			viewport_data.push( this._viewport_transform(ndc_data[i]) );
		}
		
		
		for (var i = 0; i < viewport_data.length; i+=3)
		{
			console.log(viewport_data[0]);
			console.log(viewport_data[1]);
			console.log(viewport_data[2]);
			
			// fragment_shader
			break;
		}
	}



	_ndc_convert(in_data)
	{
		var div_by_w = 1.0 / in_data.gl_Position[3];
		
		var rv = {
			gl_Position: [
							in_data.gl_Position[0] * div_by_w,
							in_data.gl_Position[1] * div_by_w,
							in_data.gl_Position[2] * div_by_w,
							div_by_w			
						 ],
							
			interp_color:[
							in_data.interp_color[0],
							in_data.interp_color[1],
							in_data.interp_color[2]
						 ]
		};
		
		return rv;
	}
	
	
	_viewport_transform(in_data)
	{
		var vx = (0.5 * (in_data.gl_Position[0] + 1) ) * 
				this._viewport_w + this._viewport_x;

		var vy = (0.5 * (in_data.gl_Position[1] + 1) ) * 
				this._viewport_h + this._viewport_y;
		
		var vz = (0.5 * (in_data.gl_Position[2] + 1) );		
		
		
		var rv = {
			gl_Position: [
							vx,
							vy,
							vz,
							in_data.gl_Position[3]
						 ],
						 
			interp_color:[
							in_data.interp_color[0],
							in_data.interp_color[1],
							in_data.interp_color[2]
						 ]
		};
		
		return rv;		
	}
	
}
