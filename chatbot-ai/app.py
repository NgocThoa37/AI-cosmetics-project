from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Chatbot AI Cosmetics dang chay!"})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    # Tam thoi tra loi mau, sau nay se ket noi AI
    reply = f"Ban da nhan: {user_message}. Chatbot se duoc tich hop AI sau."
    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(debug=True, port=5000)