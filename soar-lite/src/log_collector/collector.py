import os
import re
import sys
from datetime import datetime

# Adjust path for local imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.database import get_db_connection

class LogCollector:
    """
    Parses and ingests log files into the SOC database.
    """
    def __init__(self, log_path, log_source='auth.log'):
        self.log_path = log_path
        self.log_source = log_source

    def parse_auth_log_line(self, line):
        """
        Parses a standard log line into structured records.
        """
        try:
            timestamp_str = line[:19]
            timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
            
            # Extract event details using pattern matching
            if "Failed login" in line:
                match = re.search(r"Failed login for user (\w+) from ([\d\.]+)", line)
                if match:
                    return {
                        'timestamp': timestamp,
                        'username': match.group(1),
                        'ip': match.group(2),
                        'event_type': 'LoginFailure',
                        'event_status': 'Failure'
                    }
            elif "Successful login" in line:
                match = re.search(r"Successful login for user (\w+) from ([\d\.]+)", line)
                if match:
                    return {
                        'timestamp': timestamp,
                        'username': match.group(1),
                        'ip': match.group(2),
                        'event_type': 'LoginSuccess',
                        'event_status': 'Success'
                    }
            elif "Access request" in line:
                match = re.search(r"Access request from ([\d\.]+) to (\S+)", line)
                if match:
                    return {
                        'timestamp': timestamp,
                        'username': 'unknown',
                        'ip': match.group(1),
                        'event_type': 'Access',
                        'event_status': 'N/A'
                    }
            return None
        except Exception as e:
            print(f"Error parsing line: {e}")
            return None

    def ingest_logs(self):
        """Reads the log file and stores parsed data in SQLite."""
        if not os.path.exists(self.log_path):
            print(f"Log file not found: {self.log_path}")
            return

        conn = get_db_connection()
        cursor = conn.cursor()

        with open(self.log_path, 'r') as f:
            for line in f:
                parsed_data = self.parse_auth_log_line(line.strip())
                if parsed_data:
                    cursor.execute('''
                        INSERT INTO logs (timestamp, log_source, ip, username, event_type, event_status, raw_data)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        parsed_data['timestamp'], 
                        self.log_source, 
                        parsed_data['ip'], 
                        parsed_data['username'], 
                        parsed_data['event_type'], 
                        parsed_data['event_status'], 
                        line.strip()
                    ))
        
        conn.commit()
        conn.close()
        print(f"Successfully ingested logs from {self.log_path}")

if __name__ == '__main__':
    collector = LogCollector('../../data/sample_logs/auth.log')
    collector.ingest_logs()
