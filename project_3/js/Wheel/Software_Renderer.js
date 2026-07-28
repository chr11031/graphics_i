class Software_Renderer
{	
	// CONTEXT for default framebuffer
	_ctx = null;
	_ctx_width = null;
	_ctx_height = null;

	_viewport_x = null;
	_viewport_y = null;
	_viewport_w = null;
	_viewport_h = null;
	
	_depth_buf = null;
	
	
	constructor(canvas_element)
	{
		this._ctx = canvas_element.getContext("2d");		
		this._ctx_width = canvas_element.width;
		this._ctx_height = canvas_element.height;
	}
	

	_draw_pixel(pt, color)
	{
		this._ctx.fillStyle = "rgba("+color.x*255+","+color.y*255+","+color.z*255+","+(color.w)+")";
		this._ctx.fillRect(pt.x, this._ctx_height - 1 - pt.y, 1, 1);
	}


	// Your code here
}

