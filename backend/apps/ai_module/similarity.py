"""
Duplicate Grievance & Spam Detection Engine using NLP Vector Similarity and Geo-Spatial Distance
"""
import math
from collections import Counter
from apps.ai_module.utils import clean_text, haversine_distance, STOPWORDS
from core.constants import SIMILARITY_DUPLICATE_THRESHOLD, MAX_DUPLICATE_RADIUS_METERS


def get_text_vector(text: str) -> Counter:
    """Creates a term-frequency vector from preprocessed text."""
    cleaned = clean_text(text)
    words = [w for w in cleaned.split() if len(w) > 2 and w not in STOPWORDS]
    # Word bigrams
    bigrams = [f"{words[i]}_{words[i+1]}" for i in range(len(words)-1)] if len(words) > 1 else []
    # Character trigrams from cleaned text
    compact_text = cleaned.replace(' ', '')
    trigrams = [compact_text[i:i+3] for i in range(len(compact_text)-2)] if len(compact_text) >= 3 else []
    return Counter(words * 2 + bigrams + trigrams)


def compute_cosine_similarity(vec1: Counter, vec2: Counter) -> float:
    """Computes cosine similarity between two term frequency vectors."""
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])

    sum1 = sum([val ** 2 for val in vec1.values()])
    sum2 = sum([val ** 2 for val in vec2.values()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)

    if not denominator:
        return 0.0
    return float(numerator) / denominator


class DuplicateDetector:
    """
    Scans candidate complaints in the database to detect identical or near-duplicate
    grievances within a geographic radius.
    """
    
    @classmethod
    def check_for_duplicates(
        cls, 
        new_title: str, 
        new_description: str, 
        new_lat: float, 
        new_lon: float, 
        candidate_complaints: list
    ) -> dict:
        """
        Finds the highest similarity match from a list of existing active complaints.
        
        Args:
            new_title: Title of new complaint
            new_description: Description of new complaint
            new_lat: Latitude of new complaint
            new_lon: Longitude of new complaint
            candidate_complaints: List of dicts or complaint objects with lat, lon, title, description, id
            
        Returns:
            {
                'is_duplicate': True/False,
                'similarity_score': 0.84,
                'distance_meters': 120.5,
                'matched_complaint_id': 14,
                'matched_complaint_title': '...'
            }
        """
        new_full_text = f"{new_title} {new_description}"
        new_vec = get_text_vector(new_full_text)
        
        highest_similarity = 0.0
        best_match = None
        closest_distance = 9999999.0
        
        for candidate in candidate_complaints:
            if isinstance(candidate, dict):
                cand_id = candidate.get('id')
                cand_title = candidate.get('title', '')
                cand_desc = candidate.get('description', '')
                cand_lat = candidate.get('latitude')
                cand_lon = candidate.get('longitude')
            else:
                cand_id = getattr(candidate, 'id', None)
                cand_title = getattr(candidate, 'title', '')
                cand_desc = getattr(candidate, 'description', '')
                cand_lat = getattr(candidate, 'latitude', None)
                cand_lon = getattr(candidate, 'longitude', None)
            
            if cand_lat is None or cand_lon is None:
                continue

            # Check spatial distance
            distance = haversine_distance(new_lat, new_lon, cand_lat, cand_lon)
            
            # If within duplicate radius (e.g. 500m), evaluate NLP text similarity
            if distance <= MAX_DUPLICATE_RADIUS_METERS:
                cand_vec = get_text_vector(f"{cand_title} {cand_desc}")
                sim_score = compute_cosine_similarity(new_vec, cand_vec)
                
                if sim_score > highest_similarity:
                    highest_similarity = sim_score
                    best_match = candidate
                    closest_distance = distance

        is_dup = (
            best_match is not None and
            closest_distance <= MAX_DUPLICATE_RADIUS_METERS and
            (
                highest_similarity >= SIMILARITY_DUPLICATE_THRESHOLD or
                (closest_distance <= 100 and highest_similarity >= 0.50)
            )
        )
        
        matched_id = None
        matched_title = None
        if best_match:
            if isinstance(best_match, dict):
                matched_id = best_match.get('id')
                matched_title = best_match.get('title')
            else:
                matched_id = getattr(best_match, 'id', None)
                matched_title = getattr(best_match, 'title', None)

        return {
            'is_duplicate': is_dup,
            'similarity_score': round(highest_similarity, 3),
            'distance_meters': round(closest_distance, 1) if closest_distance < 999999 else None,
            'matched_complaint_id': matched_id,
            'matched_complaint_title': matched_title
        }
