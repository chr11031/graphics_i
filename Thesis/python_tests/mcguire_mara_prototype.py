import numpy as np
import matplotlib.pyplot as plt
from PIL import Image


def texel_fetch(img, uv, unused):
    return img[img.shape[0], uv[1], uv[0]]


def reconstruct_cs_z(z_val, proj_z_scale, proj_z_trans):
    z_ndc = (2.0 * z_val) - 1.0

    z_cs = proj_z_trans / (z_ndc - proj_z_scale)

    return z_cs


def distance_squared(A, B):
    A_P = A - B
    return np.dot(A_P, A_P)

def swizzle_xy(v):
    tmp_x = v[0]
    tmp_y = v[1]
    return np.array([ tmp_y, tmp_x ])


def Mcguire_Mara_Screen_Space_Ray(cs_origin,
                                  cs_direction,
                                  projection_to_pixel_matrix,
                                  cs_z_buffer,
                                  cs_z_thickness,
                                  proj_z_scale, proj_z_trans,
                                  near_plane_z,
                                  stride,
                                  jitter_fraction,
                                  max_steps,
                                  max_ray_trace_distance):

    # Initialize to off screen 
    hit_pixel = np.array([-1.0, -1.0])
    which = 0 # Only one layer

    # Clip ray to a near plane in 3D (doesn't have to be *the* near plane, although that would be a good idea)
    ray_length = None
    if (cs_origin[2] + cs_direction[2] * max_ray_trace_distance) < near_plane_z:
        ray_length = (cs_origin[2] - near_plane_z[2]) / cs_direction[2]
    else:
        ray_length = max_ray_trace_distance
    cs_end_point = cs_direction * ray_length + cs_origin


    # Project into screen space
    H0 = (projection_to_pixel_matrix @ np.array([ [cs_origin[0]   ], [cs_origin[1]   ], [cs_origin[2]   ], [1.0] ]) ).reshape(-1)
    H1 = (projection_to_pixel_matrix @ np.array([ [cs_end_point[0]], [cs_end_point[1]], [cs_end_point[2]], [1.0] ]) ).reshape(-1)


    # There are a lot of divisions by w that can be turned into multiplications
    # at some minor precision loss... and we need to interpolate these 1/w values
    # anyway.
    # 
    # Because the caller was required to clip to the near plane,
    # this homogeneous division (projecting from 4D to 2D) is guaranteed
    # to succeed.
    k0 = 1.0 / H0[3]
    k1 = 1.0 / H1[3]

    # Switch the original points to values that interpolate linearly in 2D
    Q0 = cs_origin    * k0 
    Q1 = cs_end_point * k1

    # Screen-space endpoints
    P0 = np.array( [k0*H0[0], k0*H0[1]] )
    P1 = np.array( [k1*H1[0], k1*H1[1]] )

    # ??? OPTIONAL CLIPPING TO FRUSTUM SIDES HERE ??? #

    # If the line is degenerate, make it cover at least one pixel
    # to avoid handling zero-pixel extent as a special case later
    if (distance_squared(P0, P1) < 0.0001):
        P1 += 0.01
    
    delta = P1 - P0

    # Permute so that the primary iteration is in x to reduce 
    # large branches later 
    permute = False 
    if np.abs(delta[0]) < np.abs(delta[1]):
        # More-vertical line. Create a permutation that swaps x and y in the output
        permute = True

        # Directly swizzle the inputs
        delta = swizzle_xy( delta )
        P1    = swizzle_xy( P1    )
        P0    = swizzle_xy( P0    )


    # From now on, "x" is the primary iteration direction and "y" is the secondary one

    step_direction = np.sign(delta[0])
    inv_dx = step_direction / delta[0]
    dP = np.array([ step_direction, inv_dx * delta[1] ])

    # Track the derivatives of Q and k 
    dQ = (Q1 - Q0) * inv_dx
    dk = (k1 - k0) * inv_dx

    # Scale derivatives by the desired pixel stride
    dP *= stride
    dQ *= stride 
    dk *= stride 

    # Offset the statting values by the jitter fraction
    P0 += dP * jitter_fraction
    Q0 += dQ * jitter_fraction
    k0 += dk * jitter_fraction

    # Slide P from P0 to P1, (now-homogeneous) Q from Q0 to Q1, and k from k0 to k1
    Q = np.copy( Q0 )
    k = np.copy( k0 ) 

    # We track the ray depth at +/- 1/2 pixel to treate pixels as clip-space solid
    # voxels. Because the depth at -1/2 for a given pixel will be the same as at 
    # +1/2 for the previous iteration, we actually only have to compute one value
    # per iteration.
    prev_z_max_estimate = cs_origin[2]
    step_count = 0
    ray_z_max = prev_z_max_estimate
    ray_z_min = prev_z_max_estimate
    scene_z_max = ray_z_max + 10000 # 1e4

    # P1.x is never modified after this point, so pre-scale it by
    # the step direction for a signed comparison
    end = P1[0] * step_direction

    # We only advance the z field of Q in the inner loop, since 
    # Q.xy is never used until after the loop terminates
    P = np.copy(P0)
    while (True):
        # FOR LOOP BEGIN
        cond_a = P[0] * step_direction <= end                                               # Traversal not at screen space end
        cond_b = step_count < max_steps                                                     # Max steps not reached
        cond_c = (ray_z_max < (scene_z_max - cs_z_thickness) or (ray_z_min < scene_z_max))  # Line is not at a Z-buffer intersection
        cond_d = scene_z_max != 0.0                                                         # We are off the edge of the screen!
        if cond_a == False or cond_b == False or cond_c == False or cond_d == False:
            break
        # FOR LOOP BEGIN 


        if permute == True:
            hit_pixel = swizzle_xy(P)
        else:
            hit_pixel = np.copy(P)

        # The depth range that the ray covers within this loop
        # iteration. Assume that the ray is moving in increasing z 
        # and swap if backwards. Because one end of the interval is
        # shared beteween adjacent iterations, we track the previous
        # value and then swap as needed to ensure correct orderiong
        ray_z_min = prev_z_max_estimate

        # Compute the value at 1/2 pixel into the future 
        ray_z_max = (dQ[2] * 0.5 + Q[2]) / (dk * 0.5 + k)
        prev_z_max_estimate = ray_z_max
        if ray_z_min > ray_z_max:
            tmp = ray_z_min 
            ray_z_min = ray_z_max
            ray_z_max = tmp

        # Camera-space z of the background 
        scene_z_max = texel_fetch(cs_z_buffer, hit_pixel, 0)[0]
        scene_z_max = reconstruct_cs_z(scene_z_max, proj_z_scale, proj_z_trans)

        # FOR LOOP END
        P += dP 
        Q[2] += dQ[2]
        k += dk 
        step_count += 1.0
        # FOR LOOP END

    # pixel on ray 

    Q[0] += dQ[0] * step_count
    Q[1] += dQ[1] * step_count
    cs_hit_point = Q * (1.0 / k)

    # Matches the new loop condition
    return (ray_z_max >= (scene_z_max - cs_z_thickness)) and (ray_z_min <= scene_z_max), hit_pixel, which, cs_hit_point






