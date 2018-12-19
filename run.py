import argparse
import time

from torch.autograd import Variable

from models import *
from datasets import *
import torchvision.transforms as transforms

import torch


start_time = time.time()


parser = argparse.ArgumentParser()
parser.add_argument('--epoch', type=int, default=0, help='epoch to start training from')
parser.add_argument('--n_epochs', type=int, default=250, help='number of epochs of training')
parser.add_argument('--dataset_name', type=str, default="facades", help='name of the dataset')
parser.add_argument('--batch_size', type=int, default=1, help='size of the batches')
parser.add_argument('--lr', type=float, default=0.00005, help='adam: learning rate')
parser.add_argument('--b1', type=float, default=0.5, help='adam: decay of first order momentum of gradient')
parser.add_argument('--b2', type=float, default=0.999, help='adam: decay of first order momentum of gradient')
parser.add_argument('--decay_epoch', type=int, default=100, help='epoch from which to start lr decay')
parser.add_argument('--n_cpu', type=int, default=8, help='number of cpu threads to use during batch generation')
parser.add_argument('--img_height', type=int, default=256, help='size of image height')
parser.add_argument('--img_width', type=int, default=256, help='size of image width')
parser.add_argument('--channels', type=int, default=3, help='number of image channels')
parser.add_argument('--sample_interval', type=int, default=500, help='interval between sampling of images from generators')
parser.add_argument('--checkpoint_interval', type=int, default=2, help='interval between model checkpoints')
parser.add_argument('--gen', type=str, default='pix2pix/saved_models/facades/generator_0.pth', help='interval between model checkpoints')
parser.add_argument('--dis', type=str, default='pix2pix/saved_models/facades/discriminator_0.pth', help='interval between model checkpoints')
opt = parser.parse_args()

cuda = True if torch.cuda.is_available() else False


generator = GeneratorUNet()
discriminator = Discriminator()

if cuda:
    generator = generator.cuda()
    discriminator = discriminator.cuda()

# Load pretrained models
generator.load_state_dict(torch.load('saved_models/%s/generator_%d.pth' % (opt.dataset_name, opt.epoch)))
discriminator.load_state_dict(torch.load('saved_models/%s/discriminator_%d.pth' % (opt.dataset_name, opt.epoch)))


# Configure dataloaders
transforms_ = [transforms.Resize((opt.img_height, opt.img_width), Image.BICUBIC),
               transforms.ToTensor(),
               transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))]

Tensor = torch.cuda.FloatTensor if cuda else torch.FloatTensor

transform = transforms.Compose(transforms_)

img = Image.open('/home/theo/Documents/Gan/pix2pix/temmm.jpg')
print(transform(img).shape)
real_A = Variable(transform(img).reshape([1,3,256,256]).type(Tensor))

fake_B = generator(real_A)
fake_B = fake_B.cpu().data.numpy().reshape([256,256,3])
print(fake_B.shape)
temp = Image.fromarray(fake_B,'RGB')

temp.save('la.jpg')

end = time.time()

print(end-start_time)