import numpy as np
import matplotlib.pyplot as plt

class hit_entry:
    def __init__(self, freq, hits):
        self.freq = freq 
        self.hits = hits


def read_pls(filename):
    f = open(filename, "r")

    lines = f.readlines()

    records = []

    for i in range(1, len(lines)):
        parts = lines[i].split()
        if len(parts) != 2:
            print('Error! bad config file entry: ' + lines[i])
        freq = int(parts[0])
        hits = int(parts[1])
        records.append( hit_entry(freq, hits) )

    return records

def plot(hits, path_name, title):

    hits_p = hits[1:]

    x = []
    y = []
    sz = 8
    plt.rcParams.update({'font.size':24})
    plt.figure(figsize=(sz,sz))

    last_one = 1
    for i in range(2,255):
        hit = hits_p[i]
        if hit.hits != 0:
            last_one = i

    for hit in hits_p:
        x.append(hit.freq)
        y.append(hit.hits)
        if len(x) == last_one:
            break

    plt.clf()
    ticks = np.arange(0, last_one, step=(last_one // 7))
    plt.xticks(ticks, fontsize=18)
    plt.yticks(fontsize=18)
    plt.bar(x, y)
    plt.title(title)
    plt.xlabel('Number of Marching Steps (Max ' + str(last_one) + ')')
    plt.savefig(path_name + '_hist.png')



files = ['sphere255', 'cup255', 'bunny255']
out_name = ['sphere', 'cup', 'bunny']
titles = ['Sphere', 'Cup', 'Stanford Bunny']

for i in range(len(files)):
    file = files[i]
    title = titles[i]
    o_name = out_name[i]
    hits = read_pls(file + '.txt')
    plot(hits, 'out_figs\\' + o_name, title)
