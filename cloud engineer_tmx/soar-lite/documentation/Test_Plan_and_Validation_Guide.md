# 🧪 SOAR-Lite: Test Plan & Validation Guide
**By: Ravi K.**

I've outlined my testing strategies below to confirm the accuracy, reliability, and automation of my **SOAR-Lite** platform.

---

## 🔬 1. My Test Strategy Overview
Standard security testing for my platform focuses on three areas:
-   **My Ingestion Integrity:** I need to ensure raw log data is correctly parsed and stored in my database.
-   **My Detection Accuracy:** I need to confirm my detection rules trigger exactly when thresholds are met.
-   **My Automation Success (SOAR):** I need to validate my system takes the correct mitigating action upon detection.

---

## 🧪 2. Functional Test Cases (Manual Validation)

### **Test Case 1: Ingestion & Normalization**
- **My Objective:** Verify my raw log parsing.
- **My Workflow:** Run `scripts/run_pipeline.py`.
- **My Expected Result:** My console should report successful ingestion. I can check the `logs` table in my SQLite database to confirm structured data exists.

### **Test Case 2: Brute Force Logic (High Severity)**
- **My Objective:** Detect multiple failed attempts from a single IP.
- **My Workflow:** I've insured `data/sample_logs/auth.log` contains 3 failed login attempts from my test IP (`192.168.1.100`). Run the pipeline.
- **My Expected Result:** My console should print `[SECURITY ALERT] High - Rule: Brute Force Detection`.

### **Test Case 3: Automated Mitigation (SOAR Logic)**
- **My Objective:** Ensure my system blocks the brute force attacker automatically.
- **My Workflow:** After running Test Case 2, I check the "Firewall Management" section of my SOC Dashboard.
- **My Expected Result:** My test IP must appear as "ACTIVE BLOCK" with a timestamp matching the alert time.

---

## 🛡️ 3. Advanced Anomaly Testing (Security Labs)

To manually trigger a new alert within my pipeline:
1. Open my `data/sample_logs/auth.log` in a text editor.
2. Add a new successful login from a new user at 3 AM:
   `2026-03-30 03:15:22 - Successful login for user lab_admin from 10.10.10.25`
3. Execute `python scripts/run_pipeline.py`.
4. Validate the `Unusual Login Time` alert in my "Security Alerts" console.

---

## 📊 4. Performance & Audit Testing

- **My Export Verification:** I'll navigate to my SOC Dashboard and click **"Download CSV Report."**
- **My Expected Result:** A `.csv` file should be generated containing all my historical security alerts.
- **My Audit Consistency:** I'll verify that every "ACTIVE BLOCK" in my firewall has a corresponding entry in the `response_actions` table.
