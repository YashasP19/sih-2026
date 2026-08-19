"""
Smart Dynamic Priority & Urgency Scoring Engine for Urban Lens
"""
from apps.ai_module.utils import clean_text
from core.constants import URGENCY_CRITICAL, URGENCY_HIGH, URGENCY_MEDIUM, URGENCY_LOW

# Critical danger keywords that immediately escalate urgency
CRITICAL_EMERGENCY_KEYWORDS = [
    'sparking', 'electric shock', 'live wire', 'electrocution', 'fire', 'blast',
    'cylinder leak', 'gas leak', 'child fell', 'open manhole', 'manhole without cover',
    'hospital road blocked', 'ambulance stuck', 'bridge collapse', 'falling tree on road',
    'fatal accident', 'death', 'casualty', 'drowning', 'toxic gas', 'school bus trapped'
]

HIGH_URGENCY_KEYWORDS = [
    'deep pothole', 'severe accident', 'broken pipe', 'flooding in houses', 'waterlogging',
    'dark street', 'women safety', 'stray dog pack', 'dog bite', 'sewage entering home',
    'transformer smoke', 'contaminated drinking water', 'choked drainage', 'epidemic',
    'dengue', 'mosquito outbreak', 'elderly citizen injured', 'main junction blocked'
]

MEDIUM_URGENCY_KEYWORDS = [
    'garbage dump', 'foul smell', 'low water pressure', 'street light off', 'illegal dumping',
    'pothole', 'broken footpath', 'dustbin full', 'debris', 'stagnant water', 'speeding vehicles'
]

CATEGORY_BASE_SEVERITY = {
    'PUBLIC_SAFETY_HAZARD': 70,
    'STREETLIGHT_POWER': 65,
    'DRAINAGE_OVERFLOW': 60,
    'WATER_LEAKAGE': 55,
    'ROADS_POTHOLES': 50,
    'WASTE_GARBAGE': 45,
    'POLLUTION_AIR_NOISE': 40,
    'OTHER': 35
}


class PriorityScorer:
    """
    Computes a composite priority score (1-100) and urgency label
    based on NLP keyword signals, category severity, and spatial density.
    """
    
    @classmethod
    def calculate_priority(
        cls, 
        title: str, 
        description: str, 
        category: str = 'OTHER',
        nearby_complaints_count: int = 0
    ) -> dict:
        """
        Calculates priority score and urgency tier.
        
        Args:
            title: Complaint title
            description: Complaint description
            category: Complaint category key
            nearby_complaints_count: Number of existing unresolved complaints in 500m radius
            
        Returns:
            {
                'priority_score': 85,
                'urgency': 'CRITICAL',
                'factors': {
                    'base_score': 65,
                    'keyword_bonus': 20,
                    'density_bonus': 10,
                    'matched_critical_keywords': ['live wire', 'sparking']
                }
            }
        """
        full_text = f"{title} {description}".lower()
        cleaned = clean_text(full_text)
        
        base_score = CATEGORY_BASE_SEVERITY.get(category, 40)
        keyword_bonus = 0
        matched_critical = []
        matched_high = []
        
        # Check critical emergency keywords
        for kw in CRITICAL_EMERGENCY_KEYWORDS:
            if kw in full_text or kw in cleaned:
                matched_critical.append(kw)
                keyword_bonus += 25
                
        # Check high urgency keywords
        for kw in HIGH_URGENCY_KEYWORDS:
            if kw in full_text or kw in cleaned:
                matched_high.append(kw)
                keyword_bonus += 12

        # Check medium urgency keywords
        for kw in MEDIUM_URGENCY_KEYWORDS:
            if kw in full_text or kw in cleaned:
                keyword_bonus += 4

        # Cap keyword bonus to +35 max
        keyword_bonus = min(35, keyword_bonus)
        
        # Spatial Clustering Density bonus: Repeated grievances in same area escalate priority
        density_bonus = 0
        if nearby_complaints_count >= 5:
            density_bonus = 20
        elif nearby_complaints_count >= 3:
            density_bonus = 12
        elif nearby_complaints_count >= 1:
            density_bonus = 6
            
        # Raw composite score
        total_score = base_score + keyword_bonus + density_bonus
        
        # If critical life-safety keyword is found, minimum floor is 85
        if matched_critical:
            total_score = max(85, total_score)
            
        final_score = min(100, max(10, total_score))
        
        # Map score to Urgency Tier
        if final_score >= 80 or len(matched_critical) > 0:
            urgency = URGENCY_CRITICAL
        elif final_score >= 60:
            urgency = URGENCY_HIGH
        elif final_score >= 40:
            urgency = URGENCY_MEDIUM
        else:
            urgency = URGENCY_LOW
            
        return {
            'priority_score': int(final_score),
            'urgency': urgency,
            'factors': {
                'base_score': base_score,
                'keyword_bonus': keyword_bonus,
                'density_bonus': density_bonus,
                'matched_critical_keywords': matched_critical[:3],
                'matched_high_keywords': matched_high[:3],
                'nearby_complaints_count': nearby_complaints_count
            }
        }
