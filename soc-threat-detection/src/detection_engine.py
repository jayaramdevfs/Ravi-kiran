from datetime import datetime, timedelta

class DetectionEngine:
    def __init__(self):
        self.failed_attempts = {}  # Format: { 'ip': [(timestamp, user), ...] }
        self.user_ips = {}         # Format: { 'user': set(ips) }
        
        # Threat parameters
        self.BRUTE_FORCE_THRESHOLD = 10
        self.BRUTE_FORCE_WINDOW_MINUTES = 5
        self.NORMAL_START_HOUR = 8
        self.NORMAL_END_HOUR = 18

    def analyze(self, parsed_logs: list) -> list:
        alerts = []
        for log in parsed_logs:
            timestamp = log['timestamp']
            user = log['user']
            ip = log['ip']
            status = log['status']
            
            # 1. Abnormal Login Time Detection
            if status == 'accepted':
                if isinstance(timestamp, datetime):
                    if not (self.NORMAL_START_HOUR <= timestamp.hour < self.NORMAL_END_HOUR):
                        alerts.append({
                            "type": "Abnormal Login Time",
                            "user": user,
                            "ip": ip,
                            "desc": f"Login outside normal hours ({self.NORMAL_START_HOUR}:00 - {self.NORMAL_END_HOUR}:00)"
                        })
                
                # 2. Suspicious Login Detection (New IP)
                if user not in self.user_ips:
                    self.user_ips[user] = set()
                elif ip not in self.user_ips[user]:
                    alerts.append({
                        "type": "Suspicious Login",
                        "user": user,
                        "ip": ip,
                        "desc": "Login from a new IP address for this user."
                    })
                self.user_ips[user].add(ip)
                
            # 3. Brute Force Detection
            if status == 'failed':
                if ip not in self.failed_attempts:
                    self.failed_attempts[ip] = []
                self.failed_attempts[ip].append((timestamp, user))
                
                # Filter old attempts
                if isinstance(timestamp, datetime):
                    cutoff_time = timestamp - timedelta(minutes=self.BRUTE_FORCE_WINDOW_MINUTES)
                    self.failed_attempts[ip] = [
                        attempt for attempt in self.failed_attempts[ip] 
                        if isinstance(attempt[0], datetime) and attempt[0] >= cutoff_time
                    ]
                
                if len(self.failed_attempts[ip]) >= self.BRUTE_FORCE_THRESHOLD:
                    alerts.append({
                        "type": "Brute Force Attack",
                        "user": user,
                        "ip": ip,
                        "attempts": len(self.failed_attempts[ip])
                    })
                    # Reset after alert to avoid spamming
                    self.failed_attempts[ip] = []
                    
        return alerts
