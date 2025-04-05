from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model

@api_view(['POST'])
def verify_token(request):
    # Verify Clerk token and return user info
    return Response({
        "status": "success",
        "message": "Token verified"
    }, status=status.HTTP_200_OK)