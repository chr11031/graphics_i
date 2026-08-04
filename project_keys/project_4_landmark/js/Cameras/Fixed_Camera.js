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


		
		var look_dir = new Vec3(position.x - look_at.x,
								position.y - look_at.y,
								position.z - look_at.z);
		look_dir.normalize();
		
		var up = new Vec3(up_vec.x, up_vec.y, up_vec.z);
		up.normalize();
		
		var right = up.cross( look_dir );
		right.normalize();
		
		var up_prime = look_dir.cross(right);
		
		
		// Set rotation basis after translating it
		this.view = new Matrix4x4();

		this.view.set(0, 0, right.x);
		this.view.set(0, 1, right.y);
		this.view.set(0, 2, right.z);
		
		this.view.set(1, 0, up_prime.x);
		this.view.set(1, 1, up_prime.y);
		this.view.set(1, 2, up_prime.z);
		
		this.view.set(2, 0, look_dir.x);
		this.view.set(2, 1, look_dir.y);
		this.view.set(2, 2, look_dir.z);
		
		this.view.set(0, 3, -position.x * right.x +
							-position.y * right.y +
							-position.z * right.z);
							
		this.view.set(1, 3, -position.x * up_prime.x +
							-position.y * up_prime.y +
							-position.z * up_prime.z);
							
		this.view.set(2, 3, -position.x * look_dir.x +
							-position.y * look_dir.y +
							-position.z * look_dir.z);
	}
}