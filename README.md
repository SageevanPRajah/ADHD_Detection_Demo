# 🧠 AI-Driven Multimodal ADHD Screening & Attention Enhancement Platform

---

## 🔍 Project Overview

This project presents an **AI-driven, multimodal ADHD screening and attention enhancement platform** designed for **children aged 6–10**, with a strong focus on **Sri Lankan and Sinhala-speaking contexts**.

The system integrates **speech analysis**, **handwriting assessment**, **body posture & hyperactivity tracking**, and **eye-tracking–based visual attention analysis** to provide an **objective, scalable, and non-invasive ADHD screening solution**.

> ⚠️ **Important Note**  
> This is a **SCREENING system**, **not a diagnostic tool**.  
> Results must be interpreted by qualified healthcare professionals.

---

## ❗ Problem Statement

Traditional ADHD diagnosis relies on:

- Lengthy clinical interviews  
- Subjective behavioral observations  
- Expensive and inaccessible tools (EEG, lab-grade eye trackers)

These methods are:

- Time-consuming  
- Costly  
- Difficult to scale for schools and communities  
- Often not child-friendly  

There is a **critical need for an accessible, engaging, and objective ADHD screening solution**, especially in **resource-limited regions like Sri Lanka**.

---

## 🎯 Project Objectives

- Develop a **multimodal AI-based ADHD screening framework**
- Enable **early detection** using non-invasive behavioral data
- Support **Sinhala-speaking children** using culturally adapted tasks
- Combine **screening and attention improvement** in a single platform
- Ensure **privacy, ethics, and child-friendly interaction**

---

## 🏗️ System Architecture

The system follows a **modular, service-oriented architecture**, where each component operates independently while contributing to a **unified ADHD risk assessment**.

### 🔄 High-Level Workflow

1. Children interact with **web-based tasks and games**
2. Multimodal data is captured (audio, video, gaze, handwriting)
3. Features are extracted and preprocessed
4. Machine Learning models analyze behavioral patterns
5. Results are fused into an **ADHD risk score**
6. **Attention-improvement games** are suggested

📌 **Architecture Diagram**  
Refer to:  

---

## 🧩 Core System Components

### 1️⃣ Speech-Based ADHD Screening
- Analyzes **Sinhala speech** during reading tasks  
- Extracts **acoustic features** (MFCCs, pitch, jitter, shimmer)  
- Extracts **linguistic features**  
- Uses ML classifiers (Random Forest, XGBoost, etc.)  
- Outputs **probability-based ADHD indicators**

---

### 2️⃣ Handwriting-Based ADHD Analysis
- Captures handwriting dynamics (strokes, pressure, timing)
- Identifies motor control and attention irregularities
- Supports early indicators of ADHD-related fine motor issues

---

### 3️⃣ Vision-Based Posture & Hyperactivity Detection
- Uses webcam-based posture tracking
- Detects excessive movement, restlessness, and impulsivity
- Extracts motion-based behavioral biomarkers

---

### 4️⃣ Eye-Tracking & Visual Attention Assessment
- Browser-based eye tracking using standard webcams
- Gamified tasks:
  - Prosaccade
  - Antisaccade
  - Memory-guided saccade
- Extracts gaze features:
  - Fixation duration
  - Saccade latency
  - Gaze entropy
- Machine learning models classify attention patterns

---

## 🧠 Machine Learning Pipeline

### 🔹 Processing Steps
- Data preprocessing & feature extraction
- Train–test split with cross-validation

### 🔹 Models Used
- Logistic Regression  
- Support Vector Machine (SVM)  
- Random Forest & Extra-Trees  
- CNN + LSTM (experimental)

### 🔹 Evaluation Metrics
- Accuracy  
- AUC–ROC  
- Sensitivity & Specificity  

---

## 🛠️ Technology Stack

### 🎨 Frontend
- React.js  
- Tailwind CSS  
- HTML5 Canvas / WebGL  

### ⚙️ Backend
- FastAPI (Python)  
- RESTful API architecture  

### 🤖 AI / Machine Learning
- Python  
- Scikit-learn  
- TensorFlow / PyTorch (experimental)  

### 🔊 Audio & Signal Processing
- Librosa  
- FFmpeg  
- PyDub  
- Praat-Parselmouth  

### 🧠 NLP
- NLTK  
- spaCy  

### 👁️ Computer Vision & Eye Tracking
- OpenCV  
- MediaPipe  
- WebGazer.js  

### 📊 Data Handling
- NumPy  
- Pandas  
- SciPy  

### 🔄 Version Control
- Git  
- GitHub  

---

## 🔐 Privacy, Ethics & Security

- No raw video or facial images are stored
- Only derived behavioral features are saved
- Participant identities are **pseudonymized**
- Encrypted data storage
- Explicit **parental consent** is required
- Designed following ethical guidelines for child data

---

## ⚠️ Disclaimer

This system is developed **for research and screening purposes only**.  
It **does not replace professional medical diagnosis** and must be used alongside clinical evaluation.

---

## ✅ PP1 – Checklist 1 Compliance

- ✔ Shared Git repository
- ✔ Clear commit history and contributions
- ✔ README.md with required sections
- ✔ Architecture diagram included
- ✔ Technology stack documented
- ✔ All component proposals uploaded
