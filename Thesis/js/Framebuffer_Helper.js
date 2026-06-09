function generate_framebuffer(gl, attachments)
{
	var framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	
	var num_attachments = attachments.length;
	if (num_attachments > 16)
	{
		alert('That may be too many attachments for WebGL (' + num_attachments + '), bailing out');
		return null;
	}

	var used_attachments = [];
	
	for (var i = 0; i < attachments.length; i++)
	{
		var attachment_keys = Object.keys(attachments[i]);
		if (attachment_keys.length == 3 && attachment_keys.includes('texture') && attachment_keys.includes('att') && attachment_keys.includes('tex'))
		{
			var texture_obj = attachments[i].texture;
			var att     	= attachments[i].att;
			var tex     	= attachments[i].tex;

			if (used_attachments.includes(att))
			{
				alert('Invalid double use of framebuffer attachment: ' + att);
				return null;				
			}
			used_attachments.push(att);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, att, tex, texture_obj, 0);
		}
		else if (attachment_keys.length == 2 && attachment_keys.includes('renderbuffer') && attachment_keys.includes('att'))
		{
			var renderbuffer 	= attachments[i].renderbuffer;
			var att 			= attachments[i].att;			

			if (used_attachments.includes(att))
			{
				alert('Invalid double use of framebuffer attachment: ' + att);
				return null;				
			}
			used_attachments.push(att);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, att, gl.RENDERBUFFER, renderbuffer);	// TODO: TEST IMPACT OF USING gl.READ_FRAMEBUFFER here
		}
		else
		{
			alert("Error: Invalid attachment supplied to framebuffer object");
			return null;
		}
	}
	
	return framebuffer;
}