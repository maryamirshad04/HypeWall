from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import random
import string
from datetime import datetime
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

app = Flask(__name__)
CORS(app)

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def generate_code():
    """Generate a 6-character alphanumeric code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.route('/api/boards', methods=['POST'])
def create_board():
    """Create a new Kudoboard"""
    data = request.json
    aesthetic = data.get('aesthetic', 'professional')
    recipient_name = data.get('recipient_name', 'Someone Special')
    
    board_id = str(uuid.uuid4())
    join_code = generate_code()
    view_token = str(uuid.uuid4())
    creator_token = str(uuid.uuid4())
    
    board = {
        'id': board_id,
        'aesthetic': aesthetic,
        'recipient_name': recipient_name,
        'join_code': join_code,
        'view_token': view_token,
        'creator_token': creator_token,
        'created_at': datetime.now().isoformat(),
        'contributor_link': f'/index.html?contribute={board_id}',
        'view_link': f'/index.html?view={view_token}'
    }
    
    # Save to Firestore
    db.collection('boards').document(board_id).set(board)
    
    return jsonify(board), 201

@app.route('/api/boards/code/<code>', methods=['GET'])
def get_board_by_code(code):
    """Get board by join code"""
    boards_ref = db.collection('boards')
    query = boards_ref.where(filter=firestore.FieldFilter('join_code', '==', code.upper())).limit(1)
    results = list(query.stream())
    
    if not results:
        return jsonify({'error': 'Board not found'}), 404
        
    board = results[0].to_dict()
    # Filter sensitive info - only return what contributors need
    return jsonify({
        'id': board['id'],
        'aesthetic': board['aesthetic'],
        'recipient_name': board['recipient_name'],
        'join_code': board['join_code']
    }), 200

@app.route('/api/boards/<board_id>', methods=['GET'])
def get_board(board_id):
    """Get board details with role-based permissions"""
    doc_ref = db.collection('boards').document(board_id)
    doc = doc_ref.get()
    
    if doc.exists:
        board = doc.to_dict()
        
        # Check if request is from creator (via query parameter)
        creator_token = request.args.get('creator_token')
        is_creator = creator_token and creator_token == board.get('creator_token')
        
        if is_creator:
            # Creator gets full access including tokens
            return jsonify(board), 200
        else:
            # Non-creator gets limited info
            safe_board = {
                'id': board['id'],
                'aesthetic': board['aesthetic'],
                'recipient_name': board['recipient_name'],
                'created_at': board['created_at']
            }
            return jsonify(safe_board), 200
    return jsonify({'error': 'Board not found'}), 404

@app.route('/api/boards/view/<view_token>', methods=['GET'])
def view_board(view_token):
    """View board with all comments (recipient view) - No sensitive data"""
    boards_ref = db.collection('boards')
    query = boards_ref.where(filter=firestore.FieldFilter('view_token', '==', view_token)).limit(1)
    results = list(query.stream())
    
    if not results:
        return jsonify({'error': 'Board not found'}), 404
        
    board_data = results[0].to_dict()
    board_id = board_data['id']
    
    # Get comments
    comments_ref = db.collection('boards').document(board_id).collection('comments')
    comments = [doc.to_dict() for doc in comments_ref.stream()]
    
    # Return only what viewers need
    safe_board_data = {
        'id': board_data['id'],
        'aesthetic': board_data['aesthetic'],
        'recipient_name': board_data['recipient_name'],
        'created_at': board_data['created_at'],
        'comments': comments
    }
    
    return jsonify(safe_board_data), 200

@app.route('/api/boards/<board_id>/comments', methods=['POST'])
def add_comment(board_id):
    """Add a comment to a board"""
    doc_ref = db.collection('boards').document(board_id)
    if not doc_ref.get().exists:
        return jsonify({'error': 'Board not found'}), 404
    
    data = request.json
    comment_id = str(uuid.uuid4())
    comment = {
        'id': comment_id,
        'author': data.get('author', 'Anonymous'),
        'message': data.get('message', ''),
        'color': data.get('color', '#FFD700'),
        'created_at': datetime.now().isoformat()
    }
    
    db.collection('boards').document(board_id).collection('comments').document(comment_id).set(comment)
    return jsonify(comment), 201

@app.route('/api/boards/<board_id>/comments', methods=['GET'])
def get_comments(board_id):
    """Get all comments for a board"""
    if not db.collection('boards').document(board_id).get().exists:
        return jsonify({'error': 'Board not found'}), 404
        
    comments_ref = db.collection('boards').document(board_id).collection('comments')
    comments = [doc.to_dict() for doc in comments_ref.stream()]
    return jsonify(comments), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)