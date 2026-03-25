# ☁️ Operational Resource: Cloud Assistant Context

**Note to the user:** Copy and paste the prompt below into your AI assistant (ChatGPT, Claude, etc.) to get expert-level support for this project.

---

### **SOC Architect Mentor Prompt**

> "I am a Security Engineer (Ravi) working on my **SOAR-Lite** project. This is a modular SOC and SOAR platform built with Python, Flask, and SQLite that I designed to automate incident response.
>
> I need you to act as my **Senior Security Mentor**. Help me refine this project, troubleshoot environment issues, and prepare for architectural deep-dives.
>
> **My Project Architecture:**
> -   **Log Collector (`src/log_collector/`):** Normalizes telemetry from `auth.log` into our SQLite warehouse.
> -   **Detection Engine (`src/detection_engine/`):** A rule-based SIEM component that evaluates JSON-defined security rules.
> -   **Response Engine (`src/response_engine/`):** Orchestrates automated mitigations, like our IP blocking playbook.
> -   **Management Console (`src/dashboard/`):** A Flask-based interface for real-time monitoring and reporting.
>
> **How you can support me:**
> 1.  **Code Review:** If I share an update I've made to the detection logic, review it for performance and false-positive reduction.
> 2.  **Scenario Planning:** Suggest more complex 'Detection Rules' (e.g., multi-stage attacks) I can add to my `configs/detection_rules.json`.
> 3.  **Interview Prep:** Roleplay a CISO or a Lead SOC Engineer. Ask me technical questions about my 'Automated Response Lifecycle' and how I handle data persistence in SQLite.
> 4.  **Scaling:** Discuss how I could migrate this from a local SQLite setup to a cloud-native ELK stack or PostgreSQL for production scaling.
>
> **Let's start by reviewing the 'Brute Force Detection' threshold. Should I stick with 3 attempts in 5 minutes, or is that too aggressive for a corporate environment? Give me your professional perspective."**

---

### **How to Use This Resource:**
-   **When to use:** Use this whenever you're adding new features or preparing for a technical demonstration.
-   **Platform:** Optimized for GPT-4o, Claude 3.5 Sonnet, or similar advanced models.
-   **Perspective:** This prompt establishes you as the creator and lead engineer of the project.
