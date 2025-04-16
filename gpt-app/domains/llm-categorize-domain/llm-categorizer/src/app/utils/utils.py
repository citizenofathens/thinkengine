
def is_json_like(s):
    # Simple check for JSON-like string (dict or list)
    s = s.strip()
    return (s.startswith("{") and s.endswith("}")) or (s.startswith("[") and s.endswith("]"))
