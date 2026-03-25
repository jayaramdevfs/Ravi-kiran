import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../../data/soar_lite.db')

def get_db_connection():
    """Returns a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema for the SOAR-Lite system."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Log table for raw and normalized data
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            log_source TEXT,
            ip TEXT,
            username TEXT,
            event_type TEXT,
            event_status TEXT,
            raw_data TEXT
        )
    ''')

    # Alert table for security incidents
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            rule_name TEXT,
            severity TEXT,
            source_ip TEXT,
            target_user TEXT,
            description TEXT,
            status TEXT DEFAULT 'New'
        )
    ''')

    # Blocked IP list for active firewall simulation
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blocked_ips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT UNIQUE,
            reason TEXT,
            blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Audit trail for automated responses
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS response_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            action_type TEXT,
            target TEXT,
            reason TEXT,
            status TEXT
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
