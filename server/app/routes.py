from flask import render_template, flash, redirect, url_for, request
from app.gan import pred_one_img
from app import app, db
from app.forms import LoginForm, RegistrationForm, ImageSubmitForm
from app.models import User, Task
from flask_login import current_user, login_user, login_required, logout_user
from werkzeug.urls import url_parse
from binascii import a2b_base64
import os
import uuid


# Redirect to the "index" page when going to route
@app.route('/')
def root_page():
	return redirect(url_for('index'))


# Defining the homepage view
@app.route('/index', methods=['GET', 'POST'])
def index():

	form = ImageSubmitForm()

	if request.method == 'POST':

		# Récupération du sketch au format png
		output_img_uri = request.form['canvas_data']
		b64_input_sketch = output_img_uri.split('base64,')[1]
		binary_input_sketch = a2b_base64(b64_input_sketch)

		static_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static')

		# If user is logged in, creation of the db entry
		if current_user.is_authenticated:

			task = Task(user_id=current_user.id)
			db.session.add(task)
			db.session.commit()

			task_id = str(task.id)

			input_path = os.path.join('db_files','input_sketches', task_id + '_sk.png')
			output_path = os.path.join('db_files','output_predictions', task_id + '_pr.png')

			task.set_input_path(input_path)
			task.set_output_path(output_path)

			db.session.commit()

			# On Windows, os.path.join joint with \, must be changed when parsed to URL
			output_filename = output_path.replace("\\","/")

			# Écriture du sketch sur le serveur au format png 
			fd = open(os.path.join(static_dir, input_path), 'wb')
			fd.write(binary_input_sketch)
			fd.close()

			# Calling prediction module
			pred_success = pred_one_img.predict_from_file(static_dir, input_path, output_path)

			output_img_src = url_for('static', filename=output_filename)

		else:

			# Calling prediction module
			output_img_src = pred_one_img.predict_temp(b64_input_sketch)
			print(output_img_src)

		return render_template('index.html', title='Home', form=form, output_img=output_img_src)

	return render_template('index.html', title='Home', form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
	if current_user.is_authenticated:
		return redirect(url_for('index'))
	form = LoginForm()
	if form.validate_on_submit():
		user = User.query.filter_by(username=form.username.data).first()
		if user is None or not user.check_password(form.password.data):
			flash('Invalid username or password')
			return redirect(url_for('login'))
		login_user(user, remember=form.remember_me.data)
		next_page = request.args.get('next')
		if not next_page or url_parse(next_page).netloc != '':
			next_page=url_for('index')
		return redirect(next_page)
	return render_template('login.html', title='Sign In', form=form)


@app.route('/logout')
def logout():
	logout_user()
	return redirect(url_for('index'))


# Defining the user profile page
@app.route('/user/<username>')
@login_required
def user(username):
	user = User.query.filter_by(username=username).first_or_404()
	tasks = Task.query.filter_by(user_id=user.id).all()
	print(tasks[0].input_sketch)
	return render_template('user.html', user=user, tasks=tasks)


@app.route('/register', methods=['GET','POST'])
def register():
	if current_user.is_authenticated:
		return redirect(url_for('index'))
	form = RegistrationForm()
	if form.validate_on_submit():
		user = User(username=form.username.data, email=form.email.data)
		user.set_password(form.password.data)
		db.session.add(user)
		db.session.commit()
		flash('Congratulations, you are now a registered user!')
		return redirect(url_for('login'))
	return render_template('register.html', title='Register', form=form)

@app.route('/about')
def about():
	return None

