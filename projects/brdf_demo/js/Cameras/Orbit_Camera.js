class Orbit_Camera
{
	constructor(fov_lr_deg, 
				fov_td_deg, 
				near_z, 
				far_z,
				orbit_distance, 
				yaw_deg, 
				pitch_deg)
	{
	
		this.proj = new Matrix4x4();
		this.proj.set_perspective(fov_lr_deg, fov_td_deg, near_z, far_z);		
		
		this.view = new Matrix4x4();
		
		this.orbit_distance = orbit_distance;
		this.yaw_deg = yaw_deg;
		this.pitch_deg = pitch_deg;
		this._update_view_matrix();
	}

	set_distance(orbit_distance)
	{
		this.orbit_distance = orbit_distance;
		this._update_view_matrix();
	}
	
	increment_distance(offset)
	{
		this.orbit_distance += offset;
		if (this.orbit_distance < 0.0)
		{
			this.orbit_distance = 0.0;
		}
		this._update_view_matrix();
	}
	
	set_yaw(yaw_deg)
	{
		this.yaw_deg = yaw_deg;
		this._update_view_matrix();
	}
	
	increment_yaw(offset)
	{
		this.yaw_deg += offset;
		this._update_view_matrix();
	}
	
	set_pitch(pitch_deg)
	{
		this.pitch_deg = pitch_deg;
		this._update_view_matrix();
	}
	
	increment_pitch(offset)
	{
		this.pitch_deg += offset;
		this._update_view_matrix();
	}
	
	
	proj_matrix()
	{
		return this.proj;
	}

	
	_update_view_matrix()
	{
		var A = new Matrix4x4();
		var B = new Matrix4x4();
		var C = new Matrix4x4();
		A.set_rotate('y', this.yaw_deg);					
		B.set_rotate('x', this.pitch_deg);
		C.set_translate(0.0, 0.0, -this.orbit_distance);
		this.view = C.mult( B.mult( A ) );
	}
	
	view_matrix()
	{
		return this.view;
	}					
}
