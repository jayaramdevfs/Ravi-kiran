import json
import os

class AlertManager:
    def __init__(self, output_file="incident_report.json"):
        self.output_file = output_file
        self.alerts = []

    def process_alerts(self, new_alerts: list):
        if not new_alerts:
            print("[✓] No threats detected.")
            return

        for alert in new_alerts:
            self.alerts.append(alert)
            self.display_alert(alert)
            
        self.save_to_file()

    def display_alert(self, alert: dict):
        print("\n" + "="*40)
        print("SECURITY ALERT")
        print(f"Type: {alert['type']}")
        print(f"User: {alert['user']}")
        print(f"IP: {alert['ip']}")
        if 'attempts' in alert:
            print(f"Attempts: {alert['attempts']}")
        if 'desc' in alert:
            print(f"Details: {alert['desc']}")
        print("="*40)

    def save_to_file(self):
        try:
            with open(self.output_file, 'w') as f:
                json.dump(self.alerts, f, indent=4)
            print(f"\n[+] Saved {len(self.alerts)} alerts to {self.output_file}")
        except Exception as e:
            print(f"Error saving alerts: {e}")
