import numpy as np
import matplotlib.pyplot as plt
import cairo
from PIL import Image

# GLOBALS
cam_pos = np.array([0.0, 0.0, -2.1])
sphere_center = np.array([0.0, 0.0, 0.0])
sphere_radius = 0.5
sdfv_mat = np.array([0.96875,0,0,0,0,0.96875,0,0,0,0,0.96875,0,0.5,0.5,0.5,1]).reshape((4,4)).transpose()
sdfv_voxel_size = 1.0 / 64.0
NUM_ITERATIONS = 4
SDF_DELTA = 1.0 / 64.0
wall_pos_z = 2.0

def retract_pos_to_sdfv_bbox(pos, dir):
    
    near_coef = -1000000.0

    if dir[0] != 0.0:
        left_x  = -pos[0] / dir[0]
        if (left_x < 0.0 and left_x > near_coef):
            near_coef = left_x
        right_x = (1.0 - pos[0]) / dir[0]
        if (right_x < 0.0 and right_x > near_coef):
            near_coef = right_x
    if dir[1] != 0.0:
        left_y  = -pos[1] / dir[1]
        if (left_y < 0.0 and left_y > near_coef):
            near_coef = left_y
        right_y = (1.0 - pos[1]) / dir[1]
        if (right_y < 0.0 and right_y > near_coef):
            near_coef = right_y    
    if dir[2] != 0.0:
        left_z  = -pos[2] / dir[2]
        if (left_z < 0.0 and left_z > near_coef):
            near_coef = left_z
        right_z = (1.0 - pos[2]) / dir[2]
        if (right_z < 0.0 and right_z > near_coef):
            near_coef = right_z
    
    bound_pos = np.array(   [   pos[0] + near_coef*dir[0], 
                                pos[1] + near_coef*dir[1], 
                                pos[2] + near_coef*dir[2], ]    )

    return bound_pos


def refract(I, N, eta):
    k = 1.0 - eta*eta * (1.0 - np.dot(N, I) * np.dot(N, I))
    if (k < 0.0):
        R = np.array([0.0, 0.0, 0.0])
    else:
        R = eta * I - (eta * np.dot(N, I) + np.sqrt(k)) * N
    return R

def normalize(A):
    len = np.sqrt(A[0]*A[0] + A[1]*A[1] + A[2]*A[2])
    return np.array([A[0]/len, A[1]/len, A[2]/len])

def intersect_plane(pt, dir, plane_height_y):
    f = (plane_height_y - pt[1]) / dir[1]
    rv = pt + f*dir
    return rv

def intersect_sphere(pt, dir, sphere_ctr, sphere_radius):
    a = dir[0]*dir[0] + dir[1]*dir[1] + dir[2]*dir[2]
    b = 2 * np.dot( (pt - sphere_ctr), dir )
    c = np.dot( pt - sphere_ctr, pt - sphere_ctr ) - sphere_radius*sphere_radius

    root = b*b - 4*a*c
    if root < 0.0:
        return None

    less = (-b - np.sqrt(root)) / (2*a)
    more = (-b + np.sqrt(root)) / (2*a)

    if less > 0.0:
        return pt + less*dir
    else:
        return pt + more*dir


def analytical_trace(light_pos, sample_dir):

    # The light pos
    pos = light_pos   

    # The light dir
    dir = normalize( sample_dir )  

    record = []
    record.append( [pos, dir] )

    # Static scene constants
    plane_y = -1.0
    pos = intersect_sphere(pos, dir, sphere_center, sphere_radius)
    if (pos is None):
        return record
    outside_norm = normalize( pos - sphere_center )
    dir = refract(dir, outside_norm, 1.0 / 1.52)
    pos += 0.001 * dir
    record.append( [pos, dir] )

    pos = intersect_sphere(pos, dir, sphere_center, sphere_radius)
    inside_norm = -normalize( pos - sphere_center )
    dir = refract(dir, inside_norm, 1.52 / 1.0)
    if (dir[0] == 0.0 and dir[1] == 0.0 and dir[2] == 0.0):
        return None
    pos += 0.001 * dir 
    record.append( [pos, dir] )

    # rv = intersect_plane(pos, dir, plane_y)
    return record

