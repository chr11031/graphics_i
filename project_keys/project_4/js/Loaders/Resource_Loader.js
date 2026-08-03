const load_image = src => 
	new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;				
	});

const load_binary = src =>
	new Promise((resolve, reject) => {
		fetch(src)
			.then(res => res.blob())
			.then(blob => {
					var file_reader = new FileReader();
					file_reader.readAsArrayBuffer(blob);
					function handle_load(event)
					{
						file_reader.removeEventListener('load', handle_load);
						array_buffer = event.target.result;
						resolve(array_buffer);
					}
					file_reader.addEventListener('load', handle_load);									
			})
		
	});

	
const load_text = src =>

	new Promise((resolve, reject) => {
		fetch(src)
			.then(res => res.blob())
			.then(blob => {
					var file_reader = new FileReader();
					file_reader.readAsText(blob);
					function handle_load(event)
					{
						file_reader.removeEventListener('load', handle_load);
						text_buffer = event.target.result;
						resolve( text_buffer );
					}
					file_reader.addEventListener('load', handle_load);									
			})
	});

	
const load_json = src =>
	new Promise((resolve, reject) => {
		fetch(src)
			.then(res => res.blob())
			.then(blob => {
					var file_reader = new FileReader();
					file_reader.readAsText(blob);
					function handle_load(event)
					{
						file_reader.removeEventListener('load', handle_load);
						text_buffer = event.target.result;
						resolve( JSON.parse(text_buffer) );
					}
					file_reader.addEventListener('load', handle_load);									
			})
	});


function load_external_resources(all_resources_dict, callback)
{
	const promises = [];
	
	var keys = Object.keys(all_resources_dict);

	for (var key_idx = 0; key_idx < keys.length; key_idx++)
	{
		for (var i = 0; i < all_resources_dict[ keys[key_idx] ].length; i++)
			{
				var entry = all_resources_dict[ keys[key_idx] ][i];
				if (entry.length != 3)
				{
					console.log('Invalid resource list: ' + entry + ', expected orderd triple for each resource request');
					return;
				}
				
				var dict_key = entry[0];
				var url = entry[1];
				var type = entry[2];
				
				if (type == 'bin')
				{
					promises.push( load_binary(url) );
				}
				else if (type == "img")
				{
					promises.push( load_image(url) );
				}
				else if (type == 'json')
				{
					promises.push( load_json(url) );
				}
				else if (type == 'text')
				{
					promises.push( load_text(url) );
				}
				else
				{
					console.log('Bad resource type request: ' + type + ' not supported');
					return;
				}
			}
	}
	
	var rv_dict = {};
	
	Promise.all( promises ).then(resources => {
	
		var r_idx = 0;
		for (var key_idx = 0; key_idx < keys.length; key_idx++)
		{
			rv_dict[ keys[key_idx] ] = {};
			for (var i = 0; i < resources.length; i++)
			{
				var key_name = all_resources_dict[ keys[key_idx] ][i][0];
				rv_dict[ keys[key_idx] ][key_name] = resources[r_idx];
				r_idx += 1;
			}
		}
	
		callback(rv_dict);
	});		
}
