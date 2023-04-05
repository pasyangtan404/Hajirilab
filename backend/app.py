from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import mysql.connector

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


with app.app_context():
    db.create_all()


class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'username', 'password', 'email')


user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'hajirilabdb'
}

# handle login requests
@app.route('/login', methods=['POST'])
def login():
    print("Login button clicked!")
    # get username and password from request body
    username = request.json['username']
    password = request.json['password']

    # Connect to the MySQL database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Execute a SQL query to check the entered username and password
    query = 'SELECT * FROM users WHERE username = %s AND password = %s'
    cursor.execute(query, (username, password))
    result = cursor.fetchone()

    # Close the database connection
    cursor.close()
    conn.close()

    # If a matching record is found, return a JSON response indicating success
    if result is not None:
        return jsonify({'success': True})
    # Otherwise, return a JSON response indicating failure
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password.'})


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
