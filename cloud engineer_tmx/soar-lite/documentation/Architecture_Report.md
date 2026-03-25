# 📐 SOAR-Lite: Architecture & System Design Report
**By: Ravi K.**

I've architected SOAR-Lite for modularity and scalability, following the standard Security Operations Center (SOC) framework.

---

## 🏛️ 1. My Centralized SOC Architecture

I have divided the platform into four distinct planes of operation to ensure clear separation of concerns:

1. **My Telemetry Plane (Ingestion):**
   - **Log Collector:** This is the entry point. I've designed it to connect to system authentication sinks (like `auth.log`) and other telemetry sources.
   - **Normalization:** It converts raw, unstructured log strings into a unified, secure SQLite format. This ensures my detection engine can run fast queries without parsing text repeatedly.

2. **My Analysis Plane (Detection):**
   - **Detection Engine:** This is the brain of the system. I've built a rule-based engine that evaluates normalized events against my configurable JSON rule-set.
   - **Threat Identification:** I use specific patterns, thresholds, and time-based criteria to distinguish between benign activity and malicious indicators (IOCs).

3. **My Response Plane (Orchestration & Automation):**
   - **SOAR Engine:** This component orchestrates automated response playbooks once a threat is identified.
   - **Active Mitigation:** I've implemented automated tasks such as IP filtering (blocking attackers in my firewall database) and forensic auditing of every response action.

4. **My Visualization Plane (Management Console):**
   - **SOC Dashboard:** A secure, real-time web portal I built with Flask so analysts can visualize telemetry, manage alerts, and audit firewall logs.
   - **Incident Reporting:** I've added automated data export capabilities (CSV) for compliance and forensic reporting.

---

## 🏗️ 2. My Data Lifecycle Workflow

1. **Ingest-Normalized:** Raw events are ingested from the infrastructure and stored in my `logs` table.
2. **Scan-Compare:** My Detection Engine compares every incoming log against my `detection_rules.json` rule-book.
3. **Trigger-Automate:** High-severity matches trigger my `BLOCK_IP` SOAR response.
4. **Audit-Present:** My orchestrated actions are logged in the `response_actions` and `blocked_ips` tables, then visualized on my SOC Dashboard.

---

## 🔒 3. My Tech Stack Rationale

-   **Python 3.10:** I chose Python for its high performance in log parsing and its robust library support for rule evaluation.
-   **Flask:** I used this for my dashboard because it's lightweight and secure.
-   **SQLite:** I chose SQLite for local data persistence—it's fast, serverless, and perfect for this modular architecture.
-   **Pandas:** I use Pandas for efficient incident report generation and CSV exports.
-   **Docker:** My entire project is containerized to ensure consistent security orchestration across any environment.

---

## 🛡️ 4. My Security Philosophy

My core philosophy with SOAR-Lite is **Automated Containment.** I want to reduce the 'Mean Time to Respond' (MTTR) by automating the initial triage of common attack vectors (like brute force). This allows me as an analyst to focus on more complex threat hunting.
