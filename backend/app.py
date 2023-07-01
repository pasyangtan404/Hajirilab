from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

    user = Users.query.filter_by(username=username, password=password).first()

    print(username)
    print(password)

    if user:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'})


class Emp_details(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(20), nullable=False)
    last_name = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    email = db.Column(db.String(50), unique=True)
    phone_num = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    position = db.Column(db.String(50), nullable=False)
    photo_sample = db.Column(db.String(10), nullable=False)

    def __init__(self, employee_id, first_name, last_name, gender, dob, email, phone_num, address, department, position, photo_sample):
        self.employee_id = employee_id
        self.first_name = first_name
        self.last_name = last_name
        self.gender = gender
        self.dob = dob
        self.email = email
        self.phone_num = phone_num
        self.address = address
        self.department = department
        self.position = position
        self.photo_sample = photo_sample

# class DetailSchema(ma.Schema):
#     class Meta:
#         fields = ('id', 'username', 'password', 'email')


# user_schema = UserSchema()
# users_schema = UserSchema(many=True)

@app.route('/save', methods=['POST'])
def save_emp_details():
    try:
        print("Save button clicked!")
        data = request.get_json()

        employee_id = data.get('employee_id')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        gender = data.get('gender')
        dob = data.get('dob')
        email = data.get('email')
        phone_num = data.get('phone_num')
        address = data.get('address')
        department = data.get('department')
        position = data.get('position')
        photo_sample = data.get('photo_sample')
        
        # Check if employee with the same employee_id already exists
        existing_emp = Emp_details.query.filter_by(employee_id=employee_id).first()
        if existing_emp:
            return jsonify({'message': 'Employee details already exist'})
        
        else:
            new_emp = Emp_details(employee_id, first_name, last_name, gender,
                              dob, email, phone_num, address, department, position, photo_sample)

            db.session.add(new_emp)

            db.session.commit()

            return jsonify({'message': 'Employee details saved successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/update/<employee_id>', methods=['PUT'])
def update_emp_details(employee_id):
    try:
        emp = Emp_details.query.filter_by(employee_id=employee_id).first()
        if emp is None:
            return jsonify({'error': 'Employee not found'}), 404

        data = request.get_json()

        emp.first_name = data.get('first_name')
        emp.last_name = data.get('last_name')
        emp.gender = data.get('gender')
        emp.dob = data.get('dob')
        emp.email = data.get('email')
        emp.phone_num = data.get('phone_num')
        emp.address = data.get('address')
        emp.department = data.get('department')
        emp.position = data.get('position')
        emp.photo_sample = data.get('photo_sample')
        
        if emp:
            db.session.commit()

            return jsonify({'message': 'Employee details updated successfully'})
        
        else:
            return jsonify({'error': 'Employee not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/delete/<employee_id>', methods=['DELETE'])
def delete_emp_details(employee_id):
    try:
        emp = Emp_details.query.filter_by(employee_id=employee_id).first()

        if emp:
            db.session.delete(emp)

            db.session.commit()

            return jsonify({'message': 'Employee details deleted successfully'})
        else:
            return jsonify({'error': 'Employee not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/employees', methods=['GET'])
def get_employee_details():
    try:
        employees = Emp_details.query.all()
        employee_list = []
        for employee in employees:
            employee_dict = {
                'employee_id': employee.employee_id,
                'first_name': employee.first_name,
                'last_name': employee.last_name,
                'gender': employee.gender,
                'dob': str(employee.dob),
                'email': employee.email,
                'phone_num': employee.phone_num,
                'address': employee.address,
                'department': employee.department,
                'position': employee.position,
                'photo_sample': employee.photo_sample
            }
            employee_list.append(employee_dict)
        return jsonify(employee_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
