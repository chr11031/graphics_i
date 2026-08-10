class Vec3
{
	constructor(x, y, z)
	{
		this.x = x;
		this.y = y;
		this.z = z;
	}


	normalize()
	{
		var size = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

		var coef = 1.0 / size;

		this.x *= coef;
		this.y *= coef;
		this.z *= coef;
	}	
	
	
	cross(other)
	{
		return new Vec3(this.y * other.z - this.z * other.y,
						this.z * other.x - this.x * other.z,
						this.x * other.y - this.y * other.x);
	}
}


function Vec3_sub(a, b)
{
	return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}


function Vec3_dot(a, b)
{
	return a.x * b.x + a.y * b.y + a.z * b.z;
}