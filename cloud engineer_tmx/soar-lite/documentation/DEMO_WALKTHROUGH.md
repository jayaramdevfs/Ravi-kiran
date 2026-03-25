# 🚀 SOAR-Lite: Project Demo & Walkthrough
**By: Ravi K.**

Welcome to my **SOAR-Lite demo**. I'll walk you through how my system handles a real-world brute force attack scenario and automatically mitigates the threat.

---

## 🎬 Part 1: Initializing the Pipeline
First, I'll launch my SOC pipeline to ingest raw infrastructure logs and scan for security incidents.

**Command:**
```bash
python scripts/run_pipeline.py
```

**What happened?**
1.  **My Log Collector** connects to `data/sample_logs/auth.log`.
2.  It identifies 3 failed login attempts from the IP `192.168.1.100`.
3.  **My Detection Engine** flags this as a "Brute Force Attack" based on the threshold I defined in `configs/detection_rules.json`.
4.  **My SOAR Engine** instantly executes an automated `BLOCK_IP` response.

---

## 🖥️ Part 2: Viewing the Manage Management Console
Now, I'll launch my SOC Dashboard to see the results.

**Command:**
```bash
python src/dashboard/app.py
```

### [📸 Screenshot 1: SOC Dashboard Overview]
-   In my dashboard, I can see the **Total Logs Analyzed**, the **Active Cyber Threats**, and the **Automated Firewall Blocks**.

### [📸 Screenshot 2: Real-Time Alerts]
-   The **"Recent Threat Detections"** table shows the Brute Force alert for `192.168.1.100` with **High Severity**.

### [📸 Screenshot 3: Active Mitigation]
-   Scroll down to **"Firewall Mitigation Control."** You'll see `192.168.1.100` is now listed as an **ACTIVE BLOCK**, automated by my playbook.

---

## 📊 Part 3: Generating a Forensic Report
Finally, I'll export my incident data for audit compliance.

1.  Click **"Download CSV Report."**
2.  Open `data/alerts_report.csv` to see a structured record of every security threat caught by my system.
3.  This report is now ready for presentation at a weekly security review.

---

## 🏁 Conclusion
I built this project to prove that even a lightweight SOAR platform can drastically reduce response times for common attack vectors. By automating the containment phase, my system allows me as an analyst to stay focused on high-level threat hunting rather than manual IP blocking.
