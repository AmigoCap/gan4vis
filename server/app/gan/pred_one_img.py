from .models import *
from .datasets import *
import torch
from torchvision.utils import save_image
from PIL import Image
import numpy
from torch.autograd import Variable
import os
from io import BytesIO
import base64
import uuid 

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


def building_model():

    opt = optlel()
    weights_path = os.path.join(current_path, 'saved_models/%s/generator_%d.pth' % (opt.dataset_name, opt.epoch))

    generator = GeneratorUNet()
    generator.load_state_dict(torch.load(weights_path, map_location="cpu"))

    return generator


def image_preparation(img_obj):

    img = Image.composite(img_obj, Image.new('RGB', img_obj.size, 'white'), img_obj)
    img = Image.fromarray(np.array(img), 'RGB')

    img = TF.resize(img, (256, 256), interpolation=Image.BICUBIC)
    img = TF.to_tensor(img)
    img = TF.normalize(img, (0.5, 0.5, 0.5), (0.5, 0.5, 0.5))

    real_A = Variable(img.type(Tensor))
    real_A = real_A.unsqueeze(0)

    return real_A


def predict_from_file(base_dir, input_path, output_path):

    # Loading the model and its weights
    generator = building_model()

    # Opening the image file
    img = Image.open(os.path.join(base_dir, input_path))

    # Giving the proper background to the input images
    # (some issues with a transparent background)
    real_A = image_preparation(img)
    
    save(generator(real_A), os.path.join(base_dir, output_path))

    return 0

def predict_temp(base64_img):

    opt = optlel()

    # Loading the model and its weights
    generator = building_model()

    # Converting the base_64 string to a binary object
    image_bytes = BytesIO(base64.b64decode(base64_img))
    img = Image.open(image_bytes)

    # Giving the proper background to the input images
    # (some issues with a transparent background)
    real_A = image_preparation(img)
    
    result = generator(real_A)

    pred_array = result.detach().numpy()[0]
    pred_array = np.swapaxes(pred_array, 0, -1)
    pred_array_int = (pred_array / pred_array.max() * 255).astype(np.uint8)

    out_img = Image.fromarray(pred_array_int)

    dir_here = os.path.dirname(__file__)
    token = str(uuid.uuid4())
    out_img.save(os.path.join(dir_here, token+'.jpg'))

    with open(os.path.join(dir_here, token+'.jpg'), "rb") as image_file:
        b64_out_img = base64.b64encode(image_file.read())
    
    os.remove(os.path.join(dir_here, token+'.jpg'))

    return 'data:image/png;base64,' + b64_out_img.decode('ascii')