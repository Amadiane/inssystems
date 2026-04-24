from django.shortcuts import render

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email    = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Email et mot de passe requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=email, password=password)

        if user is None:
            return Response(
                {"detail": "Identifiants incorrects"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access":  str(refresh.access_token),
            "user": {
                "id":       user.id,
                "email":    user.email,
                "username": user.username,
            }
        })



#view courriers arrivés


# courriers/views.py

from rest_framework                 import generics, status, filters
from rest_framework.response        import Response
from rest_framework.views           import APIView
from rest_framework.permissions     import IsAuthenticated
from rest_framework.parsers         import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework  import DjangoFilterBackend
from django.shortcuts               import get_object_or_404
from django.http                    import HttpResponse
from django.template.loader         import render_to_string
import cloudinary.uploader

from .models      import CourrierArrive, LigneCirculation
from .serializers import (
    CourrierArriveListSerializer,
    CourrierArriveDetailSerializer,
    LigneCirculationUpdateSerializer,
    CourrierArriveImpressionSerializer,
)


# ════════════════════════════════════════════════════════════
#  1. LISTE + CRÉATION des courriers arrivés
# ════════════════════════════════════════════════════════════
class CourrierArriveListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/courriers-arrives/          → Liste paginée
    POST /api/courriers-arrives/          → Création (avec upload scan optionnel)
    """

    queryset           = CourrierArrive.objects.all().order_by('-date_arrivee', '-id')
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['date_arrivee', 'origine']
    search_fields      = ['numero_ordre', 'origine', 'reference', 'objet']
    ordering_fields    = ['date_arrivee', 'created_at', 'numero_ordre']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourrierArriveDetailSerializer
        return CourrierArriveListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Retourner la fiche complète avec lignes de circulation
        detail_serializer = CourrierArriveDetailSerializer(
            instance,
            context={'request': request}
        )
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


# ════════════════════════════════════════════════════════════
#  2. DÉTAIL, MODIFICATION, SUPPRESSION d'un courrier
# ════════════════════════════════════════════════════════════
class CourrierArriveDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/courriers-arrives/<id>/   → Consulter
    PUT    /api/courriers-arrives/<id>/   → Modifier (remplace tout)
    PATCH  /api/courriers-arrives/<id>/   → Modifier partiellement
    DELETE /api/courriers-arrives/<id>/   → Supprimer
    """

    queryset           = CourrierArrive.objects.all()
    serializer_class   = CourrierArriveDetailSerializer
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def update(self, request, *args, **kwargs):
        partial  = kwargs.pop('partial', False)
        instance = self.get_object()

        # Si un nouveau scan est envoyé, supprimer l'ancien sur Cloudinary
        if 'scan' in request.FILES and instance.scan:
            try:
                cloudinary.uploader.destroy(instance.scan.public_id, resource_type='auto')
            except Exception:
                pass  # Continuer même si la suppression échoue

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Retourner la fiche complète
        detail_serializer = CourrierArriveDetailSerializer(
            instance,
            context={'request': request}
        )
        return Response(detail_serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Supprimer le scan Cloudinary si existant
        if instance.scan:
            try:
                cloudinary.uploader.destroy(instance.scan.public_id, resource_type='auto')
            except Exception:
                pass
        self.perform_destroy(instance)
        return Response(
            {"message": f"Courrier {instance.numero_ordre} supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT
        )


# ════════════════════════════════════════════════════════════
#  3. UPLOAD / REMPLACEMENT du scan uniquement
# ════════════════════════════════════════════════════════════
class CourrierScanUploadView(APIView):
    """
    POST /api/courriers-arrives/<id>/scan/
    Body : multipart/form-data avec champ 'scan' (image ou PDF)
    Remplace le scan existant et retourne la nouvelle URL Cloudinary.
    """

    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, pk):
        courrier = get_object_or_404(CourrierArrive, pk=pk)

        if 'scan' not in request.FILES:
            return Response(
                {"error": "Aucun fichier envoyé. Utilisez le champ 'scan'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        fichier = request.FILES['scan']

        # Supprimer l'ancien scan si existant
        if courrier.scan:
            try:
                cloudinary.uploader.destroy(courrier.scan.public_id, resource_type='auto')
            except Exception:
                pass

        # Upload vers Cloudinary
        try:
            upload_result = cloudinary.uploader.upload(
                fichier,
                folder='ins_guinee/courriers_arrives',
                resource_type='auto',
                public_id=f"courrier_{courrier.numero_ordre.replace('/', '_')}",
                overwrite=True,
                use_filename=True,
            )
        except Exception as e:
            return Response(
                {"error": f"Échec de l'upload Cloudinary : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Sauvegarder la référence Cloudinary
        courrier.scan = upload_result['public_id']
        courrier.save(update_fields=['scan'])

        return Response({
            "message"    : "Scan uploadé avec succès.",
            "scan_url"   : upload_result['secure_url'],
            "public_id"  : upload_result['public_id'],
            "format"     : upload_result.get('format'),
            "resource_type": upload_result.get('resource_type'),
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """
        DELETE /api/courriers-arrives/<id>/scan/
        Supprime uniquement le scan, sans toucher à la fiche.
        """
        courrier = get_object_or_404(CourrierArrive, pk=pk)

        if not courrier.scan:
            return Response(
                {"error": "Aucun scan à supprimer."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            cloudinary.uploader.destroy(courrier.scan.public_id, resource_type='auto')
        except Exception as e:
            return Response(
                {"error": f"Erreur Cloudinary : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        courrier.scan = None
        courrier.save(update_fields=['scan'])

        return Response({"message": "Scan supprimé avec succès."}, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════════
#  4. MISE À JOUR d'une LIGNE de circulation (signature)
# ════════════════════════════════════════════════════════════
class LigneCirculationUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/courriers-arrives/<courrier_id>/circulation/<id>/
    Permet à un responsable de signer (date, annotation, observation).
    """

    queryset           = LigneCirculation.objects.all()
    serializer_class   = LigneCirculationUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(
            LigneCirculation,
            pk=self.kwargs['ligne_id'],
            courrier_id=self.kwargs['pk']
        )

    def update(self, request, *args, **kwargs):
        instance   = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ════════════════════════════════════════════════════════════
#  5. DONNÉES pour IMPRESSION / TÉLÉCHARGEMENT
# ════════════════════════════════════════════════════════════
class CourrierArriveImpressionView(generics.RetrieveAPIView):
    """
    GET /api/courriers-arrives/<id>/impression/
    Retourne toutes les données nécessaires pour générer le PDF
    ou afficher la fiche imprimable côté frontend (React/PDF).
    """

    queryset           = CourrierArrive.objects.prefetch_related('lignes_circulation')
    serializer_class   = CourrierArriveImpressionSerializer
    permission_classes = [IsAuthenticated]