


from flask import Flask, Response, jsonify, request
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
from flask_cors import CORS
import logging
import traceback
import base64

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

try:
    logger.info("Loading model...")
    model = tf.keras.models.load_model('./best_model.keras')

    logger.info("Loading labels...")
    with open("./labels.txt", "r") as file:
        class_names = [line.strip() for line in file.readlines()]

    logger.info("Initializing MediaPipe...")
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    logger.info("Starting video capture...")
    camera = cv2.VideoCapture(0, cv2.CAP_V4L2)  # Open webcam

except Exception as e:
    logger.error(f"Error during initialization: {str(e)}")
    logger.error(traceback.format_exc())
    raise

latest_prediction = {"class": "", "confidence": 0.0}

def preprocess_image(image_array):
    """Preprocess the hand image for model prediction."""
    image = cv2.resize(image_array, (224, 224))
    image = image.astype(np.float32) / 127.5 - 1
    return np.expand_dims(image, axis=0)

def process_base64_image(base64_string):
    """Convert base64-encoded image to OpenCV format."""
    if 'base64,' in base64_string:
        base64_string = base64_string.split('base64,')[1]
    img_bytes = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def generate_frames():
    """Generate video frames with hand detection and ASL prediction."""
    global latest_prediction

    while True:
        success, frame = camera.read()
        if not success:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        detected_class = ""
        detected_confidence = 0.0

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                h, w, _ = frame.shape
                x_coords = [int(landmark.x * w) for landmark in hand_landmarks.landmark]
                y_coords = [int(landmark.y * h) for landmark in hand_landmarks.landmark]

                padding = 20
                x_min = max(0, min(x_coords) - padding)
                x_max = min(w, max(x_coords) + padding)
                y_min = max(0, min(y_coords) - padding) 
                y_max = min(h, max(y_coords) + padding)

                hand_region = frame[y_min:y_max, x_min:x_max]

                if hand_region.size > 0:
                    input_data = preprocess_image(hand_region)
                    prediction = model.predict(input_data, verbose=0)
                    index = np.argmax(prediction)

                    detected_class = class_names[index]
                    detected_confidence = float(prediction[0][index])

                    # Draw bounding box and label
                    cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
                    cv2.putText(frame, f"{detected_class} ({detected_confidence*100:.2f}%)",
                                (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        # Update latest prediction
        latest_prediction = {"class": detected_class, "confidence": detected_confidence}

        # Encode frame for streaming
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """Stream video with hand detection and ASL prediction overlay."""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/prediction', methods=['GET'])
def get_prediction():
    """Return the latest ASL prediction."""
    return jsonify(latest_prediction), 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        image = process_base64_image(data['image'])
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400

        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_image)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                h, w, _ = image.shape
                x_coords = [int(landmark.x * w) for landmark in hand_landmarks.landmark]
                y_coords = [int(landmark.y * h) for landmark in hand_landmarks.landmark]

                padding = 20
                x_min = max(0, min(x_coords) - padding)
                x_max = min(w, max(x_coords) + padding)
                y_min = max(0, min(y_coords) - padding)
                y_max = min(h, max(y_coords) + padding)

                hand_region = image[y_min:y_max, x_min:x_max]

                if hand_region.size > 0:
                    input_data = preprocess_image(hand_region)
                    prediction = model.predict(input_data, verbose=0)
                    index = np.argmax(prediction)

                    confidence = float(prediction[0][index])

                    index = np.argmax(prediction)

                    return jsonify({
                    'class': class_names[index].split(" ", 1)[-1],  # Extract only the label
                    'confidence': confidence
                })
        return jsonify({'class': '', 'confidence': 0.0}), 200

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

# from flask import Flask, request, jsonify
# import cv2
# import numpy as np
# import tensorflow as tf
# from PIL import Image
# import base64
# import mediapipe as mp
# from flask_cors import CORS
# import logging
# import traceback
# import io

# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(_name_)

# app = Flask(_name_)
# CORS(app)

# try:
#     logger.info("Loading model...")
#     model = tf.keras.models.load_model('./best_model.keras')
    
#     logger.info("Loading labels...")
#     with open("./labels.txt", "r") as file:
#         class_names = [line.strip() for line in file.readlines()]
    
#     logger.info("Initializing MediaPipe...")
#     mp_hands = mp.solutions.hands
#     hands = mp_hands.Hands(
#         static_image_mode=False,
#         max_num_hands=2,
#         min_detection_confidence=0.5,
#         min_tracking_confidence=0.5
#     )
    
# except Exception as e:
#     logger.error(f"Error during initialization: {str(e)}")
#     logger.error(traceback.format_exc())
#     raise

# def encode_image_to_base64(image_array):
#     """Convert numpy array to base64 string."""
#     try:
#         # Convert to RGB for consistent encoding
#         if len(image_array.shape) == 3 and image_array.shape[2] == 3:
#             image_array = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
        
#         # Convert to PIL Image
#         pil_image = Image.fromarray(image_array)
        
#         # Save to bytes
#         img_byte_arr = io.BytesIO()
#         pil_image.save(img_byte_arr, format='JPEG')
#         img_byte_arr = img_byte_arr.getvalue()
        
#         # Convert to base64
#         base64_encoded = base64.b64encode(img_byte_arr).decode('utf-8')
#         return f"data:image/jpeg;base64,{base64_encoded}"
#     except Exception as e:
#         logger.error(f"Error encoding image: {str(e)}")
#         return None

# def decode_base64_image(base64_string):
#     try:
#         if ',' in base64_string:
#             base64_string = base64_string.split(',')[1]
#         image_data = base64.b64decode(base64_string)
#         nparr = np.frombuffer(image_data, np.uint8)
#         image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#         if image is None:
#             raise ValueError("Failed to decode image")
#         return image
#     except Exception as e:
#         logger.error(f"Error decoding base64 image: {str(e)}")
#         raise

# def preprocess_image(image_array):
#     try:
#         if image_array is None or image_array.size == 0:
#             raise ValueError("Invalid image array")
        
#         image = Image.fromarray(cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB))
#         image = image.resize((224, 224), Image.Resampling.LANCZOS)
#         img_array = np.asarray(image)
#         normalized_image_array = (img_array.astype(np.float32) / 127.5) - 1
#         return np.expand_dims(normalized_image_array, axis=0)
#     except Exception as e:
#         logger.error(f"Error preprocessing image: {str(e)}")
#         return None

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         if not request.json or 'image' not in request.json:
#             return jsonify({"error": "No image data provided"}), 400
            
#         frame = decode_base64_image(request.json['image'])
#         rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = hands.process(rgb_frame)
        
#         if not results.multi_hand_landmarks:
#             return jsonify({"error": "No hands detected"}), 200
            
#         hand_landmarks = results.multi_hand_landmarks[0]
        
#         # Get hand bounding box
#         h, w = frame.shape[:2]
#         x_coords = [int(landmark.x * w) for landmark in hand_landmarks.landmark]
#         y_coords = [int(landmark.y * h) for landmark in hand_landmarks.landmark]
        
#         padding = 20
#         x_min = max(0, min(x_coords) - padding)
#         x_max = min(w, max(x_coords) + padding)
#         y_min = max(0, min(y_coords) - padding)
#         y_max = min(h, max(y_coords) + padding)
        
#         # Crop hand region
#         hand_region = frame[y_min:y_max, x_min:x_max]
        
#         if hand_region.size == 0:
#             return jsonify({"error": "Invalid hand region"}), 400
            
#         # Convert cropped hand region to base64
#         hand_region_base64 = encode_image_to_base64(hand_region)
        
#         # Preprocess and predict
#         input_data = preprocess_image(hand_region)
#         if input_data is None:
#             return jsonify({"error": "Failed to preprocess image"}), 400
            
#         prediction = model.predict(input_data, verbose=0)
#         index = np.argmax(prediction)
        
#         response = {
#             "class": class_names[index],
#             "confidence": float(prediction[0][index]),
#             "hand_image": hand_region_base64,
#             "bbox": {
#                 "x_min": int(x_min),
#                 "x_max": int(x_max),
#                 "y_min": int(y_min),
#                 "y_max": int(y_max)
#             }
#         }
        
#         return jsonify(response), 200
        
#     except Exception as e:
#         logger.error(f"Error processing request: {str(e)}")
#         logger.error(traceback.format_exc())
#         return jsonify({"error": str(e)}), 500

# if _name_ == "_main_":
#     app.run(host='0.0.0.0', port=5000, debug=True)


# from flask import Flask, Response, jsonify
# import cv2
# import numpy as np
# import tensorflow as tf
# import mediapipe as mp
# from flask_cors import CORS
# import logging
# import traceback

# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# try:
#     logger.info("Loading model...")
#     model = tf.keras.models.load_model('./best_model.keras')

#     logger.info("Loading labels...")
#     with open("./labels.txt", "r") as file:
#         class_names = [line.strip() for line in file.readlines()]

#     logger.info("Initializing MediaPipe...")
#     mp_hands = mp.solutions.hands
#     hands = mp_hands.Hands(
#         static_image_mode=False,
#         max_num_hands=2,
#         min_detection_confidence=0.5,
#         min_tracking_confidence=0.5
#     )

#     logger.info("Starting video capture...")
#     camera = cv2.VideoCapture(0)  # Open webcam

# except Exception as e:
#     logger.error(f"Error during initialization: {str(e)}")
#     logger.error(traceback.format_exc())
#     raise

# latest_prediction = {"class": "", "confidence": 0.0}

# def preprocess_image(image_array):
#     """Preprocess the hand image for model prediction."""
#     image = cv2.resize(image_array, (224, 224))
#     image = image.astype(np.float32) / 127.5 - 1
#     return np.expand_dims(image, axis=0)

# def generate_frames():
#     """Generate video frames with hand detection and ASL prediction."""
#     global latest_prediction

#     while True:
#         success, frame = camera.read()
#         if not success:
#             break

#         rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = hands.process(rgb_frame)

#         detected_class = ""
#         detected_confidence = 0.0

#         if results.multi_hand_landmarks:
#             for hand_landmarks in results.multi_hand_landmarks:
#                 h, w, _ = frame.shape
#                 x_coords = [int(landmark.x * w) for landmark in hand_landmarks.landmark]
#                 y_coords = [int(landmark.y * h) for landmark in hand_landmarks.landmark]

#                 padding = 20
#                 x_min = max(0, min(x_coords) - padding)
#                 x_max = min(w, max(x_coords) + padding)
#                 y_min = max(0, min(y_coords) - padding)
#                 y_max = min(h, max(y_coords) + padding)

#                 hand_region = frame[y_min:y_max, x_min:x_max]

#                 if hand_region.size > 0:
#                     input_data = preprocess_image(hand_region)
#                     prediction = model.predict(input_data, verbose=0)
#                     index = np.argmax(prediction)

#                     detected_class = class_names[index]
#                     detected_confidence = float(prediction[0][index])

#                     # Draw bounding box and label
#                     cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
#                     cv2.putText(frame, f"{detected_class} ({detected_confidence*100:.2f}%)",
#                                 (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

#         # Update latest prediction
#         latest_prediction = {"class": detected_class, "confidence": detected_confidence}

#         # Encode frame for streaming
#         _, buffer = cv2.imencode('.jpg', frame)
#         frame_bytes = buffer.tobytes()

#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# @app.route('/video_feed')
# def video_feed():
#     """Stream video with hand detection and ASL prediction overlay."""
#     return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# @app.route('/prediction', methods=['GET'])
# def get_prediction():
#     """Return the latest ASL prediction."""
#     return jsonify(latest_prediction), 200

# if __name__ == "__main__":
#     app.run(host='0.0.0.0', port=5000, debug=True)

# from flask import Flask, Response, jsonify, request
# import cv2
# import numpy as np
# import tensorflow as tf
# import mediapipe as mp
# from flask_cors import CORS
# import logging
# import traceback
# import base64

# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# try:
#     logger.info("Loading model...")
#     model = tf.keras.models.load_model('./best_model.keras')

#     logger.info("Loading labels...")
#     with open("./labels.txt", "r") as file:
#         class_names = [line.strip() for line in file.readlines()]

#     logger.info("Initializing MediaPipe...")
#     mp_hands = mp.solutions.hands
#     hands = mp_hands.Hands(
#         static_image_mode=True,
#         max_num_hands=2,
#         min_detection_confidence=0.5,
#         min_tracking_confidence=0.5
#     )

# except Exception as e:
#     logger.error(f"Error during initialization: {str(e)}")
#     logger.error(traceback.format_exc())
#     raise

# def process_base64_image(base64_string):
#     # Remove data URL prefix if present
#     if 'base64,' in base64_string:
#         base64_string = base64_string.split('base64,')[1]
    
#     # Decode base64 string to bytes
#     img_bytes = base64.b64decode(base64_string)
    
#     # Convert bytes to numpy array
#     nparr = np.frombuffer(img_bytes, np.uint8)
    
#     # Decode image
#     image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#     return image

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         data = request.json
#         if not data or 'image' not in data:
#             return jsonify({'error': 'No image data provided'}), 400

#         # Process the base64 image
#         image = process_base64_image(data['image'])
#         if image is None:
#             return jsonify({'error': 'Invalid image data'}), 400

#         # Convert to RGB for MediaPipe
#         rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#         results = hands.process(rgb_image)

#         if results.multi_hand_landmarks:
#             for hand_landmarks in results.multi_hand_landmarks:
#                 # Get hand region
#                 h, w, _ = image.shape
#                 x_coords = [int(landmark.x * w) for landmark in hand_landmarks.landmark]
#                 y_coords = [int(landmark.y * h) for landmark in hand_landmarks.landmark]

#                 padding = 20
#                 x_min = max(0, min(x_coords) - padding)
#                 x_max = min(w, max(x_coords) + padding)
#                 y_min = max(0, min(y_coords) - padding)
#                 y_max = min(h, max(y_coords) + padding)

#                 hand_region = image[y_min:y_max, x_min:x_max]

#                 if hand_region.size > 0:
#                     # Preprocess for model
#                     processed_image = cv2.resize(hand_region, (224, 224))
#                     processed_image = processed_image.astype(np.float32) / 127.5 - 1
#                     processed_image = np.expand_dims(processed_image, axis=0)

#                     # Get prediction
#                 prediction = model.predict(processed_image, verbose=0)
#                 predicted_class_index = np.argmax(prediction[0])
#                 confidence = float(prediction[0][predicted_class_index])

#                 return jsonify({
#                     'class': class_names[predicted_class_index].split(" ", 1)[-1],  # Extract only the label
#                     'confidence': confidence
#                 })

#         return jsonify({
#             'class': '',
#             'confidence': 0.0
#         })

#     except Exception as e:
#         logger.error(f"Error processing prediction: {str(e)}")
#         logger.error(traceback.format_exc())
#         return jsonify({'error': str(e)}), 500

# if __name__ == "__main__":
#     app.run(host='localhost', port=5000, debug=True)    

