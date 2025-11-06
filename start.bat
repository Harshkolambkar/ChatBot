@echo off
start cmd /k "cd Frontend && npm run dev"
start cmd /k "cd Backend && call venv\Scripts\activate.bat && python main.py"