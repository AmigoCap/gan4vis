from models import *
from datasets import *
from bezier import *
from torch.autograd import Variable
import torch
from torchvision.utils import save_image
from PIL import Image
import numpy

def save(image,img_path):
    save_image(image, img_path, nrow=1, normalize=False)




class optlel():
    def __init__(self):
        self.epoch=750 # help='epoch to start training from')
        #self.n_epochs=1000 # help='number of epochs of training')
        self.dataset_name="pie2barTrans" # help='name of the dataset')
        """
        self.batch_size=5 # help='size of the batches')
        self.lr=0.00005 # help='adam: learning rate')
        self.b1=0.5 # help='adam: decay of first order momentum of gradient')
        self.b2=0.999 # help='adam: decay of first order momentum of gradient')
        self.decay_epoch=100 # help='epoch from which to start lr decay')
        self.n_cpu=8 # help='number of cpu threads to use during batch generation')
        """
        self.img_height=256 # help='size of image height')
        self.img_width=256 # help='size of image width')
        self.channels=1 # help='number of image channels')
        """
        self.sample_interval=20 # help='interval between sampling of images from generators')
        self.checkpoint_interval=5 # help='interval between model checkpoints')
        """
def path_to_variable(img_path):
    cuda = True if torch.cuda.is_available() else False
    cuda = False
    Tensor = torch.cuda.FloatTensor if cuda else torch.FloatTensor
    img = Image.open(img_path)
    img = Image.fromarray(np.array(img)[:, :, :], 'RGB')
    img = TF.resize(img, (256, 256), interpolation=Image.BICUBIC)
    img = TF.to_tensor(img)
    img = TF.normalize(img, (0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    real_A = Variable(img.type(Tensor))
    real_A = real_A.unsqueeze(0)
    return real_A



def interpol(dict_arg):
    begin_path = dict_arg['begin_path']
    end_path = dict_arg['end_path']
    output_path = dict_arg['output_path']


    opt = optlel()


    cuda = True if torch.cuda.is_available() else False
    cuda = False
    Tensor = torch.cuda.FloatTensor if cuda else torch.FloatTensor
    #generator = GeneratorUNet()
    generator = AutoEncoder()

    generator.load_state_dict(torch.load('saved_models/%s/generator_%d.pth' % (opt.dataset_name, opt.epoch)))



    begin_variable = path_to_variable(begin_path)
    end_variable = path_to_variable(end_path)


    P0 = generator.encode(begin_variable)[0].cpu().detach().numpy()
    P3 = generator.encode(end_variable)[0].cpu().detach().numpy()

    image_inter=()
    shake = 5 #0.1 5 10
    P1noize = P0 + (P3-P0)*1/3 + np.random.randn(2048)*shake
    P2noize = P0 + (P3-P0)*2/3 + np.random.randn(2048)*shake

    points = courbe_bezier_3([P0,P1noize,P2noize,P3],9)

    image_inter = tuple(generator.decode(Variable(torch.from_numpy(point).type(Tensor))) for point in points) #On décode les 10 veteurs latent intermédiare

    img_sample = torch.cat(image_inter) #on concat
    save_image(img_sample, output_path, nrow=10, normalize=False) #on enregistre


if __name__ == '__main__'  :
    dict_arg = dict()
    dict_arg['begin_path'] = 'begin.jpg'
    dict_arg['end_path'] = 'end.jpg'
    dict_arg['output_path'] ='pred_test.jpg'
    interpol(dict_arg) 
