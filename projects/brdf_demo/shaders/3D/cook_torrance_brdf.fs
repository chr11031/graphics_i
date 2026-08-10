#version 300 es
precision highp float;

#define PI 3.14159

uniform sampler2D albedo;
uniform sampler2D metal;
uniform sampler2D rough;

layout(std140) uniform matrix_data
{
	mat4 model;
	mat4 view;
	mat4 proj;
	
	vec3 light_pos;
	vec3 camera_pos;
};

smooth in vec2 interp_uv;		
smooth in vec3 interp_normal;	
smooth in vec3 interp_world_pos;

layout (location=0) out vec4 out_color;






vec3 Fresnel_Schlick(float cos_theta, vec3 F0)
{
	return F0 + (1.0 - F0) * pow(1.0 - cos_theta, 5.0);
}


// Trowbridge-Reitz Normal Distribution 
float Distribution_GGX(vec3 N, vec3 H, float roughness)
{
	float a = roughness;
	float a2 = a*a;
	float NdotH = max(dot(N,H), 0.0);
	float NdotH2 = NdotH*NdotH;
	
	float num = a2;
	float denom = (NdotH2 * (a2 - 1.0) + 1.0);
	denom = PI * denom * denom;
	
	return num / denom;
}


// GGX Schlick Geometry Shadowing Function 
float Geometry_Schlick_GGX(float NdotV, float roughness)
{
	float r = (roughness + 1.0);
	float k = (r*r) / 8.0;
	
	float num = NdotV;
	float denom = NdotV * (1.0 - k) + k;
	
	return num / denom;
}


// Geometry Smith approximation accounting for V and L shadowing 
float Geometry_Smith(vec3 N, vec3 V, vec3 L, float roughness)
{
	float NdotV = max(dot(N, V), 0.0);
	float NdotL = max(dot(N, L), 0.0);
	float ggx2 = Geometry_Schlick_GGX(NdotV, roughness);
	float ggx1 = Geometry_Schlick_GGX(NdotL, roughness);
	
	return ggx2 * ggx1;
}


void main() 
{
	float rough    = texture(rough, interp_uv).r;
	float metallic = texture(metal, interp_uv).r;
	vec3 albedo    = texture(albedo, interp_uv).rgb; 

	
	vec3 N = normalize(interp_normal);
	vec3 I = normalize( light_pos - interp_world_pos );	
	vec3 L = normalize( camera_pos - interp_world_pos );
	vec3 H = normalize( L + I );
	
	
	float HdotL = max(dot(H,L), 0.0);
	float NdotL = max(dot(N,L), 0.0);
	float NdotI = max(dot(N,I), 0.0);
	
	
	vec3 F = Fresnel_Schlick(HdotL, mix(vec3(0.04), albedo, metallic));	
	float D = Distribution_GGX(N, H, rough);
	float G = Geometry_Smith(N, L, I, rough);
	
	
	
	vec3 specular = ( D*G*F ) / 
					max( ( 4.0 * NdotL * NdotI ), 0.001 );
	
	vec3 kD = (1.0 - metallic) * (vec3(1.0) - F);
	vec3 diffuse = kD * albedo / PI;
	
	// Depends on Lighting Situation
	float radiance = 4.0;
	vec3 color = (diffuse + specular) * radiance * NdotI;



	// Ambient 
	color += 0.05*albedo;


	// Tone Mapping
	//color = color / (1.0 + color);


	// Gamma Correction
	color =  pow(color, vec3(1.0/2.2));


	out_color = vec4(color, 1.0);
	
}

/* Blinn-Phong Shading: 

	// Ambient				
	vec3 albedo = texture(albedo, interp_uv).rgb;
	float aC = 0.2;
	vec3 ambient  = aC * albedo;

	// Diffuse
	float align = dot(light_dir, normal);
	align = max(0.0, align);
	vec3 diffuse = (1.0 - aC) * align * albedo;
	
	// Specular
	align = dot(half_vector, normal);
	align = max(0.0, align);
	align = pow(align, 256.0);
	vec3 specular = align * vec3(1.0, 1.0, 1.0);


	vec3 color = vec3(ambient + diffuse + specular);	


	
*/