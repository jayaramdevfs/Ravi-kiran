import os
import sys
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import pandas as pd

# Adjust path for local imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.database import get_db_connection

app = Flask(__name__)
app.secret_key = 'soar_lite_security_key'

@app.route('/')
def dashboard():
    """Main SOC dashboard view."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get recent logs
    cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 20")
    logs = cursor.fetchall()

    # Get recent alerts
    cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 20")
    alerts = cursor.fetchall()

    # Get current firewall blocks
    cursor.execute("SELECT * FROM blocked_ips ORDER BY blocked_at DESC")
    blocked_ips = cursor.fetchall()

    # Aggregate key metrics
    cursor.execute("SELECT COUNT(*) FROM logs")
    total_logs = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM alerts WHERE status = 'New'")
    total_alerts = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM blocked_ips")
    total_blocked = cursor.fetchone()[0]

    conn.close()
    return render_template('dashboard.html', 
                             logs=logs, 
                             alerts=alerts, 
                             blocked_ips=blocked_ips,
                             total_logs=total_logs,
                             total_alerts=total_alerts,
                             total_blocked=total_blocked)

@app.route('/logs')
def logs_view():
    """Detailed log search and view."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100")
    logs = cursor.fetchall()
    conn.close()
    return render_template('logs.html', logs=logs)

@app.route('/alerts')
def alerts_view():
    """Security alert management view."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC")
    alerts = cursor.fetchall()
    conn.close()
    return render_template('alerts.html', alerts=alerts)

@app.route('/blocked_ips')
def blocked_ips_view():
    """Firewall and mitigation management."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM blocked_ips ORDER BY blocked_at DESC")
    blocked_ips = cursor.fetchall()
    conn.close()
    return render_template('blocked_ips.html', blocked_ips=blocked_ips)

@app.route('/export/csv')
def export_csv():
    """Generate incident report in CSV format."""
    conn = get_db_connection()
    query = "SELECT * FROM alerts"
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    file_path = os.path.join(os.path.dirname(__file__), '../../data/alerts_report.csv')
    df.to_csv(file_path, index=False)
    return jsonify({"status": "success", "message": f"Security report successfully exported to {file_path}"})

@app.route('/api/ingest', methods=['POST'])
def trigger_ingest():
    """Trigger the manual scanning and detection pipeline."""
    from log_collector.collector import LogCollector
    from detection_engine.engine import DetectionEngine
    
    base_path = os.path.dirname(os.path.abspath(__file__))
    log_path = os.path.join(base_path, '../../data/sample_logs/auth.log')
    rules_path = os.path.join(base_path, '../../configs/detection_rules.json')
    
    collector = LogCollector(log_path)
    collector.ingest_logs()
    
    engine = DetectionEngine(rules_path)
    engine.process_logs()
    
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
