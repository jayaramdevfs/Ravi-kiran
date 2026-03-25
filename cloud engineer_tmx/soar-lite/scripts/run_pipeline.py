import os
import sys

# Add src to the library path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from utils.database import init_db
from log_collector.collector import LogCollector
from detection_engine.engine import DetectionEngine

def run_pipeline():
    """
    Simulates a live security pipeline by running ingestion and detection sequentially.
    """
    print("=" * 60)
    print("SOAR-Lite: SOC Pipeline Execution Console")
    print("=" * 60)
    
    # Initialize the centralized security database
    print("\n[STEP 1] Initializing SOC Database Warehouse...")
    init_db()
    
    # Establish file paths for sample logs and configurations
    current_dir = os.path.dirname(os.path.abspath(__file__))
    log_path = os.path.join(current_dir, '..', 'data', 'sample_logs', 'auth.log')
    rules_path = os.path.join(current_dir, '..', 'configs', 'detection_rules.json')
    
    # Stage 1: Ingest log telemetry from the infrastructure
    print(f"[STEP 2] Ingesting log telemetry from {log_path}...")
    collector = LogCollector(log_path)
    collector.ingest_logs()
    
    # Stage 3: Execute the detection rules and automated mitigations
    print("[STEP 3] Executing Detection Engine & Automated Mitigation Rule-set...")
    engine = DetectionEngine(rules_path)
    engine.process_logs()
    
    print("\n" + "=" * 60)
    print("Infrastructure Scan & Response Pipeline Completed Successfully.")
    print("Run `python src/dashboard/app.py` to monitor the environment.")
    print("=" * 60)

if __name__ == "__main__":
    run_pipeline()
