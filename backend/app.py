from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import random
import string
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory storage (use a database in production)
boards = {}
comments = {}

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
    
    boards[board_id] = {
        'id': board_id,
        'aesthetic': aesthetic,
        'recipient_name': recipient_name,
        'join_code': join_code,
        'view_token': view_token,
        'created_at': datetime.now().isoformat(),
        'contributor_link': f'/contribute/{board_id}',
        'view_link': f'/view/{view_token}'
    }
    
    comments[board_id] = []
    
    return jsonify(boards[board_id]), 201

@app.route('/api/boards/code/<code>', methods=['GET'])
def get_board_by_code(code):
    """Get board by join code"""
    for board_id, board in boards.items():
        if board['join_code'] == code.upper():
            return jsonify({
                'id': board_id,
                'aesthetic': board['aesthetic'],
                'recipient_name': board['recipient_name']
            }), 200
    return jsonify({'error': 'Board not found'}), 404

@app.route('/api/boards/<board_id>', methods=['GET'])
def get_board(board_id):
    """Get board details"""
    if board_id in boards:
        return jsonify(boards[board_id]), 200
    return jsonify({'error': 'Board not found'}), 404

@app.route('/api/boards/view/<view_token>', methods=['GET'])
def view_board(view_token):
    """View board with all comments (recipient view)"""
    for board_id, board in boards.items():
        if board['view_token'] == view_token:
            board_data = board.copy()
            board_data['comments'] = comments[board_id]
            return jsonify(board_data), 200
    return jsonify({'error': 'Board not found'}), 404

@app.route('/api/boards/<board_id>/comments', methods=['POST'])
def add_comment(board_id):
    """Add a comment to a board"""
    if board_id not in boards:
        return jsonify({'error': 'Board not found'}), 404
    
    data = request.json
    comment = {
        'id': str(uuid.uuid4()),
        'author': data.get('author', 'Anonymous'),
        'message': data.get('message', ''),
        'color': data.get('color', '#FFD700'),
        'created_at': datetime.now().isoformat()
    }
    
    comments[board_id].append(comment)
    return jsonify(comment), 201

@app.route('/api/boards/<board_id>/comments', methods=['GET'])
def get_comments(board_id):
    """Get all comments for a board"""
    if board_id in comments:
        return jsonify(comments[board_id]), 200
    return jsonify({'error': 'Board not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)