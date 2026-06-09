class Observe_Control
{
	constructor(camera, min_zoom, max_zoom)
	{
		// TODO: REFACTOR AND IMPROVE THIS SO STATE IS DECOUPLED FURTHER
		this._start_pos_r4 = null; 
		this._start_dir_r4 = null; 
		this._start_up_r4  = null;

		this.change_camera(camera);
		this.set_zoom_range(min_zoom, max_zoom);

		this.mouse_active = false;
		this.last_x = -1;
		this.last_y = -1;

		this.yaw = 0.0;
		this.pitch = 0.0;
	}

	set_zoom_range(min_zoom, max_zoom)
	{
		if (min_zoom > max_zoom)
			{
				alert('Invalid zoom range for observation control');
			}
		this.min_zoom = min_zoom;
		this.max_zoom = max_zoom;
	}
	
	change_camera(camera)
	{
		this.camera = camera;

		this._start_pos_r4 = _vec3_pos_to_vec4( this.camera.pos() ); 
		this._start_dir_r4 = _vec3_dir_to_vec4( this.camera.dir() ); 
		this._start_up_r4  = _vec3_dir_to_vec4( this.camera.up()  );
	}
	
	update_mouse_active(active)
	{
		this.mouse_active = active;
	}
	
	update_mouse_move(event)
	{
		var delta_x = 0.0;
		var delta_y = 0.0;
		if (this.mouse_active == false)
		{
			this.last_x = -1;
			this.last_y = -1;
			return;
		}
		else
		{
			// First motion sets up relative movement state
			if (this.last_x == -1 || this.last_y == -1)
			{
				this.last_x = event.clientX;
				this.last_y = event.clientY;
			}
			// Later motions facilitate updates
			else
			{
				delta_x = event.clientX - this.last_x;
				delta_y = event.clientY - this.last_y;
				this.last_x = event.clientX;
				this.last_y = event.clientY;
			}
		
		}


		// Update the VIEW matrix
		var rot_coef = 0.2;
		this.yaw  	+= rot_coef * delta_x;
		this.pitch 	+= rot_coef * delta_y;

		while (this.yaw < 0.0)
		{
			this.yaw += 360.0;			
		}
		while (this.yaw > 360.0)
		{
			this.yaw -= 360.0;
		}
		while (this.pitch < -89.9)
		{
			this.pitch = -89.9;			
		}
		while (this.pitch > 89.9)
		{
			this.pitch = 89.9;			
		}

		
		// TODO: Make these camera controls 'state'-less
		var cur_zoom = _length_r3(this.camera.pos()) / _length_r3(this._start_pos_r4);

		var rot_mat = this._get_rotation_matrix(-this.pitch, -this.yaw);
		var new_pos_r3 = _vec4_pos_to_vec3( rot_mat.mult_vec4( this._start_pos_r4 ) );
		var new_dir_r3 = _vec4_dir_to_vec3( rot_mat.mult_vec4( this._start_dir_r4 ) );
		var new_up_r3  = _vec4_dir_to_vec3( rot_mat.mult_vec4( this._start_up_r4  ) );
		

		// Update the camera object
		this.camera.set_pos( _scale_vec_r3(new_pos_r3, cur_zoom) );
		this.camera.set_dir( new_dir_r3 );
		this.camera.set_up(  new_up_r3  );
	}
	
	_get_rotation_matrix(pitch_deg, yaw_deg)
	{
		var rot_pitch = new Matrix4x4();
		rot_pitch.set_rotate('x', pitch_deg);

		var rot_yaw = new Matrix4x4();
		rot_yaw.set_rotate('y', yaw_deg);
		
		var rv = rot_yaw.mult( rot_pitch );
		
		return rv;				
	}

	update_zoom(delta_wheel)
	{
		// Detect current 'Zoom' value (position to origin length)
		var current_pos = this.camera.pos();
		var current_dir  = this.camera.dir();
		var current_zoom = _length_r3( current_pos );

		// Check dot product for sign of 'zoom' value
		var dot_pos_dir = _dot_r3(current_pos, current_dir);
		if (dot_pos_dir > 0.0)
		{
			current_zoom *= -1.0;
		}

		var zoom_coef = 0.001;
		var projected_new_zoom = current_zoom + (zoom_coef * delta_wheel);

		var new_zoom;
		if (projected_new_zoom > this.max_zoom)
		{
			new_zoom = this.max_zoom; 
		}
		else if (projected_new_zoom < this.min_zoom)
		{
			new_zoom = this.min_zoom;
		}
		else
		{
			new_zoom = projected_new_zoom;
		}
		
		var scale_factor = new_zoom / current_zoom;
		var new_pos = _scale_vec_r3(current_pos, scale_factor);
		this.camera.set_pos(new_pos);
	}
}