# 🛡️ SOAR-Lite: Automated Threat Detection and Incident Response System

Developed by: **Ravi K.**

[![Python](https://img.shields.io/badge/Python-3.10-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Framework-Flask-green.svg)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-lightgrey.svg)](https://www.sqlite.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-blue.svg)](https://www.docker.com/)

**SOAR-Lite** is a robust SOC framework I built to demonstrate how modern security operations can automate log ingestion, threat detection, and incident response (SOAR). It provides a real-time dashboard and an automated mitigation engine for common infrastructure attacks.

---

## 🚀 Key Security Features

### 📂 1. Log Telemetry Ingestion
-   **Structured Ingestion:** High-speed parsing of `auth.log` and JSON formats into a queryable security warehouse.
-   **Normalization:** Maps raw logs (Timestamp, IP, Username) to structured L1/L2 telemetry.

### 🚨 2. SIEM Detection Engine
-   **Brute Force Mitigation:** Detects and flags rapid sequential login failures.
-   **Indicator Check (IOC):** Cross-references traffic against known malicious IP watchlists.
-   **Anomaly Triage:** Identifies successful logins occurring during non-standard hours.

### ⚡ 3. SOAR-Driven Automation
-   **Playbook Execution:** Automatically triggers `BLOCK_IP` actions upon high-severity alerts.
-   **Active Firewall Database:** Manages real-time IP blocks with forensic auditing for each action.
-   **Audit Compliance:** Every automated response generates a timestamped entry for compliance reviews.

---

## 📂 Project Organization

```bash
soar-lite/
├── src/                    # System Logic
│   ├── log_collector/      # Normalization and ingestion
│   ├── detection_engine/   # SIEM/Rule-based analyzer
│   ├── response_engine/    # SOAR-driven mitigation
│   ├── dashboard/          # SOC Management Interface
│   └── utils/              # Data storage and utilities
├── documentation/          # Professional Documentation
│   ├── Architecture_Report.md
│   ├── Setup_and_Features_Guide.md
│   └── Test_Plan_and_Validation_Guide.md
├── instructions/           # Operational Resources
│   └── CLOUD_ASSISTANT_PROMPT.md
├── configs/                # Security rule-book (JSON)
├── data/                   # Log storage and samples
├── scripts/                # Pipeline automation
├── docker/                 # Deployment logic
├── requirements.txt
└── README.md
```

---

## 🛠️ Execution & Deployment

### Local Setup
1.  **Initialize Security Data:**
    ```bash
    python scripts/run_pipeline.py
    ```
2.  **Launch Management Console:**
    ```bash
    python src/dashboard/app.py
    ```

### Docker Deployment
```bash
docker build -t soar-lite -f docker/Dockerfile .
docker run -p 5000:5000 soar-lite
```

---

## 🏗️ Real-World Use Case

**Scenario: Automated Containment of Brute Force Attacks**
When an attacker makes multiple failed login attempts, my **Log Collector** fetches the events, the **Detection Engine** triggers the `Brute Force` rule, and the **SOAR Engine** instantly executes an automated block. You can then view the "ACTIVE BLOCK" on the dashboard and export forensic logs for compliance reports.

---

## 🤝 Project Support
For technical details or environment-specific questions, refer to the **Operational Resources** in the `instructions/` directory.
