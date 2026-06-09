import numpy as np

def dot(A, B):
    return A[0]*B[0] + A[1]*B[1] + A[2]*B[2]

def normalize(V):
    len = np.sqrt(V[0]*V[0] + V[1]*V[1] + V[2]*V[2])
    return [V[0]/len, V[1]/len, V[2]/len]



def find_intersect_box(pos, dir):
    
    near_pos = pos
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
    
    bound_pos = [   pos[0] + near_coef*dir[0], 
                    pos[1] + near_coef*dir[1], 
                    pos[2] + near_coef*dir[2], ]

    return bound_pos


def walk(pos, flux, dir):

    

    


sdfv_pos = [0.4, 0.7, 0.1]
sdfv_dir = normalize( [0.1, 0.1, 1.0] )

i_pos = find_intersect_box(sdfv_pos, sdfv_dir)
print(i_pos)