ws_origin = np.array([0.0, 0.0, 0.0])
ws_direction = np.array([0.0, 0.0, 1.0])

view_matrix = np.array([
                            [0.8348478674888611, -4.0190255568006705e-9, -0.5504807829856873, 3.1702800384891816e-8],
                            [0.24304048717021942, 0.8972583413124084, 0.36859020590782166, 7.291332337899803e-8],
                            [0.4939234256744385, -0.4415058493614197, 0.7490742206573486, 4.7519989013671875],
                            [0.0, 0.0, 0.0, 1.0]
                        ])
cs_origin = ( view_matrix @ np.array([  [ws_origin[0]], 
                                        [ws_origin[1]],
                                        [ws_origin[2]],
                                        [1.0]
                                    ]) ).reshape(-1)
cs_direction = ( view_matrix @ np.array([   [ws_direction[0]], 
                                            [ws_direction[1]],
                                            [ws_direction[2]],
                                            [0.0]
                                        ]) ).reshape(-1)


cs_z_buffer = np.asarray( Image.open('depth_cube.png') )
res_x = cs_z_buffer.shape[1]
res_y = cs_z_buffer.shape[0]
projection_matrix = np.array([
                                [1, 0, 0, 0],
                                [0, 1, 0, 0],
                                [0, 0, 1.0020020008087158, -0.20020020008087158],
                                [0, 0, 1, 0]                                
                            ])
