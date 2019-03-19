import torch.nn as nn
import torch.nn.functional as F
import torch


def weights_init_normal(m):
    classname = m.__class__.__name__
    if classname.find('Conv') != -1:
        torch.nn.init.normal_(m.weight.data, 0.0, 0.02)
    elif classname.find('BatchNorm2d') != -1:
        torch.nn.init.normal_(m.weight.data, 1.0, 0.02)
        torch.nn.init.constant_(m.bias.data, 0.0)


##############################
#           U-NET
##############################

class UNetDown(nn.Module):
    def __init__(self, in_size, out_size, normalize=True, dropout=0.0):
        super(UNetDown, self).__init__()
        layers = [nn.Conv2d(in_size, out_size, 4, 2, 1, bias=False)]
        if normalize:
            layers.append(nn.InstanceNorm2d(out_size))
        layers.append(nn.LeakyReLU(0.2))
        if dropout:
            layers.append(nn.Dropout(dropout))
        self.model = nn.Sequential(*layers)

    def forward(self, x):
        return self.model(x)


class UNetUp(nn.Module):
    def __init__(self, in_size, out_size, dropout=0.0):
        super(UNetUp, self).__init__()
        layers = [nn.ConvTranspose2d(in_size, out_size, 4, 2, 1, bias=False),
                  nn.InstanceNorm2d(out_size),
                  nn.ReLU(inplace=True)]
        if dropout:
            layers.append(nn.Dropout(dropout))

        self.model = nn.Sequential(*layers)

    def forward(self, x, skip_input):
        x = self.model(x)
        x = torch.cat((x, skip_input), 1)

        return x


class GeneratorUNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=3):
        super(GeneratorUNet, self).__init__()

        self.down1 = UNetDown(in_channels, 64, normalize=False)
        self.down2 = UNetDown(64, 128)
        self.down3 = UNetDown(128, 256)
        self.down4 = UNetDown(256, 512)
        self.down5 = UNetDown(512, 512)
        self.down6 = UNetDown(512, 512)
        self.down7 = UNetDown(512, 512)
        self.down8 = UNetDown(512, 512, normalize=False)

        self.up1 = UNetUp(512, 512, dropout=0.5)
        self.up2 = UNetUp(1024, 512, dropout=0.5)
        self.up3 = UNetUp(1024, 512, dropout=0.5)
        self.up4 = UNetUp(1024, 512, dropout=0.5)
        self.up5 = UNetUp(1024, 256)
        self.up6 = UNetUp(512, 128)
        self.up7 = UNetUp(256, 64)

        self.final = nn.Sequential(
            nn.Upsample(scale_factor=2),
            nn.ZeroPad2d((1, 0, 1, 0)),
            nn.Conv2d(128, out_channels, 4, padding=1),
            nn.Tanh()
        )

    def forward(self, x):
        # U-Net generator with skip connections from encoder to decoder
        d1 = self.down1(x)
        d2 = self.down2(d1)
        d3 = self.down3(d2)
        d4 = self.down4(d3)
        d5 = self.down5(d4)
        d6 = self.down6(d5)
        d7 = self.down7(d6)
        d8 = self.down8(d7)
        u1 = self.up1(d8, d7)
        u2 = self.up2(u1, d6)
        u3 = self.up3(u2, d5)
        u4 = self.up4(u3, d4)
        u5 = self.up5(u4, d3)
        u6 = self.up6(u5, d2)
        u7 = self.up7(u6, d1)

        return self.final(u7)


##############################
#        Discriminator       #
##############################

class Discriminator(nn.Module):
    def __init__(self, in_channels=3):
        super(Discriminator, self).__init__()

        def discriminator_block(in_filters, out_filters, normalization=True):
            """Returns downsampling layers of each discriminator block"""
            layers = [nn.Conv2d(in_filters, out_filters, 4, stride=2, padding=1)]
            if normalization:
                layers.append(nn.InstanceNorm2d(out_filters))
            layers.append(nn.LeakyReLU(0.2, inplace=True))
            return layers

        self.model = nn.Sequential(
            *discriminator_block(in_channels * 2, 64, normalization=False),
            *discriminator_block(64, 128),
            *discriminator_block(128, 256),
            *discriminator_block(256, 512),
            nn.ZeroPad2d((1, 0, 1, 0)),
            nn.Conv2d(512, 1, 4, padding=1, bias=False)
        )

    def forward(self, img_A, img_B):
        # Concatenate image and condition image by channels to produce input
        img_input = torch.cat((img_A, img_B), 1)
        return self.model(img_input)
		


