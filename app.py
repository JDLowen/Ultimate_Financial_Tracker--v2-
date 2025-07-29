# app.py
###########################################
# - Main Flask Application Entry Point
###########################################

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from models import db, USAFRetirementPay, VADisabilityPay, RentalProperty, UploadedFile
from datetime import datetime

import os
import logging

###########################################
# - Initialize Flask App
###########################################

app = Flask(
    __name__,
    template_folder='templates',  # Points to templates/
    static_folder='static'        # Points to static/
)

# Project base directory
basedir = os.path.abspath(os.path.dirname(__file__))

# Secret key for sessions & security
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_very_secret_and_random_key_for_dev')

# SQLite database location
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'data', 'database.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# File Upload Path
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')

# Ensure necessary folders exist
os.makedirs('data', exist_ok=True)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

###########################################
# - Logging Configuration
###########################################

if not app.debug:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    app.logger.info('Application starting up...')

###########################################
# - Register Blueprints
###########################################

# Initialize the DB with the app
db.init_app(app)

# Load and register all blueprints centrally
from routes import register_blueprints
register_blueprints(app)

###########################################
# - Base Routes
###########################################

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """
    Serves uploaded files from the uploads directory.
    """
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

###########################################
# - Run the App
###########################################

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            print("✅ Databases created successfully!")
        except Exception as e:
            print(f" Error creating databases: {e}")
            app.logger.error(f"Error creating databases: {e}")

    app.run(debug=True, host='0.0.0.0', port=5000)



