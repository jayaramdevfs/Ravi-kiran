# 📋 SOC Threat Detection: Test Plan & Validation Guide

**Project:** SOC Threat Detection Log Analyzer  
**Document Type:** Test Plan and Execution Strategy  
**Audience:** Security Engineers, QA Analysts, and SOC Managers  

---

## 1. Overview
This document outlines the testing methodology, validation steps, and log monitoring strategies for the SOC Threat Detection Log Analyzer. The goal of this test plan is to ensure the **Detection Engine** accurately identifies key security threats without generating excessive false positives.

## 2. Testing Strategy
The project relies on two primary layers of testing:
1. **Automated Unit Testing (`pytest`)**: Programmatic verification of the underlying detection rules logic (`src/detection_engine.py`) using simulated data arrays in memory.
2. **Functional/System Testing**: End-to-end execution of the CLI script (`src/main.py`) against mock authentication logs stored in the filesystem (`logs/sample_auth.log`) to visually validate SIEM alerts and JSON outputs.

## 3. Test Scenarios & Threat Models
The detection engine is configured to hunt for three primary Indicators of Compromise (IoCs). We validate each IoC with isolated test cases.

| Test Case ID | Scenario | Expected Outcome | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- |
| **TC-01** | **Brute Force Attack** <br> Simulate 10+ failed logins mapped to a single Source IP under 5 minutes. | High Severity Alert Generated. <br> Alert output specifies attempts count. | Pass |
| **TC-02** | **Suspicious Login (New IP)** <br> Simulate a successful login from an IP address that the user has never logged in from before. | Medium Severity Alert Generated. <br> IP and User are flagged. | Pass |
| **TC-03** | **Abnormal Login Time** <br> Simulate a successful login occurring outside normal corporate hours (18:00 to 08:00). | Low/Medium Severity Alert Generated. | Pass |
| **TC-04** | **Normal Baseline Activity** <br> Simulate typical authentication during standard business hours from a recognized IP. | Safe. No alert generated. Output remains quiet. | Pass |

---

## 4. Execution Guide: Running Automated Unit Tests
We use the `pytest` framework to rapidly validate the logic.

### **Step 1: Install Dependencies**
Ensure your test environment has the necessary packages installed:
```bash
pip install -r requirements.txt
```

### **Step 2: Execute Pytest**
Run the following command from the root project directory:
```bash
python -m pytest tests/ -v
```

### **Step 3: Analyzing Test Outcomes**
A successful test run will yield the following terminal output:
```text
======================= test session starts =======================
collected 4 items

tests/test_detection.py::test_brute_force_detection PASSED   [ 25%]
tests/test_detection.py::test_suspicious_login_new_ip PASSED [ 50%]
tests/test_detection.py::test_abnormal_login_time PASSED     [ 75%]
tests/test_detection.py::test_normal_login_no_alert PASSED   [100%]

======================== 4 passed in 0.05s ========================
```
*If a test fails, `pytest` will expose exactly which rule broke the detection logic, allowing for immediate remediation.*

---

## 5. Log Monitoring & Live Data Injection (Functional Testing)
To functionally mimic a real-world scenario, you can perform live manual log injections.

### **Monitoring Workflow**
1. **Locate the Log File:** Open `logs/sample_auth.log` in any text editor.
2. **Inject a Threat:** Append a malicious log entry at the bottom of the file. 

*Example Injection (Brute Force Data):*
```text
Mar 13 09:10:00 server1 sshd[9999]: Failed password for root from 11.22.33.44 port 22 ssh2
Mar 13 09:10:02 server1 sshd[9999]: Failed password for root from 11.22.33.44 port 22 ssh2
Mar 13 09:10:05 server1 sshd[9999]: Failed password for root from 11.22.33.44 port 22 ssh2
... (Copy/paste 10+ times)
```

3. **Execute the Analyzer:** Run the SIEM tool directly against the log file.
```bash
python src/main.py logs/sample_auth.log
```

4. **Validate Output:**
   * Watch the console terminal. A `SECURITY ALERT` banner should trigger for the injected scenario.
   * Open `incident_report.json` and verify that the forensic payload has been logged properly to disk format.

---

## 6. Known Limitations
- Currently, logs must manually be parsed via a standalone CLI command. Live "tailing" (continuous monitoring of a growing file) is planned for future iterations.
- Alerting mechanisms are restricted to local console prints and disk files. External webhooks (Slack, email alerts) are excluded from the current test boundaries.
