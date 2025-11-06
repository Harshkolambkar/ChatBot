from session_name_generator import session_name_generator

def test_session_name_generator(topic: str):
    try:
        session_name = session_name_generator(topic)
        print(f"\nTopic: {topic}")
        print(f"Generated name: {session_name}")
    except Exception as e:
        print(f"Error generating name for '{topic}': {e}")

if __name__ == "__main__":
    test_session_name_generator('sum of 11 and 22')