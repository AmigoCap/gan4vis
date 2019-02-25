from datetime import datetime
from app import db

class Transfer(db.Model):
	token = db.Column(db.String(120), primary_key=True)
	date = db.Column(db.DateTime, index=True, default=datetime.utcnow)
	model = db.Column(db.String(64), index=True)
	distribution = db.Column(db.String(64), index=True)
	datapoints = db.Column(db.String(120), index=True)
	grid = db.Column(db.String(64), index=True)
	orientation = db.Column(db.String(64), index=True)

	def __repr__(self):
		return '<Tranfert {}>'.format(self.token)

	# def get_dictionary(self):
	# 	return({token:,})
#
# class User(UserMixin, db.Model):
#
# 	# Initialization of database scheme (columns)
# 	id = db.Column(db.Integer, primary_key=True)
# 	username = db.Column(db.String(64), index=True, unique=True)
# 	email = db.Column(db.String(120), index=True, unique=True)
# 	password_hash = db.Column(db.String(128)) # On ne stocke pas le mot de passe mais uniquement le hash pour comparer
#
# 	# Initialization of the link between a user and the tasks submitted
# 	tasks = db.relationship('Task', backref='creator', lazy='dynamic')
#
# 	# Generate password hash on password input
# 	def set_password(self, password):
# 		self.password_hash = generate_password_hash(password)
#
# 	# Function that checks the password input against the hash stored in database
# 	def check_password(self, password):
# 		return check_password_hash(self.password_hash, password)
#
# 	def avatar(self, size):
# 		digest = md5(self.email.lower().encode('utf-8')).hexdigest()
# 		return 'https://www.gravatar.com/avatar/{}?d=identicon&s={}'.format(digest, size)
#
# 	# Function that defines how the object is printed to stdout
# 	def __repr__(self):
# 		return '<User {}>'.format(self.username)
#
# class Task(db.Model):
#
# 	# Initialization of database scheme (columns)
# 	id = db.Column(db.Integer, primary_key=True)
# 	input_sketch = db.Column(db.String(256), index=True, unique=True)
# 	output_pred = db.Column(db.String(256), index=True, unique=True)
# 	user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
#
# 	def set_input_path(self, path):
# 		self.input_sketch = path.replace("\\", "/")
#
# 	def set_output_path(self, path):
# 		self.output_pred = path.replace("\\", "/")
#
# 	# Function that defines how the object is printed to stdout
# 	def __repr__(self):
# 		return '<Task {} - Creator {}>'.format(self.id, self.creator.username)
#
# @login.user_loader
# def load_user(id):
# 	return User.query.get(int(id))
