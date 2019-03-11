import glob
import random
import os
import numpy as np

from torch.utils.data import Dataset
from PIL import Image

import torchvision.transforms.functional as TF


class ImageDataset(Dataset):
    def __init__(self, root, mode='train'):
        # self.transform = transforms.Compose(transforms_)

        self.files = sorted(glob.glob(os.path.join(root, mode) + '/*.*'))
        if mode == 'train':
            self.files.extend(sorted(glob.glob(os.path.join(root, 'test') + '/*.*')))

    def __getitem__(self, index):

        img = Image.open(self.files[index % len(self.files)])
        w, h = img.size
        img_A = img.crop((0, 0, w / 2, h))
        img_B = img.crop((w / 2, 0, w, h))

        if np.random.random() < 0.5:
            img_A = Image.fromarray(np.array(img_A)[:, ::-1, :], 'RGB')
            img_B = Image.fromarray(np.array(img_B)[:, ::-1, :], 'RGB')

        img_A, img_B = self.transform(img_A, img_B)

        return {'A': img_A, 'B': img_B}

    def transform(self, imageA, imageB):

        transx = random.choice(range(0, 130))
        transy = random.choice(range(0, 130))
        sca = random.uniform(0.7, 2)

        imageA = TF.resize(imageA, (256, 256), interpolation=Image.BICUBIC)
        imageB = TF.resize(imageB, (256, 256), interpolation=Image.BICUBIC)

        if random.random() > 0.5:
            imageA = TF.affine(imageA, angle=0, shear=0, translate=[transx, transy], scale=sca, fillcolor=(255, 255, 255))
            imageB = TF.affine(imageB, angle=0, shear=0, translate=[transx, transy], scale=sca, fillcolor=(255, 255, 255))

        if random.random() > 0.3:
            amount = random.uniform(0.004, 0.06)
            out = np.copy(imageB)

            num_pepper = np.ceil(amount * out.size)

            coords = [np.random.randint(0, i - 1, int(num_pepper)) for i in out.shape[:-1]]

            for i in range(int(num_pepper)):
                out[coords[0][i]][coords[1][i]] = [0, 0, 0]

            imageB = Image.fromarray(out)

        imageA = TF.to_tensor(imageA)
        imageB = TF.to_tensor(imageB)

        imageA = TF.normalize(imageA, (0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        imageB = TF.normalize(imageB, (0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        return imageA, imageB

    def __len__(self):
        return len(self.files)
