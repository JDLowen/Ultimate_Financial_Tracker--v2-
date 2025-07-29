# routes/uploads.py
###########################################
# - Handles File Upload Routes
# - Uploads documents like receipts, contracts, etc.
###########################################

from flask import Blueprint, render_template, request, jsonify, current_app, redirect, url_for
from werkzeug.utils import secure_filename
from models import db
from models import UploadedFile
import os
from urllib.parse import unquote

# Create uploads blueprint
uploads_bp = Blueprint('uploads', __name__, url_prefix='/uploads')
###########################################
# -------- File Upload Logic --------
@uploads_bp.route('/test')
def upload_test():
    """
    Test page for manual file uploads
    """
    return render_template('html/includes/upload_test.html')

@uploads_bp.route('/upload_file', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    related_page = request.form.get('related_page', 'unspecified')
    notes = request.form.get('notes', '')
    related_id = request.form.get('related_id')  # ← NEW

    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    try:
        filename = secure_filename(file.filename)
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)

        uploaded_file = UploadedFile(
            filename=filename,
            filetype=file.content_type,
            related_page=related_page,
            related_id=int(related_id) if related_id else None,  # ← Parse if provided
            notes=notes
        )
        db.session.add(uploaded_file)
        db.session.commit()

        return jsonify({'message': 'Upload successful', 'file': uploaded_file.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500


###########################################
# -------- File Upload Routes --------
###########################################

@uploads_bp.route('/list/<property_id>')
def list_uploaded_files_for_property(property_id):
    """
    Displays uploaded files associated with the rental property using the property_id string.
    """
    # First, find the RentalProperty entry with this property_id
    from models import RentalProperty  # Import inside the route to avoid circular imports
    rental = RentalProperty.query.filter_by(property_id=property_id).first()
    
    if not rental:
        return render_template('html/uploads/list.html', files=[], property_id=property_id)
    
    # Now filter documents using the numeric database ID (related_id)
    files = UploadedFile.query.filter_by(related_id=rental.id).order_by(UploadedFile.date_uploaded.desc()).all()
    
    return render_template('html/uploads/list.html', files=files, property_id=property_id)

@uploads_bp.route('/delete/<int:file_id>', methods=['POST'])
def delete_uploaded_file(file_id):
    """
    Deletes a file from both disk and database.
    """
    file = UploadedFile.query.get_or_404(file_id)
    try:
        # Delete the physical file
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], file.filename)
        if os.path.exists(filepath):
            os.remove(filepath)

        # Remove from database
        db.session.delete(file)
        db.session.commit()
        return redirect(url_for('uploads.list_uploaded_files'))
    except Exception as e:
        return jsonify({'error': f'Failed to delete file: {str(e)}'}), 500

@uploads_bp.route('/api/files/<string:related_page>')
def get_files_by_page(related_page):
    """
    API to return uploaded files filtered by related_page.
    """
    files = UploadedFile.query.filter_by(related_page=related_page).order_by(UploadedFile.date_uploaded.desc()).all()
    return jsonify([file.to_dict() for file in files])

#@uploads_bp.route('/list/<int:related_id>')
#def list_property_documents(related_id):
#    """
#    List only files for a specific rental property.
#    """
#    files = UploadedFile.query.filter_by(related_page='rental_properties', related_id=related_id).all()
#    return render_template('html/uploads/list.html', files=files, title=f"Documents for Property #{related_id}")
