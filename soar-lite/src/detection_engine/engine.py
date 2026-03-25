import json
import os
import sys
from datetime import datetime

# Adjust path for local imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.database import get_db_connection

class DetectionEngine:
    """
    Evaluates logged events against security rules and triggers automated responses.
    """
    def __init__(self, rules_path):
        self.rules_path = rules_path
        self.rules = self.load_rules()

    def load_rules(self):
        """Loads security rules from the JSON configuration."""
        with open(self.rules_path, 'r') as f:
            return json.load(f)['rules']

    def process_logs(self):
        """Processes logs and applies relevant detection rules."""
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch recent logs for evaluation
        cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100")
        logs = cursor.fetchall()

        for rule in self.rules:
            if rule['name'] == 'Brute Force Detection':
                self.detect_brute_force(logs, rule, cursor)
            elif rule['name'] == 'Suspicious IP Check':
                self.detect_suspicious_ip(logs, rule, cursor)
            elif rule['name'] == 'Unusual Login Time':
                self.detect_unusual_login_time(logs, rule, cursor)

        conn.commit()
        conn.close()

    def detect_brute_force(self, logs, rule, cursor):
        """Identifies brute force attempts based on threshold of failures."""
        failed_attempts = {}
        for log in logs:
            if log['event_type'] == rule['event_type']:
                ip = log['ip']
                failed_attempts[ip] = failed_attempts.get(ip, 0) + 1

        for ip, count in failed_attempts.items():
            if count >= rule['threshold']:
                self.trigger_alert(rule, ip, 'multiple_failed_users', f"Brute force attempt detected: {count} failures from {ip}", cursor)

    def detect_suspicious_ip(self, logs, rule, cursor):
        """Flags activity from known malicious IP addresses."""
        for log in logs:
            if log['ip'] in rule['malicious_ips']:
                self.trigger_alert(rule, log['ip'], log['username'], f"Access from known suspicious IP: {log['ip']}", cursor)

    def detect_unusual_login_time(self, logs, rule, cursor):
        """Monitors logins during non-standard operational hours."""
        for log in logs:
            if log['event_type'] == rule['event_type']:
                try:
                    ts = datetime.strptime(log['timestamp'], '%Y-%m-%d %H:%M:%S')
                    if rule['start_hour'] <= ts.hour <= rule['end_hour']:
                        self.trigger_alert(rule, log['ip'], log['username'], f"Login at unusual hour ({ts.hour}:00) for user {log['username']}", cursor)
                except:
                    pass

    def trigger_alert(self, rule, ip, user, description, cursor):
        """Maintains the alert database and triggers automated mitigations."""
        cursor.execute("SELECT id FROM alerts WHERE rule_name = ? AND source_ip = ? AND status = 'New'", (rule['name'], ip))
        if cursor.fetchone():
            return

        cursor.execute('''
            INSERT INTO alerts (rule_name, severity, source_ip, target_user, description)
            VALUES (?, ?, ?, ?, ?)
        ''', (rule['name'], rule['severity'], ip, user, description))
        
        print(f"[SECURITY ALERT] {rule['severity']} - Rule: {rule['name']} | Source IP: {ip}")

        # Execute automated SOAR response if configured
        if rule.get('action') == 'BLOCK_IP':
            self.execute_response(ip, 'BLOCK_IP', description, cursor)

    def execute_response(self, target, action_type, reason, cursor):
        """Logs and executes automated incident response actions."""
        cursor.execute('''
            INSERT INTO response_actions (action_type, target, reason, status)
            VALUES (?, ?, ?, ?)
        ''', (action_type, target, reason, 'Automated'))
        
        if action_type == 'BLOCK_IP':
            cursor.execute("INSERT OR IGNORE INTO blocked_ips (ip, reason) VALUES (?, ?)", (target, reason))
            print(f"[SOAR ACTION] Automated Response: {action_type} for {target}")

if __name__ == '__main__':
    engine = DetectionEngine('../../configs/detection_rules.json')
    engine.process_logs()
