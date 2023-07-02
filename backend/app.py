from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import cv2
import numpy as np
from skimage.feature import hog, local_binary_pattern
from sklearn.svm import SVC
import joblib

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:''@localhost/hajirilabdb'

db = SQLAlchemy(app)

#### Initializing VideoCapture object to access WebCam
cap = cv2.VideoCapture(0)

# Create the 'faces' folder if it doesn't exist
data_folder = 'D:/finalyearproject/hajirilab/faces'
if not os.path.exists(data_folder):
    os.makedirs(data_folder)

def extract_faces(img):
    face_detector = cv2.CascadeClassifier('D:/finalyearproject/hajirilab/detectors/haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return faces

def get_eyes(img):
    eye_detector = cv2.CascadeClassifier('D:/finalyearproject/hajirilab/detectors/haarcascade_eye.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    eyes = eye_detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=(30, 30))
    return eyes

def extract_hog_features(img, winSize, blockSize, blockStride, cellSize, nbins):
    # Perform HOG feature extraction
    hog_feature = hog(img, winSize=winSize, block_size=blockSize, block_stride=blockStride,
                      cell_size=cellSize, orientations=nbins, visualize=False, multichannel=False)
    return hog_feature

def extract_lbp_features(img, radius, neighbors):
    # Perform LBP feature extraction on the image
    lbp_feature = local_binary_pattern(img, neighbors, radius, method='uniform').flatten()

    return lbp_feature

def train_model():
    # Set the parameters for HOG and LBP feature extraction
    winSize = (64, 64)
    blockSize = (16, 16)
    blockStride = (8, 8)
    cellSize = (8, 8)
    nbins = 9
    radius = 3
    neighbors = 8
    
    # Set the input directory containing the face images
    input_dir = 'D:/finalyearproject/hajirilab/faces'
    
    # Initialize lists to store features and labels
    features = []
    labels = []
    
    for name in os.listdir(input_dir):
        for filename in os.listdir(os.path.join(input_dir, name)):
            if filename.endswith('.jpg'):
                # Load the pre-processed face image and extract the label from the filename
                img = cv2.imread(os.path.join(input_dir, name, filename))
                if img is None:
                    print(f"Error loading image: {os.path.join(input_dir, name, filename)}")
                    continue

                # Extract HOG and LBP features
                hog_feature = extract_hog_features(img, winSize, blockSize, blockStride, cellSize, nbins)
                lbp_feature = extract_lbp_features(img, radius, neighbors)

                # Concatenate HOG and LBP features
                combined_feature = np.concatenate((hog_feature, lbp_feature))

                # Extract the label from the image name
                label = filename.split('_')[0]

                # Append the features and label to the lists
                features.append(combined_feature)
                labels.append(label)

    # Convert the lists to NumPy arrays
    features = np.array(features)
    labels = np.array(labels)

    # Train the SVM model
    model = SVC()
    model.fit(features, labels)
    
    model_file = 'backend/face_recognition_model.pkl'
    joblib.dump(model, model_file)

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
        existing_emp = Emp_details.query.filter_by(
            employee_id=employee_id).first()
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

        if emp:
            data = request.get_json()
            
            fields_to_update = ['first_name', 'last_name', 'gender', 'dob', 'email', 'phone_num', 'address', 'department', 'position', 'photo_sample']
            
            is_modified = False
             
            for field in fields_to_update:
                if getattr(emp, field) != data.get(field):
                    setattr(emp, field, data.get(field))
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

# Route to handle the photo capture and preprocessing
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
            # Create folder if it doesn't exist
            folder_name = os.path.join(data_folder, f'{employee_id}_{first_name}_{last_name}')
            if not os.path.exists(folder_name):
                os.makedirs(folder_name)
        
            # Open camera and capture 20 photos
            cap = cv2.VideoCapture(0)
        
            i,j = 0,0
            while 1:
                _,frame = cap.read()
                faces = extract_faces(frame)
 
                for (x, y, w, h) in faces:
                    face_img = frame[y:y+h, x:x+w]
                    face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
                    
                    # Normalizing the pixel values of the face image to be between 0 and 1
                    face_img = face_img.astype(float) / 255.0
        
                    # Defining the gamma value
                    gamma = 1.5

                    # Applying gamma correction
                    corrected = cv2.pow(face_img/255.0, gamma)

                    # Normalizing the output image
                    face_img = cv2.normalize(corrected, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
                    
                    # Draw bounding box and text on the frame
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 20), 2)
                    cv2.putText(frame, f'Images Captured: {i}/30', (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 20), 2, cv2.LINE_AA)
                    
                    eyes = get_eyes(frame)
                    for (ex, ey, ew, eh) in eyes:
                        cx = int(ex + ew/2)
                        cy = int(ey + eh/2)
                        
                        # Draw a dot on the eye center
                        cv2.circle(frame, (cx, cy), 3, (255, 0, 20), -1)
                    
                    if j%10==0:
                        # Save the image
                        image_path = os.path.join(folder_name, f'{employee_id}_{first_name}_{last_name}_{str(i)}.jpg')
                        cv2.imwrite(image_path, face_img)
                        i += 1
                    j+=1
                if j==300:
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
