class Matrix4x4
{
	constructor()
	{
		this.data = new Float32Array(16);
		this.set_identity();
	}
	
	copy()
	{
		var rv = new Matrix4x4();
		
		for (var r = 0; r < 4; r++)
		{
			for (var c = 0; c < 4; c++)
			{
				rv.set(r, c, this.get(r, c));
			}
		}
		
		return rv;
	}

	set(r, c, value)
	{
		this.data[(c * 4) + r] = value;
	}

	get(r, c)
	{
		return this.data[(c * 4) + r];
	}

	zero()
	{
		for (var r = 0; r < 4; r++)
		{
			for (var c = 0; c < 4; c++)
			{
				this.set(r, c, 0);
			}
		}
	}

	_swap(r_a, c_a, r_b, c_b)
	{
		var tmp = this.get(r_a, c_a);
		this.set(r_a, c_a, this.get(r_b, c_b));
		this.set(r_b, c_b, tmp);
	}

	transpose()
	{
		var rv = this.copy();
		rv._swap(0, 1, 1, 0);
		rv._swap(0, 2, 2, 0);
		rv._swap(0, 3, 3, 0);

		rv._swap(1, 2, 2, 1);
		rv._swap(1, 3, 3, 1);

		rv._swap(2, 3, 3, 2);
		
		return rv;
	}

	set_identity()
	{
		this.zero();
		for (var i = 0; i < 4; i++)
		{
			this.set(i, i, 1.0);
		}
	}

	set_scale(x, y, z)
	{
		this.set(0, 0, x);
		this.set(1, 1, y);
		this.set(2, 2, z);
	}

	set_translate(x, y, z)
	{
		this.set(0, 3, x);
		this.set(1, 3, y);
		this.set(2, 3, z);
	}

	set_rotate(axis='x', rot_deg)
	{
		if (axis != 'x' && axis != 'y' && axis != 'z')
		{
			alert('Bad rotation matrix around axis ' + axis );
			return;
		}

		var rad = Math.PI * rot_deg / 180.0;
		var cos_t = Math.cos(rad);
		var sin_t = Math.sin(rad);

		if (axis == 'x')
		{
			this.set(0, 0, 1.0);
			this.set(0, 1, 0.0);
			this.set(0, 2, 0.0);
			this.set(0, 3, 0.0);

			this.set(1, 0, 0.0);
			this.set(1, 1, cos_t);
			this.set(1, 2, sin_t);
			this.set(1, 3, 0.0);

			this.set(2, 0, 0.0);
			this.set(2, 1, -sin_t);
			this.set(2, 2, cos_t);
			this.set(2, 3, 0.0);

			this.set(3, 0, 0.0);
			this.set(3, 1, 0.0);
			this.set(3, 2, 0.0);
			this.set(3, 3, 1.0);
		}
		else if (axis == 'y')
		{
			this.set(0, 0, cos_t);
			this.set(0, 1, 0.0);
			this.set(0, 2, -sin_t);
			this.set(0, 3, 0.0);

			this.set(1, 0, 0.0);
			this.set(1, 1, 1.0);
			this.set(1, 2, 0.0);
			this.set(1, 3, 0.0);

			this.set(2, 0, sin_t);
			this.set(2, 1, 0.0);
			this.set(2, 2, cos_t);
			this.set(2, 3, 0.0);

			this.set(3, 0, 0.0);
			this.set(3, 1, 0.0);
			this.set(3, 2, 0.0);
			this.set(3, 3, 1.0);

		}
		else if (axis == 'z')
		{
			this.set(0, 0, cos_t);
			this.set(0, 1, -sin_t);
			this.set(0, 2, 0.0);
			this.set(0, 3, 0.0);

			this.set(1, 0, sin_t);
			this.set(1, 1, cos_t);
			this.set(1, 2, 0.0);
			this.set(1, 3, 0.0);

			this.set(2, 0, 0.0);
			this.set(2, 1, 0.0);
			this.set(2, 2, 1.0);
			this.set(2, 3, 0.0);

			this.set(3, 0, 0.0);
			this.set(3, 1, 0.0);
			this.set(3, 2, 0.0);
			this.set(3, 3, 1.0);
		}
	}
	
	set_orthographic(left, right, bot, top, near, far)
	{
		// We are looking for the Left-handed coordinate versions of these
		near = -near;
		far = -far;
		
		this.set(0, 0, 2.0 / (right - left));
		this.set(0, 1, 0.0);
		this.set(0, 2, 0.0);
		this.set(0, 3, -(left + right) / (right - left));

		this.set(1, 0, 0.0);
		this.set(1, 1, 2.0 / (top - bot));
		this.set(1, 2, 0.0);
		this.set(1, 3, -(bot + top) / (top - bot));

		this.set(2, 0, 0.0);
		this.set(2, 1, 0.0);
		this.set(2, 2, 2.0 / (far - near));
		this.set(2, 3, -(near + far) / (far - near));

		this.set(3, 0,  0.0);
		this.set(3, 1,  0.0);
		this.set(3, 2,  0.0);
		this.set(3, 3,  1.0);
	}

