# models.py
###########################################
# - Define Database Models
###########################################

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

# This line allows app.py to initialize db, but models to be defined separately
db = SQLAlchemy()

#-----------------------------------------
# Stores USAF Retirement Pay in the same database (database.db) as separate tables.
#-----------------------------------------
class USAFRetirementPay(db.Model):
    __tablename__ = 'usaf_retirement_pay'

    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    month_name = db.Column(db.String(20), nullable=False)
    month_index = db.Column(db.Integer, nullable=False)
    gross_pay = db.Column(db.Numeric(10, 2), nullable=False)
    taxed_amount = db.Column(db.Numeric(10, 2), nullable=False)
    net_pay = db.Column(db.Numeric(10, 2), nullable=False)

    def to_dict(self):
        """
        Converts the model instance to a dictionary, useful for JSON serialization.
        """
        return {
            'id': self.id,
            'year': self.year,
            'month_name': self.month_name,
            'month_index': self.month_index,
            'gross_pay': self.gross_pay,
            'taxed_amount': self.taxed_amount,
            'net_pay': self.net_pay
        }

    def __repr__(self):
        """
        Provides a readable representation of the USAFRetirementPay object for debugging.
        """
        return (f"<USAFRetirementPay(id={self.id}, year={self.year}, "
                f"month='{self.month_name}', net_pay={self.net_pay:.2f})>")
    
#-----------------------------------------
# Stores VA Disability in the same database (database.db) as separate tables.
#-----------------------------------------
class VADisabilityPay(db.Model):
    __tablename__ = 'va_disability_pay'

    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    month_name = db.Column(db.String(20), nullable=False)
    month_index = db.Column(db.Integer, nullable=False)
    gross_pay = db.Column(db.Numeric(10, 2), nullable=False)
    taxed_amount = db.Column(db.Numeric(10, 2), nullable=False)
    net_pay = db.Column(db.Numeric(10, 2), nullable=False)

    def to_dict(self):
        """
        Converts the model instance to a dictionary, useful for JSON serialization.
        """
        return {
            'id': self.id,
            'year': self.year,
            'month_name': self.month_name,
            'month_index': self.month_index,
            'gross_pay': self.gross_pay,
            'taxed_amount': self.taxed_amount,
            'net_pay': self.net_pay
        }

    def __repr__(self):
        """
        Provides a readable representation of the VADisabiityPay object for debugging.
        """
        return (f"<VADisabilityPay(id={self.id}, year={self.year}, "
                f"month='{self.month_name}', net_pay={self.net_pay:.2f})>")
    
#-----------------------------------------
# Stores RENTAL PROPERTY Values for rental_properties.html
#-----------------------------------------
class RentalProperty(db.Model):
    __tablename__ = 'rental_properties'
    id = db.Column(db.Integer, primary_key=True) # Internal database ID
    property_id = db.Column(db.String(50), unique=True, nullable=False) # User-defined unique ID
    property_name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    county = db.Column(db.String(100))
    built_year = db.Column(db.Integer, nullable=False)
    purchase_date = db.Column(db.Date, nullable=False) # Store as Date object
    ownership_association = db.Column(db.String(100), nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    down_payment = db.Column(db.Float, nullable=False)
    interest_rate = db.Column(db.Float, nullable=False)
    mortgage_broker_name = db.Column(db.String(100))
    maturity_date = db.Column(db.Date) # NEW FIELD: Optional
    loan_number = db.Column(db.String(100)) # NEW FIELD: Optional
    # document_path = db.Column(db.String(255)) # Placeholder for future document storage path

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'property_name': self.property_name,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'county': self.county,
            'built_year': self.built_year,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None, # Format date for JSON
            'ownership_association': self.ownership_association,
            'purchase_price': self.purchase_price,
            'down_payment': self.down_payment,
            'interest_rate': self.interest_rate,
            'mortgage_broker_name': self.mortgage_broker_name,
            'maturity_date': self.maturity_date.isoformat() if self.maturity_date else None, # NEW FIELD
            'loan_number': self.loan_number, # NEW FIELD
            # 'document_path': self.document_path # Include if implemented
        }
    
    def __repr__(self):
        return f"<RentalProperty {self.property_id} - {self.property_name}>"

#-----------------------------------------
# Stores uploaded files (contracts, receipts, etc.)
#-----------------------------------------
class UploadedFile(db.Model):
    __tablename__ = 'uploaded_files'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filetype = db.Column(db.String(50))
    related_page = db.Column(db.String(100))  # e.g., "retirement", "rental_properties"
    notes = db.Column(db.Text)
    date_uploaded = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'filetype': self.filetype,
            'related_page': self.related_page,
            'notes': self.notes,
            'date_uploaded': self.date_uploaded.strftime('%Y-%m-%d %H:%M:%S'),
        }

    def __repr__(self):
        return f"<UploadedFile {self.filename} ({self.related_page})>"
#-----------------------------------------
# Add any additional models here as needed