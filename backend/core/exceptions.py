"""
Custom exception handlers for Urban Lens
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def _flatten_error_details(details):
    """Turn DRF validation payloads into a single readable message."""
    if details is None:
        return 'Request failed.'

    if isinstance(details, str):
        return details

    if isinstance(details, list):
        return '; '.join(str(item) for item in details)

    if isinstance(details, dict):
        messages = []
        for field, errors in details.items():
            label = field.replace('_', ' ').title()
            if isinstance(errors, list):
                for err in errors:
                    messages.append(f'{label}: {err}')
            else:
                messages.append(f'{label}: {errors}')
        return ' '.join(messages) if messages else 'Validation failed.'

    return str(details)


def custom_exception_handler(exc, context):
    """
    Returns uniform JSON response:
    {
        "success": false,
        "error": {
            "status_code": 400,
            "message": "Email: Enter a valid email address.",
            "details": {...}
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        details = response.data
        message = _flatten_error_details(details)
        custom_data = {
            'success': False,
            'error': {
                'status_code': response.status_code,
                'message': message,
                'details': details,
            }
        }
        response.data = custom_data
    else:
        logger.error(f'Unhandled Exception: {str(exc)}', exc_info=True)
        return Response({
            'success': False,
            'error': {
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An unexpected internal server error occurred.',
                'details': str(exc),
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
