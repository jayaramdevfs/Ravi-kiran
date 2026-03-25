# 🚀 SOC Threat Detection: Features & Setup Guide

This document provides a clear, high-level overview of how the **SOC Threat Detection Log Analyzer** functions and how to get it running immediately. It is intended to help anyone—including beginners—understand the scope and operations of this project.

---

## 💡 1. Project Overview (What does this do?)
This project simulates the core logic of a **Security Operations Center (SOC)** detection platform. It acts like a mini-SIEM (Security Information and Event Management) system.

**The primary workflow is:**
1. **Inputs:** The system ingests standard Linux server authentication logs (e.g., failed and successful login attempts) stored in the `logs/sample_auth.log` file.
2. **Process:** Our Python-based parsing engine reads the chaotic log text, extracts valuable metadata (Timestamp, User, Target IP), and pipes this through our custom "Detection Engine."
3. **Outputs:** The Detection Engine compares the logs against known malicious behavioral rules. If it spots a threat, it generates high-fidelity **Security Alerts** in the terminal and saves a forensic report locally to `incident_report.json`.

---

## 🛠️ 2. Core Security Features
The current Detection Engine hunts down three main hacker techniques:

*   **Rule 1: Brute Force Attacks:** If an attacker's IP fails to log in 10 times within a narrow 5-minute time window, an alert is triggered.
*   **Rule 2: Suspicious / Anomalous Logins:** The engine securely remembers where users successfully log in from. If a user logs in from an entirely new IP address they have never used before, an alert is created to mitigate hijacked accounts.
*   **Rule 3: Abnormal Time Access:** Normal business operations are set between 8:00 AM and 6:00 PM. An alert is flagged if successful authentication happens in the middle of the night.

---

## ▶️ 3. How to Execute & Test the System

There are two primary ways to run this engine: through standard Python or via an isolated Docker container.

### **Method A: Local Execution (Python)**
This is the fastest method to test the project natively on your operating system.

**Prerequisites:** Python 3.9+
1. Open your terminal and navigate to the project root folder.
2. Install the lightweight dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the script and feed it the sample log data:
   ```bash
   python src/main.py logs/sample_auth.log
   ```
4. Check the terminal! You will immediately see the Security Alerts dynamically print out showing the simulated attackers we caught.

### **Method B: Containerized Execution (Docker)**
For deploying in a modern, cloud-ready environment, the project is completely containerized.

**Prerequisites:** Docker Engine / Docker Desktop
1. Ensure Docker is running in the background.
2. In your terminal, build the container image:
   ```bash
   docker build -t soc-analyzer .
   ```
3. Run the log analysis inside the isolated container:
   ```bash
   docker run soc-analyzer
   ```

---

## 🧪 4. Live Trick: See It In Action!
Want to test the logic manually? Try this:
1. Open `logs/sample_auth.log` in a text editor.
2. At the bottom of the file, type in 10 identical lines simulating a failure:
   `Mar 13 12:00:00 server1 sshd[100]: Failed password for fake_user from 9.9.9.9 port 22 ssh2`
3. Save the file and execute `python src/main.py logs/sample_auth.log` again.
4. Watch the detection engine catch your new `fake_user` attack automatically!