	set_perspective(fov_lr_deg, fov_td_deg, near, far)
	{
		// We are looking for the Left-handed coordinate versions of these
		near = -near;
		far  = -far;
		
		var fov_lr_rad = fov_lr_deg * Math.PI / 180.0;
		var fov_td_rad = fov_td_deg * Math.PI / 180.0;

		var left = near * Math.tan(fov_lr_rad / 2.0);
		var right = -left;
		var bot = near * Math.tan(fov_td_rad / 2.0);
		var top = -bot;

		this.set(0, 0, -2.0 * near / (right - left));
		this.set(0, 1, 0.0);
		this.set(0, 2, (right + left) / (right - left));
		this.set(0, 3, 0.0);

		this.set(1, 0, 0.0);
		this.set(1, 1, -2.0 * near / (top - bot));
		this.set(1, 2, (top + bot) / (top - bot));
		this.set(1, 3, 0.0);

		this.set(2, 0, 0.0);
		this.set(2, 1, 0.0);
		this.set(2, 2, -(far + near) / (far - near));
		this.set(2, 3, (2.0 * far * near) / (far - near));

		this.set(3, 0,  0.0);
		this.set(3, 1,  0.0);
		this.set(3, 2, -1.0);
		this.set(3, 3,  0.0);
	}

	set_columns_basis_r3(col_right, col_up, col_forward)
	{
		this.set_identity();

		this.set(0, 0, col_right[0]);
		this.set(1, 0, col_right[1]);
		this.set(2, 0, col_right[2]);

		this.set(0, 1, col_up[0]);
		this.set(1, 1, col_up[1]);
		this.set(2, 1, col_up[2]);

		this.set(0, 2, col_forward[0]);
		this.set(1, 2, col_forward[1]);
		this.set(2, 2, col_forward[2]);
	}

	mult(other_mat)
	{
		var rv = new Matrix4x4();

		for (var r = 0; r < 4; r++)
		{
			for (var c = 0; c < 4; c++) 
			{
				var sum = 0;                      
				for (var i = 0; i < 4; i++)
				{
					sum = sum + (this.get(r, i) * other_mat.get(i, c));
				}

				rv.set(r, c, sum);
			}
		}

		return rv;              
	}
	
	mult_vec4(vec4)
	{
		if (vec4.length != 4)
		{
			alert('Invalid vec4');
			console.log('Invalid vec4');
			return null;
		}
		
		var rv = [
					this.get(0,0)*vec4[0] + this.get(0,1)*vec4[1] + this.get(0,2)*vec4[2] + this.get(0,3)*vec4[3],
					this.get(1,0)*vec4[0] + this.get(1,1)*vec4[1] + this.get(1,2)*vec4[2] + this.get(1,3)*vec4[3],
					this.get(2,0)*vec4[0] + this.get(2,1)*vec4[1] + this.get(2,2)*vec4[2] + this.get(2,3)*vec4[3],
					this.get(3,0)*vec4[0] + this.get(3,1)*vec4[1] + this.get(3,2)*vec4[2] + this.get(3,3)*vec4[3]					
				];
		
		return rv;		
	}
	
	add(other_mat)
	{
		var rv = this.copy();
		
		for (var r = 0; r < 4; r++)
		{
			for (var c = 0; c < 4; c++)
			{
				rv.set(r, c, rv.get(r,c) + other_mat.get(r,c));
			}
		}
		
		return rv;
	}

	sub(other_mat)
	{
		var rv = this.copy();
		
		for (var r = 0; r < 4; r++)
		{
			for (var c = 0; c < 4; c++)
			{
				rv.set(r, c, rv.get(r,c) - other_mat.get(r,c));
			}
		}
		
		return rv;
	}
	
	_det(r, c)
	{
		if (r.length < 2)
		{
			alert('Invalid call to _det');
			console.log('Invalid call to _det');
			return null;
		}
		else if (r.length == 2)
		{
			return this.get(r[0],c[0])*this.get(r[1],c[1]) - this.get(r[0],c[1])*this.get(r[1],c[0]);
		}
		
		var sum = 0;
		for (var i = 0; i < r.length; i++)
		{
			var tmp_r = structuredClone(r);
			tmp_r.splice(0,1);
			var tmp_c = structuredClone(c);
			tmp_c.splice(i,1);
						
			var sign = (0 + i) % 2 == 0 ? 1.0 : -1.0;
			sum = sum + ( sign * this.get(r[0],c[i]) * this._det(tmp_r, tmp_c) );
		}
			
		return sum;
	}
	
	det()
	{
		var r = [0,1,2,3];
		var c = [0,1,2,3];
		var det = this._det(r, c);
		return det;
	}
	
	inverse()
	{
		var r = [0,1,2,3];
		var c = [0,1,2,3];
		var det = this._det(r, c);
		if (det == 0.0)
		{
			alert('Invalid Matrix4x4 inversion: matrix cannot be inverted!');
			console.log('Invalid Matrix4x4 inversion: matrix cannot be inverted!');
			return null;
		}
		var coef = 1.0 / det;
			
		var adj = new Matrix4x4();
		for (var r_i = 0; r_i < 4; r_i++)
		{
			for (var c_i = 0; c_i < 4; c_i++)
			{
				var tmp_r = structuredClone(r);
				tmp_r.splice(r_i,1);
				var tmp_c = structuredClone(c);
				tmp_c.splice(c_i,1);
							
				var sign = (r_i + c_i) % 2 == 0 ? 1.0 : -1.0;
				adj.set(c_i, r_i, sign * coef * this._det(tmp_r, tmp_c)); 
			}
		}
		
		return adj;	
	}
}

