import uuid
import os
from custom_chat_history import CustomChatMessageHistory
from langchain_core.messages import AIMessage, HumanMessage
import psycopg2

from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import sys

def initialize_agent(session_id:str):
    # Load environment variables first
    load_dotenv()
    
    # Get database connection from environment variable
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        # Fallback to individual parameters for local development
        database_user = os.environ.get("database_user", "postgres")
        database_password = os.environ.get("database_password", "12345")
        database_host = os.environ.get("database_host", "localhost")
        database_port = os.environ.get("database_port", "5432")
        database_name = os.environ.get("database_name", "chatbot")
        database_url = f"postgresql://{database_user}:{database_password}@{database_host}:{database_port}/{database_name}"
    else:
        # Render provides postgres:// but psycopg2 needs postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # Establish a synchronous connection to the database
    sync_connection = psycopg2.connect(database_url)

    table_name = "chats_2"

    # Get Gemini API key
    gemini_api_key = os.environ.get('gemini_api_key')

    # Initialize the language model
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=gemini_api_key)

    # Create a prompt template with a placeholder for chat history
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant who remembers previous conversations."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])

    # Initialize the chat history manager
    chat_history = CustomChatMessageHistory(
        connection=sync_connection,
        table_name=table_name,
        session_id=session_id
    )

    # Create a chain using the modern approach
    chain = (
        {"chat_history": lambda _: chat_history.messages, "input": RunnablePassthrough()}
        | prompt
        | llm
    )

    return chain, chat_history

def chat_with_agent(session_id: str, user_input: str):
    chain, chat_history = initialize_agent(session_id)

    # Add user message to history
    chat_history.add_messages([
        HumanMessage(content=user_input),
    ])

    # Get AI response
    response = chain.invoke({"input": user_input})

    # Add AI response to history
    chat_history.add_messages([
        AIMessage(content=response.content),
    ])

    return response.content  # Return only the content

if __name__ == "__main__":
    # For standalone testing
    if len(sys.argv) > 1:
        session_id = sys.argv[1]
    else:
        session_id = 'a151d47b85b39c9c838393ae04df0f6c'  # fallback
    
    user_input = input("You: ")
    response = chat_with_agent(session_id, user_input)
    print(f"Assistant: {response}")