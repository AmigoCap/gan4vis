from flask import render_template, flash, redirect, url_for, request
from app import app, db
from app.models import User, Task
from binascii import a2b_base64, b2a_base64
import re
import os, sys, inspect
import uuid
from PIL import Image, ImageFilter

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
    # Get the AJAX request and create the variable storing the data and the one storing the binary
    dictionary_request = request.get_json()
    # A2B : Transform the image into binaries
    binary_data = a2b_base64(dictionary_request['image'].split('base64,')[1])
    # Save the model to apply
    model = dictionary_request['model']

    # Save the image in png format using a random token
    token = str(uuid.uuid4())
    fd = open('./app/static/content-images/'+token+'.png', 'wb')
    fd.write(binary_data)
    fd.close()

    # Load the image to remove the Alpha Channel
    png = Image.open('./app/static/content-images/'+token+'.png')
    png.load() # required for png.split()

    #background = Image.open('./app/static/style-images/'+re.sub('_','-',re.sub('.pth','.jpg',model)))
    #background = Image.open('./app/static/style-images/'+'us_flag.jpg')

    #background = background.resize((450,300),Image.ANTIALIAS)
    #background = background.filter(ImageFilter.GaussianBlur(radius=100))# Flou

    # background = background.filter(ImageFilter.FIND_EDGES)
    # background = background.filter(ImageFilter.GaussianBlur(radius=7))

    background = Image.new("RGB", png.size, (0, 0, 255)) # Add a white background to the image

    background.paste(png, mask=png.split()[3]) # 3 is the alpha channel
    background.save('./app/static/content-images/'+token+'.jpg', 'JPEG', quality=90) # Save the image in the "static/content-images" directory

    # Run the style transfer using the GAN chosen in model
    main(content_image='./app/static/content-images/'+token+'.jpg',content_scale=None,output_image='./app/static/output-images/'+token+'.jpg',model="./app/gan/saved_models/"+model,cuda=0)

    # B2A : Open image and transform binaries to image
    # We need this step in order to delete the output image from the server, and send the content on the client's side
    with open('./app/static/output-images/'+token+'.jpg', "rb") as image_file:
        output_image = b2a_base64(image_file.read())

    # Remove the input and ouput images
    os.remove('./app/static/content-images/'+token+'.png')
    os.remove('./app/static/content-images/'+token+'.jpg')
    os.remove('./app/static/output-images/'+token+'.jpg')

    # Return the content of the output to the client with AJAX
    return(output_image)

@app.route('/about')
def about():
    return None