def sdfv_dist(pos):
    sphere_center_p = _sdfv_pos_world_to_sdfv(sphere_center)
    sphere_radius_p = sdfv_mat[0,0] * sphere_radius

    dist = np.sqrt( np.dot((pos - sphere_center_p), (pos - sphere_center_p)) )
    return dist - sphere_radius_p


def sdfv_normal(pos):
    N = np.array([0.0, 0.0, 0.0])
    N[0] =  sdfv_dist( np.array([pos[0] + SDF_DELTA, pos[1], pos[2]])) - sdfv_dist( np.array([pos[0] - SDF_DELTA, pos[1], pos[2]]))
    N[1] =  sdfv_dist( np.array([pos[0], pos[1] + SDF_DELTA, pos[2]])) - sdfv_dist( np.array([pos[0], pos[1] - SDF_DELTA, pos[2]]))
    N[2] =  sdfv_dist( np.array([pos[0], pos[1], pos[2] + SDF_DELTA])) - sdfv_dist( np.array([pos[0], pos[1], pos[2] - SDF_DELTA]))
    N = normalize(N)
    return N


def OUTSIDE(low,high,val):
    return (val < low) or (val > high)


def find_surface_crossing(prev_pos, prev_dist, next_pos, next_dist):
    increasing = next_dist > prev_dist
    guess_pos = None 
    guess_dist = None 

    # Secant method
    for i in range(NUM_ITERATIONS):
        range_v    = next_dist - prev_dist
        lin_coef   = -prev_dist / range_v
        guess_pos  = prev_pos + lin_coef * (next_pos - prev_pos)
        guess_dist = sdfv_dist(guess_pos)
        if (increasing and guess_dist > 0.0) or (not increasing and guess_dist < 0.0):
            next_pos  = guess_pos
            next_dist = guess_dist
        else:
            prev_pos  = guess_pos
            prev_dist = guess_dist

    return guess_pos


def reflect(I, N):
    return I - 2.0 * np.dot(N,I) * N


def Fresnel_Schlick(cos_theta, F0):
    return F0 + (1.0 - F0) * np.power(1.0 - cos_theta, 5.0)


def refract_reflect(flux, I, N, S):
    N = S * N 
    eta = 1.0 / 1.52 
    if (S > 0.0):
        eta = eta
    else:
        eta = 1.0/eta

    reflect_coef = Fresnel_Schlick(np.dot(N,-I), 0.04)
    refract_coef = 1.0 - reflect_coef

    k = 1.0 - eta * eta * (1.0 - np.dot(N,I) * np.dot(N,I))
    if k < 0.0:
        flux *= reflect_coef
        return reflect(I, N), flux
    else:
        flux *= refract_coef
        return ( eta * I - (eta * np.dot(N,I) + np.sqrt(k)) * N ), flux


def march_refractions(pos, flux, dir):
    surface_records = []

    prev_pos = None
    prev_dist = None

    dist = sdfv_dist(pos)
    for i in range(64):
        prev_pos = pos
        prev_dist = dist
        pos = pos + ( np.max([sdfv_voxel_size, np.abs(dist)]) * dir)
        dist = sdfv_dist(pos)

        if np.sign(prev_dist) != np.sign(dist):
            pos = find_surface_crossing(prev_pos, prev_dist, pos, dist)
            dir, flux = refract_reflect(flux, dir, sdfv_normal(pos), np.sign(prev_dist))

            ### RECORD EACH INTERACTION WITH THE SUBJECT ###
            surface_records.append( [_sdfv_pos_sdfv_to_world(pos), _sdfv_dir_sdfv_to_world(dir)] )
            ### RECORD EACH INTERACTION WITH THE SUBJECT ###

            pos = pos + (sdfv_voxel_size * dir)

        if OUTSIDE(0.0, 1.0, pos[0]) or OUTSIDE(0.0, 1.0, pos[1]) or OUTSIDE(0.0, 1.0, pos[2]):
            return surface_records, pos, flux, dir

    return surface_records, pos, flux, dir


