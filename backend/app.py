from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:''@localhost/hajirilabdb'

db = SQLAlchemy(app)
ma = Marshmallow(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(50), unique=True)

    def __init__(self, username, password, email):
        self.username = username
        self.password = password
        self.email = email


# with app.app_context():
#     db.create_all()


class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'username', 'password', 'email')


user_schema = UserSchema()
users_schema = UserSchema(many=True)

# handle login requests
@app.route('/login', methods=['POST'])
def login():
    print("Login button clicked!")
    # get username and password from request body
    username = request.json.get('username')
    password = request.json.get('password')
    
    user = Users.query.filter_by(username= username, password=password).first()
    
    print(username)
    print(password)
    
    if user:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'})


# @app.route('/get', methods=['GET'])
# def home():
#     all_home = Users.query.all()
#     results = users_schema.dump(all_home)
#     return jsonify(results)


# @app.route('/get/<id>/', methods=['GET'])
# def post_details(id):
#     article = Users.query.get(id)
#     return user_schema.jsonify(article)

# @app.route('/add', methods=['POST'])
# def add_home():
#     username = request.json['username']
#     password = request.json['password']
#     email = request.json['email']

#     users = Users(username, password, email)
#     db.session.add(users)
#     db.session.commit()
#     return user_schema.jsonify(users)

# @app.route('/update/<id>/', methods=['PUT'])
# def update_home(id):
#     article = Users.query.get(id)

#     username = request.json['username']
#     password = request.json['password']
#     email = request.json['email']

#     article.username = username
#     article.password = password
#     article.email = email
#     db.session.commit()
#     return user_schema.jsonify(article)

# @app.route('/delete/<id>/', methods=['DELETE'])
# def delete_home(id):
#     article = Users.query.get(id)
#     db.session.delete(article)
#     db.session.commit()
#     return user_schema.jsonify(article)

if __name__ == "__main__":
    app.run(debug=True)


# from flask import Flask,render_template,Response
# import cv2

# app=Flask(__name__)
# camera=cv2.VideoCapture(0)

# def generate_frames():
#     while True:
            
#         ## read the camera frame
#         success,frame=camera.read()
#         if not success:
#             break
#         else:
#             ret,buffer=cv2.imencode('.jpg',frame)
#             frame=buffer.tobytes()

#         yield(b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


# @app.route('/')
# def index():
#     return render_template('./node')

# @app.route('/video')
# def video():
#     return Response(generate_frames(),mimetype='multipart/x-mixed-replace; boundary=frame')

# if __name__=="__main__":
#     app.run(debug=True)