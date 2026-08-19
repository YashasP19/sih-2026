"""
Helper utilities for complaints module
"""
from core.constants import CATEGORY_CHOICES, DEPARTMENT_CHOICES, STATUS_CHOICES, URGENCY_CHOICES


def get_category_label(code: str) -> str:
    """Returns human-friendly category label from choice key."""
    for c_code, c_label in CATEGORY_CHOICES:
        if c_code == code:
            return c_label
    return code


def get_status_badge_color(status_code: str) -> str:
    """Returns Tailwind color class string for given status."""
    colors = {
        'PENDING': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        'VERIFIED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        'IN_PROGRESS': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
        'RESOLVED': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        'REJECTED': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    }
    return colors.get(status_code, 'bg-slate-100 text-slate-800')
