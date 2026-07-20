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
}


function Vec3_sub(a, b)
{
	return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}


function Vec3_dot(a, b)
{
	return a.x * b.x + a.y * b.y + a.z * b.z;
}