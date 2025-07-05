import cv2
import time

def preview_webcam(duration=10):
    cap = cv2.VideoCapture(0)  
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return
        
    print("Webcam opened successfully!")
    
    start_time = time.time()
    
    while (time.time() - start_time) < duration:
        ret, frame = cap.read()
        
        if ret:
            cv2.imshow('Webcam Preview', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        else:
            print("Error: Couldn't read frame.")
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"Preview ended after {duration} seconds.")

preview_webcam(10)