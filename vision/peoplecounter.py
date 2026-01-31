import cv2, time
from ultralytics import YOLO
from datetime import datetime
from backend.db import get_db
from backend.crowd_logic import classify_crowd

LOCATION_NAME = "Main Mess"
WRITE_INTERVAL = 3

model = YOLO("yolov8n.pt")
cap = cv2.VideoCapture(0)

db = get_db()
collection = db["crowd_stats"]

last_write = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, conf=0.5, classes=[0], verbose=False)
    people = len(results[0].boxes) if results else 0
    crowd_level = classify_crowd(people)

    if time.time() - last_write > WRITE_INTERVAL:
        collection.insert_one({
            "location_name": LOCATION_NAME,
            "people_count": people,
            "crowd_level": crowd_level,
            "timestamp": datetime.utcnow()
        })
        last_write = time.time()

    cv2.putText(frame, f"People: {people} | {crowd_level}",
                (20, 40), cv2.FONT_HERSHEY_SIMPLEX,
                1, (0,255,0), 2)

    cv2.imshow("Campus Crowd CCTV", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
