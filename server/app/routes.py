from flask import render_template, flash, redirect, url_for, request
from app import app, db
from app.models import User, Task
from binascii import a2b_base64, b2a_base64
import re
import os, sys, inspect
from PIL import Image, ImageFilter
from io import StringIO, BytesIO

# Use this if you want to include modules from a subfolder
cmd_subfolder = os.path.realpath(os.path.abspath(os.path.join(os.path.split(inspect.getfile( inspect.currentframe() ))[0],"gan")))
if cmd_subfolder not in sys.path:
    sys.path.insert(0, cmd_subfolder)

from neural_style import *

# Redirect to the "index" page when going to route
@app.route('/')
def root_page():
    return redirect(url_for('index'))


# Defining the homepage view
@app.route('/index', methods=['GET', 'POST'])
def index():
    return render_template('index.html', title='Home')


@app.route('/treatment', methods=['GET','POST'])
def treatment():
    ### Get the AJAX request and create the variable storing the data and the one storing the binary
    dictionary_request = request.get_json()

    ### Save the model to apply
    model = dictionary_request['model']

    ### A2B : Transform the image into binaries
    binary_data = a2b_base64(dictionary_request['image'].split('base64,')[1])

    ### Transform binary data to PIL format (Step could be avoided if we find something like "Image.froma")
    dataBytesIO = BytesIO(binary_data)
    png = Image.open(dataBytesIO)
    print("png",png)

    ### Work on background and remove the Alpha Channel
    #background = Image.open('./app/static/style-images/'+re.sub('_','-',re.sub('.pth','.jpg',model)))
    #background = Image.open('./app/static/style-images/'+'us_flag.jpg')

    #background = background.resize((450,300),Image.ANTIALIAS)
    #background = background.filter(ImageFilter.GaussianBlur(radius=100))# Flou

    # background = background.filter(ImageFilter.FIND_EDGES)
    # background = background.filter(ImageFilter.GaussianBlur(radius=7))
    background = Image.new("RGB", png.size, (255, 255, 255)) # Add a white background to the image

    background.paste(png, mask=png.split()[3]) # 3 is the alpha channel

    ### Run the style transfer using the GAN chosen in model
    image_after_gan = stylize({"content_image":background,"content_scale":None,"model":model,"cuda":0,"export_onnx":None})

    ### B2A : Transform image from PIL to bytes and then to image for the interface
    imgByteArr = BytesIO()
    image_after_gan.save(imgByteArr, format='JPEG')
    output_image = imgByteArr.getvalue()
    output_image = b2a_base64(output_image)

    # Return the content of the output to the client with AJAX
    return(output_image)

@app.route('/about')
def about():
    return None
