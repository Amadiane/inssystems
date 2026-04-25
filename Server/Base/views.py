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



# courriers/views.py

from rest_framework             import generics, status, filters
from rest_framework.response    import Response
from rest_framework.views       import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers     import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts           import get_object_or_404
import cloudinary
import cloudinary.uploader

from .models      import CourrierArrive, LigneCirculation
from .serializers import (
    CourrierArriveListSerializer,
    CourrierArriveDetailSerializer,
    LigneCirculationUpdateSerializer,
    CourrierArriveImpressionSerializer,
)


def upload_scan(fichier, numero_ordre):
    """Upload vers Cloudinary, retourne l'URL HTTPS complète."""
    public_id = f"courrier_{numero_ordre.replace('/', '_')}"
    print(f"[CLOUDINARY] Upload début — public_id={public_id}, fichier={fichier.name}, size={fichier.size}")
    result = cloudinary.uploader.upload(
        fichier,
        folder        = 'ins_guinee/courriers_arrives',
        resource_type = 'auto',
        public_id     = public_id,
        overwrite     = True,
    )
    print(f"[CLOUDINARY] Upload OK — secure_url={result['secure_url']}")
    return result['secure_url']


# ════════════════════════════════════════════════════════
#  1. LISTE + CRÉATION
# ════════════════════════════════════════════════════════
class CourrierArriveListCreateView(generics.ListCreateAPIView):
    queryset           = CourrierArrive.objects.all().order_by('-date_arrivee', '-id')
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['date_arrivee', 'origine']
    search_fields      = ['numero_ordre', 'origine', 'reference', 'objet']
    ordering_fields    = ['date_arrivee', 'created_at', 'numero_ordre']

    def get_serializer_class(self):
        return CourrierArriveListSerializer

    def create(self, request, *args, **kwargs):
        print(f"\n{'='*60}")
        print(f"[CREATE] request.FILES  = {dict(request.FILES)}")
        print(f"[CREATE] request.data   = {dict(request.data)}")
        print(f"[CREATE] Content-Type   = {request.content_type}")
        print(f"{'='*60}\n")

        fichier_scan = request.FILES.get('scan', None)
        print(f"[CREATE] fichier_scan = {fichier_scan}")

        origine   = request.data.get('origine',   '').strip()
        reference = request.data.get('reference', '').strip()
        objet     = request.data.get('objet',     '').strip()

        errors = {}
        if not origine:   errors['origine']   = ['Ce champ est obligatoire.']
        if not reference: errors['reference']  = ['Ce champ est obligatoire.']
        if not objet:     errors['objet']      = ['Ce champ est obligatoire.']
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        date_envoi = request.data.get('date_envoi') or None
        if date_envoi == '': date_envoi = None

        instance = CourrierArrive.objects.create(
            date_arrivee = request.data.get('date_arrivee'),
            origine      = origine,
            reference    = reference,
            date_envoi   = date_envoi,
            objet        = objet,
            created_by   = request.user,
        )
        print(f"[CREATE] Instance créée — id={instance.id}, numero={instance.numero_ordre}")

        if fichier_scan:
            try:
                secure_url    = upload_scan(fichier_scan, instance.numero_ordre)
                instance.scan = secure_url
                instance.save(update_fields=['scan'])
                print(f"[CREATE] Scan sauvegardé — instance.scan='{instance.scan}'")
            except Exception as e:
                print(f"[CREATE] ❌ Upload scan ÉCHOUÉ : {type(e).__name__}: {e}")
        else:
            print(f"[CREATE] Aucun fichier scan dans la requête.")

        # Vérification finale
        instance.refresh_from_db()
        print(f"[CREATE] Après refresh — instance.scan='{instance.scan}', scan_url='{instance.scan_url}'")

        serializer = CourrierArriveDetailSerializer(instance, context={'request': request})
        response_data = serializer.data
        print(f"[CREATE] Réponse scan_url='{response_data.get('scan_url')}', scan='{response_data.get('scan')}'")

        return Response(response_data, status=status.HTTP_201_CREATED)


# ════════════════════════════════════════════════════════
#  2. DÉTAIL, MODIFICATION, SUPPRESSION
# ════════════════════════════════════════════════════════
class CourrierArriveDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = CourrierArrive.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    serializer_class   = CourrierArriveDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        print(f"[RETRIEVE] id={instance.id}, scan='{instance.scan}', scan_url='{instance.scan_url}'")
        serializer = CourrierArriveDetailSerializer(instance, context={'request': request})
        data = serializer.data
        print(f"[RETRIEVE] Serializer scan_url='{data.get('scan_url')}', scan='{data.get('scan')}'")
        return Response(data)

    def update(self, request, *args, **kwargs):
        instance     = self.get_object()
        fichier_scan = request.FILES.get('scan', None)

        for champ in ['date_arrivee', 'origine', 'reference', 'objet']:
            val = request.data.get(champ)
            if val is not None and val != '':
                setattr(instance, champ, val)

        date_envoi = request.data.get('date_envoi')
        if date_envoi is not None:
            instance.date_envoi = date_envoi if date_envoi != '' else None

        if fichier_scan:
            try:
                secure_url    = upload_scan(fichier_scan, instance.numero_ordre)
                instance.scan = secure_url
            except Exception as e:
                print(f"[UPDATE] ❌ Upload scan ÉCHOUÉ : {e}")

        instance.save()
        instance.refresh_from_db()
        print(f"[UPDATE] Après save — scan='{instance.scan}', scan_url='{instance.scan_url}'")

        serializer = CourrierArriveDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        numero   = instance.numero_ordre
        instance.delete()
        return Response({"message": f"Courrier {numero} supprimé."}, status=status.HTTP_204_NO_CONTENT)


# ════════════════════════════════════════════════════════
#  3. UPLOAD scan uniquement
# ════════════════════════════════════════════════════════
class CourrierScanUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, pk):
        courrier = get_object_or_404(CourrierArrive, pk=pk)
        if 'scan' not in request.FILES:
            return Response({"error": "Champ 'scan' manquant."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            secure_url    = upload_scan(request.FILES['scan'], courrier.numero_ordre)
            courrier.scan = secure_url
            courrier.save(update_fields=['scan'])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"message": "Scan uploadé.", "scan_url": secure_url}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        courrier = get_object_or_404(CourrierArrive, pk=pk)
        courrier.scan = None
        courrier.save(update_fields=['scan'])
        return Response({"message": "Scan supprimé."}, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════
#  4. SIGNATURE ligne de circulation
# ════════════════════════════════════════════════════════
class LigneCirculationUpdateView(generics.UpdateAPIView):
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


# ════════════════════════════════════════════════════════
#  5. IMPRESSION
# ════════════════════════════════════════════════════════
class CourrierArriveImpressionView(generics.RetrieveAPIView):
    queryset           = CourrierArrive.objects.prefetch_related('lignes_circulation')
    serializer_class   = CourrierArriveImpressionSerializer
    permission_classes = [IsAuthenticated]


# ════════════════════════════════════════════════════════
#  6. DEBUG scan
# ════════════════════════════════════════════════════════
class CourrierScanDebugView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        c = get_object_or_404(CourrierArrive, pk=pk)
        return Response({
            "id":            c.id,
            "numero_ordre":  c.numero_ordre,
            "scan_raw":      c.scan,
            "scan_type":     type(c.scan).__name__,
            "scan_url_prop": c.scan_url,
        })