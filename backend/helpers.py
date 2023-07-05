import os
import cv2
import random
import numpy as np
from skimage.feature import hog, local_binary_pattern
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score
import joblib

# Set the parameters for HOG and LBP feature extraction
blockSize = (8, 8)
cellSize = (2, 2)
nbins = 9
radius = 3
neighbors = 8

# Get the directory of the app.py file
current_dir = os.path.dirname(os.path.abspath(__file__))

def extract_faces(img):
    face_detector = cv2.CascadeClassifier('D:/finalyearproject/hajirilab/detectors/haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return faces

def get_eyes(img):
    eye_detector = cv2.CascadeClassifier('D:/finalyearproject/hajirilab/detectors/haarcascade_eye.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    eyes = eye_detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return eyes

def preprocess_face(img):
    # Convert the face image to grayscale
    face_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
     # Resize the face image to a fixed size                
    face_img = cv2.resize(face_img, (256, 256))
                    
    # Normalizing the pixel values of the face image to be between 0 and 1
    face_img = face_img.astype(float) / 255.0
        
    # Defining the gamma value
    gamma = 1.5

    # Applying gamma correction
    corrected = cv2.pow(face_img/255.0, gamma)

    # Normalizing the output image
    face_img = cv2.normalize(corrected, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    
    return face_img
    
def draw_frame(frame, x, y, w, h, color, text):
    # Draw the bounding box and display information about the recognized face
    cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
    cv2.putText(frame, text, (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2, cv2.LINE_AA)
    
def data_augmentation(img):
    # Normalize the pixel values of the face image to be between 0 and 1
    img = img.astype(float) / 255.0

    # Randomly tilt the image at a small angle
    angle = random.uniform(-5, 5)
    M = cv2.getRotationMatrix2D((img.shape[1] / 2, img.shape[0] / 2), angle, 1)
    tilted_img = cv2.warpAffine(img, M, (img.shape[1], img.shape[0]))

    # Randomly adjust the brightness of the image
    brightness_factor = random.uniform(0.7, 1.3)
    brightened_img = np.clip(tilted_img * brightness_factor, 0, 1)

    # Adjust the contrast of the image
    contrast_factor = random.uniform(0.8, 1.2)
    contrast_img = np.clip((brightened_img - 0.5) * contrast_factor + 0.5, 0, 1)

    # Add random noise to the image
    noise_img = np.clip(contrast_img + np.random.normal(scale=0.05, size=contrast_img.shape), 0, 1)
    
    # Convert the image back to the original pixel range (0-255)
    augmented_img = (noise_img * 255).astype(np.uint8)

    return augmented_img

def extract_hog_features(img, nbins, blockSize, cellSize):
    # Perform HOG feature extraction
    hog_feature = hog(img, orientations= nbins, pixels_per_cell=blockSize,
                      cells_per_block=cellSize, visualize=False)
    return hog_feature

def extract_lbp_features(img, radius, neighbors):
    # Perform LBP feature extraction on the image
    lbp_feature = local_binary_pattern(img, neighbors, radius, method='uniform').flatten()

    return lbp_feature

def train_model():  
    # Define the pipeline with feature normalization and dimensionality reduction
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('pca', PCA(n_components=0.95)),  # Retain 95% of the variance
        ('svm', SVC())
    ])
        
    # Define the parameter grid for hyperparameter tuning
    param_grid = {
        'svm__C': [1, 10, 100],
        'svm__kernel': ['linear', 'rbf']
    }
        
    # Perform grid search cross-validation to find the best hyperparameters
    grid_search = GridSearchCV(pipeline, param_grid, cv=5)
    
    # Specify the input directory path relative to the current directory
    input_dir = os.path.join(current_dir, '../face_data')
    
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
                    
                # Convert the image to grayscale
                img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                face_img = cv2.resize(img_gray, (256, 256))
                
                # Extract HOG and LBP features
                hog_feature = extract_hog_features(face_img, nbins, blockSize, cellSize)
                lbp_feature = extract_lbp_features(face_img, radius, neighbors)
                
                print(hog_feature.shape)
                print(lbp_feature.shape)
                print()
                
                
                # Concatenate HOG and LBP features
                combined_feature = np.concatenate((hog_feature, lbp_feature))

                # Extract the label from the image name
                label = filename.split('_')[0]

                # Append the features and label to the lists
                features.append(combined_feature)
                labels.append(label)
                
                cv2.namedWindow('Training...', cv2.WINDOW_NORMAL)
                cv2.resizeWindow('Training...', 800, 600)

                # Show the training image
                cv2.imshow('Training...', img)
                cv2.waitKey(50)  # Update the displayed image                
    
    # Convert the lists to NumPy arrays
    features = np.array(features)
    labels = np.array(labels)
    
    # Split the data into training and validation sets
    train_features, val_features, train_labels, val_labels = train_test_split(
    features, labels, test_size=0.2, random_state=42)
    
    print("Training...")
    cv2.destroyAllWindows()

    # Fit the model using grid search cross-validation
    grid_search.fit(train_features, train_labels) 
    
    # Print the best hyperparameters
    print("Best Hyperparameters:", grid_search.best_params_)

    # Get the best model
    model = grid_search.best_estimator_
    
    # Train the best model on the full training dataset
    model.fit(train_features, train_labels)
    
    train_predictions = model.predict(train_features)
    train_accuracy = accuracy_score(train_labels, train_predictions)
    print('Training Accuracy:', train_accuracy)

    val_predictions = model.predict(val_features)
    val_accuracy = accuracy_score(val_labels, val_predictions)
    print('Validation Accuracy:', val_accuracy)
    
    # Specify the path for the model file
    model_file_path = os.path.join(current_dir, '..', 'face_recognition_model.pkl')
    joblib.dump(model, model_file_path)
    
def recognize_face(img):
    # Load the trained face recognition model
    model_file_path = os.path.join(current_dir, '..', 'face_recognition_model.pkl')
    model = joblib.load(model_file_path)

    # Extract features from the face image
    hog_feature = extract_hog_features(img, nbins, blockSize, cellSize)
    lbp_feature = extract_lbp_features(img, radius, neighbors)
    combined_feature = np.concatenate((hog_feature, lbp_feature))

    # Predict the label (employee_id) of the face using the trained model
    predicted_label = model.predict([combined_feature])[0]
    confidence = model.decision_function([combined_feature])[0]

    return predicted_label, confidence