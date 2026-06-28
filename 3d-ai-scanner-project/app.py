"""
Flask Web App - 3D AI Scanner with OpenCV
"""
from flask import Flask, render_template, request, jsonify, send_file
import cv2
import os
import datetime
import uuid
import threading
from scanner import PointCloudProcessor, process_3d_file

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = "uploads"
SCANNED_FOLDER = "scanned_images"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SCANNED_FOLDER"] = SCANNED_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB max upload

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SCANNED_FOLDER, exist_ok=True)


# Global camera state (single camera shared across routes)
camera = None
camera_lock = threading.Lock()
current_session = None  # Track current session name


def get_current_session():
    """Get or create a session for the current scanning session"""
    global current_session
    if current_session is None:
        now = datetime.datetime.now()
        current_session = now.strftime("%Y-%m-%d_%H-%M-%S")
    session_dir = os.path.join(SCANNED_FOLDER, current_session)
    os.makedirs(session_dir, exist_ok=True)
    return current_session, session_dir


def reset_session():
    """Reset session so next capture creates a new folder"""
    global current_session
    current_session = None


def get_camera():
    """Get or initialize the camera"""
    global camera
    if camera is None:
        camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Use DirectShow on Windows
        if not camera.isOpened():
            raise RuntimeError("Could not open camera. Is it connected?")
        # Set resolution for consistency
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        # Warm up camera
        for _ in range(5):
            camera.read()
    return camera


def release_camera():
    """Release the camera resource"""
    global camera
    if camera is not None:
        camera.release()
        camera = None
    reset_session()


@app.route('/')
def home():
    """Serve the modern landing page"""
    return render_template("landing.html")


@app.route('/dashboard')
def dashboard():
    """Redirect to home page"""
    return render_template("landing.html")


@app.route('/landing')
def landing():
    """Serve the landing page"""
    return render_template("landing.html")


@app.route('/scan/preview')
def scan_preview():
    """Open camera and return success status"""
    with camera_lock:
        try:
            cam = get_camera()
            # Try to read a test frame to confirm camera works
            ret, test_frame = cam.read()
            if not ret:
                release_camera()
                return jsonify({"status": "error", "message": "Camera opened but failed to read frames"}), 500
            return jsonify({"status": "success", "message": "Camera is ready"})
        except RuntimeError as e:
            return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/scan/capture')
def scan_capture():
    """Capture a single frame from the backend camera and save it"""
    with camera_lock:
        try:
            cam = get_camera()
            ret, frame = cam.read()
            if not ret:
                return jsonify({"status": "error", "message": "Failed to capture frame"}), 500

            # Save the image in session folder
            session_name, session_dir = get_current_session()
            timestamp = datetime.datetime.now().strftime("%H-%M-%S-%f")
            unique_id = uuid.uuid4().hex[:6]
            filename = f"scan_{timestamp}_{unique_id}.png"
            filepath = os.path.join(session_dir, filename)

            success = cv2.imwrite(filepath, frame)
            if not success:
                return jsonify({"status": "error", "message": "Failed to save image to disk"}), 500

            return jsonify({
                "status": "success",
                "message": "Image captured and saved",
                "filename": filename,
                "filepath": f"/scan/image/{session_name}/{filename}",
                "session": session_name
            })
        except RuntimeError as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        except Exception as e:
            return jsonify({"status": "error", "message": f"Unexpected error: {str(e)}"}), 500


@app.route('/scan/close')
def scan_close():
    """Close the camera"""
    with camera_lock:
        release_camera()
    return jsonify({"status": "success", "message": "Camera closed"})


@app.route('/scan/latest')
def scan_latest():
    """Get the latest captured image"""
    if not os.path.exists(SCANNED_FOLDER):
        return jsonify({"status": "error", "message": "No scans yet"}), 404

    sessions = sorted(
        [d for d in os.listdir(SCANNED_FOLDER)
         if os.path.isdir(os.path.join(SCANNED_FOLDER, d))],
        reverse=True
    )
    if not sessions:
        return jsonify({"status": "error", "message": "No scans yet"}), 404

    latest_session = sessions[0]
    session_dir = os.path.join(SCANNED_FOLDER, latest_session)
    images = sorted(
        [f for f in os.listdir(session_dir) if f.endswith(('.png', '.jpg', '.jpeg'))],
        reverse=True
    )
    if not images:
        return jsonify({"status": "error", "message": "No images in latest session"}), 404

    latest_image_path = os.path.join(session_dir, images[0])
    return send_file(latest_image_path, mimetype='image/png')


@app.route('/scan/list')
def scan_list():
    """List all scan sessions and their images"""
    if not os.path.exists(SCANNED_FOLDER):
        return jsonify({"status": "success", "sessions": []})

    sessions = []
    for s in sorted(
        [d for d in os.listdir(SCANNED_FOLDER)
         if os.path.isdir(os.path.join(SCANNED_FOLDER, d))],
        reverse=True
    ):
        session_dir = os.path.join(SCANNED_FOLDER, s)
        images = sorted(
            [f for f in os.listdir(session_dir) if f.endswith(('.png', '.jpg', '.jpeg'))],
            reverse=True
        )
        sessions.append({
            "session": s,
            "image_count": len(images),
            "images": images[:20]  # Latest 20 images
        })
    return jsonify({"status": "success", "sessions": sessions})


