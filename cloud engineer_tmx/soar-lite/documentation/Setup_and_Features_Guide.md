# 🚀 SOAR-Lite: Project Features & Setup Guide

This guide provides a high-level overview of how **my SOAR-Lite platform** works and how to get it running immediately. I've built this to be a miniature SIEM (Security Information and Event Management) and SOAR (Security Orchestration, Automation, and Response) tool.

---

## 💡 1. Project Overview (How it works)
My primary goal with SOAR-Lite was to simulate a professional SOC (Security Operations Center) detection and response pipeline.

**My Workflow Lifecycle:**
1. **My Source (Inputs):** The system connects to standard infrastructure logs (e.g., `auth.log`) and simulated JSON telemetry.
2. **My Analysis (Process):** I've built a Python-based Log Collector that parses raw, messy logs into a structured SQLite database. This then feeds my "Detection Engine."
3. **My Response (Outputs):** My engine evaluates the logs against pre-defined JSON security rules. When a high-fidelity threat is caught, my SOAR engine triggers an automated response—automatically blocking the source IP in the firewall list and generating a forensic report.

---

## 🛠️ 2. My Security Capabilities
I've currently implemented three core automated playbooks:

*   **⚡ Playbook 1: Brute Force Attacks:** If an IP fails to log in 3 times within 5 minutes, my system automatically triggers a block.
*   **🚨 Playbook 2: Malicious Indicator Check:** I cross-reference all incoming traffic against $my known malicious IP watchlist. If a threat is detected, an alert is instantly created.
*   **🌙 Playbook 3: Off-Hours Activity:** I monitor for logins happening between 2 AM and 5 AM. These are flagged for manual investigation to mitigate hijacked accounts.

---

## ▶️ 3. Environment Execution Guide

You can run my project natively through Python or via a containerized Docker environment.

### **Option A: Local Execution (Python)**
This is the fastest method to test my detection logic on your host OS.

**Prerequisites:** Python 3.10+
1. Navigate to the project root.
2. Install my lightweight dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the pipeline and my sample telemetry:
   ```bash
   python scripts/run_pipeline.py
   ```
4. Check the terminal! You'll see my security alerts and automated blocks print out in real-time.
5. Launch my SOC Management Dashboard:
   ```bash
   python src/dashboard/app.py
   ```

### **Option B: Containerized SOC (Docker)**
I've made the system completely cloud-ready with a Docker configuration.

**Prerequisites:** Docker Engine / Desktop
1. Ensure the Docker daemon is running.
2. Build my SOAR infrastructure image:
   ```bash
   docker build -t soar-lite -f docker/Dockerfile .
   ```
3. Deploy the container:
   ```bash
   docker run -p 5000:5000 soar-lite
   ```

---

## 🧪 4. Live Validation: Watch My Logic in Action!
To verify my automation playbooks:
1. Open my dashboard at `http://localhost:5000`.
2. Locate the "Automated Firewall Blocks" section.
3. Click **"Execute Infrastructure Scan."**
4. Watch as my pipeline scans the pre-recorded "attacks" in the log telemetry and automatically updates my firewall status logs in real-time.
