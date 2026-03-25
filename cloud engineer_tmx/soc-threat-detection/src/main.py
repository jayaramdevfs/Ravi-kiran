import sys
import argparse
from log_parser import LogParser
from detection_engine import DetectionEngine
from alert_manager import AlertManager

def main():
    parser = argparse.ArgumentParser(description="SOC Threat Detection Log Analyzer")
    parser.add_argument("log_file", help="Path to the authentication log file to analyze")
    args = parser.parse_args()

    print(f"[*] Analyzing log file: {args.log_file}")
    
    # Initialize components
    log_parser = LogParser()
    detection_engine = DetectionEngine()
    alert_manager = AlertManager()

    # Process logs
    parsed_logs = log_parser.parse_file(args.log_file)
    print(f"[*] Parsed {len(parsed_logs)} log entries.")

    # Analyze for threats
    print("[*] Running detection engine...")
    alerts = detection_engine.analyze(parsed_logs)

    # Manage alerts
    alert_manager.process_alerts(alerts)

if __name__ == "__main__":
    main()
