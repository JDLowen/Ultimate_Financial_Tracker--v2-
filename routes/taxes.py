# routes/taxes.py
###########################################
# - Routes for Taxes
###########################################

from flask import Blueprint, render_template

# Create a Blueprint for taxes
tax_bp = Blueprint('taxes', __name__, url_prefix='/taxes')

@tax_bp.route('/1040')
def taxes_1040():
    """
    Renders the 1040 Tax Tracker page.
    """
    return render_template('html/taxes/1040.html')

@tax_bp.route('/jdl_global_tax_tracker')
def taxes_jdl_global():
    """
    Renders the JDL Global Tax Tracker page.
    """
    return render_template('html/taxes/jdl_global_tax_tracker.html')

@tax_bp.route('/jdl_texas_tax_tracker')
def taxes_jdl_texas():
    """
    Renders the JDL Texas Tax Tracker page.
    """
    return render_template('html/taxes/jdl_texas_tax_tracker.html')

@tax_bp.route('/jdl_virginia_tax_tracker')
def taxes_jdl_virginia():
    """
    Renders the JDL Virginia Tax Tracker page.
    """
    return render_template('html/taxes/jdl_virginia_tax_tracker.html')

@tax_bp.route('/jdl_office_tax_tracker')
def taxes_jdl_office():
    """
    Renders the JDL Office Tax Tracker page.
    """
    return render_template('html/taxes/jdl_office_tax_tracker.html')

@tax_bp.route('/thm_ug_tax_tracker')
def taxes_thm_ug():
    """
    Renders the Two & Half Mex UG Tax Tracker page.
    """
    return render_template('html/taxes/thm_ug_tax_tracker.html')