import numpy as np

def schlick(cos_theta, F0):
    rv = [F0[0], F0[1], F0[2]]
    rv[0] = rv[0] + (1.0-F0[0])*( (1.0-cos_theta)**5.0 )
    rv[1] = rv[1] + (1.0-F0[1])*( (1.0-cos_theta)**5.0 )
    rv[2] = rv[2] + (1.0-F0[2])*( (1.0-cos_theta)**5.0 )
    return rv

def dot(A, B):
    return A[0]*B[0] + A[1]*B[1] + A[2]*B[2]


def refract(I, N, eta):
    dot_n_i = I[0]*N[0]+I[1]*N[1]+I[2]*N[2]
    k = 1.0 - (eta*eta) * (1.0-dot_n_i*dot_n_i)
    if k < 0.0:
            print('NO REFRACTION')
            return [0.0, 0.0, 0.0]
    else:
            R = [0.0, 0.0, 0.0]
            R[0] = eta*I[0] - (eta * dot_n_i + np.sqrt(k))*N[0]
            R[1] = eta*I[1] - (eta * dot_n_i + np.sqrt(k))*N[1]
            R[2] = eta*I[2] - (eta * dot_n_i + np.sqrt(k))*N[2]
            return R

def normalize(V):
    len = np.sqrt(V[0]*V[0] + V[1]*V[1] + V[2]*V[2])
    return [V[0]/len, V[1]/len, V[2]/len]


def reflect(I, N):
    rv = [0.0, 0.0, 0.0]
    dot_I_N = dot(I, N)
    rv[0] = I[0] - 2.0 * dot_I_N * N[0]
    rv[1] = I[1] - 2.0 * dot_I_N * N[1]
    rv[2] = I[2] - 2.0 * dot_I_N * N[2]
    return rv
    

N = normalize([0.0, 1.0, 0.0])
I = normalize([1.0,-1.0, 0.0])


print('====TESTING REFRACTION====')
print('I is:', I)
print('N is:', N)
print('Refract with parameters (I, N, 1.0/1.52) gives', refract(I, N, 1.0/1.52))
print('\n')


print('====TESTING REFLECTION====')
I = normalize([1.0,-1.0, 0.0])
N = normalize([0.0, 1.0, 0.0])
print('I is', I)
print('N is', N)
print('Reflect with parameters (I, N) gives', reflect(I,N))
print('\n')


print('====TESTING SCHLICK====')
F0 = [0.04, 0.04, 0.04]
I = normalize([-1.0, 0.1,0.0])
N = normalize([0.0, 1.0, 0.0])
print('SCHLICK With paramters (I, N, (0.04, 0.04, 0.04)) gives', schlick( dot(I,N), F0 ))


