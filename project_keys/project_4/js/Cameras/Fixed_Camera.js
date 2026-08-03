class Fixed_Camera
{
	constructor(position,
				look_at,
				up_vec,
	
				fov_lr_deg, 
				fov_td_deg, 
				near_z, 
				far_z)
	{
		this.proj = new Matrix4x4();
		this.proj.set_perspective(fov_lr_deg, fov_td_deg, near_z, far_z);		


		
		var look_dir = new Vec3(look_at.x - position.x,
								look_at.y - position.y,
								look_at.z - position.z);
		look_dir.normalize();
		
		var up = new Vec3(up_vec.x, up_vec.y, up_vec.z);
		up.normalize();
		
		var right = up.cross( look_dir );
		right.normalize();
		
		var up_prime = look_dir.cross(right);
		
		
		// Set rotation basis after translating it
		var tmp = new Matrix4x4();
		tmp.set_translate(-position.x,
						  -position.y,
						  -position.z);
						  
		this.view = new Matrix4x4();

		this.view.set(0, 0, right.x);
		this.view.set(1, 0, right.y);
		this.view.set(2, 0, right.z);
		
		this.view.set(0, 1, up_prime.x);
		this.view.set(1, 1, up_prime.y);
		this.view.set(2, 1, up_prime.z);
		
		this.view.set(0, 2, look_dir.x);
		this.view.set(1, 2, look_dir.y);
		this.view.set(2, 2, look_dir.z);


		// Move to new origin, then rotate it 
		this.view = this.view.mult( tmp );
		
	}
}