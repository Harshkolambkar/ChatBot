from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from routers import users, sessions, Chat  # Capital C for Chat

app = FastAPI(
    title="ChatBot API",
    description="A comprehensive chatbot API with user management and chat functionality",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# Include routers
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(Chat.router)  # Capital C for Chat

print("🚀 Starting application...")
print("✅ Application started successfully!")

if __name__ == "__main__":
    import uvicorn
    print("🌐 Starting server on http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
