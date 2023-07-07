from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from marshmallow import Schema, fields
from flask_cors import CORS
from datetime import datetime
from helpers import extract_faces, get_eyes, preprocess_face, draw_frame, data_augmentation,train_model, recognize_face
import os
import cv2
import time
import csv
import pandas as pd

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:''@localhost/hajirilabdb'

db = SQLAlchemy(app)
ma = Marshmallow(app)

# Set the parameters for HOG and LBP feature extraction
blockSize = (8, 8)
cellSize = (2, 2)
nbins = 9
radius = 3
neighbors = 8
    
#### Initializing VideoCapture object to access WebCam
cap = cv2.VideoCapture(0)

# Get the directory of the app.py file
current_dir = os.path.dirname(os.path.abspath(__file__))
    
# Specify the data folder path relative to the current directory
data_folder = os.path.join(current_dir, '../face_data')
if not os.path.exists(data_folder):
    os.makedirs(data_folder)

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
    id = fields.Int()
    username = fields.Str()
    email = fields.Email()

user_schema = UserSchema()

#----------Handle Login----------#
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
        result = user_schema.dump(user)
        return jsonify({'success': True, 'user': result})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'})
    
class Emp_details(db.Model):
    id = db.Column(db.Integer, unique=True, autoincrement=True)
    employee_id = db.Column(db.Integer, primary_key=True, nullable=False)
    first_name = db.Column(db.String(20), nullable=False)
    last_name = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    email = db.Column(db.String(50), unique=True)
    phone_num = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    position = db.Column(db.String(50), nullable=False)
    photo_sample = db.Column(db.String(10), default="No")

    def __init__(self, employee_id, first_name, last_name, gender, dob, email, phone_num, address, department, position,  photo_sample):
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
        self.photo_sample =  photo_sample

class EmployeeSchema(Schema):
    employee_id = fields.Int()
    first_name = fields.Str()
    last_name = fields.Str()
    gender = fields.Str()
    dob = fields.Date()
    email = fields.Email()
    phone_num = fields.Str()
    address = fields.Str()
    department = fields.Str()
    position = fields.Str()
    photo_sample = fields.Str()


employee_schema = EmployeeSchema()
employees_schema = EmployeeSchema(many=True)