pixel_matrix = np.array(    [
                                [0.5*res_x,     0.0,        0.0,    0.5*res_x   ],
                                [0.0,           0.5*res_y,  0.0,    0.5*res_y   ],
                                [0.0,           0.0,        0.5,    0.5         ],
                                [0.0,           0.0,        0.0,    1.0         ]
                            ])

projection_to_pixel_matrix = pixel_matrix @ projection_matrix

### DEBUG ### 
# plt.imshow(cs_z_buffer)
### DEBUG ### 

cs_z_thickness = 0.01
proj_z_scale = projection_matrix[2,2]
proj_z_trans = projection_matrix[2,3]
near_plane_z = 0.1
stride = 1.0
jitter_fraction = 0.0
max_steps = 100
max_ray_trace_distance = 99.0



status, hit_pixel, which, cs_hit_point = Mcguire_Mara_Screen_Space_Ray(cs_origin,
                                                                       cs_direction,
                                                                       projection_to_pixel_matrix,
                                                                       cs_z_buffer,
                                                                       cs_z_thickness,
                                                                       proj_z_scale, proj_z_trans,
                                                                       near_plane_z,
                                                                       stride,
                                                                       jitter_fraction,
                                                                       max_steps,
                                                                       max_ray_trace_distance)




# INDICES ARE AS FOLLOWS:
# PX = 0
# PY = 1
# PZ = 2
# NX = 3
# NY = 4
# NZ = 5
def cubemap_index(rel_pos):
    abs_rel = np.abs(rel_pos)
    x_gt_y = abs_rel[0] > abs_rel[1]
    x_gt_z = abs_rel[0] > abs_rel[2]
    y_gt_z = abs_rel[1] > abs_rel[2]

    if x_gt_y and x_gt_z:
        if rel_pos[0] > 0:
            return 0
        else:
            return 3
    if not x_gt_y and y_gt_z:
        if rel_pos[1] > 0:
            return 1
        else:
            return 4
    else:
        if rel_pos[2] > 0:
            return 2
        else:
            return 5

def cubemap_pos_dir_from_ws(pos, dir):
    abs_pos = np.abs(pos)
    x_gt_y = abs_pos[0] > abs_pos[1]
    x_gt_z = abs_pos[0] > abs_pos[2]
    y_gt_z = abs_pos[1] > abs_pos[2]

    if x_gt_y and x_gt_z:
        if abs_pos[0] > 0:
            return np.array([-pos[2], pos[1], pos[0]]), np.array([-dir[2], dir[1], dir[0]])
        else:
            return np.array([ pos[2], pos[1],-pos[0]]), np.array([ dir[2], dir[1],-dir[0]])
    if not x_gt_y and y_gt_z:
        if abs_pos[1] > 0:
            return np.array([ pos[0],-pos[2], pos[1]]), np.array([ dir[0],-dir[2], dir[1]])
        else:
            return np.array([ pos[0], pos[2],-pos[1]]), np.array([ dir[0], dir[2],-dir[1]])
    else:
        if abs_pos[2] > 0:
            return np.array([ pos[0], pos[1], pos[2]]), np.array([ dir[0], dir[1], dir[2]])
        else:
            return np.array([-pos[0], pos[1],-pos[2]]), np.array([-dir[0], dir[1], dir[2]])



def find_intersections(pos, dir):
    pass


# Intersections possible are:
#   F_PX,  F_PY,  F_PZ,  F_NX,  F_NY,  F_NZ
#   N_PX,  N_PY,  N_PZ,  N_NX,  N_NY,  N_NZ
#   PZ_PX, PX_NZ, NX_NZ, NX_PZ, 
#   PZ_PY, PX_PY, NZ_PY, NX_PY,
#   PZ_NY, PX_NY, NZ_NY, NX_NY,
#   24 TESTS IN TOTAL




def MMSSRT(ws_pos, ws_dir, z_buf, cs_origin, near, far, max_steps):

    pix_0 = None 
    pix_1 = None 
    pix_step = None 
    cs_z_0_recip = None
    cs_z_1_recip = None
    cs_z_recip_step = None 
    ws_pos_recip = None
    ws_pos_recip_step = None


    cs_pos = ws_pos - cs_origin
    cur_quadrant = cubemap_index(cs_pos)

    no_steps = 0
    while no_steps < max_steps:

        



        no_steps += 1























