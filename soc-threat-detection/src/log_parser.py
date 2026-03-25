import re
from datetime import datetime

class LogParser:
    def __init__(self):
        # Regex to match generic linux auth log format with 'Failed' or 'Accepted'
        self.log_pattern = re.compile(
            r'(?P<date>[A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+\S+\s+.*?'
            r'(?P<status>Failed|Accepted)\s+password\s+for\s+(?:invalid\s+user\s+)?'
            r'(?P<user>\S+)\s+from\s+(?P<ip>\S+)\s+port'
        )
        self.current_year = datetime.now().year

    def parse_line(self, line: str) -> dict:
        """
        Parses a single log line and extracts timestamp, user, ip, status.
        Returns a dictionary or None if it doesn't match the pattern.
        """
        match = self.log_pattern.search(line)
        if match:
            date_str = match.group('date')
            try:
                # Add current year to timestamp as syslog usually omits it
                timestamp = datetime.strptime(f"{self.current_year} {date_str}", "%Y %b %d %H:%M:%S")
            except ValueError:
                timestamp = date_str
                
            return {
                "timestamp": timestamp,
                "user": match.group('user'),
                "ip": match.group('ip'),
                "status": match.group('status').lower()
            }
        return None

    def parse_file(self, file_path: str) -> list:
        """Reads and parses an entire log file."""
        parsed_logs = []
        try:
            with open(file_path, 'r') as file:
                for line in file:
                    parsed = self.parse_line(line)
                    if parsed:
                        parsed_logs.append(parsed)
        except FileNotFoundError:
            print(f"Error: Log file {file_path} not found.")
        return parsed_logs
