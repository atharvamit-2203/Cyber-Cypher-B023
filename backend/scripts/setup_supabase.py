import os
import psycopg2
import sys
import urllib.parse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    print("🚀 Starting Supabase Database Initialization...")
    
    # Connection string format: postgresql://postgres:[PASSWORD]@db.miklfwbuhqogjnztmmgo.supabase.co:5432/postgres
    # We ask the user for the password if not in env
    db_password = os.getenv("SUPABASE_DB_PASSWORD")
    if not db_password:
        print("⚠️  SUPABASE_DB_PASSWORD not found in .env")
        db_password = input("🔑 Please enter your Supabase Database Password: ")

    # Encode password to handle special characters like '@'
    encoded_password = urllib.parse.quote_plus(db_password)
    db_url = f"postgresql://postgres:{encoded_password}@db.miklfwbuhqogjnztmmgo.supabase.co:5432/postgres"

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        print("✅ Connected to Supabase Postgres database.")

        # 1. Enable UUID Extension
        cur.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")

        # 2. Create Tables
        tables = {
            "merchants": """
                CREATE TABLE IF NOT EXISTS merchants (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name TEXT NOT NULL,
                    migration_step INT DEFAULT 1,
                    total_steps INT DEFAULT 5,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """,
            "customers": """
                CREATE TABLE IF NOT EXISTS customers (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    merchant_id UUID REFERENCES merchants(id),
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    avatar_url TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """,
            "engineers": """
                CREATE TABLE IF NOT EXISTS engineers (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT DEFAULT 'DevOps Lead',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """,
            "tickets": """
                CREATE TABLE IF NOT EXISTS tickets (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    merchant_id UUID REFERENCES merchants(id),
                    title TEXT NOT NULL,
                    description TEXT,
                    category TEXT,
                    status TEXT DEFAULT 'open',
                    priority TEXT DEFAULT 'medium',
                    agent_status TEXT DEFAULT 'observing',
                    confidence FLOAT DEFAULT 0.0,
                    risk_level TEXT DEFAULT 'low',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """,
            "chat_history": """
                CREATE TABLE IF NOT EXISTS chat_history (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    ticket_id UUID REFERENCES tickets(id),
                    role TEXT NOT NULL, -- 'customer', 'engineer', 'ai'
                    sender_id TEXT, -- email or name
                    message TEXT NOT NULL,
                    type TEXT DEFAULT 'text', -- 'text', 'reasoning', 'action'
                    metadata JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """,
            "api_logs": """
                CREATE TABLE IF NOT EXISTS api_logs (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    merchant_id UUID REFERENCES merchants(id),
                    endpoint TEXT NOT NULL,
                    status INT,
                    error TEXT,
                    count INT DEFAULT 1,
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """,
            "products": """
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    price FLOAT NOT NULL,
                    category TEXT,
                    image TEXT,
                    description TEXT,
                    stock INT DEFAULT 0,
                    tags TEXT[]
                );
            """,
            "agent_actions": """
                CREATE TABLE IF NOT EXISTS agent_actions (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    ticket_id UUID REFERENCES tickets(id),
                    type TEXT NOT NULL,
                    description TEXT,
                    impact TEXT,
                    risk TEXT,
                    confidence FLOAT,
                    requires_approval BOOLEAN DEFAULT TRUE,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """
        }

        for table_name, schema in tables.items():
            print(f"📦 Creating table: {table_name}...")
            cur.execute(schema)
        
        # 3. Insert Initial Demo Data
        cur.execute("SELECT id FROM merchants WHERE name = 'Fashion Hub' LIMIT 1;")
        merchant = cur.fetchone()
        if not merchant:
            print("👤 Inserting demo merchant: Fashion Hub")
            cur.execute("INSERT INTO merchants (name, migration_step, total_steps) VALUES ('Fashion Hub', 3, 5) RETURNING id;")
            merchant_id = cur.fetchone()[0]
        else:
            merchant_id = merchant[0]

        # Insert 5 Customers
        demo_customers = [
            ('Alex Chen', 'alex@example.com', 'pass123'),
            ('Sarah Miller', 'sarah@example.com', 'pass456'),
            ('David Kumar', 'david@example.com', 'pass789'),
            ('Elena Rossi', 'elena@example.com', 'pass321'),
            ('Jordan Smith', 'jordan@example.com', 'pass654')
        ]
        
        for name, email, pwd in demo_customers:
            cur.execute("SELECT id FROM customers WHERE email = %s LIMIT 1;", (email,))
            if not cur.fetchone():
                print(f"👤 Inserting demo customer: {name}")
                cur.execute("INSERT INTO customers (merchant_id, email, name, password) VALUES (%s, %s, %s, %s);", (merchant_id, email, name, pwd))

        # Insert Engineer
        eng_email = 'atharvamitdeshpande2203@gmail.com'
        eng_pass = '0809202327'
        cur.execute("SELECT id FROM engineers WHERE email = %s LIMIT 1;", (eng_email,))
        if not cur.fetchone():
            print(f"🛠️ Inserting admin engineer: {eng_email}")
            cur.execute("INSERT INTO engineers (email, name, password) VALUES (%s, %s, %s);", (eng_email, 'Atharva Amit', eng_pass))

        conn.commit()
        print("\n✨ Database initialized successfully!")
        print("🔗 View your tables in the Supabase Dashboard: https://supabase.com/dashboard/project/miklfwbuhqogjnztmmgo/editor")

    except Exception as e:
        print(f"❌ Error initializing database: {e}")
    finally:
        if 'conn' in locals():
            cur.close()
            conn.close()

if __name__ == "__main__":
    setup_database()