#--------------------Saving Employee details--------------------#
@app.route('/save', methods=['POST'])
def save_emp_details():
    try:
        print("Save button clicked!")
        data = request.get_json()

        # Deserialize and validate the data
        emp_data = employee_schema.load(data)
        
        employee_id = emp_data['employee_id']

        # Check if employee with the same employee_id already exists
        existing_emp = Emp_details.query.filter_by(
            employee_id=employee_id).first()
        if existing_emp:
            return jsonify({'message': 'Employee details already exist'})

        else:
            new_emp = Emp_details(**emp_data)

            db.session.add(new_emp)

            db.session.commit()
            
            # Fetch all employee details from the database in order by employee ID
            all_emp_details = Emp_details.query.order_by(Emp_details.employee_id).all()
            
            # Serialize the employee details
            result = employees_schema.dump(all_emp_details)
                
            return jsonify({'message': 'Employee details saved successfully', 'employees': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

class UpdateEmployeeSchema(Schema):
    employee_id = fields.Int()
    first_name = fields.String()
    last_name = fields.String()
    gender = fields.String()
    dob = fields.Date()
    email = fields.Email()
    phone_num = fields.String()
    address = fields.String()
    department = fields.String()
    position = fields.String()
    photo_sample = fields.Str()
    
update_employee_schema = UpdateEmployeeSchema()

#-----------------Updating Employee Details-------------------#
@app.route('/update/<employee_id>', methods=['PUT'])
def update_emp_details(employee_id):
    try:
        emp = Emp_details.query.filter_by(employee_id=employee_id).first()

        if emp:
            data = request.get_json()
            
           # Deserialize and validate the update data
            update_data = update_employee_schema.load(data)
            
            is_modified = False
             
            for field, value in update_data.items():
                if getattr(emp, field) != value:
                    setattr(emp, field, value)
                    is_modified = True
            
            if is_modified:
                db.session.commit()
                return jsonify({'updated': True, 'message': 'Employee details updated successfully'})
            else:
                return jsonify({'updated': False, 'message': 'No changes made'})
        else:
            return jsonify({'error': 'Employee not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

#-----------------------Deleting Employee Details------------------#
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

#------------------Capturing Images from Camera-----------------#
@app.route('/capture', methods=['POST'])
def capture():
    try:
        print("add photo button clicked!")
        data = request.get_json()
        employee_id = data.get('employee_id')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        
        emp = Emp_details.query.filter_by(employee_id=employee_id).first()
        if emp:
            # Update the photo_sample column to 'yes'
            emp.photo_sample = 'Yes'
            
            # Commit the changes to the database
            db.session.commit()
            
            # Create folder if it doesn't exist
            folder_name = os.path.join(data_folder, f'{employee_id}_{first_name}_{last_name}')
            if not os.path.exists(folder_name):
                os.makedirs(folder_name)
        
            # Open camera and capture 50 photos
            cap = cv2.VideoCapture(0)
            
            # Set window properties to make it appear in front of all other windows
            cv2.namedWindow('HajiriLab(Taking Photos...)', cv2.WINDOW_NORMAL)
            
            # Position the window in the center of the screen
            cv2.moveWindow('HajiriLab(Taking Photos...)', 400, 100)
        
            i,j = 0,0
            ready_start_time = time.time()
            while 1:
                _,frame = cap.read()
                if time.time() - ready_start_time < 3:
                    # Display "Ready" message for 3 seconds
                    cv2.putText(frame, 'Ready', (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 20), 2, cv2.LINE_AA)
                else:
                    faces = extract_faces(frame)
 
                    for (x, y, w, h) in faces:
                        face_img = frame[y:y+h, x:x+w]
                        # Preprocess the face image
                        face_img = preprocess_face(face_img)
                        
                        # Perform data augmentation on the face image
                        face_img2 = data_augmentation(face_img)
                        
                        # Draw bounding box and text on the frame
                        color = (255, 0, 20)
                        info_text = f'Images Captured: {i}/50'
                        draw_frame(frame, x, y,w, h, color, info_text)
                    
                        eyes = get_eyes(frame)
                        for (ex, ey, ew, eh) in eyes:
                            cx = int(ex + ew/2)
                            cy = int(ey + eh/2)
                        
                            # Draw a dot on the eye center
                            cv2.circle(frame, (cx, cy), 3, (255, 0, 20), -1)
                    
                        if j%10==0:
                            # Save the image
                            image_path = os.path.join(folder_name, f'{employee_id}_{first_name}_{last_name}_{str(i+1)}.jpg')
                            cv2.imwrite(image_path, face_img)
                            
                            # Save the grayscale augmented image
                            image_gray_path = os.path.join(folder_name, f'{employee_id}_{first_name}_{last_name}_{str(i+1)}a.jpg')
                            cv2.imwrite(image_gray_path, face_img2)
                            i += 1
                        j+=1
                    if j==500:
                        break
                    
                cv2.imshow('HajiriLab(Taking Photos...)',frame)
                if cv2.waitKey(1)==27:
                    break
  
            # Release the camera
            cap.release()
            cv2.destroyAllWindows()
                        
            return jsonify({'message': 'Photos captured successfully'})
        
        else:
            # Employee details not found in the database
            return jsonify({'error': 'Employee details not found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#-------------------------Displaying all Employee Details-------------------#   
@app.route('/employees', methods=['GET'])
def get_employee_details():
    try:
        employees = Emp_details.query.all()
        serialized_data = employees_schema.dump(employees)
        return jsonify(serialized_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/train', methods=['POST'])
def train_data():
    try:
        # Call the train_model function to train the model
        train_model()

        # Return a success response
        return jsonify({'success': True})

    except Exception as e:
        # Return an error response if an exception occurs during training
        return jsonify({'success': False, 'error': str(e)}), 500

#-----------------Recognizing and Taking Attendance---------------# 
@app.route('/checkIn', methods=['POST'])
def checkIn_Attendance():
    try:
        # Set up the video capture 
        cap = cv2.VideoCapture(0)

        while True:
            # Capture frame-by-frame
            ret, frame = cap.read()

            faces = extract_faces(frame)
            
            # Create the attendance folder path
            attendance_folder = os.path.join(current_dir, '../attendance')
            
            # Check if the attendance folder exists and create it if it doesn't
            if not os.path.exists(attendance_folder):
                os.makedirs(attendance_folder)
            
            current_date = datetime.now().strftime('%Y-%m-%d')
            csv_name = os.path.join(attendance_folder, f"attendance_{current_date}.csv")
            
            # Check if the CSV file exists
            csv_exists = os.path.exists(csv_name)
            
            # Create an empty DataFrame to hold attendance data
            attendance_data = pd.DataFrame(columns=['Employee ID', 'First Name', 'Last Name', 
                                                    'Department', 'Date', 'Check-In', 'Check-Out', 'Attendance Status'])
            
            # Read the existing CSV file if it exists
            if csv_exists:
                attendance_data = pd.read_csv(csv_name)
                
            for (x, y, w, h) in faces:
                face_img = frame[y:y+h, x:x+w]

                # Preprocess the face image
                preprocessed_face = preprocess_face(face_img)

                # Recognize the face and retrieve employee details
                predicted_label, confidence = recognize_face(preprocessed_face)
                employee = Emp_details.query.filter_by(employee_id=predicted_label).first()

                if confidence[0] >= 0.77:
                    # Face recognized
                    attendance_status = 'Present'
                    color = (0, 255, 0)  # Green frame
                    if employee:
                        info_text = f"ID: {employee.employee_id}\n{employee.first_name} {employee.last_name}"
                    
                        # Check if the employee's details are already written in the CSV
                        already_written = attendance_data['Employee ID'].eq(employee.employee_id).any()
                        
                        if not already_written:
                            # Get the current date and time
                            check_in_time = datetime.now().strftime('%H:%M:%S')
                            
                            # Create a new row with attendance details
                            new_row = {
                            'Employee ID': employee.employee_id,
                            'First Name': employee.first_name,
                            'Last Name': employee.last_name,
                            'Department': employee.department,
                            'Date': current_date,
                            'Check-In': check_in_time,
                            'Check-Out': '',
                            'Attendance Status': attendance_status
                            }
                            
                            # Append the new row to the DataFrame
                            attendance_data = attendance_data.append(new_row, ignore_index=True)
                    else:
                        color = (0, 0, 255)
                        info_text = "Unknown"
                else:
                    # Face unrecognized
                    attendance_status = 'Absent'
                    employee = None
                    color = (0, 0, 255)  # Red frame
                    info_text = "Unknown"

                # Draw the frame and display information
                draw_frame(frame, x, y, w, h, color, info_text)
                
            # Write the updated DataFrame to the CSV file
            attendance_data.to_csv(csv_name, index=False)

            # Display the frame
            cv2.imshow('HajiriLab(Taking Attendance...)', frame)

            # Break the loop if the Esc key is pressed
            if cv2.waitKey(1) == 27:
                break
            
        # Release the video capture
        cap.release()
        cv2.destroyAllWindows()

        return jsonify({'message': 'Attendance taken successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/checkOut', methods=['POST'])
def checkOut_Attendance():
    try:
        # Set up the video capture 
        cap = cv2.VideoCapture(0)

        while True:
            # Capture frame-by-frame
            ret, frame = cap.read()

            faces = extract_faces(frame)
            
            # Create the attendance folder path
            attendance_folder = os.path.join(current_dir, '../attendance')
            
            # Check if the attendance folder exists and create it if it doesn't
            if not os.path.exists(attendance_folder):
                os.makedirs(attendance_folder)
            
            current_date = datetime.now().strftime('%Y-%m-%d')
            csv_name = os.path.join(attendance_folder, f"attendance_{current_date}.csv")
            
            # Check if the CSV file exists
            csv_exists = os.path.exists(csv_name)
   
            for (x, y, w, h) in faces:
                face_img = frame[y:y+h, x:x+w]

                # Preprocess the face image
                preprocessed_face = preprocess_face(face_img)

                # Recognize the face and retrieve employee details
                predicted_label, confidence = recognize_face(preprocessed_face)
                employee = Emp_details.query.filter_by(employee_id=predicted_label).first()

                if confidence[0] >= 0.77:
                    color = (0, 255, 0)  # Green frame
                    if employee:
                        info_text = f"ID: {employee.employee_id}\nName: {employee.first_name} {employee.last_name}"
                    
                        # Read the existing CSV file if it exists
                        if csv_exists:
                            attendance_data = pd.read_csv(csv_name)
                            
                            # Find the employee in the DataFrame
                            employee_index = attendance_data[attendance_data['Employee ID'] == employee.employee_id].index
                            
                            if not employee_index.empty:
                                check_out_time = datetime.now().strftime('%H:%M:%S')
                                # Update the check-out time for the employee
                                attendance_data.loc[employee_index, 'Check-Out'] = check_out_time
                                # Write the updated DataFrame to the CSV file
                                attendance_data.to_csv(csv_name, index=False)
                    else:
                        color = (0, 0, 255)
                        info_text = "Unknown"
                else:
                    # Face unrecognized
                    employee = None
                    color = (0, 0, 255)  # Red frame
                    info_text = "Unknown"

                # Draw the frame and display information
                draw_frame(frame, x, y, w, h, color, info_text)
            
            # Display the frame
            cv2.imshow('HajiriLab(Checking-out...)', frame)

            # Break the loop if the Esc key is pressed
            if cv2.waitKey(1) == 27:
                break
            
        # Release the video capture
        cap.release()
        cv2.destroyAllWindows()

        return jsonify({'message': 'Check-out successful'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

#-----------------Showing Photo of one employee---------------#
@app.route('/show', methods=['POST'])
def show_photos():
    print("show photo button clicked!")
    data = request.get_json()
    employee_id = data.get('employee_id')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
        
    # Construct the folder name based on the ID, first name, and last name
    folder_name = f"{employee_id}_{first_name}_{last_name}"
    
    data_folder = os.path.join(current_dir, '../face_data')

    folder_path = os.path.join(data_folder, folder_name)

    # Check if the folder exists
    if os.path.exists(folder_path):
        # Open the folder using the default file explorer of the operating system
        os.startfile(folder_path)
        return jsonify({'message': 'Folder opened successfully'})
    else:
        return jsonify({'error': 'Folder does not exist'}), 404

#--------------Opening folder containing Images------------#
@app.route('/open', methods=['POST'])
def open_photos():
    print("open button clicked!")
    
    data_path = os.path.join(current_dir, '../face_data')

    # Check if the folder exists
    if os.path.exists(data_path):
        # Open the folder using the default file explorer of the operating system
        os.startfile(data_path)
        return jsonify({'message': 'Folder opened successfully'})
    else:
        return jsonify({'error': 'Folder does not exist'}), 404

if __name__ == "__main__":
    app.run(debug=True)
