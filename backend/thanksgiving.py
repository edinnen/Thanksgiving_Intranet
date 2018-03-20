import os
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, send_from_directory, jsonify

app = Flask(__name__)

app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'thanksgiving.db')
))
app.config.from_envvar('THANKSGIVING_SETTINGS', silent=True)

def connect_db():
    """Connects to the specific database"""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv

def get_db():
    """Opens a new database connection if there is none yet for the current application context"""
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request"""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

def init_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

@app.cli.command('initdb')
def initdb_command():
    """Initializes the database"""
    init_db()
    print('Initialized the database.')


@app.route('/')
def api_index():
    return "This is the API"

@app.route('/getLogs')
def get_entries():
    db = get_db()
    cur = db.execute('select members, entry from logs order by id desc')
    entries = cur.fetchall()
    return jsonify({'data': map(dict, entries)})

@app.route('/addLog', methods=['POST'])
def add_entry():
    db = get_db()
    db.execute('insert into logs (members, entry) values (?, ?)',
                [request.form['members'], request.form['entry']])
    db.commit()
    print('Added new entry')
    return true

@app.route('/stats')
def gen_stats():
    return "This is the stats route"

if __name__ == '__main__':
    app.run(debug=True)
