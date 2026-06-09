function generate_2d_RGBA8_MSAA_renderbuffer(gl, width, height)
{
    var renderbuffer = gl.createRenderbuffer();

    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

    gl.renderbufferStorageMultisample(gl.RENDERBUFFER,
                                      gl.getParameter(gl.MAX_SAMPLES),
                                      gl.RGBA8,
                                      width,
                                      height);

    
    return renderbuffer;
}

function generate_2d_RGBA_Depth_MSAA_renderbuffer(gl, width, height)
{
    var renderbuffer = gl.createRenderbuffer();

    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

    gl.renderbufferStorageMultisample(gl.RENDERBUFFER,
                                      gl.getParameter(gl.MAX_SAMPLES),
                                      gl.DEPTH_COMPONENT24,
                                      width,
                                      height);

    
    return renderbuffer;
}


// BELOW IS SOME CODE WORKING FOR UP TO 4 RENDERBUFFER ATTACHMENTS - NEEDS SOME WORK BUT 
// HAS THE KEY API CALLS SETUP - INTERNAL TEXTURE FORMATS HERE LIMIT WHAT CAN BE DONE & USED

// function blit_attachments_to_framebuffer(framebuffer_A, framebuffer_B, attachments)
// {
//     for (var i = 0; i < attachments.length; i++)
//     {
//         var att = attachments[i];
//         gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer_A.framebuffer());
//         gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer_B.framebuffer());
//         gl.readBuffer(att);

//         var work_around = [];
//         if (att == gl.COLOR_ATTACHMENT0)
//         {
//             work_around = [gl.COLOR_ATTACHMENT0, gl.NONE, gl.NONE, gl.NONE];
//         }
//         else if (att = gl.COLOR_ATTACHMENT1)
//         {
//             work_around = [gl.NONE, gl.COLOR_ATTACHMENT1, gl.NONE, gl.NONE];
//         }
//         else if (att = gl.COLOR_ATTACHMENT2)
//         {
//             work_around = [gl.NONE, gl.NONE, gl.COLOR_ATTACHMENT2, gl.NONE];
//         }
//         else if (att == gl.COLOR_ATTACHMENT3)
//         {
//             work_around = [gl.NONE, gl.NONE, gl.NONE, gl.COLOR_ATTACHMENT3];
//         }

//         gl.drawBuffers(work_around);

//         gl.blitFramebuffer(	0, 0, framebuffer_A.width(), framebuffer_A.height(),
//                             0, 0, framebuffer_A.width(), framebuffer_A.height(),
//                             gl.COLOR_BUFFER_BIT, gl.LINEAR);
    
//     }
// }

// ENGINE CODE FOR FRAMEBUFFERS (DATATYPES ARE NOT POSSIBLE UNFORTUNATELY)
// 			NON-SUBJECT G BUFFER MSAA
// 			renderbuffers['opaque_pos_msaa'] 			= generate_2d_RGBA8_MSAA_renderbuffer(gl, gl.viewport_width, gl.viewport_height);
// 			renderbuffers['opaque_normal_msaa'] 		= generate_2d_RGBA8_MSAA_renderbuffer(gl, gl.viewport_width, gl.viewport_height);
// 			renderbuffers['opaque_albedo_msaa'] 		= generate_2d_RGBA8_MSAA_renderbuffer(gl, gl.viewport_width, gl.viewport_height);
// 			renderbuffers['opaque_metal_rough_ao_msaa'] = generate_2d_RGBA8_MSAA_renderbuffer(gl, gl.viewport_width, gl.viewport_height);
// 			renderbuffers['opaque_depth_msaa'] 			= generate_2d_RGBA_Depth_MSAA_renderbuffer(gl, gl.viewport_width, gl.viewport_height);			
// 			render_targets['opaque_g_buffer_msaa'] 		= new Render_Target(gl, gl.viewport_width, gl.viewport_height,
// 															[
// 																{renderbuffer: renderbuffers['opaque_pos_msaa'],			att: gl.COLOR_ATTACHMENT0 },
// 																{renderbuffer: renderbuffers['opaque_normal_msaa'],			att: gl.COLOR_ATTACHMENT1 },
// 																{renderbuffer: renderbuffers['opaque_albedo_msaa'],			att: gl.COLOR_ATTACHMENT2 },
// 																{renderbuffer: renderbuffers['opaque_metal_rough_ao_msaa'],	att: gl.COLOR_ATTACHMENT3 },
// 																{renderbuffer: renderbuffers['opaque_depth_msaa'],			att: gl.DEPTH_ATTACHMENT  },
// 															]);

