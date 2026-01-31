def classify_crowd(count):
    if count < 10:
        return "Low"
    elif count < 25:
        return "Medium"
    return "High"
