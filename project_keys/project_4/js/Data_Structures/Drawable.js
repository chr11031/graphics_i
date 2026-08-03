class Drawable
{
	constructor(uniforms, vao, primitive_type, num_verts, draw_indexed)
	{
		this.uniforms = uniforms;
		this.vao = vao;
		this.primitive_type = primitive_type;
		this.num_verts = num_verts;
		this.draw_indexed = draw_indexed;
	}
}
