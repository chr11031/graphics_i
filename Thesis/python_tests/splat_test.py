import numpy as np
import matplotlib.pyplot as plt

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


def report_end(light_pos, sample_dir):

    # The light pos
    pos = light_pos   

    # The light dir
    dir = normalize( sample_dir )  

    # Static scene constants
    plane_y = -1.0
    sphere_center = np.array([0.0, -0.4, 0.0 ])
    sphere_radius = 0.5

    pos = intersect_sphere(pos, dir, sphere_center, sphere_radius)
    if (pos is None):
        return None
    outside_norm = normalize( pos - sphere_center )
    dir = refract(dir, outside_norm, 1.0 / 1.52)
    pos += 0.001 * dir

    pos = intersect_sphere(pos, dir, sphere_center, sphere_radius)
    inside_norm = -normalize( pos - sphere_center )
    dir = refract(dir, inside_norm, 1.52 / 1.0)
    if (dir[0] == 0.0 and dir[1] == 0.0 and dir[2] == 0.0):
        return None
    pos += 0.001 * dir 

    rv = intersect_plane(pos, dir, plane_y)
    return rv 


def test_grid():
    
    light_pos = np.array([0.0, 0.75, 0.0])

    out_x = []
    out_z = []

    steps = 256
    bound = 0.5
    x_lin = np.linspace(-bound, bound, num=steps)
    z_lin = np.linspace(-bound, bound, num=steps)

    for z in z_lin:
        for x in x_lin:
            cos_x = np.cos( (270.0 + x * 90.0) * np.pi / 180.0)
            cos_z = np.cos( (270.0 + z * 90.0) * np.pi / 180.0)
            sample_dir = np.array([cos_x, -1.0, cos_z])
            end_pos = report_end(light_pos, sample_dir)
            if end_pos is not None:
                out_x.append(end_pos[0])
                out_z.append(end_pos[2])


    plt.xlim(-1, 1)
    plt.ylim(-1, 1)
    plt.plot(out_x, out_z, 'o', markersize=0.1)
    plt.show()


test_grid()
print('DONE!')


