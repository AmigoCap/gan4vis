from flask import render_template, flash, redirect, url_for, request, send_file
from app import app, db
from app.models import Transfer
from .gan.transition import interpol
from binascii import a2b_base64, b2a_base64
import re
import os, sys, inspect
from PIL import Image, ImageFilter
from io import StringIO, BytesIO
import uuid
import time

from datetime import datetime

import logging

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
    token = request.args.get('token')
    app.logger.info("index token={}".format(token))
    dict_transfer = {"token":"placeholder","model":"mosaic.pth","distribution":"random","datapoints":"","grid":"vertical","orientation":"up","ratio":2} # Start ratio at 2 to be able to activate both zooms on page load
    if token:
        transfer = Transfer.query.filter_by(token=token).first()
        dict_transfer = {"token":transfer.token,"model":transfer.model,"distribution":transfer.distribution,"datapoints":transfer.datapoints,"grid":transfer.grid,"orientation":transfer.orientation,"ratio":transfer.ratio}
    return render_template('index.html', title='GAN4VIS', dict_transfer=dict_transfer)


@app.route('/treatment', methods=['GET','POST'])
def treatment():
    token = str(uuid.uuid4())

    ### 1 - Get the AJAX request and create the variable storing the data and the one storing the binary
    dictionary_request = request.get_json()
    model = dictionary_request["model"] ## Save the model to apply
    distribution = dictionary_request["distribution"]
    datapoints = dictionary_request["datapoints"]
    grid = dictionary_request["grid"]
    orientation = dictionary_request["orientation"]
    ratio = dictionary_request["ratio"]

    ### 2 - Prepare the input image
    app.logger.info("treatment token={} : IMAGE-INPUT START".format(token))
    t_image_input_start = time.time()

    # A2B : Transform the image into binaries
    binary_data = a2b_base64(dictionary_request['image'].split('base64,')[1])

    # Transform binary data to PIL format (Step could be avoided if we find something like "Image.froma")
    dataBytesIO = BytesIO(binary_data)
    png = Image.open(dataBytesIO)

    # Work on background and remove the Alpha Channel
    background = Image.open('./app/static/style-images/'+re.sub('_','-',re.sub('.pth','.jpg',model))) # Use the style image as background
    #background = Image.open('./app/static/style-images/'+"white-noise.jpg") # Use white noise as background
    background = background.resize((450,300),Image.ANTIALIAS) # Resize the background
    #background = background.filter(ImageFilter.FIND_EDGES) # Detect background edges
    background = background.filter(ImageFilter.GaussianBlur(radius=100)) # Blur the background
    # background = Image.new("RGB", png.size, (255, 255, 255)) # Add a white background to the image

    background.paste(png, mask=png.split()[3]) # 3 is the alpha channel

    t_image_input = time.time() - t_image_input_start
    app.logger.info("treatment token={} : IMAGE-INPUT END ({}s)".format(token,t_image_input))

    ### 3 - Run the style transfer using the GAN chosen in model

    app.logger.info("treatment token={} : GAN START".format(token))
    t_gan_start = time.time()

    image_after_gan = stylize({"content_image":background,"content_scale":None,"model":model,"cuda":0,"export_onnx":None})

    t_gan = time.time() - t_gan_start
    app.logger.info("treatment token={} : GAN END ({}s)".format(token,t_gan))

    ### 4 - Prepare the output image, transform image from PIL to bytes and then to image for the interface

    app.logger.info("treatment token={} : IMAGE-OUTPUT START".format(token))
    t_image_output_start = time.time()

    imgByteArr = BytesIO()
    image_after_gan.save("./app/static/output_images/{}.jpg".format(token), format='JPEG')
    image_after_gan.save(imgByteArr, format='JPEG')
    output_image = imgByteArr.getvalue()
    output_image = b2a_base64(output_image)

    t_image_output = t_image_output_start - time.time()
    app.logger.info("treatment token={} : IMAGE-OUTPUT END ({}s)".format(token,t_image_output))

    t = Transfer(token = token, model = model, distribution = distribution, datapoints = datapoints, grid = grid, orientation = orientation, ratio = ratio)
    db.session.add(t)
    db.session.commit()

    # Return the content of the output to the client with AJAX
    return(token)

@app.route('/process')
def process():
    return render_template('process.html', title='GAN4VIS - Process')

@app.route('/dashboard')
def dashboard():
    transfers = []
    for transfer in Transfer.query.all():
        transfers.append({"token":transfer.token,"date":transfer.date,"model":transfer.model,"distribution":transfer.distribution,"datapoints":transfer.datapoints,"grid":transfer.grid,"orientation":transfer.orientation,"ratio":transfer.ratio})
    return render_template('dashboard.html', title='GAN4VIS - Dashboard', transfers=transfers)

@app.route('/preview/<token>.jpg')
def preview(token):
    return send_file("./static/output_images/{}.jpg".format(token), mimetype='image/jpg')


@app.route('/treatment_transitions', methods=['GET','POST'])
def treatment_transitions():
    token = str(uuid.uuid4())
    
    ### 1 - Get the AJAX request and create the variable storing the data and the one storing the binary
    dictionary_request = request.get_json()
    bin_image = dictionary_request["image"]

    ### 2 - Prepare the input image
    app.logger.info("transition_creation token={} : IMAGE-INPUT START".format(token))
    t_image_input_start = time.time()
    
    # A2B : Transform the image into binaries
    binary_data = a2b_base64(dictionary_request['image'].split('base64,')[1])

    # Transform binary data to PIL format (Step could be avoided if we find something like "Image.froma")
    dataBytesIO = BytesIO(binary_data)
    png = Image.open(dataBytesIO)
    
    t_image_input = time.time() - t_image_input_start
    app.logger.info("transition_creation token={} : IMAGE-INPUT END ({}s)".format(token,t_image_input))
    
    ### 3 - Run the style transfer using the GAN chosen in model

    app.logger.info("transition_creation token={} : GENERATION START".format(token))
    t_creation_start = time.time()

    png_wo_alpha = Image.new("RGB", png.size, (255, 255, 255))
    png_wo_alpha.paste(png, mask=png.split()[3])

    transition_dict = {}
    transition_dict['begin_path'] = os.path.join(os.path.dirname(__file__),
                                                 'static', 'utilitaries_images',
                                                 'transition_begin.jpg')
    transition_dict['end_path'] = os.path.join(os.path.dirname(__file__),
                                                 'static', 'utilitaries_images',
                                                 'transition_end.jpg')
    
    transition_dict['user_canvas'] = png_wo_alpha

    transition_result = interpol(transition_dict) # TODO: Call Wills' function

    t_creation = time.time() - t_creation_start
    app.logger.info("transition_creation token={} : GENERATION END ({}s)".format(token,t_creation))

    ### 4 - Prepare the output image, transform image from PIL to bytes and then to image for the interface

    app.logger.info("treatment token={} : IMAGE-OUTPUT START".format(token))
    t_image_output_start = time.time()

    transition_result[0].save("./app/static/output_images/{}.gif".format(token),
                            format='GIF', save_all=True, append_images=transition_result[1:],
                            duration=1, loop=10)

    t_image_output = t_image_output_start - time.time()
    app.logger.info("treatment token={} : IMAGE-OUTPUT END ({}s)".format(token,t_image_output))
    
    # Return the content of the output to the client with AJAX
    return(token)
    
@app.route('/transitions')
def transition():
    token = request.args.get('token')
    app.logger.info("index token={}".format(token))
    dict_transfer = {"token":"placeholder"}
    return render_template('transitions.html', title='GAN4VIS - Transitions', dict_transfer=dict_transfer)