class AutoEncoder(nn.Module):
    def __init__(self):
        super(AutoEncoder, self).__init__()
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=(5,5),  stride=(1,1))
        self.conv2 = nn.Conv2d(in_channels=16, out_channels=32,  kernel_size=(5,5), stride=(1,1))
        self.conv3 = nn.Conv2d(in_channels=32, out_channels=64,  kernel_size=(5,5), stride=(1,1))
        self.fc1 = nn.Linear(in_features=28*28*64,  out_features=2048)
        self.dfc1 = nn.Linear(in_features=2048, out_features=29*29*64)
        self.dconv3 = nn.ConvTranspose2d(in_channels=64, out_channels=32, kernel_size=(5,5),  stride=(2,2))
        self.dconv2 = nn.ConvTranspose2d(in_channels=32, out_channels=16,  kernel_size=(6,6), stride=(2,2))
        self.dconv1 = nn.ConvTranspose2d(in_channels=16, out_channels=3,  kernel_size=(6,6), stride=(2,2))

    def forward(self,x):
        ######################
        #ENCODER
        ######################
        x = self.conv1(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        x = self.conv2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        x = self.conv3(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        # feed output to fully connected layer #
           ## vectorizing the input matrix
        x = x.view(-1, 28*28*64)
        x = F.relu(self.fc1(x))
        
        ######################
        #DECODER
        ######################
        
        x = F.relu(self.dfc1(x))
        x = x.view(-1, 64,29,29)
        x = self.dconv3(x)
        x = F.relu(x)
        x = self.dconv2(x)
        x = F.relu(x)
        x = self.dconv1(x)
        x = F.relu(x)
        return x
    
    def encode(self,x):
        x = self.conv1(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        x = self.conv2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        x = self.conv3(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        # feed output to fully connected layer #
           ## vectorizing the input matrix
        x = x.view(-1, 28*28*64)
        x = F.relu(self.fc1(x))
        return x
    def decode(self,x):
        x = F.relu(self.dfc1(x))
        x = x.view(-1, 64,29,29)
        x = self.dconv3(x)
        x = F.relu(x)
        x = self.dconv2(x)
        x = F.relu(x)
        x = self.dconv1(x)
        x = F.relu(x)
        return x
    
class AutoEncoder64(nn.Module):
    def __init__(self):
        super(AutoEncoder64, self).__init__()
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=(5,5),  stride=(1,1))
        self.conv2 = nn.Conv2d(in_channels=16, out_channels=32,  kernel_size=(5,5), stride=(1,1))
        self.conv3 = nn.Conv2d(in_channels=32, out_channels=64,  kernel_size=(5,5), stride=(1,1))
        self.fc1 = nn.Linear(in_features=28*28*64,  out_features=64)
        self.dfc1 = nn.Linear(in_features=64, out_features=29*29*64)
        self.dconv3 = nn.ConvTranspose2d(in_channels=64, out_channels=32, kernel_size=(5,5),  stride=(2,2))
        self.dconv2 = nn.ConvTranspose2d(in_channels=32, out_channels=16,  kernel_size=(6,6), stride=(2,2))
        self.dconv1 = nn.ConvTranspose2d(in_channels=16, out_channels=3,  kernel_size=(6,6), stride=(2,2))

    def forward(self,x):
        ######################
        #ENCODER
        ######################
        x = self.conv1(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        x = self.conv2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        x = self.conv3(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        # feed output to fully connected layer #
           ## vectorizing the input matrix
        x = x.view(-1, 28*28*64)
        x = F.relu(self.fc1(x))
        
        ######################
        #DECODER
        ######################
        
        x = F.relu(self.dfc1(x))
        x = x.view(-1, 64,29,29)
        x = self.dconv3(x)
        x = F.relu(x)
        x = self.dconv2(x)
        x = F.relu(x)
        x = self.dconv1(x)
        x = F.relu(x)
        return x
    
    def encode(self,x):
        x = self.conv1(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        x = self.conv2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        x = self.conv3(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2, 2)
        # feed output to fully connected layer #
           ## vectorizing the input matrix
        x = x.view(-1, 28*28*64)
        x = F.relu(self.fc1(x))
        return x
    def decode(self,x):
        x = F.relu(self.dfc1(x))
        x = x.view(-1, 64,29,29)
        x = self.dconv3(x)
        x = F.relu(x)
        x = self.dconv2(x)
        x = F.relu(x)
        x = self.dconv1(x)
        x = F.relu(x)
        return x
