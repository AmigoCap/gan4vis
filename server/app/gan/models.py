import torch.nn as nn
import torch.nn.functional as F
import torch




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
