class Vec4
{
	constructor(x, y, z, w)
	{
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
	
	normalize()
	{
		var len = Math.sqrt(this.x * this.x + 
							this.y * this.y +
							this.z * this.z + 
							this.w * this.w);
							
		var coef = 1.0 / len;
		this.x *= coef;
		this.y *= coef;
		this.z *= coef;
		this.w *= coef;
	}
}

