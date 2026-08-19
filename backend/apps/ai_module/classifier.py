"""
Municipal Grievance Category Classifier using NLP & TF-IDF Domain Knowledge
"""
import logging
from apps.ai_module.utils import clean_text

logger = logging.getLogger(__name__)

# Domain lexicon mapping categories to high-signal civic terms & Hindi/Hinglish terms
CATEGORY_VOCABULARY = {
    'ROADS_POTHOLES': {
        'keywords': [
            'pothole', 'potholes', 'road', 'roads', 'khaddha', 'gaddha', 'footpath', 'asphalt',
            'tar', 'crater', 'divider', 'speed breaker', 'broken road', 'highway', 'pavement',
            'sidewalk', 'street repair', 'concrete', 'manhole cover broken', 'patchwork'
        ],
        'weight': 1.2
    },
    'WASTE_GARBAGE': {
        'keywords': [
            'garbage', 'waste', 'trash', 'kachra', 'dump', 'dustbin', 'litter', 'debris',
            'filth', 'stink', 'smell', 'overflowing bin', 'cleaning', 'sanitation', 'sweep',
            'sweeper', 'dead animal', 'carcass', 'plastic waste', 'compost', 'rotting'
        ],
        'weight': 1.2
    },
    'STREETLIGHT_POWER': {
        'keywords': [
            'streetlight', 'street light', 'light', 'dark', 'bulb', 'pole', 'wire', 'cable',
            'spark', 'sparking', 'electricity', 'bijli', 'power cut', 'outage', 'blackout',
            'transformer', 'electric shock', 'open wire', 'meter', 'fuse', 'high voltage'
        ],
        'weight': 1.3
    },
    'WATER_LEAKAGE': {
        'keywords': [
            'water', 'leakage', 'leak', 'pipe', 'pipeline', 'pani', 'drinking water', 'tap',
            'no water', 'low pressure', 'contaminated water', 'dirty water', 'muddy water',
            'water supply', 'tanker', 'valve', 'burst pipe', 'water crisis', 'chlorine'
        ],
        'weight': 1.2
    },
    'DRAINAGE_OVERFLOW': {
        'keywords': [
            'drain', 'drainage', 'gutter', 'sewage', 'sewer', 'overflow', 'nalah', 'nullah',
            'ganda pani', 'waterlogging', 'flooding', 'clogged', 'blocked drain', 'choked',
            'manhole overflow', 'stagnant water', 'mosquito', 'monsoon flood'
        ],
        'weight': 1.3
    },
    'PUBLIC_SAFETY_HAZARD': {
        'keywords': [
            'safety', 'hazard', 'danger', 'dangerous', 'open manhole', 'falling tree', 'branch',
            'stray dog', 'dog bite', 'rabid dog', 'bull', 'cattle', 'encroachment', 'unauthorized',
            'collapsed wall', 'illegal parking', 'accident zone', 'crime', 'theft', 'harassment'
        ],
        'weight': 1.4
    },
    'POLLUTION_AIR_NOISE': {
        'keywords': [
            'pollution', 'smoke', 'air quality', 'smog', 'aqi', 'burning', 'leaf burning',
            'garbage burning', 'factory smoke', 'dust', 'noise', 'loudspeaker', 'dj sound',
            'industrial waste', 'chemical', 'toxic', 'fumes', 'effluent'
        ],
        'weight': 1.1
    }
}


class ComplaintClassifier:
    """
    NLP Classifier that analyzes grievance title and description
    to predict the most accurate municipal department category.
    """
    
    @classmethod
    def classify(cls, title: str, description: str) -> dict:
        """
        Classifies grievance text.
        Returns:
            {
                'category': 'ROADS_POTHOLES',
                'confidence': 0.88,
                'scores': {'ROADS_POTHOLES': 8.4, 'WASTE_GARBAGE': 1.2, ...}
            }
        """
        full_text = f"{title} {description}".lower()
        cleaned = clean_text(full_text)
        
        scores = {}
        for category, data in CATEGORY_VOCABULARY.items():
            category_score = 0.0
            for kw in data['keywords']:
                if kw in cleaned or kw in full_text:
                    # Give higher weight to matches in title
                    title_bonus = 2.5 if kw in title.lower() else 1.0
                    # Give higher weight if exact word match vs substring
                    pattern_weight = 2.0 if f" {kw} " in f" {cleaned} " else 1.0
                    category_score += (pattern_weight * title_bonus * data['weight'])
            scores[category] = round(category_score, 2)
            
        # Find best category
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        best_category, highest_score = sorted_scores[0]
        
        if highest_score < 1.0:
            best_category = 'OTHER'
            confidence = 0.50
        else:
            total_score = sum(scores.values()) or 1.0
            confidence = min(0.98, max(0.65, round(highest_score / (total_score * 0.7), 2)))
            
        return {
            'category': best_category,
            'confidence': float(confidence),
            'scores': scores
        }
