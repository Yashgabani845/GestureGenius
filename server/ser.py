from flask import Flask, Response, jsonify
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
from flask_cors import CORS
import logging
import traceback

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
    camera = cv2.VideoCapture(0)  # Open webcam

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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)