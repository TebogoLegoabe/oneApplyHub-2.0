from app import create_app

app = create_app()

@app.route('/')
def home():
    return {'message': 'StudentStay API is running!', 'status': 'success'}

if __name__ == '__main__':
    app.run(debug=True)

#curl -X POST http://localhost:5000/api/admin/login \
#  -H "Content-Type: application/json" \
 # -d '{"email":"your_admin_email","password":"your_admin_password"}'