# 3D AI Scanner Optimization System

## B.Tech Project: Machine Learning-Based Optimization of 3D Scanning Parameters

A modern Flask-based web application for uploading, processing, and analyzing 3D models with machine learning-based optimization techniques.

---

## 📋 Project Features

✅ **File Upload System**
- Support for .STL and .PLY 3D model formats
- Drag-and-drop upload interface
- Maximum file size: 50 MB

✅ **Modern Web Interface**
- Responsive, modern UI with dark theme
- Real-time file management
- Smooth animations and transitions

✅ **3D Model Management**
- Upload and organize 3D models
- File listing with download/delete options
- Session-based image scanning

✅ **Live Camera Capture**
- Real-time webcam capture
- Automatic session organization
- Image history tracking

✅ **Point Cloud Density Analysis** (Added)
- Depth map computation from images
- 3D point cloud generation
- Density statistics calculation
- Volume and distribution analysis

✅ **Placeholder for Future Features**
- Open3D integration (planned)
- Machine learning model results
- Parameter optimization algorithms
- Quality metrics visualization

---

## 📁 Project Structure

```
3D_AI_Project/
│
├── app.py                    # Flask main application
├── scanner.py                # Scanner module with point cloud density
├── requirements.txt          # Python dependencies
├── README.md                 # This file
│
├── uploads/                  # Uploaded 3D model files
├── scanned_images/           # Captured images organized by session
│
├── templates/
│   └── index.html            # Modern responsive homepage
│
└── static/
    └── style.css             # Complete styling (CSS3 with animations)
```

---

## 🚀 Quick Start

### 1. **Prerequisites**
- Python 3.7 or higher
- pip (Python package manager)
- A webcam (optional, for camera capture)

### 2. **Installation**

Clone or download the project to your computer:

```bash
cd 3D_AI_Project
```

Install required packages:

```bash
pip install -r requirements.txt
```

### 3. **Run the Application**

Start the Flask development server:

```bash
python app.py
```

You should see output like:

```
 * Running on http://127.0.0.1:5000
 * Running on http://10.xxx.xxx.xxx:5000
```

### 4. **Access the Web Interface**

Open your web browser and go to:

```
http://localhost:5000
```

---

## 🎨 User Interface

### Homepage Features

1. **Hero Section**
   - Project title and description
   - Feature highlights

2. **Upload Section**
   - Drag-and-drop upload area
   - Supported format information
   - Quick start guide

3. **File Management**
   - List all uploaded files
   - Download files
   - Delete files
   - File size display

4. **3D Processing Results**
   - Tabs for Overview, Analysis, and Optimization
   - Placeholder sections for future ML features
   - Real-time result display

5. **Project Information**
   - How to run locally
   - Project structure
   - Technologies used

---

## 📡 API Endpoints

### Upload & File Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload a 3D model file |
| `/uploads/<filename>` | GET | Download an uploaded file |
| `/list-uploads` | GET | List all uploaded files |
| `/delete-upload` | POST | Delete an uploaded file |

### Camera & Scanning

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/scan/preview` | GET | Test camera availability |
| `/scan/capture` | GET | Capture image from backend camera |
| `/scan/close` | GET | Close camera connection |
| `/scan/list` | GET | List all scan sessions |
| `/upload/scan` | POST | Upload browser-captured image |
| `/scan/image/<session>/<filename>` | GET | Serve scanned image |

### Point Cloud Analysis (New!)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/density/process` | POST | Process session images for density |
| `/density/stats` | GET | Get density statistics |
| `/density/report` | POST | Save density report as JSON |

### System Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/scanner/status` | GET | Get current scanner status |

---

## 🔧 Technologies Used

### Backend
- **Python** - Programming language
- **Flask** - Web framework
- **OpenCV** - Image processing
- **NumPy & SciPy** - Numerical computing
- **Werkzeug** - WSGI utility library

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with animations
- **Vanilla JavaScript** - Client-side logic

### Additional (Planned)
- **Open3D** - 3D geometry processing
- **Scikit-learn** - Machine learning
- **TensorFlow** - Deep learning (planned)

---

## 💻 Configuration

### File Size Limits
Default maximum upload size: **50 MB**

To change, edit in `app.py`:
```python
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # Change 50 to desired size
```

### Upload Folder
Default: `uploads/`
Default for scanned images: `scanned_images/`

Both are created automatically if they don't exist.

---

## 📸 Using the Application

### Uploading 3D Models

1. Go to the **"Upload 3D Models"** section
2. Either:
   - Drag and drop .STL or .PLY files into the upload area, OR
   - Click the area to browse and select files
3. Files are automatically saved to the `uploads/` folder
4. A success message appears after upload

### Downloading/Deleting Files

1. View uploaded files in the **"Uploaded Files"** section
2. Click **"Download"** to save a file to your computer
3. Click **"Delete"** to remove a file from the server

### Using Point Cloud Density Analysis

```python
from scanner import Scanner

# Create scanner instance
scanner = Scanner("scanned_images")

# Process images in a session
stats = scanner.process_session_for_density("session_name")

# Get statistics
if stats:
    print(f"Total points: {stats['overall']['total_points']}")
    print(f"Density: {stats['overall']['density']:.4f} pts/unit³")

# Save report
scanner.save_density_report("session_name")
```

---

## 🎯 Future Enhancements

### Phase 2 - 3D Processing
- [ ] Open3D integration for mesh processing
- [ ] Point cloud visualization in browser
- [ ] Mesh quality analysis
- [ ] STL/PLY preview viewer

### Phase 3 - Machine Learning
- [ ] ML models for scanning optimization
- [ ] Parameter prediction
- [ ] Quality assessment algorithms
- [ ] Model classification system

### Phase 4 - Advanced Features
- [ ] Real-time 3D visualization (Three.js)
- [ ] Batch processing
- [ ] Database integration
- [ ] User authentication
- [ ] Export results functionality

---

## 🐛 Troubleshooting

### **Port Already in Use**
If port 5000 is already in use, Flask will show an error.

**Solution:** Kill the process or change the port in `app.py`:
```python
app.run(debug=True, port=5001)  # Use port 5001 instead
```

### **Camera Not Working**
If camera capture fails, check:
1. Webcam is properly connected
2. Camera is not in use by another application
3. Correct camera permissions are granted

### **File Upload Fails**
- Check file format (.stl or .ply only)
- Verify file size is less than 50 MB
- Ensure `uploads/` folder exists

### **ModuleNotFoundError**
If you get import errors, reinstall dependencies:
```bash
pip install --upgrade -r requirements.txt
```

---

## 📚 Code Examples

### Python - Processing a 3D Model

```python
from scanner import Scanner
import cv2

# Initialize scanner
scanner = Scanner("scanned_images", focal_length=800)

# Process a session
result = scanner.process_session_for_density("2026-06-19_11-23-19")

# Print statistics
print(result['overall'])

# Save report
scanner.save_density_report("2026-06-19_11-23-19")
```

### JavaScript - Upload File

```javascript
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    if (data.status === 'success') {
        console.log('File uploaded:', data.filename);
    }
}
```

---

## 📝 License

This project is created as a B.Tech academic project.

---

## 👨‍💻 Author

B.Tech Student - Specialized in Machine Learning & 3D Scanning Optimization

---

## ❓ Support

For issues or questions, please check:
1. This README file
2. Code comments in app.py and scanner.py
3. Flask documentation: https://flask.palletsprojects.com/
4. OpenCV documentation: https://docs.opencv.org/

---

**Happy 3D Scanning! 🚀**
