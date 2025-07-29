# routes/financial_health.py
###########################################
# - Routes for Financial Health
###########################################

from flask import Blueprint, render_template

# Create a Blueprint for financial health
financial_health_bp = Blueprint('financial_health', __name__, url_prefix='/financial_health')

@financial_health_bp.route('/personal_finances')
def personal_finances_overview():
    """
    Renders the overall personal finances health dashboard.
    """
    return render_template('html/financial_health/personal_finances.html')

@financial_health_bp.route('/company_finances')
def company_finances_overview():
    """
    Renders the overall company finances health dashboard.
    """
    return render_template('html/financial_health/company_finances.html')

@financial_health_bp.route('/budget')
def budget():
    """
    Renders the budget tracking page.
    """
    return render_template('html/financial_health/budget.html')

@financial_health_bp.route('/net_worth')
def net_worth():
    """
    Renders the net worth tracking page.
    """
    return render_template('html/financial_health/net_worth.html')

@financial_health_bp.route('/expenses')
def expenses():
    """
    Renders the expenses tracking page.
    """
    return render_template('html/financial_health/expenses.html')

@financial_health_bp.route('/investments')
def investments():
    """
    Renders the investments tracking page.
    """
    return render_template('html/financial_health/investments.html')

@financial_health_bp.route('/loans')
def loans():
    """
    Renders the loans tracking page.
    """
    return render_template('html/financial_health/loans.html')

@financial_health_bp.route('/credit_score')
def credit_score():
    """
    Renders the credit score tracking page.
    """
    return render_template('html/financial_health/credit_score.html')

@financial_health_bp.route('/financial_goals')
def financial_goals():
    """
    Renders the financial goals tracking page.
    """
    return render_template('html/financial_health/financial_goals.html')

@financial_health_bp.route('/financial_education')
def financial_education():
    """
    Renders the financial education resources page.
    """
    return render_template('html/financial_health/financial_education.html')