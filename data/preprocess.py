from PIL import Image
import re
import os
from tqdm import trange



def getfilext(path):
    files = []
    file = [".jpg"]

    for f in os.listdir(path):
        ext = os.path.splitext(f)[1]  # reverse search of '.' and send it. If no '.', send empty String
        if ext.lower() not in file:
            continue
        if 'label' not in f:
            files.append(f)

    return files


def combine(name, nb):
    dior = ['res/test/', 'res/val/', 'res/train/']
    images = map(Image.open, ['output/' + re.sub(r'([A-z]+)', r'\1_label', name)[:-6], 'output/' + name])
    # images = map(Image.open, ['output/' + re.sub(r'([A-z]+)', 'vertical_color', name)[:-15]+'.jpg', 'output/' + name])

    total_width = 1000
    max_height = 500

    new_im = Image.new('RGB', (total_width, max_height))

    x_offset = 0
    for im in images:
        new_im.paste(im, (x_offset, 0))
        x_offset += im.size[0]

    new_im.save(dior[nb] + name)


def main():
    os.makedirs('res', exist_ok=True)
    os.makedirs('res/train', exist_ok=True)
    os.makedirs('res/val', exist_ok=True)
    os.makedirs('res/test', exist_ok=True)
    os.makedirs('output', exist_ok=True)

    imgs = getfilext('output/')
    nb = len(imgs)
    print(nb)
    lim = int(nb * 0.15)

    for i in trange(nb):
        if i < lim:
            combine(imgs[i], 0)
        elif i < lim * 2:
            combine(imgs[i], 1)
        else:
            combine(imgs[i], 2)


if __name__ == '__main__':
    main()