def _sdfv_pos_world_to_sdfv(pos):
    pos_sdfv = (sdfv_mat @ np.array( [  [pos[0]],
                                        [pos[1]],
                                        [pos[2]],
                                        [1.0],          ] ))[:3,:].transpose().reshape(-1)
    pos_sdfv = pos_sdfv[0:3]
    return pos_sdfv


def _sdfv_dir_world_to_sdfv(dir):
    dir_sdfv = (sdfv_mat[0:3,0:3] @ np.array( [ [dir[0]],
                                                [dir[1]],
                                                [dir[2]], ] )).transpose().reshape(-1)
    dir_sdfv = normalize(dir_sdfv)
    return dir_sdfv

def _sdfv_pos_sdfv_to_world(pos):
    sdfv_to_world = np.linalg.inv(sdfv_mat)
    world_pos = (sdfv_to_world @ np.array( [ [pos[0]],
                                             [pos[1]],
                                             [pos[2]],
                                             [1.0],      ] ))[:3,:].transpose().reshape(-1)
    world_pos = world_pos[0:3]
    return world_pos


def _sdfv_dir_sdfv_to_world(dir):
    sdfv_to_world = np.linalg.inv(sdfv_mat)
    world_dir = (sdfv_to_world[0:3,0:3] @ np.array( [[dir[0]],
                                                     [dir[1]],
                                                     [dir[2]] ] )).transpose().reshape(-1)
    world_dir = normalize(world_dir)
    return world_dir


def sdfv_trace(pos, dir):

    record = []
    # record.append( [pos, dir] )

    # Find pos, direction, flux
    pos_sdfv = _sdfv_pos_world_to_sdfv(pos)
    dir_sdfv = _sdfv_dir_world_to_sdfv(dir)

    pos_sdfv = retract_pos_to_sdfv_bbox(pos_sdfv, dir_sdfv)
    flux = 1.0
    record.append( [_sdfv_pos_sdfv_to_world(pos_sdfv), _sdfv_dir_sdfv_to_world(dir_sdfv)] )


    # March through
    sub_records, pos_p_sdfv, flux_p, dir_p_sdfv, = march_refractions(pos_sdfv, flux, dir_sdfv)
    record = record + sub_records

    world_pos = _sdfv_pos_sdfv_to_world(pos_p_sdfv)
    world_dir = _sdfv_dir_sdfv_to_world(dir_p_sdfv)

    return record
    



def print_record(record, banner):
    print('================' + banner + '================')
    for i in range(len(record)):
        pos = record[i][0]
        dir = record[i][1]
        print('\t#' + str(i) + '\tHIT: ' + str(pos) + ', DIR: ' + str(dir))
    print('\n')


def compute_ray_dir(fov, res, pixel):
    half_res = res / 2    
    len_x = 1.0 * np.sin( fov * np.pi / 180.0 ) / half_res 
    len_y = 1.0 * np.sin( fov * np.pi / 180.0 ) / half_res

    mid_pt = np.array( [half_res, half_res] )
    pixel_p = pixel - mid_pt

    prop_x = pixel_p[0] * len_x
    prop_y = pixel_p[1] * len_y

    rv = np.array([prop_x, prop_y, 1.0])
    rv = normalize(rv)
    return rv


# CAIRO GLOBALS
WIDTH = 1024
HEIGHT = 1024
PIXEL_SCALE = 1
CTR_X = WIDTH  / 2
CTR_Y = HEIGHT / 2 
MY_SCALE = 200
LINE_WIDTH = 4
NORMAL_SCALE = 0.25
NORMAL_LINE_AUG = 1.5
DOT_POINT_COEF = 0.05

