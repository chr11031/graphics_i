class RGBA
{
	constructor(r, g, b, a)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	
	equals(other)
	{
		return (this.r == other.r &&
				this.g == other.g &&
				this.b == other.b &&
				this.a == other.a);
	}

}			
