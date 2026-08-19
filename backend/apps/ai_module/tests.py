"""
Automated Unit Tests for CivicSense AI NLP & Intelligence Modules
"""
from django.test import TestCase
from apps.ai_module.classifier import ComplaintClassifier
from apps.ai_module.priority import PriorityScorer
from apps.ai_module.similarity import DuplicateDetector
from apps.ai_module.utils import extract_keywords, haversine_distance, clean_text


class AIModuleTests(TestCase):
    def test_text_cleaning_and_keywords(self):
        text = "Urgent help! Potholes on main road near metro station causing accidents!"
        cleaned = clean_text(text)
        self.assertIn("potholes", cleaned)
        self.assertNotIn("!", cleaned)

        keywords = extract_keywords(text, top_n=3)
        self.assertTrue(len(keywords) > 0)
        self.assertTrue(any("pothole" in kw or "road" in kw or "accident" in kw for kw in keywords))

    def test_haversine_distance(self):
        # Two points ~400m apart in New Delhi
        lat1, lon1 = 28.6328, 77.2197
        lat2, lon2 = 28.6360, 77.2210
        dist = haversine_distance(lat1, lon1, lat2, lon2)
        self.assertTrue(300 < dist < 600)

    def test_complaint_category_classification(self):
        # Electrical hazard
        res_power = ComplaintClassifier.classify(
            title="Transformer sparking with live wire",
            description="Exposed high tension wire fell on the ground near school"
        )
        self.assertEqual(res_power['category'], 'STREETLIGHT_POWER')
        self.assertGreater(res_power['confidence'], 0.70)

        # Waste garbage
        res_waste = ComplaintClassifier.classify(
            title="Overflowing dustbin and garbage dump",
            description="Municipal vat not cleared for 5 days, severe stink and kachra"
        )
        self.assertEqual(res_waste['category'], 'WASTE_GARBAGE')
        self.assertGreater(res_waste['confidence'], 0.70)

    def test_priority_urgency_scorer(self):
        # Critical life safety hazard
        critical_res = PriorityScorer.calculate_priority(
            title="Live sparking wire near school gate",
            description="Danger of electric shock to students entering",
            category="STREETLIGHT_POWER",
            nearby_complaints_count=3
        )
        self.assertEqual(critical_res['urgency'], 'CRITICAL')
        self.assertGreaterEqual(critical_res['priority_score'], 85)

        # Normal medium issue
        med_res = PriorityScorer.calculate_priority(
            title="Dustbin full of dry leaves",
            description="Small street bin requires emptying",
            category="WASTE_GARBAGE",
            nearby_complaints_count=0
        )
        self.assertIn(med_res['urgency'], ['MEDIUM', 'LOW'])
        self.assertLess(med_res['priority_score'], 80)

    def test_duplicate_detection(self):
        existing_complaints = [
            {
                'id': 101,
                'title': 'Deep pothole on flyover descent',
                'description': 'Large crater damaging cars on flyover descent road',
                'latitude': 28.6328,
                'longitude': 77.2197
            }
        ]

        # Similar complaint within 100 meters
        dup_res = DuplicateDetector.check_for_duplicates(
            new_title='Pothole crater on flyover descent',
            new_description='Vehicles skidding due to huge pothole crater on flyover',
            new_lat=28.6330,
            new_lon=77.2198,
            candidate_complaints=existing_complaints
        )
        self.assertTrue(dup_res['is_duplicate'])
        self.assertEqual(dup_res['matched_complaint_id'], 101)
