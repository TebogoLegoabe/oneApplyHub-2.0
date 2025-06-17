# 🏠 oneApplyHub - Student Accommodation Platform

A comprehensive web platform designed specifically for **Wits and UJ students** to find, review, and apply for student accommodation in Johannesburg. Built with Flask and React to provide a seamless experience for students searching for their ideal living space.

## ✨ Features

### 🔍 **Property Discovery**
- Browse verified student accommodation properties
- Advanced filtering by price, location, property type, and amenities
- Interactive property listings with detailed information
- High-quality property images and virtual tours

### 📝 **Student Reviews System**
- Read honest reviews from verified university students
- Detailed rating system (overall, safety, cleanliness, management, etc.)
- Mark reviews as helpful
- Anonymous review option for privacy
- Filter reviews by university (Wits/UJ) and rating

### 👤 **User Authentication**
- Secure JWT-based authentication
- Student verification system
- Protected routes for authenticated users
- User dashboard with personalized content

### 📱 **Responsive Design**
- Mobile-first responsive design
- Hamburger menu for mobile navigation
- Touch-friendly interface
- Works seamlessly across all devices

### 🎯 **University-Specific Features**
- Tailored for Wits and UJ students
- University-specific filtering and content
- Academic year and faculty information integration

## 🛠️ Tech Stack

### **Frontend**
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Context API** - State management

### **Backend**
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite** - Database (development)

### **Authentication & Security**
- JWT (JSON Web Tokens) for secure authentication
- Password hashing with Werkzeug
- Protected API endpoints
- CORS configuration for secure cross-origin requests

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** and **npm**
- **Git**

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/oneapplyhub.git
   cd oneapplyhub
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install flask flask-sqlalchemy flask-cors flask-jwt-extended flask-mail
   
   # Initialize database
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   
   # Add sample data (optional)
   python add_sample_properties.py
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Install additional packages
   npm install react-router-dom lucide-react
   ```

### 🏃‍♂️ Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python app.py
   ```
   The Flask API will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   The React app will run on `http://localhost:3000`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The app will automatically proxy API requests to the Flask backend

## 📚 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### **Properties**
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get specific property
- `POST /api/properties` - Create new property (admin)

### **Reviews**
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/property/:id` - Get reviews for specific property
- `POST /api/reviews/property/:id` - Create review for property
- `POST /api/reviews/:id/helpful` - Mark review as helpful

## 🗂️ Project Structure

```
oneapplyhub/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   └── __init__.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── properties.py
│   │       └── reviews.py
│   ├── app.py
│   ├── add_sample_properties.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout/
    │   │       └── Header.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── PropertiesPage.js
    │   │   ├── PropertyDetailPage.js
    │   │   └── ReviewsPage.js
    │   └── App.js
    ├── public/
    └── package.json
```

## 🎯 Key Features in Detail

### **Smart Property Search**
- Filter by price range, number of bedrooms/bathrooms
- Search by location and amenities
- Property type filtering (apartment, house, room, studio)

### **Comprehensive Review System**
- Multiple rating categories (value, location, safety, cleanliness, management, facilities)
- Pros and cons sections
- Recommendation system
- Helpful vote functionality

### **User Dashboard**
- View personal reviews and bookings
- Edit profile information
- Manage account settings

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///studentstay.db
FLASK_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Tebogo Legoabe** - [YourGitHub](https://github.com/TebogoLegoabe)

- **To be updated ;)** 

## 🙏 Acknowledgments

- Built for Wits and UJ students
- Inspired by the need for reliable student accommodation information
- Thanks to all students who will contribute reviews and feedback

## 📞 Support

If you have any questions or need help getting started:

1. Check the [Issues](https://github.com/yourusername/oneapplyhub/issues) page
2. Create a new issue if your problem isn't already listed
3. Contact the development team

---

**Happy coding! 🚀** Help make student accommodation hunting easier for everyone!