from .models import *
from .datasets import *
import torch
from torchvision.utils import save_image
from PIL import Image
import numpy
from torch.autograd import Variable
import os

Tensor = torch.FloatTensor
current_path = os.path.abspath(os.path.dirname(__file__))

def save(image,img_path):
    save_image(image, img_path, nrow=1, normalize=True)
    
class optlel():
    def __init__(self):
        self.epoch=810 # help='epoch to start training from')
        self.dataset_name="1000line2b" # help='name of the dataset')
        self.img_height=256 # help='size of image height')
        self.img_width=256 # help='size of image width')
        self.channels=1 # help='number of image channels')

def main(base_dir, input_path, output_path):
    opt = optlel()


    cuda = True if torch.cuda.is_available() else False

    generator = GeneratorUNet()

    generator.load_state_dict(torch.load(os.path.join(current_path, 'saved_models/%s/generator_%d.pth' % (opt.dataset_name, opt.epoch)), map_location="cpu"))

    img = Image.open(os.path.join(base_dir, input_path))
    
    img = Image.composite(img, Image.new('RGB', img.size, 'white'), img)
    img_arr = np.array(img)

    img = Image.fromarray(img_arr, 'RGB')

    img = TF.resize(img, (256, 256), interpolation=Image.BICUBIC)


    img = TF.to_tensor(img)

    img = TF.normalize(img, (0.5, 0.5, 0.5), (0.5, 0.5, 0.5))

    real_A = Variable(img.type(Tensor))
    real_A = real_A.unsqueeze(0)

    #save(real_A)
    save(generator(real_A), os.path.join(base_dir, output_path))

    return 0