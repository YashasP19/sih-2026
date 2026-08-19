"""
AI & NLP Utilities for Urban Lens: Text Cleaning, Keyword Extraction, Haversine Distance
"""
import math
import re
from collections import Counter

# Standard English stopwords + municipal civic stopwords
STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
    'please', 'kindly', 'help', 'sir', 'madam', 'complaint', 'problem', 'issue', 'area',
    'regarding', 'look', 'action', 'urgent', 'take', 'near'
}


def clean_text(text: str) -> str:
    """Preprocess text: lowercases, cleans special characters, removes excess spaces."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_keywords(text: str, top_n: int = 5) -> list[str]:
    """
    Extracts top N representative keywords/phrases from grievance text
    using frequency analysis and domain weighting.
    """
    cleaned = clean_text(text)
    words = [w for w in cleaned.split() if len(w) > 2 and w not in STOPWORDS]
    
    if not words:
        return []

    # Frequency counting
    counts = Counter(words)
    
    # Give slight bonus to multi-word civic n-grams if found
    bigrams = []
    for i in range(len(words) - 1):
        bigram = f"{words[i]} {words[i+1]}"
        bigrams.append(bigram)

    top_words = [item[0] for item in counts.most_common(top_n)]
    return top_words


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees).
    Returns distance in METERS.
    """
    if None in (lat1, lon1, lat2, lon2):
        return 9999999.0

    try:
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    except (ValueError, TypeError):
        return 9999999.0

    R = 6371000  # Radius of earth in meters
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance
