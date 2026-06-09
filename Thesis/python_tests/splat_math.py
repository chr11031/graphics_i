import numpy as np


def get_other_two_vecs(vec):

    vec = vec / np.linalg.norm(vec)

    vec_a = np.array([0.0, 0.0, 0.0]) 
    if vec[0] == 0.0:
        vec_a = np.array([1.0, 0.0, 0.0])
    elif vec[1] == 0.0:
        vec_a = np.array([0.0, 1.0, 0.0])
    elif vec[2] == 0.0:
        vec_a = np.array([0.0, 0.0, 1.0])
    else:
        vec_a = np.array([1, vec[0]/vec[1], -2*vec[0] / vec[2]])
        vec_a = vec_a / np.linalg.norm(vec_a)

    vec_b = np.cross(vec_a, vec)
    vec_c = np.array([-vec[0], -vec[1], -vec[2]])
    return vec_a, vec_b, vec_c

# TEST DATA
tests = [
    np.array([1.0, 1.0,-1.0]),    
    np.array([0.0, 0.0,-1.0]),
    np.array([1.0, 0.0,-1.0]),
]

for test in tests:
    x, y, z = get_other_two_vecs(test)
    print('For test input:\t\t', test)
    print(x)
    print(y)
    print(z)
    print('DOTS:\t\t', np.dot(x,y), np.dot(x,z), np.dot(y,z))
    print('\n\n')


