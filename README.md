# 🤖 ChatBot Application

An AI-powered chatbot application with user authentication, session management, and intelligent responses using Google's Gemini API.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login system
- 💬 **Multiple Chat Sessions** - Organize conversations into separate sessions
- 🤖 **AI-Powered Responses** - Intelligent responses using Google Gemini
- 🏷️ **Auto-Generated Session Names** - Automatically names sessions based on conversation content
- 💾 **Persistent Chat History** - All conversations are saved to database
- 🌓 **Dark/Light Theme** - Toggle between themes
- 🔄 **Session Management** - Create, rename, and delete sessions
- 🔒 **Password Management** - Change password functionality
- 📱 **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **React Context** - State management

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - SQL ORM
- **LangChain** - LLM application framework
- **Google Gemini AI** - Advanced language model
- **Pydantic** - Data validation

## 📋 Prerequisites

- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Python** (v3.9+) - [Download](https://www.python.org/)
- **PostgreSQL** (v13+) - [Download](https://www.postgresql.org/)
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Harshkolambkar/ChatBot.git
cd ChatBot
```

### 2️⃣ Backend Setup

```bash
cd Backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Configure environment variables
copy .env.example .env
copy Agent\.env.example Agent\.env
```

**Backend/.env:**
```env
database_user=postgres
database_password=your_password
database_host=localhost
database_port=5432
database_name=chatbot
```

**Backend/Agent/.env:**
```env
gemini_api_key=your_gemini_api_key_here
```

### 3️⃣ Database Setup

```sql
CREATE DATABASE chatbot;
```

### 4️⃣ Frontend Setup

```bash
cd Frontend
npm install

copy .env.example .env
```

**Frontend/.env:**
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 5️⃣ Run the Application

**Backend:**
```bash
cd Backend
venv\Scripts\activate
python main.py
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

### 6️⃣ Access
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
ChatBot/
├── Backend/
│   ├── Agent/              # AI agent logic
│   ├── crud/               # Database operations
│   ├── routers/            # API endpoints
│   ├── schemas/            # Pydantic models
│   └── main.py
├── Frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Users
- `POST /users` - Create user
- `POST /users/validate` - Login
- `PATCH /users/{user_id}/password` - Update password

### Sessions
- `GET /sessions/{user_id}` - Get sessions
- `POST /sessions` - Create session
- `DELETE /sessions/{session_token}` - Delete session
- `PATCH /sessions/{session_token}/name` - Rename session

### Chat
- `GET /chat/{session_token}` - Get messages
- `POST /chat` - Send message

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 👨‍💻 Author

**Harsh Kolambkar**
- GitHub: [@Harshkolambkar](https://github.com/Harshkolambkar)

---

⭐ Star this repo if you find it helpful!
