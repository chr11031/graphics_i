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


	_draw_pixel(pt, color)
	{
		this._ctx.fillStyle = "rgba("+color.x*255+","+color.y*255+","+color.z*255+","+(color.w)+")";
		this._ctx.fillRect(pt.x, this._ctx_height - 1 - pt.y, 1, 1);
	}


	clear_depth(x, y, x_size, y_size)
	{
		var ex = x + x_size;
		var ey = y + y_size;		
		
		for (var r = y; r < ey; r++)
		{
			for (var c = 0; c < ex; c++)
			{
				this._depth_buf[r][c] = 1.0;
			}
		}
	}
	
	
	clear(x, y, x_size, y_size, color)
	{
		this.clear_depth(x, y, x_size, y_size);
		
		this.draw_rect(x, y, x_size, y_size, color);
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
		var div_by_w = 1.0 / in_data.gl_Position.w;
		
		var rv = {
			gl_Position:  new Vec4(in_data.gl_Position.x * div_by_w,
								   in_data.gl_Position.y * div_by_w,
								   in_data.gl_Position.z * div_by_w,
								   div_by_w),			
							
			interp_color: new Vec3(in_data.interp_color.x,
								   in_data.interp_color.y,
								   in_data.interp_color.z)
		};
		
		return rv;
	}
	
	
	_viewport_transform(in_data)
	{
		var vx = (0.5 * (in_data.gl_Position.x + 1) ) * this._viewport_w + this._viewport_x;
		var vy = (0.5 * (in_data.gl_Position.y + 1) ) * this._viewport_h + this._viewport_y;
		var vz = (0.5 * (in_data.gl_Position.z + 1) );		


		var rv = {
			gl_Position:  new Vec4(Math.round(vx),
								   Math.round(vy),
											  vz,
								   in_data.gl_Position.w),
						 
			interp_color: new Vec3(in_data.interp_color.x,
								   in_data.interp_color.y,
								   in_data.interp_color.z)
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
		var tri_min = new Vec2( Math.max(this._viewport_x, min_of_3(Q.gl_Position.x, R.gl_Position.x, S.gl_Position.x)), 
							    Math.max(this._viewport_y, min_of_3(Q.gl_Position.y, R.gl_Position.y, S.gl_Position.y)) );

		var tri_max = new Vec2( Math.min(this._viewport_x + this._viewport_w, max_of_3(Q.gl_Position.x, R.gl_Position.x, S.gl_Position.x)), 
							    Math.min(this._viewport_y + this._viewport_h, max_of_3(Q.gl_Position.y, R.gl_Position.y, S.gl_Position.y)) );
		
		
		
		var edge_qr = new Vec2( R.gl_Position.x - Q.gl_Position.x, R.gl_Position.y - Q.gl_Position.y );
		var edge_rs = new Vec2( S.gl_Position.x - R.gl_Position.x, S.gl_Position.y - R.gl_Position.y );
		var edge_sq = new Vec2( Q.gl_Position.x - S.gl_Position.x, Q.gl_Position.y - S.gl_Position.y );
		
		var tri_area = Vec2_determinant(edge_qr, new Vec2(-edge_sq.x, -edge_sq.y));
		
		// Back-face culling 
		if (tri_area < 0)
		{
			return;
		}
		
		
		var tri_coef = 1.0 / tri_area;
		
		
		// Barycentric coverage pass 
		
		var bias_qr = this._edge_is_top_or_left(Q.gl_Position, R.gl_Position, S.gl_Position);
		var bias_rs = this._edge_is_top_or_left(R.gl_Position, S.gl_Position, Q.gl_Position);
		var bias_sq = this._edge_is_top_or_left(S.gl_Position, Q.gl_Position, R.gl_Position);
		
		var P = new Vec2(tri_min.x, tri_min.y);
		
		var edge_qp = new Vec2(P.x - Q.gl_Position.x, P.y - Q.gl_Position.y);
		var edge_rp = new Vec2(P.x - R.gl_Position.x, P.y - R.gl_Position.y);
		var edge_sp = new Vec2(P.x - S.gl_Position.x, P.y - S.gl_Position.y);

		var det_s = Vec2_determinant(edge_qr, edge_qp);
		var det_q = Vec2_determinant(edge_rs, edge_rp);
		var det_r = Vec2_determinant(edge_sq, edge_sp);

		var row_width = tri_max.x - tri_min.x + 1;
		var row_s = edge_qr.x + (row_width * edge_qr.y);
		var row_q = edge_rs.x + (row_width * edge_rs.y);
		var row_r = edge_sq.x + (row_width * edge_sq.y);
		
		
		
		var covered = new Array(tri_max.y - tri_min.y);
		
		var r = 0;
		var c = 0;
		while (P.y <= tri_max.y)
		{			
			covered[r] = new Array(row_width);
			while (P.x <= tri_max.x)
			{
				covered[r][c] = det_q >= bias_rs && det_r >= bias_sq && det_s >= bias_qr;
				
				det_s -= edge_qr.y;
				det_q -= edge_rs.y;
				det_r -= edge_sq.y;
			
				c += 1;
				P.x += 1;
			}
			
			det_s += row_s;
			det_q += row_q;
			det_r += row_r;
						

			P.x = tri_min.x;
			c = 0;

			r += 1;
			P.y += 1;
		}
		
		
		// Interpolation pass
		
		/*
		var Az = tri_coef * ( (R.y - S.y) * Q.z + (S.y - Q.y) * R.z + (Q.y - R.y) * S.z );
		var Bz = tri_coef * ( (S.x - R.x) * Q.z + (Q.x - S.x) * R.z + (R.x - Q.x) * S.z );
		var Cz = tri_coef * ( (R.x*S.y - R.y*S.x)*Q.z + (Q.y*S.x - Q.x*S.y)*R.z + (Q.x*R.y - Q.y*R.x)*S.z );
		*/
		
		var det_rs = R.gl_Position.x * S.gl_Position.y - R.gl_Position.y * S.gl_Position.x;
		var det_sq = S.gl_Position.x * Q.gl_Position.y - S.gl_Position.y * Q.gl_Position.x;
		var det_qr = Q.gl_Position.x * R.gl_Position.y - Q.gl_Position.y * R.gl_Position.x;
		
		
		var Az = tri_coef * ( -edge_rs.y * Q.gl_Position.z + -edge_sq.y * R.gl_Position.z + -edge_qr.y * S.gl_Position.z );
		var Bz = tri_coef * (  edge_rs.x * Q.gl_Position.z +  edge_sq.x * R.gl_Position.z +  edge_qr.x * S.gl_Position.z );
		var Cz = tri_coef * (  det_rs    * Q.gl_Position.z +     det_sq * R.gl_Position.z +     det_qr * S.gl_Position.z );
		var interp_z = tri_min.x * Az + tri_min.y * Bz + Cz;
		var row_z = Bz - (row_width * Az);

		
		var Aw = tri_coef * ( -edge_rs.y * Q.gl_Position.w + -edge_sq.y * R.gl_Position.w + -edge_qr.y * S.gl_Position.w );
		var Bw = tri_coef * (  edge_rs.x * Q.gl_Position.w +  edge_sq.x * R.gl_Position.w +  edge_qr.x * S.gl_Position.w );
		var Cw = tri_coef * (  det_rs    * Q.gl_Position.w +     det_sq * R.gl_Position.w +     det_qr * S.gl_Position.w );
		var interp_w = tri_min.x * Aw + tri_min.y * Bw + Cw;
		var row_w = Bw - (row_width * Aw);


		var Ar = tri_coef * ( -edge_rs.y * Q.interp_color.x + -edge_sq.y * R.interp_color.x + -edge_qr.y * S.interp_color.x );
		var Br = tri_coef * (  edge_rs.x * Q.interp_color.x +  edge_sq.x * R.interp_color.x +  edge_qr.x * S.interp_color.x );
		var Cr = tri_coef * (  det_rs    * Q.interp_color.x +     det_sq * R.interp_color.x +     det_qr * S.interp_color.x );
		var interp_r = tri_min.x * Ar + tri_min.y * Br + Cr;
		var row_r = Br - (row_width * Ar);


		var Ag = tri_coef * ( -edge_rs.y * Q.interp_color.y + -edge_sq.y * R.interp_color.y + -edge_qr.y * S.interp_color.y );
		var Bg = tri_coef * (  edge_rs.x * Q.interp_color.y +  edge_sq.x * R.interp_color.y +  edge_qr.x * S.interp_color.y );
		var Cg = tri_coef * (  det_rs    * Q.interp_color.y +     det_sq * R.interp_color.y +     det_qr * S.interp_color.y );
		var interp_g = tri_min.x * Ag + tri_min.y * Bg + Cg;
		var row_g = Bg - (row_width * Ag);


		var Ab = tri_coef * ( -edge_rs.y * Q.interp_color.z + -edge_sq.y * R.interp_color.z + -edge_qr.y * S.interp_color.z );
		var Bb = tri_coef * (  edge_rs.x * Q.interp_color.z +  edge_sq.x * R.interp_color.z +  edge_qr.x * S.interp_color.z );
		var Cb = tri_coef * (  det_rs    * Q.interp_color.z +     det_sq * R.interp_color.z +     det_qr * S.interp_color.z );
		var interp_b = tri_min.x * Ab + tri_min.y * Bb + Cb;
		var row_b = Bb - (row_width * Ab);
		
		
		
		r = 0; 
		for (P.y = tri_min.y; P.y <= tri_max.y; P.y += 1)
		{
			c = 0;
			for (P.x = tri_min.x; P.x <= tri_max.x; P.x += 1)
			{
				if (covered[r][c])
				{
					var fragment_input = {
						
						gl_Position:  new Vec4(P.x,
											   P.y,
											   interp_z,
											   interp_w),
						
						interp_color: new Vec3(interp_r, 
											   interp_g, 
											   interp_b)
					};
					
					var fragment_out = fragment_shader(fragment_input, uniform_data);
					
					
					// Depth test 
					if (fragment_out.gl_Position.z < this._depth_buf[fragment_out.gl_Position.y][fragment_out.gl_Position.x])
					{
						this._depth_buf[fragment_out.gl_Position.y][fragment_out.gl_Position.x] = fragment_out.gl_Position.z;
						this._draw_pixel(P, fragment_out.out_color);
					}
				}	

				
				interp_z += Az;
				interp_w += Aw;
				
				interp_r += Ar;
				interp_g += Ag;
				interp_b += Ab;

				c += 1;
			}
			
			interp_z += row_z;
			interp_w += row_w;
			
			interp_r += row_r;
			interp_g += row_g;
			interp_b += row_b;
			
			r += 1;				
		}
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

