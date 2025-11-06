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
    # Establish a synchronous connection to the database
    conn_info = "postgresql://postgres:12345@localhost:5432/chatbot"
    sync_connection = psycopg2.connect(conn_info)

    table_name = "chats_2"

    # Load environment variables
    load_dotenv()
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