function generate_screen_pt()
{
	var screen_vert = [
		0.0, 0.0, 0.0
	];

	var rv = { 
				type: 'POINTS', 
				position : screen_vert, 
				vertex_count: 1 
			};

	return rv;
}


function generate_screen_line()
{
	var screen_verts = [
		0.0, 0.0, 0.0,
		0.0, 0.0, 1.0,
	];

	var rv = { 
				type: 'LINES', 
				position: screen_verts, 
				vertex_count: 2 
			};

	return rv;
}


function generate_screen_tri()
{
	var screen_verts = [
		0.0, 0.0, 0.0,
		0.0,-1.0, 0.0,
		1.0,-1.0, 0.0,
	];

	var rv = {
		type: 'TRIANGLES',
		position: screen_verts,
		vertex_count: 3
	};

	return rv;
}


function generate_screen_quad()
{
	var screen_verts = [
		-1.0,  1.0, 0.0,
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0,

		 1.0,  1.0, 0.0,
		-1.0,  1.0, 0.0,
		 1.0, -1.0, 0.0,
	];
	
	var screen_uvs = [
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,

		1.0, 1.0,
		0.0, 1.0,
		1.0, 0.0
	];
	
	var rv = { 
		type: 'TRIANGLES', 
		position: screen_verts, 
		uv: screen_uvs, 
		vertex_count: 6 
	};

	return rv;	
}



function generate_box_buffers(box_dim_size, with_stand)
{
	// VBOs, EBOs, VAOs
	var v = box_dim_size;
	
	var mesh_verts   = [
		-v, v, -v,
		-v, -v, -v,
		-v, v, v,
		-v, v, v,
		-v, -v, -v,
		-v, -v, v,
		
		v, v, -v,
		v, v, v,
		v, -v, v,
		v, v, -v,
		v, -v, v,
		v, -v, -v,
		
		-v, v, -v,
		-v, v, v,
		v, v, -v,
		v, v, -v,
		-v, v, v, 
		v, v, v,
	
		-v, -v, v,
		-v, -v, -v,
		v, -v, v,
		v, -v, v,
		-v, -v, -v,
		v, -v, -v,
		
		-v, v, v,
		-v, -v, v,
		v, v, v,
		v, v, v,
		-v, -v, v,
		v, -v, v,

		v, v, -v,
		v, -v, -v,
		-v, v, -v,
		v, -v, -v,
		-v, -v, -v,
		-v, v, -v,
	];

	if (with_stand)
	{
		mesh_verts = mesh_verts.concat( [
			-0.5,  0.0, -0.5,
			-0.5,   -v, -0.5,
			0.5,   -v, -0.5,
		   
		   0.5,   -v, -0.5,
		   0.5,  0.0, -0.5,
		  -0.5,  0.0, -0.5,
		  
			-0.5,   -v,  0.5,
		   -0.5,  0.0,  0.5,
			0.5,   -v,  0.5,
		   
		   0.5,  0.0,  0.5,
		   0.5,   -v,  0.5,
		  -0.5,  0.0,  0.5,
		  
		  -0.5,  0.0,  0.5,
		  -0.5, -v,    0.5,
		  -0.5, -v,   -0.5,
		  
		  -0.5,  0.0,  0.5,
		  -0.5, -v,   -0.5,
		  -0.5,  0.0, -0.5, 
   
		   0.5,  0.0,  0.5,
		   0.5, -v,   -0.5,
		   0.5, -v,    0.5,
		  
		   0.5,  0.0,  0.5,
		   0.5,  0.0, -0.5, 
		   0.5, -v,   -0.5,
		   
		   -0.5, 0.0, 0.5,
		   -0.5, 0.0, -0.5,
		   0.5, 0.0, -0.5,
		   
		   -0.5, 0.0, 0.5,
		   0.5, 0.0, -0.5,
		   0.5, 0.0, 0.5,   
		] );
	}
		
	
	var tl_x = 1.0/4.0;
	var tl_y = 3.0/4.0;
	
	var tr_x = 3.0/4.0;
	var tr_y = 3.0/4.0;
	
	var bc_x = 0.5;
	var bc_y = 1.0/4.0;
	


	// // DEBUG CODE
	// var mesh_uvs = [
	// 	0.0, 2.0/3.0,
	// 	0.0, 1.0/3.0,
	// 	0.25, 2.0/3.0,
	// 	0.25, 2.0/3.0,
	// 	0.0, 1.0/3.0,
	// 	0.25,1.0/3.0,

	// 	0.75, 2.0/3.0,
	// 	0.5, 2.0/3.0,
	// 	0.5, 1.0/3.0,
	// 	0.75, 2.0/3.0,
	// 	0.5, 1.0/3.0,
	// 	0.75, 1.0/3.0,

	// 	0.25, 1.0,
	// 	0.25, 2.0/3.0,
	// 	0.5, 1.0,
	// 	0.5, 1.0,
	// 	0.25, 2.0/3.0,
	// 	0.5, 2.0/3.0,

	// 	0.25, 1.0/3.0,
	// 	0.25, 0.0,
	// 	0.5, 1.0/3.0,
	// 	0.5, 1.0/3.0,
	// 	0.25, 0.0,
	// 	0.5, 0.0,

	// 	0.25, 2.0/3.0,
	// 	0.25, 1.0/3.0,
	// 	0.5,  2.0/3.0,
	// 	0.5,  2.0/3.0,
	// 	0.25, 1.0/3.0,
	// 	0.5,  1.0/3.0,
	// ];

	var mesh_uvs = [
		tl_x, tl_y,
		tl_x, tl_y,
		tl_x, tl_y,
		tl_x, tl_y,
		tl_x, tl_y,
		tl_x, tl_y,

		tr_x, tr_y,
		tr_x, tr_y,
		tr_x, tr_y,
		tr_x, tr_y,
		tr_x, tr_y,
		tr_x, tr_y,

		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,

		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,

		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,

		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
		bc_x, bc_y,
	];

	if (with_stand)
	{
		mesh_uvs = mesh_uvs.concat( [
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,

			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
	
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
	
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
	
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
			bc_x, bc_y,
		] );		
	}
	
	var mesh_norms   = [
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
	
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
	
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
	
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,

		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
	];

	if (with_stand)
	{
		mesh_norms = mesh_norms.concat( [
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
	
			0.0, 0.0,  1.0,
			0.0, 0.0,  1.0,
			0.0, 0.0,  1.0,
			0.0, 0.0,  1.0,
			0.0, 0.0,  1.0,
			0.0, 0.0,  1.0,
			
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
	
			 1.0, 0.0, 0.0,
			 1.0, 0.0, 0.0,
			 1.0, 0.0, 0.0,
			 1.0, 0.0, 0.0,
			  1.0, 0.0, 0.0, 
			 1.0, 0.0, 0.0,
			 
			 0.0, 1.0, 0.0,
			 0.0, 1.0, 0.0,
			 0.0, 1.0, 0.0,
			 0.0, 1.0, 0.0,
			 0.0, 1.0, 0.0,
			 0.0, 1.0, 0.0,
		] );
	}
		
	
	var mesh_colors = [
		1.0, 0.2, 0.2,
		1.0, 0.2, 0.2,
		1.0, 0.2, 0.2,
		1.0, 0.2, 0.2,
		1.0, 0.2, 0.2,
		1.0, 0.2, 0.2,

		0.2, 1.0, 0.2, 
		0.2, 1.0, 0.2, 
		0.2, 1.0, 0.2, 
		0.2, 1.0, 0.2, 
		0.2, 1.0, 0.2, 
		0.2, 1.0, 0.2, 
		
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,

		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,

		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,

		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
		0.9, 0.9, 0.9,
	];

	if (with_stand)
	{
		mesh_colors = mesh_colors.concat( [
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
	
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
	
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
			0.9, 0.9, 0.9,
		] );
	}


	var vertex_count = mesh_verts.length / 3;

	var rv = { 	
				type: 'TRIANGLES', 
				position: 		mesh_verts,
				uv: 			mesh_uvs,
				normal: 		mesh_norms,
				color:			mesh_colors,
				vertex_count: 	vertex_count,
			};

	return rv;
}


