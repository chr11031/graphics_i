class software_renderer
{	
	// CONTEXT for default framebuffer
	_ctx = null;
	_ctx_width = null;
	_ctx_height = null;
	
	
	constructor(canvas_element)
	{
		this._ctx = canvas_element.getContext("2d");		
		this._ctx_width = canvas_element.width;
		this._ctx_height = canvas_element.height;

	}


	_draw_pixel(pos, color)
	{
		this.ctx.fillStyle = "rgba("+color.r+","+color.g+","+color.b+","+(color.a/255)+")";
		this.ctx.fillRect(pos.x, this._ctx_height - 1 - pos.y, 1, 1);
	}


	// Your function calls here


}
