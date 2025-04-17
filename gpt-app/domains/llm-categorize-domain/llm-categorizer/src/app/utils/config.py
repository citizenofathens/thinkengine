import configparser
import os

def get_api_key_ini_path():
    # Adjust the path as needed for your project structure
    return os.path.join(os.path.dirname(__file__), "..", "api_key.ini")

def get_openai_api_key():
    config = configparser.ConfigParser()
    config.read(get_api_key_ini_path())
    if 'OPENAI_API_KEY' not in config or 'OPEN_API_KEY' not in config['OPENAI_API_KEY']:
        raise RuntimeError("Missing [OPENAI_API_KEY] section or OPEN_API_KEY in api_key.ini")
    return config['OPENAI_API_KEY']['OPEN_API_KEY']