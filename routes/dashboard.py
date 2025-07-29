# routes/dashboard.py
###########################################
# - Routes for Dashboard and Root Pages
###########################################

from flask import Blueprint, render_template

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='')

@dashboard_bp.route('/')
def home():
    """
    Dashboard landing page.
    """
    return render_template('html/dashboard.html')

@dashboard_bp.route('/upload_test')
def upload_test():
    """
    Temporary route to test file upload interface.
    """
    return render_template('html/includes/upload_test.html')
