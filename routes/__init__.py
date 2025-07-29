# routes/__init__.py
###########################################
# - Centralized Blueprint Registration
###########################################

from .personal import personal_bp
from .company import company_bp
from .taxes import tax_bp
from .financial_health import financial_health_bp
from .uploads import uploads_bp
from .dashboard import dashboard_bp  # 🆕 NEW: handles index + dashboard-specific routes

def register_blueprints(app):
    """
    Registers all application blueprints with the given Flask application instance.

    Args:
        app (Flask): The Flask app instance
    """
    app.register_blueprint(personal_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(tax_bp)
    app.register_blueprint(financial_health_bp)
    app.register_blueprint(uploads_bp)
    app.register_blueprint(dashboard_bp)
    # 🆕 NEW: Registering the dashboard blueprint for index and dashboard routes