function generate_obj_buffers_with_vert_uv_norm(obj)
{	
	// VBOs, EBOs, VAOs
	var no_verts 	= 0;
	var mesh_verts  = [];
	var mesh_uvs	= [];
	var mesh_norms  = [];
	for (i = 0; i < obj.length; i++)
	{
		mesh_verts.push(obj[i][0]);
		mesh_verts.push(obj[i][1]);
		mesh_verts.push(obj[i][2]);

		mesh_verts.push(obj[i][3]);
		mesh_verts.push(obj[i][4]);
		mesh_verts.push(obj[i][5]);

		mesh_verts.push(obj[i][6]);
		mesh_verts.push(obj[i][7]);
		mesh_verts.push(obj[i][8]);

		
		mesh_uvs.push(obj[i][9]);
		mesh_uvs.push(obj[i][10]);

		mesh_uvs.push(obj[i][11]);
		mesh_uvs.push(obj[i][12]);

		mesh_uvs.push(obj[i][13]);
		mesh_uvs.push(obj[i][14]);


		mesh_norms.push(obj[i][15]);
		mesh_norms.push(obj[i][16]);
		mesh_norms.push(obj[i][17]);

		mesh_norms.push(obj[i][18]);
		mesh_norms.push(obj[i][19]);
		mesh_norms.push(obj[i][20]);

		mesh_norms.push(obj[i][21]);
		mesh_norms.push(obj[i][22]);
		mesh_norms.push(obj[i][23]);

		no_verts += 3;
	}

	var rv = {
				type: 			'TRIANGLES',
				position:		mesh_verts,
				uv:				mesh_uvs,
				normal:			mesh_norms,
				vertex_count: 	no_verts,
			};

	return rv;
}