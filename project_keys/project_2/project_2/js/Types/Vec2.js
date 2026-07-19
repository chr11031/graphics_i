class Vec2
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}
	
}

function Vec2_determinant(M, N)
{
	return M.x * N.y - M.y * N.x;
}