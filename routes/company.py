# routes/company.py
###########################################
# - Routes for Company Finances
###########################################

from flask import Blueprint, render_template, jsonify, request
from models import db, RentalProperty
from datetime import datetime
import calendar
import logging # Import logging for better error messages

# Create a Blueprint for company finances
company_bp = Blueprint('company', __name__, url_prefix='/company_finances',
                       template_folder='../templates/html/company_finances')

# Configure logger for this blueprint
company_bp.logger = logging.getLogger(__name__)

###########################################
# -------- LLC Pages --------
###########################################
@company_bp.route('/jdl_global')
def jdl_global():
    """
    Renders the JDL Global adVentures company finance page.
    """
    # FIX: Template path is now relative to the blueprint's template_folder
    return render_template('jdl_global.html')

@company_bp.route('/jdl_texas')
def jdl_texas():
    """
    Renders the JDL Texas Holdings company finance page.
    """
    # FIX: Template path is now relative to the blueprint's template_folder
    return render_template('jdl_texas.html')

@company_bp.route('/jdl_virginia')
def jdl_virginia():
    """
    Renders the JDL Virginia Holdings company finance page.
    """
    # FIX: Template path is now relative to the blueprint's template_folder
    return render_template('jdl_virginia.html')

@company_bp.route('/jdl_office')
def jdl_office():
    """
    Renders the JDL Office Management company finance page.
    """
    # FIX: Template path is now relative to the blueprint's template_folder
    return render_template('jdl_office.html')

@company_bp.route('/thm_ug')
def thm_ug():
    """
    Renders the Two & Half Mex UG company finance page.
    """
    # FIX: Template path is now relative to the blueprint's template_folder
    return render_template('thm_ug.html')

###########################################
# -------- Rental Properties --------
###########################################
@company_bp.route('/rental_properties')
def rental_properties():
    """
    Renders the rental properties management page.
    This page allows users to view, add, and delete rental properties.
    """
    return render_template('rental_properties.html')

@company_bp.route('/api/rental_properties/data')
def get_rental_properties_data():
    properties = RentalProperty.query.order_by(RentalProperty.property_id).all()
    return jsonify([p.to_dict() for p in properties])

@company_bp.route('/api/rental_properties/add', methods=['POST'])
def add_rental_property():
    data = request.json

    # Server-side validation for unique Property ID
    existing_property = RentalProperty.query.filter_by(property_id=data.get('property_id')).first()
    if existing_property:
        return jsonify({"error": "Property ID already exists. Please choose a unique ID."}), 400

    try:
        # Convert date strings to date objects
        purchase_date_str = data.get('purchase_date')
        purchase_date_obj = datetime.strptime(purchase_date_str, '%Y-%m-%d').date() if purchase_date_str else None

        maturity_date_str = data.get('maturity_date')
        maturity_date_obj = datetime.strptime(maturity_date_str, '%Y-%m-%d').date() if maturity_date_str else None
        
        # Handle optional fields that might be empty strings from the form
        loan_number_val = data.get('loan_number')
        mortgage_broker_name_val = data.get('mortgage_broker_name')

        new_property = RentalProperty(
            property_id=data.get('property_id'),
            property_name=data.get('property_name'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            county=data.get('county'),
            built_year=data.get('built_year'),
            purchase_date=purchase_date_obj,
            ownership_association=data.get('ownership_association'),
            purchase_price=data.get('purchase_price'),
            down_payment=data.get('down_payment'),
            interest_rate=data.get('interest_rate'),
            mortgage_broker_name=mortgage_broker_name_val if mortgage_broker_name_val else None,
            maturity_date=maturity_date_obj,
            loan_number=loan_number_val if loan_number_val else None
        )
        db.session.add(new_property)
        db.session.commit()
        return jsonify({"message": "Property added successfully!", "property": new_property.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        company_bp.logger.error(f"Error adding rental property: {e}", exc_info=True)
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@company_bp.route('/api/rental_properties/update/<int:property_db_id>', methods=['PUT'])
def update_rental_property(property_db_id):
    data = request.json
    
    property_to_update = RentalProperty.query.get(property_db_id)
    if not property_to_update:
        return jsonify({"error": "Property not found"}), 404

    try:
        property_to_update.property_name = data.get('property_name')
        property_to_update.address = data.get('address')
        property_to_update.city = data.get('city')
        property_to_update.state = data.get('state')
        property_to_update.county = data.get('county')
        property_to_update.built_year = data.get('built_year')
        
        purchase_date_str = data.get('purchase_date')
        property_to_update.purchase_date = datetime.strptime(purchase_date_str, '%Y-%m-%d').date() if purchase_date_str else None

        property_to_update.ownership_association = data.get('ownership_association')
        property_to_update.purchase_price = data.get('purchase_price')
        property_to_update.down_payment = data.get('down_payment')
        property_to_update.interest_rate = data.get('interest_rate')
        property_to_update.mortgage_broker_name = data.get('mortgage_broker_name') if data.get('mortgage_broker_name') else None
        
        maturity_date_str = data.get('maturity_date')
        property_to_update.maturity_date = datetime.strptime(maturity_date_str, '%Y-%m-%d').date() if maturity_date_str else None
        
        property_to_update.loan_number = data.get('loan_number') if data.get('loan_number') else None

        db.session.commit()
        return jsonify({"message": f"Property {property_to_update.property_id} updated successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        company_bp.logger.error(f"Error updating rental property {property_db_id}: {e}", exc_info=True)
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@company_bp.route('/api/rental_properties/delete', methods=['POST'])
def delete_rental_property():
    print("DEBUG: delete_rental_property route hit!") # DEBUG PRINT STATEMENT
    data = request.json
    # FIX: Get the database ID directly from the payload
    db_id = data.get('id') 

    # FIX: Query by the database's primary key 'id'
    property_to_delete = RentalProperty.query.get(db_id) 
    if property_to_delete:
        try:
            db.session.delete(property_to_delete)
            db.session.commit()
            return jsonify({"message": f"Property {property_to_delete.property_id} deleted successfully!"}), 200
        except Exception as e:
            db.session.rollback()
            company_bp.logger.error(f"Error deleting rental property {db_id}: {e}", exc_info=True)
            return jsonify({"error": str(e)}), 500
    # FIX: Changed error message to reflect looking for DB ID
    return jsonify({"error": f"Property with database ID {db_id} not found"}), 404