import sys
import os
import pytest
from datetime import datetime, timedelta

# Add the project root to sys.path to resolve src imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.detection_engine import DetectionEngine

@pytest.fixture
def engine():
    return DetectionEngine()

def test_brute_force_detection(engine):
    base_time = datetime(2023, 1, 1, 10, 0, 0)
    logs = []
    
    # Simulate 10 failed logins
    for i in range(10):
        logs.append({
            "timestamp": base_time + timedelta(seconds=i*10),
            "user": "admin",
            "ip": "10.0.0.1",
            "status": "failed"
        })
        
    alerts = engine.analyze(logs)
    assert len(alerts) == 1
    assert alerts[0]["type"] == "Brute Force Attack"
    assert alerts[0]["ip"] == "10.0.0.1"

def test_suspicious_login_new_ip(engine):
    base_time = datetime(2023, 1, 1, 10, 0, 0)
    
    logs = [
        # First login from normal IP
        {"timestamp": base_time, "user": "user1", "ip": "10.0.0.15", "status": "accepted"},
        # Second login from different IP
        {"timestamp": base_time + timedelta(hours=1), "user": "user1", "ip": "10.10.10.10", "status": "accepted"}
    ]
    
    alerts = engine.analyze(logs)
    assert len(alerts) == 1
    assert alerts[0]["type"] == "Suspicious Login"
    assert alerts[0]["ip"] == "10.10.10.10"

def test_abnormal_login_time(engine):
    # Time outside 8-18 (e.g. 23:00)
    log_time = datetime(2023, 1, 1, 23, 0, 0)
    
    logs = [
        {"timestamp": log_time, "user": "nightowl", "ip": "10.0.0.50", "status": "accepted"}
    ]
    
    alerts = engine.analyze(logs)
    assert len(alerts) == 1
    assert alerts[0]["type"] == "Abnormal Login Time"
    assert alerts[0]["user"] == "nightowl"

def test_normal_login_no_alert(engine):
    # Time inside 8-18 (e.g. 10:00)
    log_time = datetime(2023, 1, 1, 10, 0, 0)
    
    logs = [
        {"timestamp": log_time, "user": "normaluser", "ip": "10.0.0.100", "status": "accepted"}
    ]
    
    alerts = engine.analyze(logs)
    assert len(alerts) == 0
