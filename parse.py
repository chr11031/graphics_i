
class vec2:
    def __init__(self, u, v):
        self.u = u
        self.v = v

    def __str__(self):
        return 'U:' + str(self.u) + ', V:' + str(self.v)

class vec3:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def __str__(self):
        return 'X:' + str(self.x) + ', Y:' + str(self.y) + ', Z:' + str(self.z)

class face3:
    def __init__(self, v0, t0, n0, v1, t1, n1, v2, t2, n2):
        self.v0 = v0
        self.t0 = t0
        self.n0 = n0
        self.v1 = v1
        self.t1 = t1
        self.n1 = n1
        self.v2 = v2
        self.t2 = t2
        self.n2 = n2
        
    def __str__(self):
        return 'V0:' + str(self.v0) + ', T0:' + str(self.t0) + ', N0:' + str(self.n0) + ' V1:' + str(self.v1) + ', T1:' + str(self.t1) + ', N1:' + str(self.n1) + ' V2:' + str(self.v2) + ', T2:' + str(self.t2) + ', N2:' + str(self.n2) 
        
verts = []
texs = []
norms = []
faces = []


# MAIN
all_lines = []
with open('utah_teapot.obj') as file_in:
    for line in file_in:
        all_lines.append(line)

for line in all_lines:
    parts = line.split(' ')
    if len(parts) < 1:
        continue

    if parts[0] == 'v':
        if len(parts) < 4:
            raise ('Bad vert: ' + parts)
        verts.append( vec3(float(parts[1]), float(parts[2]), float(parts[3])) )
    if parts[0] == 'vt':
        if len(parts) < 3:
            raise ('Bad tex: ' + parts)
        texs.append( vec2(float(parts[1]), float(parts[2])) )
    if parts[0] == 'vn':
        if len(parts) < 4:
            raise ('Bad norm: ' + parts)
        norms.append( vec3(float(parts[1]), float(parts[2]), float(parts[3])) )
    if parts[0] == 'f':
        if len(parts) < 4:
            raise ('Bad face: ' + parts)
        ps = [0 for i in range(9)]
        idx = 0
        for i in range(3):
            face_data = parts[i+1].split('/')
            if len(face_data) != 3:
                raise ('Bad face data')
            ps[idx+0] = float(face_data[0])
            ps[idx+1] = float(face_data[1])
            ps[idx+2] = float(face_data[2])
            idx += 1;
                                        
        faces.append( face3(ps[0], ps[1], ps[2],
                            ps[3], ps[4], ps[5],
                            ps[6], ps[7], ps[8]) )


print('Num verts: ', len(verts))
print('\t[0]', verts[0])
print('Num texs: ', len(texs))
print('\t[0]', texs[0])
print('Num norms: ', len(norms))
print('\t[0]', norms[0])
print('Num faces: ', len(faces))        
print('\t[0]', faces[0])






