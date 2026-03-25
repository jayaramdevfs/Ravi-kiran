# 🛡️ Architectural & Threat Assessment Report 
**Project**: SOC Threat Detection Log Analyzer  

### **1. Executive Summary**
The **SOC Threat Detection Log Analyzer** is a lightweight, scalable, and modular telemetry processing utility designed to replicate the ingestions, parsing, and detection pipelines typical of modern Security Information and Event Management (SIEM) systems. 

This tool serves to proactively identify anomalies in authentication attempts (such as SSH access loops) by mapping raw event data directly against a suite of behavioral indicators of compromise (IoC). The tool is structurally encapsulated inside a Docker container to adhere to strict DevSecOps deployment standards.

### **2. Architectural Design & Pipeline**
The architecture is deliberately broken down into modular micro-components representing the four fundamental pillars of SOC operations:

*   **Ingestion Phase (`logs/`)**: Accepts untampered, raw structural data mimicking physical endpoint logs (Linux `auth.log`).
*   **Parsing Phase (`log_parser.py`)**: Utilizes robust RegEx mechanisms to normalize unstructured `syslog` output into structured key-value telemetry (JSON/Dictionary) while gracefully handling edge cases and malformed lines.
*   **Detection Engine (`detection_engine.py`)**: Acts as the centralized intelligence hub. This engine maintains state across events using sliding-window tracking to perform correlation across multiple independent log lines.
*   **Alert Generation (`alert_manager.py`)**: Operates as the SIEM front-end, raising high-fidelity alerts to console stdout for analysts, while asynchronously committing persistent artifacts to `incident_report.json` for forensic auditing.

### **3. Attacker Persona & Threat Models Validated**
The analyzer correctly models behavior and hunts for three distinct adversarial techniques aligned with the MITRE ATT&CK Framework:

1. **Brute Force (T1110.001 - Password Guessing):**
   * *Mechanism:* The engine calculates volumetric metrics against source IPs within a sliding 5-minute time boundary. Exceeding 10 failed login failures drops a high-severity alert. This defeats slow-roll brute forcing while effectively catching noisy automated bots.
2. **Suspicious Login via Anomaly Detection (T1078 - Valid Accounts):**
   * *Mechanism:* Statefully maps known healthy Source IPs to Valid User Accounts. If a previously authenticated credential is suddenly utilized from an anomalous/unseen IPv4 address, an Impersonation/Hijacking alert is raised.
3. **Time-Based Behavioral Deviation (T1078 - Valid Accounts):**
   * *Mechanism:* Audits the temporal cadence of valid logins against normal corporate access hours (08:00 - 18:00). Logins successfully completed during irregular, "off-hours" are flagged under the presumption of insider threats or initial-access brokering post-exploitation.

### **4. Security Validation & DevSecOps Maturity**
From a software engineering security perspective, this tool ranks highly due to the inclusion of essential DevSecOps artifacts:
* **CI/CD Readiness:** The codebase includes a robust unit test suite (`test_detection.py`) executed smoothly by `pytest`, enforcing that subsequent code adjustments do not break our core threat-hunting rules.
* **Containerization (`Dockerfile`):** The program uses a minimal `python:3.9-slim` base image, effectively reducing the active attack surface of the app environment, ensuring fast deployments and immutable runtime behavior.
* **Documentation (`README.md`):** Comprehensive enough to function as standard operating procedures (SOPs) for Tier-1 SOC analysts who might deploy or maintain the asset. 

### **5. Future Roadmap**
This project lays out a solid and foundational architecture for custom incident detection. The logic integrates practical threat intelligence concepts with scalable backend engineering patterns. 

**Next-Step Expansion Opportunities (V2 Roadmap):**
* Integration with a threat intelligence feed (e.g., AbuseIPDB) to dynamically enrich malicious IP addresses.
* Emitting alerts externally via webhooks (Slack/Discord) simulating actual PagerDuty/SOC escalation paths. 
