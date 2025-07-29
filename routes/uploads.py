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

# Create uploads blueprint
uploads_bp = Blueprint('uploads', __name__, url_prefix='/uploads')
###########################################
# -------- File Upload Logic --------
@uploads_bp.route('/test')
def upload_test():
    return render_template('html/includes/upload_test.html')

@uploads_bp.route('/upload_file', methods=['POST'])
def upload_file():
    """
    Upload a file and store metadata in the database.
    Required form fields: file
    Optional form fields: related_page, notes
    """
    file = request.files.get('file')
    related_page = request.form.get('related_page', 'unspecified')
    notes = request.form.get('notes', '')

    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    try:
        # Secure the filename and build save path
        filename = secure_filename(file.filename)
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)

        # Create and store the UploadedFile entry
        uploaded_file = UploadedFile(
            filename=filename,
            filetype=file.content_type,
            related_page=related_page,
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

@uploads_bp.route('/list')
def list_uploaded_files():
    """
    Displays all uploaded files in a table.
    """
    files = UploadedFile.query.order_by(UploadedFile.date_uploaded.desc()).all()
    return render_template('html/uploads/list.html', files=files)

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
