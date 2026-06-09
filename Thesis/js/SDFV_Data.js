class sdfv_data
{
	constructor(in_x_size, in_y_size, in_z_size, in_world_to_sdfv_transform, data)
	{
		this.x_size = in_x_size;
		this.y_size = in_y_size;
		this.z_size = in_z_size;
		this.world_to_sdfv_transform = in_world_to_sdfv_transform;
		
		this.data   = data;
	}
}

function load_sdf_volume(array_buffer)
{
	// Check MAGIC and ENDIAN fields
	const magic  = new Uint8Array( array_buffer, 0, 4);
	if (magic.byteLength != 4)
	{
		console.log('Header does not have even the first 4 bytes for the file header!');
		return null;
	}
	
	const expected_magic = ['S', 'D', 'F', 'V'];
	for (var i = 0; i < 4; i++)
	{
		if (expected_magic[i] != String.fromCharCode(magic[i]) )
		{
			console.log('Bad magic encoding in sdfv file');
			return null;
		}
	}
	const endian_check = new Uint16Array(array_buffer, 4, 1);
	if (endian_check.byteLength != 2)
	{
		console.log('Header does not have the 2 bytes for the endian-ness file header field!');
		return null;
	}
	const little_endian = (endian_check[0] != 0);

	// Parse the remaining header bytes
	const sdfv_header_size = 16 + (4*16);		// 16 bytes of parameters, 64 bytes for 4x4 homogeneous transform
	const sdf_file = new DataView(array_buffer);
	if (sdf_file.byteLength < sdfv_header_size)
	{
		console.log('Header does not have the full ' + sdfv_header_size + ' bytes required for SDFV file header');
		return null;
	}
	
	const version_no = sdf_file.getUint16(6, little_endian);
	if (version_no != 1)
	{
		console.log(version_no);
		console.log('Bad version number in sdfv file');
		return null;
	}
	
	const x_size  = sdf_file.getUint16(8,  little_endian);
	const y_size  = sdf_file.getUint16(10, little_endian);
	const z_size  = sdf_file.getUint16(12, little_endian);
	const packing = sdf_file.getUint16(14, little_endian);
	if (packing != 0x0123)
	{
		console.log('Unsupported packing mode in sdfv file');
		return null;
	}

	// Load the world_to_sdfv transformation
	var world_to_sdfv_transform = new Float32Array(16);
	for (var i = 0; i < 16; i++)
	{
		world_to_sdfv_transform[i] = sdf_file.getFloat32(16 + (i*4), little_endian);
	}


	// Load in the volume data
	const data_size = x_size * y_size * z_size;
	const total_expected_size = sdfv_header_size + (4*data_size);
	if (sdf_file.byteLength < total_expected_size)
	{
		console.log('SDFV file does not comform to specification size; too small!');
		return null;
	}
	else if (sdf_file.byteLength > total_expected_size)
	{
		console.log('SDFV file does not conform to specification size; extra bytes detected!');
		return null;
	}

	var the_array = new Float32Array( data_size );
	for (var i = 0; i < data_size; i++)
	{
		the_array[i] = sdf_file.getFloat32(sdfv_header_size + (i*4), little_endian);
	}

	const sdfv = new sdfv_data(x_size, y_size, z_size, world_to_sdfv_transform, the_array);
	return sdfv;
}