@app.route('/scan/image/<session_name>/<filename>')
def scan_image(session_name, filename):
    """Serve a specific scanned image"""
    # Security: prevent path traversal
    if '..' in session_name or '..' in filename or '/' in filename or '\\' in filename:
        return jsonify({"status": "error", "message": "Invalid path"}), 400

    filepath = os.path.join(SCANNED_FOLDER, session_name, filename)
    if not os.path.exists(filepath):
        return jsonify({"status": "error", "message": "Image not found"}), 404

    return send_file(filepath, mimetype='image/png')


@app.route('/upload/scan', methods=['POST'])
def upload_scan():
    """
    Upload an image captured from browser camera, save to scanned_images
    with proper session organization.
    """
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    # Save to scanned_images with session
    session_name, session_dir = get_current_session()
    timestamp = datetime.datetime.now().strftime("%H-%M-%S-%f")
    unique_id = uuid.uuid4().hex[:6]
    filename = f"scan_{timestamp}_{unique_id}.png"
    filepath = os.path.join(session_dir, filename)

    file.save(filepath)

    return jsonify({
        "status": "success",
        "message": "Image saved",
        "filename": filename,
        "filepath": f"/scan/image/{session_name}/{filename}",
        "session": session_name
    })


@app.route('/upload', methods=['POST'])
def upload():
    """Upload 3D files (STL, PLY) or other content to uploads folder"""
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    # Sanitize filename - keep only the name, no path traversal
    safe_filename = os.path.basename(file.filename)
    if not safe_filename:
        return jsonify({"status": "error", "message": "Invalid filename"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, safe_filename)
    file.save(filepath)

    return jsonify({
        "status": "success",
        "message": "File uploaded successfully",
        "filename": safe_filename
    })


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve an uploaded file"""
    if '..' in filename:
        return jsonify({"status": "error", "message": "Invalid path"}), 400
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"status": "error", "message": "File not found"}), 404
    return send_file(filepath)


@app.route('/list-uploads')
def list_uploads():
    """List all uploaded files"""
    if not os.path.exists(UPLOAD_FOLDER):
        return jsonify({"status": "success", "files": []})
    
    files = []
    try:
        for filename in sorted(os.listdir(UPLOAD_FOLDER), reverse=True):
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(filepath):
                files.append({
                    "name": filename,
                    "size": os.path.getsize(filepath)
                })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    return jsonify({"status": "success", "files": files})


@app.route('/delete-upload', methods=['POST'])
def delete_upload():
    """Delete an uploaded file"""
    data = request.get_json()
    filename = data.get('filename', '')
    
    # Security: prevent path traversal
    if '..' in filename or '/' in filename or '\\' in filename:
        return jsonify({"status": "error", "message": "Invalid filename"}), 400
    
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    # Verify file exists in uploads folder
    if not os.path.exists(filepath) or not os.path.isfile(filepath):
        return jsonify({"status": "error", "message": "File not found"}), 404
    
    try:
        os.remove(filepath)
        return jsonify({"status": "success", "message": f"File {filename} deleted"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/scanner/status')
def scanner_status():
    """Return the current scanner status"""
    with camera_lock:
        cam_active = camera is not None
    return jsonify({
        "camera_active": cam_active,
        "session": current_session or "none",
        "scanned_images_dir_exists": os.path.exists(SCANNED_FOLDER)
    })


@app.route('/optimize', methods=['POST'])
def optimize():
    """
    Run complete 3D processing pipeline on an uploaded file.
    Includes:
      - Point Cloud Density Analysis
      - DBSCAN Clustering
      - Voxel Grid Downsampling
      - Poisson Surface Reconstruction
      - RANSAC Plane Segmentation
      - Statistical Outlier Removal
      - Radius Outlier Removal
    """
    import time
    start_time = time.time()
    
    try:
        data = request.get_json() or {}
        filename = data.get('filename', '')
        
        if not filename:
            return jsonify({"status": "error", "message": "No filename provided"}), 400
        
        # Security: prevent path traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({"status": "error", "message": "Invalid filename"}), 400
        
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(filepath):
            return jsonify({"status": "error", "message": "File not found"}), 404
        
        # Run the real 3D processing pipeline
        results = process_3d_file(filepath)
        
        if "error" in results:
            return jsonify({"status": "error", "message": results["error"]}), 400
        
        elapsed = round((time.time() - start_time) * 1000)
        results["processing_time_ms"] = elapsed
        results["status"] = "completed"
        
        return jsonify({
            "status": "success",
            "data": results
        })
        
    except Exception as e:
        import traceback
        return jsonify({
            "status": "error",
            "message": str(e),
            "detail": traceback.format_exc()
        }), 500


if __name__ == "__main__":
    # Don't auto-reload with camera active to avoid port conflicts
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
