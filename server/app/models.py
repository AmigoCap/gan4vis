from datetime import datetime
from app import db

# Table transfer in the SQLite database
class Transfer(db.Model):
	token = db.Column(db.String(120), primary_key=True)
	date = db.Column(db.DateTime, index=True, default=datetime.utcnow)
	model = db.Column(db.String(64), index=True)
	distribution = db.Column(db.String(64), index=True)
	datapoints = db.Column(db.String(120), index=True)
	grid = db.Column(db.String(64), index=True)
	orientation = db.Column(db.String(64), index=True)
	ratio = db.Column(db.Integer, index=True, default=1)

	def __repr__(self):
		return '<Tranfert {}>'.format(self.token)

class Transition(db.Model):
	token = db.Column(db.String(120), primary_key=True)
	date = db.Column(db.DateTime, index=True, default=datetime.utcnow)
	sketch = db.Column(db.String(120), index=True)
	begin_img = db.Column(db.String(64), index=True)
	end_img = db.Column(db.String(64), index=True)

	def __repr__(self):
		return '<Transition {}>'.format(self.token)