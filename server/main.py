from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Dict
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import base64
import logging
import traceback
from io import BytesIO
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
executor = ThreadPoolExecutor(max_workers=4)  

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    logger.info("Loading model...")
    model = tf.keras.models.load_model('./best_model.keras')
    
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)

    logger.info("Loading labels...")
    with open("./labels.txt", "r") as file:
        class_names = [line.strip() for line in file.readlines()]

    logger.info("Initializing MediaPipe...")
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,  
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

except Exception as e:
    logger.error(f"Error during initialization: {str(e)}")
    logger.error(traceback.format_exc())
    raise

connections: Dict[str, WebSocket] = {}

def preprocess_image(image_array):
    """Preprocess the hand image for model prediction."""
    image = cv2.resize(image_array, (160, 160))  # Reduced from 224x224
    image = image.astype(np.float32) / 127.5 - 1
    return np.expand_dims(image, axis=0)

def process_frame(frame_data):
    """Process a frame with hand detection and ASL prediction."""
    try:
        img_data = base64.b64decode(frame_data.split(',')[1])
        img_array = np.array(Image.open(BytesIO(img_data)))
        
        scale_factor = 0.5
        frame = cv2.resize(img_array, None, fx=scale_factor, fy=scale_factor)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Process frame with MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        detected_class = ""
        detected_confidence = 0.0

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                h, w, _ = frame.shape
                x_coords = [int(landmark.x * w) for landmark in hand_landmarks.landmark]
                y_coords = [int(landmark.y * h) for landmark in hand_landmarks.landmark]

                padding = 10  # Reduced padding
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

                    # Simplified visualization
                    cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 1)
                    cv2.putText(frame, f"{detected_class}",
                              (x_min, y_min - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]
        _, buffer = cv2.imencode('.jpg', frame, encode_param)
        processed_frame = base64.b64encode(buffer).decode('utf-8')
        
        return {
            'frame': f'data:image/jpeg;base64,{processed_frame}',
            'prediction': {
                'class': detected_class,
                'confidence': detected_confidence
            }
        }
    
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        logger.error(traceback.format_exc())
        return None

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    connections[client_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "video-frame":
                future = executor.submit(process_frame, message["frame"])
                processed_data = future.result()
                
                if processed_data and message["target"] in connections:
                    response = {
                        "type": "processed-frame",
                        "frame": processed_data["frame"],
                        "prediction": processed_data["prediction"],
                        "from": client_id
                    }
                    await connections[message["target"]].send_text(json.dumps(response))
            else:
                if message["target"] in connections:
                    await connections[message["target"]].send_text(data)
    
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        logger.error(traceback.format_exc())
    
    finally:
        if client_id in connections:
            del connections[client_id]