# routes/personal.py
###########################################
# - Routes for Personal Finances
###########################################

from flask import Blueprint, render_template, jsonify, request
from models import db, USAFRetirementPay, VADisabilityPay
from datetime import datetime
import calendar
import logging # Import logging for better error messages

# Create a Blueprint for personal finances
personal_bp = Blueprint('personal', __name__, url_prefix='/personal')

# Configure logger for this blueprint
personal_bp.logger = logging.getLogger(__name__)

###########################################
# -------- Banking --------
###########################################
@personal_bp.route('/banking/n26')
def n26():
    """
    Renders the N26 banking details page.
    """
    return render_template('html/personal_finances/banking/n26.html')

@personal_bp.route('/banking/scu')
def scu():
    """
    Renders the SCU banking details page.
    """
    return render_template('html/personal_finances/banking/scu.html')

@personal_bp.route('/banking/usaa')
def usaa():
    """
    Renders the USAA banking details page.
    """
    return render_template('html/personal_finances/banking/usaa.html')
###########################################
# -------- Credit Cards --------
###########################################
@personal_bp.route('/credit_card/chase')
def chase():
    """
    Renders the Chase credit card details page.
    """
    return render_template('html/personal_finances/credit_card/chase.html')

@personal_bp.route('/credit_card/capital_one')
def capital_one():
    """
    Renders the Capital One credit card details page.
    """
    return render_template('html/personal_finances/credit_card/capital_one.html')

###########################################
# -------- Income --------
###########################################

#------------------------------------------
#----------- USAF Retirement --------------
#------------------------------------------
@personal_bp.route('/income/retirement')
def retirement():
    """
    Renders the USAF Retirement income tracking page.
    """
    return render_template('html/personal_finances/income/retirement.html')
#------------------------------------------
#---- API Endpoints for USAF Retirement ---
#------------------------------------------
@personal_bp.route('/api/usaf_retirement/data', methods=['GET'])
def get_usaf_retirement_data():
    """
    API endpoint to retrieve all USAF Retirement Pay data.
    If the table is empty, it initializes data for the current year,
    the year before, and two years after.
    """
    data = USAFRetirementPay.query.all()

    # If no data exists, initialize the table with default entries
    if not data:
        personal_bp.logger.info("USAFRetirementPay table is empty, initializing with default data.")
        current_year = datetime.now().year
        try:
            for year in range(current_year - 1, current_year + 2): # From last year to two years in future
                for month_index in range(1, 13):
                    month_name = calendar.month_name[month_index]
                    new_entry = USAFRetirementPay(
                        year=year,
                        month_index=month_index,
                        month_name=month_name,
                        gross_pay=0.0,
                        taxed_amount=0.0,
                        net_pay=0.0
                    )
                    db.session.add(new_entry)
            db.session.commit()
            personal_bp.logger.info("USAFRetirementPay table initialized successfully.")
            data = USAFRetirementPay.query.all() # Re-fetch data after initialization
        except Exception as e:
            db.session.rollback()
            personal_bp.logger.error(f"Error initializing USAFRetirementPay data: {e}")
            return jsonify({'error': 'Failed to initialize USAF retirement data'}), 500

    # Use the to_dict() method for cleaner serialization
    result = [item.to_dict() for item in data]
    return jsonify(result)

@personal_bp.route('/api/usaf_retirement/update', methods=['POST'])
def update_usaf_retirement_entry():
    """
    API endpoint to update an existing USAF Retirement Pay entry.
    Expects JSON with 'id', 'grossPay', and 'taxedAmount'.
    """
    data = request.get_json()
    entry_id = data.get('id')
    gross_pay = data.get('grossPay')
    taxed_amount = data.get('taxedAmount')

    # Input validation
    if not isinstance(entry_id, int):
        personal_bp.logger.warning(f"Invalid entry ID received: {entry_id}")
        return jsonify({'error': 'Invalid ID format'}), 400

    try:
        gross_pay = float(gross_pay)
        taxed_amount = float(taxed_amount)
        if gross_pay < 0 or taxed_amount < 0:
            personal_bp.logger.warning(f"Negative pay or taxed amount received for entry ID {entry_id}: Gross={gross_pay}, Taxed={taxed_amount}")
            return jsonify({'error': 'Gross pay and taxed amount must be non-negative'}), 400
    except (TypeError, ValueError):
        personal_bp.logger.warning(f"Invalid or missing grossPay/taxedAmount for entry ID {entry_id}: Gross={gross_pay}, Taxed={taxed_amount}")
        return jsonify({'error': 'Invalid or missing grossPay or taxedAmount'}), 400

    net_pay = gross_pay - taxed_amount
    entry = USAFRetirementPay.query.get(entry_id)

    if not entry:
        personal_bp.logger.warning(f"USAF Retirement entry not found for ID: {entry_id}")
        return jsonify({'error': 'Entry not found'}), 404

    entry.gross_pay = gross_pay
    entry.taxed_amount = taxed_amount
    entry.net_pay = net_pay

    try:
        db.session.commit()
        personal_bp.logger.info(f"USAF retirement entry ID {entry_id} updated successfully.")
        return jsonify({'message': 'USAF retirement entry updated successfully'})
    except Exception as e:
        db.session.rollback()
        personal_bp.logger.error(f"Failed to update USAF retirement entry (ID: {entry_id}): {e}")
        return jsonify({'error': 'Failed to update USAF retirement entry'}), 500

