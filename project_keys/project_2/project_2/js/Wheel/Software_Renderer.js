class Vec2
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}
	
}

class Vec3
{
	constructor(x, y, z)
	{
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

class Vec4
{
	constructor(x, y, z, w)
	{
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
}

function min_of_3(x, y, z)
{
	if (x < y)
	{
		if (x < z)
		{
			return x;
		}
		else
		{
			return z;
		}
	}
	else
	{
		if (y < z)
		{
			return y;
		}
		else
		{
			return z;
		}		
	}
}


function max_of_3(x, y, z)
{
	if (x > y)
	{
		if (x > z)
		{
			return x;
		}
		else
		{
			return z;
		}
	}
	else
	{
		if (y > z)
		{
			return y;
		}
		else
		{
			return z;
		}		
	}
}

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
		this._viewport_x = Math.max(0, Math.min(x, this._ctx_width-1 ));
		this._viewport_y = Math.max(0, Math.min(y, this._ctx_height-1));
		
		var max_w = this._ctx_width  - this._viewport_x -1;
		var max_h = this._ctx_height - this._viewport_y -1;
		
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
			this._raster_triangle(viewport_data[i+0],
								  viewport_data[i+1],
								  viewport_data[i+2],
								  uniform_data,
								  fragment_shader);
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
			gl_Position: new Vec4(vx,
								  vy,
								  vz,
								  in_data.gl_Position[3]
								 ),
						 
			interp_color: new Vec3(in_data.interp_color[0],
								   in_data.interp_color[1],
								   in_data.interp_color[2])
		};
		
		return rv;		
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
	
	
	_raster_triangle(Q, R, S, uniform_data, fragment_shader)
	{
		// TODO: Check this math again for the X-Y coordinate center offsetting
		var tri_min = new vec2( Math.max(this._viewport_x, min_of_3(Q.gl_Position.x, R.gl_Position.x, S.gl_Position.x)), 
							    Math.max(this._viewport_y, min_of_3(Q.gl_Position.y, R.gl_Position.y, S.gl_Position.y)) );

		var tri_max = new vec2( Math.min(this._viewport_x + this._viewport_w, max_of_3(Q.gl_Position.x, R.gl_Position.x, S.gl_Position.x)), 
							    Math.min(this._viewport_y + this._viewport_h, max_of_3(Q.gl_Position.y, R.gl_Position.y, S.gl_Position.y)) );
		
		
		var edge_qr = new Vec2( R.gl_Position.x - Q.gl_Position.x, R.gl_Position.y - Q.gl_Position..y );
		var edge_rs = new Vec2( S.gl_Position.x - R.gl_Position.x, S.gl_Position.y - R.gl_Position.y );
		var edge_sq = new Vec2( Q.gl_Position.x - S.gl_Position.x, Q.gl_Position.y - S.gl_Position.y );
		
		var tri_area = vec2_determinant(edge_qr, new vec2(-edge_sq.x, -edge_sq.y));
		
		// Back-face culling 
		if (tri_area < 0)
		{
			return;
		}
		
		
		var tri_coef = 1.0 / tri_area;
		
		
		// Barycentric coverage test 
		var bias_qr = this._edge_is_top_or_left(Q.gl_Position, R.gl_Position, S.gl_Position);
		var bias_rs = this._edge_is_top_or_left(R.gl_Position, S.gl_Position, Q.gl_Position);
		var bias_sq = this._edge_is_top_or_left(S.gl_Position, Q.gl_Position, R.gl_Position);
		
		
		var P = new Vec2(tri_min.x, tri_min.y);
		while (P.y < tri_max.y)
		{
			while (P.x < tri_max.y)
			{
				var edge_QP = new Vec2(P.x - Q.x, P.y - Q.y);
				var edge_RP = new Vec2(P.x - R.x, P.y - R.y);
				var edge_SP = new Vec2(P.x - S.x, P.y - S.y);
				
				
				var det_s = vec2_determinant(edge_QR, edge_QP);
				var det_q = vec2_determinant(edge_RS, edge_RP);
				var det_r = vec2_determinant(edge_SQ, edge_SP);
				
				
				if (det_q - bias_rs >= 0 && det_r - bias_sq >= 0 && det_s - bias_qr >= 0)
				{
					var interp_s = tri_coef * det_s;
					var interp_q = tri_coef * det_q;
					var interp_r = tri_coef * det_r;
					
					// this._draw_pixel(
				}
			
				it.x += 1;
			}
			
			it.x =  pt_min.x;
			it.y += 1;
		}
		
		
		
		
		
		/*
		this.draw_rect(min_x, 
					   min_y, 
					   max_x - min_x + 1, 
					   max_y - min_y + 1,
					   new RGBA(255, 0, 0, 255));
		*/
	}
	
}