def draw_path(ctx, record, color_path, color_dir):
    no_record = len(record)
    for i in range(no_record):
        pos = record[i][0]
        dir = record[i][1]

        # DRAW Ball for point start position
        ctx.arc(CTR_X + (MY_SCALE*pos[0]), CTR_Y - (MY_SCALE*pos[2]), DOT_POINT_COEF * MY_SCALE, 0.0, 2.0*np.pi)
        ctx.set_source_rgb(0.0, 0.0, 0.6)
        ctx.fill()

        # DRAW SEGMENT
        if i < no_record-1:
            ctx.move_to(CTR_X + (MY_SCALE*pos[0]), CTR_Y - (MY_SCALE*pos[2]))
            next_pos = record[i+1][0]
            ctx.line_to(CTR_X + (MY_SCALE*next_pos[0]), CTR_Y - (MY_SCALE*next_pos[2]))
            ctx.set_source_rgb(color_path[0], color_path[1], color_path[2])
            ctx.set_line_width(LINE_WIDTH)
            ctx.stroke()
        
        # DRAW DIRECTION ON TOP
        ctx.move_to(CTR_X + (MY_SCALE*pos[0]), CTR_Y - (MY_SCALE*pos[2]))
        tip = pos + NORMAL_SCALE*dir
        ctx.line_to(CTR_X + (MY_SCALE*tip[0]), CTR_Y - (MY_SCALE*tip[2]))
        ctx.set_source_rgb(color_dir[0], color_dir[1], color_dir[2])
        ctx.set_line_width(NORMAL_LINE_AUG*LINE_WIDTH)
        ctx.stroke()


def render_record(path, record):

    surface = cairo.ImageSurface(cairo.FORMAT_RGB24,
                                 WIDTH*PIXEL_SCALE,
                                 HEIGHT*PIXEL_SCALE)
    ctx = cairo.Context(surface)
    ctx.scale(PIXEL_SCALE, PIXEL_SCALE)

    # BACKGROUND FILL
    ctx.rectangle(0, 0, WIDTH, HEIGHT)
    ctx.set_source_rgb(0.9, 1.0, 0.9)
    ctx.fill()

    # WALL POS
    ctx.move_to(0,      CTR_Y - (MY_SCALE*wall_pos_z))
    ctx.line_to(WIDTH,  CTR_Y - (MY_SCALE*wall_pos_z))
    ctx.set_source_rgb(1.0, 0.0, 0.0)
    ctx.set_line_width(LINE_WIDTH)
    ctx.stroke()


    # SPHERE RENDERING
    ctx.arc(CTR_X + (MY_SCALE*sphere_center[0]), CTR_Y - (MY_SCALE*sphere_center[2]), MY_SCALE*sphere_radius, 0, 2.0*np.pi)
    ctx.set_source_rgb(1.0, 0.0, 0.0)
    ctx.set_line_width(LINE_WIDTH)
    ctx.stroke()


    # TRACING SOURCE
    ctx.arc(CTR_X + (MY_SCALE * cam_pos[0]), CTR_Y - (MY_SCALE * cam_pos[2]), DOT_POINT_COEF * MY_SCALE, 0.0, 2.0*np.pi)
    ctx.set_source_rgb(1.0, 0.0, 0.0)
    ctx.fill()

    draw_path(ctx, record, [0.0,0.0,0.0], [0.4,1.0,0.4])

    surface.write_to_png(path)
    # img = np.asarray(Image.open(path))
    # plt.axis('off')
    # plt.imshow(img)
    # print('DONE DRAWING')





# 0. Input values
screen_res = 1024
pixel_pos = np.array( [424, 512] )
fov = 90.0


cam_dir = compute_ray_dir(fov, screen_res, pixel_pos)


# 1. ANALYTICAL TEST
record_analytical = analytical_trace(cam_pos, cam_dir)
print_record(record_analytical, 'ANALYTICAL')
render_record('analytical_392_512.png', record_analytical)

# 2. SDFV TEST
frag_intersect_pos = intersect_sphere(cam_pos, cam_dir, sphere_center, sphere_radius)

record_sdfv = sdfv_trace(frag_intersect_pos, cam_dir)
print_record(record_sdfv, 'SDFV')
render_record('sdfv_392_512.png', record_sdfv)


I = normalize(np.array([-0.1, 0.0, 1.0]))
N = normalize(np.array([-1.0, 0.0, -1.0]))
S = reflect(I, N)
print(S)