#------------------------------------------
#------------ VA Disability ---------------
#------------------------------------------
@personal_bp.route('/income/disability')
def disability():
    """
    Renders the VA Disability income tracking page.
    """
    return render_template('html/personal_finances/income/disability.html')

#------------------------------------------
# --- API Endpoints for VA Disability ---
#------------------------------------------
@personal_bp.route('/api/va_disability/data', methods=['GET'])
def get_va_disability_data():
    """
    API endpoint to retrieve all VA Disabiliy Pay data.
    If the table is empty, it initializes data for the current year,
    the year before, and two years after.
    """
    data = VADisabilityPay.query.all()

    # If no data exists, initialize the table with default entries
    if not data:
        personal_bp.logger.info("VADisabilityPay table is empty, initializing with default data.")
        current_year = datetime.now().year
        try:
            for year in range(current_year - 1, current_year + 2): # From last year to two years in future
                for month_index in range(1, 13):
                    month_name = calendar.month_name[month_index]
                    new_entry = VADisabilityPay(
                        year=year,
                        month_index=month_index,
                        month_name=month_name,
                        gross_pay=0.0,
                        taxed_amount=0.0,
                        net_pay=0.0
                    )
                    db.session.add(new_entry)
            db.session.commit()
            personal_bp.logger.info("VADisabilityPay table initialized successfully.")
            data = VADisabilityPay.query.all() # Re-fetch data after initialization
        except Exception as e:
            db.session.rollback()
            personal_bp.logger.error(f"Error initializing VADisabilityPay data: {e}")
            return jsonify({'error': 'Failed to initialize VA disability data'}), 500

    # Use the to_dict() method for cleaner serialization
    result = [item.to_dict() for item in data]
    return jsonify(result)

@personal_bp.route('/api/va_disability/update', methods=['POST'])
def update_va_disability_entry():
    """
    API endpoint to update an existing VA disability Pay entry.
    Expects JSON with 'id', 'grossPay', and 'taxedAmount'.
    """
    data = request.get_json()
    entry_id = data.get('id')
    gross_pay = data.get('grossPay')
    taxed_amount = data.get('taxedAmount')

    # Input validation
    if not isinstance(entry_id, int):
        personal_bp.logger.warning(f"Invalid entry ID received: {entry_id}")
        return jsonify({'error': 'Invalid ID format'}), 400

    try:
        gross_pay = float(gross_pay)
        taxed_amount = float(taxed_amount)
        if gross_pay < 0 or taxed_amount < 0:
            personal_bp.logger.warning(f"Negative pay or taxed amount received for entry ID {entry_id}: Gross={gross_pay}, Taxed={taxed_amount}")
            return jsonify({'error': 'Gross pay and taxed amount must be non-negative'}), 400
    except (TypeError, ValueError):
        personal_bp.logger.warning(f"Invalid or missing grossPay/taxedAmount for entry ID {entry_id}: Gross={gross_pay}, Taxed={taxed_amount}")
        return jsonify({'error': 'Invalid or missing grossPay or taxedAmount'}), 400

    net_pay = gross_pay - taxed_amount
    entry = VADisabilityPay.query.get(entry_id)

    if not entry:
        personal_bp.logger.warning(f"VA disability entry not found for ID: {entry_id}")
        return jsonify({'error': 'Entry not found'}), 404

    entry.gross_pay = gross_pay
    entry.taxed_amount = taxed_amount
    entry.net_pay = net_pay

    try:
        db.session.commit()
        personal_bp.logger.info(f"VA disability entry ID {entry_id} updated successfully.")
        return jsonify({'message': 'VA disability entry updated successfully'})
    except Exception as e:
        db.session.rollback()
        personal_bp.logger.error(f"Failed to update VA disability entry (ID: {entry_id}): {e}")
        return jsonify({'error': 'Failed to update VA disability entry'}), 500
    
@personal_bp.route('/income/dividends')
def dividends():
    """
    Renders the Cash Dividends income tracking page.
    """
    return render_template('html/personal_finances/income/dividends.html')

@personal_bp.route('/income/stocks')
def stocks():
    """
    Renders the Stocks income tracking page.
    """
    return render_template('html/personal_finances/income/stocks.html')