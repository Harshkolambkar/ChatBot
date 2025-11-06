''' This file provides a function to generate session names using LangChain and Gemini '''
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Also try loading from parent directory
from pathlib import Path
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Get API key
GEMINI_API_KEY = os.getenv("gemini_api_key") or os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Gemini API key not found in environment variables")

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

def session_name_generator(topic: str) -> str:
    """
    Generate a short session name for a given topic
    
    Args:
        topic (str): The topic to generate a name for
        
    Returns:
        str: A short name for the session
    """
    # Initialize the LLM
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_API_KEY)

    # Create a prompt template
    name_generator = PromptTemplate(
        input_variables=["topic"],
        template="""Generate a concise and descriptive name (2-4 words) for a session about: {topic}

        Requirements:
        - Keep it brief and meaningful
        - Use title case
        - No special characters or quotes
        - Should be easily readable

        Example output format:
        If topic is "machine learning basics", output: "ML Fundamentals"
        If topic is "cooking italian food", output: "Italian Cuisine Basics"
        """
    )

    # Create and run the chain
    chain = name_generator | llm | StrOutputParser()
    return chain.invoke({"topic": topic})


