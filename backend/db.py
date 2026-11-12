"""
db.py — Oracle Database 11g Connection Layer
JATRA Railway Management System
"""

import os
import oracledb
from dotenv import load_dotenv

# Load .env
load_dotenv()

# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DB_USER = os.getenv("DB_USER", "jatra")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_DSN = os.getenv("DB_DSN", "localhost:1521/XE")

ORACLE_CLIENT_PATH = os.getenv("ORACLE_CLIENT_PATH", "").strip()

_oracle_initialized = False
_dll_directory = None


# ============================================================
# ORACLE CLIENT INITIALIZATION
# ============================================================

def init_oracle_client():
    """
    Initialize Oracle 11g Client in Thick Mode.

    This must happen before the first Oracle connection.
    """

    global _oracle_initialized
    global _dll_directory

    # Already initialized
    if _oracle_initialized:
        return

    # Check path
    if not ORACLE_CLIENT_PATH:
        raise EnvironmentError(
            "ORACLE_CLIENT_PATH is not set in .env"
        )

    # Convert to absolute path
    client_path = os.path.abspath(ORACLE_CLIENT_PATH)

    print(f"[DB] Oracle Client path: {client_path}")
    print(f"[DB] Oracle Client exists: {os.path.isdir(client_path)}")

    # Check OCI DLL
    oci_dll = os.path.join(client_path, "oci.dll")

    print(f"[DB] OCI DLL path: {oci_dll}")
    print(f"[DB] OCI DLL exists: {os.path.isfile(oci_dll)}")

    if not os.path.isfile(oci_dll):
        raise FileNotFoundError(
            f"oci.dll was not found in: {client_path}"
        )

    try:
        # ----------------------------------------------------
        # Windows DLL search path
        # ----------------------------------------------------
        #
        # Python 3.8+ provides os.add_dll_directory().
        # This helps Windows locate Oracle's dependent DLLs.
        #
        if hasattr(os, "add_dll_directory"):
            _dll_directory = os.add_dll_directory(client_path)
            print("[DB] Oracle DLL directory added to Windows DLL search path.")

        # ----------------------------------------------------
        # Initialize python-oracledb Thick Mode
        # ----------------------------------------------------

        oracledb.init_oracle_client(
            lib_dir=client_path
        )

        _oracle_initialized = True

        print(
            f"[DB] Oracle Client initialized successfully from: "
            f"{client_path}"
        )

    except Exception as e:

        print(f"[DB] Oracle initialization error: {e}")

        raise RuntimeError(
            f"[DB] Failed to initialize Oracle Client: {e}"
        )


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_connection():
    """
    Return a new Oracle database connection.
    """

    if not _oracle_initialized:
        init_oracle_client()

    try:

        conn = oracledb.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            dsn=DB_DSN
        )

        return conn

    except oracledb.DatabaseError as e:

        error_obj, = e.args

        raise ConnectionError(
            f"[DB] Oracle connection failed "
            f"(ORA-{error_obj.code}): "
            f"{error_obj.message}"
        )


# ============================================================
# ORACLE CONNECTION CONTEXT MANAGER
# ============================================================

class OracleConnection:
    """
    Context manager for safe Oracle connections.

    Automatically commits on success
    and rolls back on exception.
    """

    def __init__(self):
        self.conn = None
        self.cursor = None

    def __enter__(self):

        self.conn = get_connection()
        self.cursor = self.conn.cursor()

        return self.conn, self.cursor

    def __exit__(
        self,
        exc_type,
        exc_val,
        exc_tb
    ):

        # Rollback if an exception occurred
        if exc_type is not None:

            if self.conn:

                try:
                    self.conn.rollback()
                except Exception:
                    pass

        # Otherwise commit
        else:

            if self.conn:

                try:
                    self.conn.commit()

                except Exception as commit_err:

                    try:
                        self.conn.rollback()
                    except Exception:
                        pass

                    raise commit_err

        # Close cursor
        if self.cursor:

            try:
                self.cursor.close()
            except Exception:
                pass

        # Close connection
        if self.conn:

            try:
                self.conn.close()
            except Exception:
                pass

        return False


# ============================================================
# CONNECTION TEST
# ============================================================

def test_connection():
    """
    Test Oracle database connection.
    Used by /api/health.
    """

    try:

        with OracleConnection() as (conn, cursor):

            cursor.execute("SELECT 1 FROM DUAL")

            row = cursor.fetchone()

            return row is not None

    except Exception as e:

        print(f"[DB] Connection test failed: {e}")

        return False