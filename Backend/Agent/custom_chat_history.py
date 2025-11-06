from langchain_core.messages import BaseMessage, message_to_dict, messages_from_dict, HumanMessage, AIMessage
from typing import List, Optional, TYPE_CHECKING, Sequence
from langchain_core.chat_history import BaseChatMessageHistory
import psycopg2
from psycopg2.extras import Json

if TYPE_CHECKING:
    from psycopg2.extensions import connection

class CustomChatMessageHistory(BaseChatMessageHistory):
    def __init__(
        self,
        connection: "connection",  # String annotation
        table_name: str,
        session_id: str,
    ):
        self.connection = connection
        self.table_name = table_name
        self.session_id = session_id

    def add_messages(self, messages: Sequence[BaseMessage]) -> None:
        """Add messages to the chat history."""
        for message in messages:
            if isinstance(message, HumanMessage):
                sender = "human"
            elif isinstance(message, AIMessage):
                sender = "ai"
            else:
                sender = "unknown"
            insert_query = f"""
            INSERT INTO {self.table_name} 
            (session_id, messages, sender) 
            VALUES (%s, %s, %s)
            """
            with self.connection.cursor() as cursor:
                cursor.execute(
                    insert_query, 
                    (
                        self.session_id,
                        message.content,
                        sender
                    )
                )
            self.connection.commit()

    def get_messages(self) -> List[BaseMessage]:
        """Get messages from the chat history."""
        select_query = f"""
        SELECT messages, sender FROM {self.table_name}
        WHERE session_id = %s
        ORDER BY id ASC
        """
        messages_list = []
        with self.connection.cursor() as cursor:
            cursor.execute(select_query, (self.session_id,))
            results = cursor.fetchall()
            for message_content, sender in results:
                if sender == "human":
                    messages_list.append(HumanMessage(content=message_content))
                elif sender == "ai":
                    messages_list.append(AIMessage(content=message_content))
        return messages_list

    @property
    def messages(self) -> List[BaseMessage]:
        """Return messages property required by LangChain."""
        return self.get_messages()
    
    def clear(self) -> None:
        """Clear messages for this session."""
        clear_query = f"""
        DELETE FROM {self.table_name}
        WHERE session_id = %s
        """
        
        with self.connection.cursor() as cursor:
            cursor.execute(clear_query, (self.session_id,))
        self.connection.commit()