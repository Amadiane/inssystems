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










# ══════════════════════════════════════════════════════════
#  À AJOUTER dans Base/views.py
# ══════════════════════════════════════════════════════════

from rest_framework             import generics, status, filters
from rest_framework.response    import Response
from rest_framework.views       import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers     import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts           import get_object_or_404
import cloudinary.uploader

from .models      import CourrierSortant
from .serializers import (
    CourrierSortantListSerializer,
    CourrierSortantDetailSerializer,
    CourrierSortantImpressionSerializer,
)


def upload_scan_sortant(fichier, numero_sortie):
    """Upload vers Cloudinary, retourne l'URL HTTPS sécurisée."""
    public_id = f"sortant_{numero_sortie.replace('/', '_')}"
    print(f"[CLOUDINARY] Sortant upload — public_id={public_id}, fichier={fichier.name}")
    result = cloudinary.uploader.upload(
        fichier,
        folder        = 'ins_guinee/courriers_sortants',
        resource_type = 'auto',
        public_id     = public_id,
        overwrite     = True,
    )
    print(f"[CLOUDINARY] Sortant OK — secure_url={result['secure_url']}")
    return result['secure_url']


# ════════════════════════════════════════════════════════
#  1. LISTE + CRÉATION
# ════════════════════════════════════════════════════════
class CourrierSortantListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/courriers-sortants/   → liste paginée
    POST /api/courriers-sortants/   → créer (multipart pour le scan)
    """
    queryset           = CourrierSortant.objects.all().order_by('-date_sortie', '-id')
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['date_sortie', 'destinataire']
    search_fields      = ['numero_sortie', 'origine', 'destinataire', 'objet']
    ordering_fields    = ['date_sortie', 'created_at', 'numero_sortie']

    def get_serializer_class(self):
        return CourrierSortantListSerializer

    def create(self, request, *args, **kwargs):
        print(f"\n{'='*60}")
        print(f"[SORTANT CREATE] FILES={dict(request.FILES)} | data={dict(request.data)}")

        fichier_scan  = request.FILES.get('scan', None)
        origine       = request.data.get('origine',      '').strip()
        objet         = request.data.get('objet',        '').strip()
        destinataire  = request.data.get('destinataire', '').strip()

        errors = {}
        if not origine:       errors['origine']      = ['Ce champ est obligatoire.']
        if not objet:         errors['objet']        = ['Ce champ est obligatoire.']
        if not destinataire:  errors['destinataire'] = ['Ce champ est obligatoire.']
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        date_sortie = request.data.get('date_sortie') or None
        if date_sortie == '': date_sortie = None

        instance = CourrierSortant.objects.create(
            origine      = origine,
            objet        = objet,
            destinataire = destinataire,
            date_sortie  = date_sortie,
            created_by   = request.user,
        )
        print(f"[SORTANT] Instance créée — id={instance.id}, numero={instance.numero_sortie}")

        if fichier_scan:
            try:
                secure_url    = upload_scan_sortant(fichier_scan, instance.numero_sortie)
                instance.scan = secure_url
                instance.save(update_fields=['scan'])
                print(f"[SORTANT] Scan sauvegardé — {secure_url}")
            except Exception as e:
                print(f"[SORTANT] ❌ Upload échoué : {e}")

        instance.refresh_from_db()
        serializer = CourrierSortantDetailSerializer(instance, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ════════════════════════════════════════════════════════
#  2. DÉTAIL, MODIFICATION, SUPPRESSION
# ════════════════════════════════════════════════════════
class CourrierSortantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/courriers-sortants/<id>/   → consulter
    PATCH  /api/courriers-sortants/<id>/   → modifier
    DELETE /api/courriers-sortants/<id>/   → supprimer
    """
    queryset           = CourrierSortant.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    serializer_class   = CourrierSortantDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance   = self.get_object()
        print(f"[SORTANT RETRIEVE] id={instance.id}, scan='{instance.scan}', scan_url='{instance.scan_url}'")
        serializer = CourrierSortantDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance     = self.get_object()
        fichier_scan = request.FILES.get('scan', None)

        for champ in ['origine', 'objet', 'destinataire']:
            val = request.data.get(champ)
            if val is not None and val != '':
                setattr(instance, champ, val)

        date_sortie = request.data.get('date_sortie')
        if date_sortie is not None:
            instance.date_sortie = date_sortie if date_sortie != '' else None

        if fichier_scan:
            try:
                secure_url    = upload_scan_sortant(fichier_scan, instance.numero_sortie)
                instance.scan = secure_url
            except Exception as e:
                print(f"[SORTANT UPDATE] ❌ Upload échoué : {e}")

        instance.save()
        instance.refresh_from_db()
        serializer = CourrierSortantDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        numero   = instance.numero_sortie
        instance.delete()
        return Response({"message": f"Courrier {numero} supprimé."}, status=status.HTTP_204_NO_CONTENT)


# ════════════════════════════════════════════════════════
#  3. UPLOAD / SUPPRESSION scan uniquement
# ════════════════════════════════════════════════════════
class CourrierSortantScanUploadView(APIView):
    """
    POST   /api/courriers-sortants/<id>/scan/  → uploader/remplacer
    DELETE /api/courriers-sortants/<id>/scan/  → supprimer
    """
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, pk):
        courrier = get_object_or_404(CourrierSortant, pk=pk)
        if 'scan' not in request.FILES:
            return Response({"error": "Champ 'scan' manquant."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            secure_url    = upload_scan_sortant(request.FILES['scan'], courrier.numero_sortie)
            courrier.scan = secure_url
            courrier.save(update_fields=['scan'])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"message": "Scan uploadé.", "scan_url": secure_url}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        courrier      = get_object_or_404(CourrierSortant, pk=pk)
        courrier.scan = None
        courrier.save(update_fields=['scan'])
        return Response({"message": "Scan supprimé."}, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════
#  4. DONNÉES IMPRESSION
# ════════════════════════════════════════════════════════
class CourrierSortantImpressionView(generics.RetrieveAPIView):
    """GET /api/courriers-sortants/<id>/impression/ → données pour PDF"""
    queryset           = CourrierSortant.objects.all()
    serializer_class   = CourrierSortantImpressionSerializer
    permission_classes = [IsAuthenticated]





# ══════════════════════════════════════════════════════════
#  À AJOUTER dans Base/views.py
# ══════════════════════════════════════════════════════════

from rest_framework             import generics, status, filters
from rest_framework.response    import Response
from rest_framework.views       import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers     import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts           import get_object_or_404
import cloudinary.uploader

from .models      import Archive, CourrierArrive, CourrierSortant
from .serializers import (
    ArchiveListSerializer,
    ArchiveDetailSerializer,
    ArchiveImpressionSerializer,
)


def upload_scan_archive(fichier, numero_archive):
    """Upload vers Cloudinary, retourne l'URL HTTPS."""
    public_id = f"archive_{numero_archive.replace('/', '_')}"
    print(f"[CLOUDINARY] Archive upload — public_id={public_id}")
    result = cloudinary.uploader.upload(
        fichier,
        folder        = 'ins_guinee/archives',
        resource_type = 'auto',
        public_id     = public_id,
        overwrite     = True,
    )
    print(f"[CLOUDINARY] Archive OK — {result['secure_url']}")
    return result['secure_url']


# ════════════════════════════════════════════════════════
#  1. LISTE + CRÉATION
# ════════════════════════════════════════════════════════
class ArchiveListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/archives/   → liste paginée avec filtres avancés
    POST /api/archives/   → créer une archive manuellement
    """
    queryset           = Archive.objects.all().order_by('-date_archivage', '-id')
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['type_courrier', 'statut', 'date_archivage', 'date_document']
    search_fields      = ['numero_archive', 'objet', 'origine', 'destinataire', 'reference_courrier']
    ordering_fields    = ['date_archivage', 'date_document', 'created_at', 'numero_archive']

    def get_serializer_class(self):
        return ArchiveListSerializer

    def create(self, request, *args, **kwargs):
        fichier_scan = request.FILES.get('scan', None)

        objet        = request.data.get('objet',        '').strip()
        origine      = request.data.get('origine',      '').strip()

        errors = {}
        if not objet:   errors['objet']   = ['Ce champ est obligatoire.']
        if not origine: errors['origine'] = ['Ce champ est obligatoire.']
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        instance = Archive.objects.create(
            type_courrier      = request.data.get('type_courrier',      'arrive'),
            objet              = objet,
            origine            = origine,
            destinataire       = request.data.get('destinataire',       ''),
            date_document      = request.data.get('date_document')      or None,
            date_archivage     = request.data.get('date_archivage')     or None,
            reference_courrier = request.data.get('reference_courrier', ''),
            statut             = request.data.get('statut',             'archive'),
            observations       = request.data.get('observations',       ''),
            created_by         = request.user,
        )

        if fichier_scan:
            try:
                secure_url    = upload_scan_archive(fichier_scan, instance.numero_archive)
                instance.scan = secure_url
                instance.save(update_fields=['scan'])
            except Exception as e:
                print(f"[ARCHIVE] ❌ Upload échoué : {e}")

        instance.refresh_from_db()
        serializer = ArchiveDetailSerializer(instance, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ════════════════════════════════════════════════════════
#  2. DÉTAIL, MODIFICATION, SUPPRESSION
# ════════════════════════════════════════════════════════
class ArchiveDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Archive.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    serializer_class   = ArchiveDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance   = self.get_object()
        serializer = ArchiveDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance     = self.get_object()
        fichier_scan = request.FILES.get('scan', None)

        champs_texte = ['type_courrier', 'objet', 'origine', 'destinataire',
                        'reference_courrier', 'statut', 'observations']
        for champ in champs_texte:
            val = request.data.get(champ)
            if val is not None and val != '':
                setattr(instance, champ, val)

        for champ_date in ['date_document', 'date_archivage']:
            val = request.data.get(champ_date)
            if val is not None:
                setattr(instance, champ_date, val if val != '' else None)

        if fichier_scan:
            try:
                secure_url    = upload_scan_archive(fichier_scan, instance.numero_archive)
                instance.scan = secure_url
            except Exception as e:
                print(f"[ARCHIVE UPDATE] ❌ {e}")

        instance.save()
        instance.refresh_from_db()
        return Response(ArchiveDetailSerializer(instance, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        numero   = instance.numero_archive
        instance.delete()
        return Response({"message": f"Archive {numero} supprimée."}, status=status.HTTP_204_NO_CONTENT)


# ════════════════════════════════════════════════════════
#  3. UPLOAD / SUPPRESSION scan
# ════════════════════════════════════════════════════════
class ArchiveScanUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, pk):
        archive = get_object_or_404(Archive, pk=pk)
        if 'scan' not in request.FILES:
            return Response({"error": "Champ 'scan' manquant."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            secure_url   = upload_scan_archive(request.FILES['scan'], archive.numero_archive)
            archive.scan = secure_url
            archive.save(update_fields=['scan'])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"message": "Scan uploadé.", "scan_url": secure_url}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        archive      = get_object_or_404(Archive, pk=pk)
        archive.scan = None
        archive.save(update_fields=['scan'])
        return Response({"message": "Scan supprimé."}, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════
#  4. AUTO-ARCHIVAGE depuis un courrier arrivé
# ════════════════════════════════════════════════════════
class AutoArchivageArriveeView(APIView):
    """
    POST /api/archives/from-arrive/<id>/
    Crée automatiquement une archive à partir d'un courrier arrivé.
    Copie toutes les informations et le scan si présent.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        courrier = get_object_or_404(CourrierArrive, pk=pk)

        # Vérifier si déjà archivé
        existant = Archive.objects.filter(reference_courrier=courrier.numero_ordre).first()
        if existant:
            return Response({
                "message":         "Ce courrier est déjà archivé.",
                "archive_existant": ArchiveDetailSerializer(existant).data,
            }, status=status.HTTP_200_OK)

        archive = Archive.objects.create(
            type_courrier      = 'arrive',
            objet              = courrier.objet,
            origine            = courrier.origine,
            date_document      = courrier.date_arrivee,
            date_archivage     = request.data.get('date_archivage') or None,
            reference_courrier = courrier.numero_ordre,
            scan               = courrier.scan or '',
            statut             = 'archive',
            observations       = request.data.get('observations', ''),
            created_by         = request.user,
        )

        serializer = ArchiveDetailSerializer(archive, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ════════════════════════════════════════════════════════
#  5. AUTO-ARCHIVAGE depuis un courrier sortant
# ════════════════════════════════════════════════════════
class AutoArchivageSortantView(APIView):
    """
    POST /api/archives/from-sortant/<id>/
    Crée automatiquement une archive à partir d'un courrier sortant.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        courrier = get_object_or_404(CourrierSortant, pk=pk)

        existant = Archive.objects.filter(reference_courrier=courrier.numero_sortie).first()
        if existant:
            return Response({
                "message":          "Ce courrier est déjà archivé.",
                "archive_existant": ArchiveDetailSerializer(existant).data,
            }, status=status.HTTP_200_OK)

        archive = Archive.objects.create(
            type_courrier      = 'sortant',
            objet              = courrier.objet,
            origine            = courrier.origine,
            destinataire       = courrier.destinataire,
            date_document      = courrier.date_sortie,
            date_archivage     = request.data.get('date_archivage') or None,
            reference_courrier = courrier.numero_sortie,
            scan               = courrier.scan or '',
            statut             = 'archive',
            observations       = request.data.get('observations', ''),
            created_by         = request.user,
        )

        serializer = ArchiveDetailSerializer(archive, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ════════════════════════════════════════════════════════
#  6. STATISTIQUES des archives
# ════════════════════════════════════════════════════════
class ArchiveStatsView(APIView):
    """GET /api/archives/stats/ → compteurs par type et statut"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = Archive.objects.count()
        return Response({
            "total":    total,
            "arrives":  Archive.objects.filter(type_courrier='arrive').count(),
            "sortants": Archive.objects.filter(type_courrier='sortant').count(),
            "internes": Archive.objects.filter(type_courrier='interne').count(),
            "actifs":   Archive.objects.filter(statut='actif').count(),
            "archives": Archive.objects.filter(statut='archive').count(),
            "detruits": Archive.objects.filter(statut='detruit').count(),
        })


# ════════════════════════════════════════════════════════
#  7. IMPRESSION
# ════════════════════════════════════════════════════════
class ArchiveImpressionView(generics.RetrieveAPIView):
    queryset           = Archive.objects.all()
    serializer_class   = ArchiveImpressionSerializer
    permission_classes = [IsAuthenticated]












# ══════════════════════════════════════════════════════════
#  À AJOUTER dans Base/views.py
#  pip install fpdf2
# ══════════════════════════════════════════════════════════

from django.http            import HttpResponse
from rest_framework.views   import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts       import get_object_or_404
from fpdf import FPDF
import requests
from io import BytesIO


# ── Couleurs INS-Guinée ──────────────────────────────────
ROUGE  = (206, 17,  38)
JAUNE  = (252, 209, 22)
VERT   = (0,  154,  68)
DARK   = (15,  33,  55)
GRIS   = (245, 247, 250)
BORDER = (221, 228, 237)
TEXT   = (74, 103, 128)


def fmt_date(d):
    if not d:
        return "—"
    try:
        from datetime import date
        if isinstance(d, date):
            return d.strftime("%d/%m/%Y")
        parts = str(d).split("-")
        if len(parts) == 3:
            return f"{parts[2]}/{parts[1]}/{parts[0]}"
    except Exception:
        pass
    return str(d)


class INSPdf(FPDF):
    """PDF de base avec entête INS-Guinée."""

    def header_ins(self, titre_fiche, numero, date_label):
        """Bandeau tricolore + entête institutionnel."""
        # Bandeau tricolore
        w = self.w - self.l_margin - self.r_margin
        third = w / 3
        y0 = self.get_y()
        for i, col in enumerate([ROUGE, JAUNE, VERT]):
            self.set_fill_color(*col)
            self.rect(self.l_margin + i * third, y0, third, 4, "F")
        self.ln(8)

        # Entête texte
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*DARK)
        self.cell(0, 7, "MPCID — Institut National de la Statistique", ln=True)

        self.set_font("Helvetica", "", 9)
        self.set_text_color(*TEXT)
        self.cell(0, 5, "République de Guinée · " + titre_fiche, ln=True)
        self.ln(3)

        # Numéro + date
        self.set_font("Helvetica", "B", 15)
        self.set_text_color(*VERT)
        self.cell(120, 8, numero, ln=False)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*TEXT)
        self.cell(0, 8, date_label, align="R", ln=True)
        self.ln(3)

        # Ligne séparatrice verte
        self.set_draw_color(*VERT)
        self.set_line_width(0.5)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(5)

    def champ(self, label, valeur, w_label=50, w_val=0, fill=False):
        """Champ label : valeur sur une ligne."""
        if w_val == 0:
            w_val = self.w - self.l_margin - self.r_margin - w_label
        if fill:
            self.set_fill_color(*GRIS)
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(*TEXT)
        self.cell(w_label, 7, label.upper(), border=0, fill=fill)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*DARK)
        self.cell(w_val, 7, str(valeur) if valeur else "—", border=0, fill=fill, ln=True)

    def section_titre(self, texte):
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*VERT)
        self.set_fill_color(*GRIS)
        self.cell(0, 7, "  " + texte.upper(), fill=True, ln=True)
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*TEXT)
        self.cell(0, 5, "Document généré par le Système de Gestion des Courriers — INS Guinée", align="C", ln=True)

    def grille_2col(self, items):
        """Grille 2 colonnes pour les champs courts."""
        col_w = (self.w - self.l_margin - self.r_margin) / 2
        pairs = [(items[i], items[i+1] if i+1 < len(items) else ("", "")) for i in range(0, len(items), 2)]
        for (l1, v1), (l2, v2) in pairs:
            y = self.get_y()
            self.set_fill_color(*GRIS)
            # Col 1
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(*TEXT)
            self.set_xy(self.l_margin, y)
            self.cell(col_w - 2, 6, l1.upper(), border="B", fill=True)
            self.set_xy(self.l_margin, y + 6)
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*DARK)
            self.cell(col_w - 2, 7, str(v1) if v1 else "—")
            # Col 2
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(*TEXT)
            self.set_xy(self.l_margin + col_w + 2, y)
            self.cell(col_w - 2, 6, l2.upper(), border="B", fill=True)
            self.set_xy(self.l_margin + col_w + 2, y + 6)
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*DARK)
            self.cell(col_w - 2, 7, str(v2) if v2 else "—")
            self.ln(16)


# ════════════════════════════════════════════════════════
#  PDF COURRIER ARRIVÉ
# ════════════════════════════════════════════════════════
class CourrierArriveePDFView(APIView):
    """
    GET /api/courriers-arrives/<id>/pdf/
    Télécharge la fiche complète en PDF avec tableau de circulation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from .models import CourrierArrive
        courrier = get_object_or_404(CourrierArrive, pk=pk)
        lignes   = courrier.lignes_circulation.all().order_by('ordre')

        pdf = INSPdf(orientation="P", unit="mm", format="A4")
        pdf.set_margins(15, 15, 15)
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=18)

        # Entête
        pdf.header_ins(
            "Fiche de Circulation du Courrier Arrivé",
            courrier.numero_ordre,
            f"Arrivé le {fmt_date(courrier.date_arrivee)}"
        )

        # Informations principales
        pdf.section_titre("Informations du courrier")
        pdf.grille_2col([
            ("Date d'arrivée",  fmt_date(courrier.date_arrivee)),
            ("Origine",         courrier.origine),
            ("Référence",       courrier.reference),
            ("Date d'envoi",    fmt_date(courrier.date_envoi)),
        ])

        # Objet
        pdf.section_titre("Objet")
        pdf.set_fill_color(*GRIS)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(0, 6, courrier.objet or "—", fill=True)
        pdf.ln(6)

        # Pièce jointe
        if courrier.scan_url:
            pdf.section_titre("Pièce jointe")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*TEXT)
            pdf.cell(0, 6, courrier.scan_url, ln=True)
            pdf.ln(3)

        # Tableau de circulation
        pdf.section_titre("Tableau de Circulation")
        col_w = [55, 30, 50, 50, 25]
        headers = ["Fonction", "Date", "Annotation", "Observation", "Signé"]

        pdf.set_font("Helvetica", "B", 8)
        pdf.set_fill_color(*VERT)
        pdf.set_text_color(255, 255, 255)
        for i, (h, w) in enumerate(zip(headers, col_w)):
            pdf.cell(w, 8, h.upper(), border=1, fill=True)
        pdf.ln()

        fonctions = [
            ("DG",  "Directeur Général"),
            ("DGA", "Directeur Général Adjoint"),
            ("DIR", "Le Directeur"),
            ("SD",  "Le Sous Directeur"),
        ]

        for idx, (code, label) in enumerate(fonctions):
            ligne = next((l for l in lignes if l.fonction == code), None)
            fill  = idx % 2 == 0
            pdf.set_fill_color(*GRIS if fill else (255, 255, 255))
            pdf.set_text_color(*DARK)
            pdf.set_font("Helvetica", "B", 8)
            pdf.cell(col_w[0], 8, label, border=1, fill=fill)
            pdf.set_font("Helvetica", "", 8)
            pdf.cell(col_w[1], 8, fmt_date(ligne.date_signature) if ligne and ligne.date_signature else "", border=1, fill=fill)
            pdf.cell(col_w[2], 8, (ligne.annotation or "")[:25] if ligne else "", border=1, fill=fill)
            pdf.cell(col_w[3], 8, (ligne.observation or "")[:25] if ligne else "", border=1, fill=fill)
            signed = "✓" if (ligne and ligne.date_signature) else ""
            pdf.set_text_color(*VERT if signed else TEXT)
            pdf.cell(col_w[4], 8, signed, border=1, fill=fill, align="C")
            pdf.set_text_color(*DARK)
            pdf.ln()

        response = HttpResponse(bytes(pdf.output()), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="courrier_{courrier.numero_ordre.replace("/","_")}.pdf"'
        return response


# ════════════════════════════════════════════════════════
#  PDF COURRIER SORTANT
# ════════════════════════════════════════════════════════
class CourrierSortantPDFView(APIView):
    """GET /api/courriers-sortants/<id>/pdf/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from .models import CourrierSortant
        courrier = get_object_or_404(CourrierSortant, pk=pk)

        pdf = INSPdf(orientation="P", unit="mm", format="A4")
        pdf.set_margins(15, 15, 15)
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=18)

        pdf.header_ins(
            "Fiche de Sortie du Courrier",
            courrier.numero_sortie,
            f"Sorti le {fmt_date(courrier.date_sortie)}"
        )

        pdf.section_titre("Informations du courrier")
        pdf.grille_2col([
            ("Numéro de sortie", courrier.numero_sortie),
            ("Date de sortie",   fmt_date(courrier.date_sortie)),
            ("Origine",          courrier.origine),
            ("Destinataire",     courrier.destinataire),
        ])

        pdf.section_titre("Objet")
        pdf.set_fill_color(*GRIS)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(0, 6, courrier.objet or "—", fill=True)
        pdf.ln(6)

        if courrier.scan_url:
            pdf.section_titre("Pièce jointe")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*TEXT)
            pdf.cell(0, 6, courrier.scan_url, ln=True)
            pdf.ln(3)

        # Zone de signature
        pdf.section_titre("Visa et Signature")
        pdf.ln(4)
        col_w = (pdf.w - pdf.l_margin - pdf.r_margin) / 2
        for label in ["Préparé par", "Approuvé par"]:
            x = pdf.l_margin if label == "Préparé par" else pdf.l_margin + col_w + 4
            pdf.set_xy(x, pdf.get_y())
            pdf.set_font("Helvetica", "B", 8)
            pdf.set_text_color(*TEXT)
            pdf.cell(col_w - 4, 5, label.upper())
        pdf.ln(5)
        for _ in range(2):
            x = pdf.l_margin if _ == 0 else pdf.l_margin + col_w + 4
            pdf.set_xy(x, pdf.get_y())
            pdf.set_draw_color(*BORDER)
            pdf.cell(col_w - 4, 18, "", border=1)
        pdf.ln(22)

        response = HttpResponse(bytes(pdf.output()), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="sortant_{courrier.numero_sortie.replace("/","_")}.pdf"'
        return response


# ════════════════════════════════════════════════════════
#  PDF ARCHIVE
# ════════════════════════════════════════════════════════
class ArchivePDFView(APIView):
    """GET /api/archives/<id>/pdf/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from .models import Archive
        archive = get_object_or_404(Archive, pk=pk)

        TYPE_LABELS   = {"arrive": "Courrier Arrivé", "sortant": "Courrier Sortant", "interne": "Document Interne"}
        STATUT_LABELS = {"actif": "Actif", "archive": "Archivé", "detruit": "Détruit"}

        pdf = INSPdf(orientation="P", unit="mm", format="A4")
        pdf.set_margins(15, 15, 15)
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=18)

        pdf.header_ins(
            "Fiche d'Archive",
            archive.numero_archive,
            f"Archivé le {fmt_date(archive.date_archivage)}"
        )

        pdf.section_titre("Informations de l'archive")
        pdf.grille_2col([
            ("Type",              TYPE_LABELS.get(archive.type_courrier, archive.type_courrier)),
            ("Statut",            STATUT_LABELS.get(archive.statut, archive.statut)),
            ("Date du document",  fmt_date(archive.date_document)),
            ("Date d'archivage",  fmt_date(archive.date_archivage)),
            ("Origine",           archive.origine),
            ("Référence",         archive.reference_courrier or "—"),
        ])

        if archive.destinataire:
            pdf.section_titre("Destinataire")
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(*DARK)
            pdf.cell(0, 6, archive.destinataire, ln=True)
            pdf.ln(3)

        pdf.section_titre("Objet / Description")
        pdf.set_fill_color(*GRIS)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(0, 6, archive.objet or "—", fill=True)
        pdf.ln(4)

        if archive.observations:
            pdf.section_titre("Observations")
            pdf.set_fill_color(255, 255, 230)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*DARK)
            pdf.multi_cell(0, 5, archive.observations, fill=True)
            pdf.ln(4)

        if archive.scan_url:
            pdf.section_titre("Document numérisé")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*TEXT)
            pdf.cell(0, 6, archive.scan_url, ln=True)
            pdf.ln(3)

        # Bloc de certification
        pdf.ln(6)
        pdf.set_fill_color(*GRIS)
        pdf.set_font("Helvetica", "B", 8)
        pdf.set_text_color(*TEXT)
        pdf.cell(0, 6, "  CERTIFICATION D'ARCHIVAGE", fill=True, ln=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(0, 5,
            f"Ce document a été archivé le {fmt_date(archive.date_archivage)} "
            f"sous la référence {archive.numero_archive}. "
            f"Statut : {STATUT_LABELS.get(archive.statut, archive.statut)}.",
            fill=False
        )

        response = HttpResponse(bytes(pdf.output()), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="archive_{archive.numero_archive.replace("/","_")}.pdf"'
        return response



















# rh/views.py
import io
import cloudinary
import cloudinary.uploader
from django.utils        import timezone
from django.http         import HttpResponse
from django.db.models    import Sum, Q, Count
from django.shortcuts    import get_object_or_404
from rest_framework      import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination  import PageNumberPagination
from fpdf import FPDF

from .models import (
    Direction, Fonction, Personnel,
    DemandeConge, SoldeConge, AutorisationAbsence, AssuranceMaladie,
)
from .serializers import (
    DirectionSerializer, FonctionSerializer,
    PersonnelListSerializer, PersonnelDetailSerializer,
    DemandeCongeSerializer, ValidationCongeSerializer,
    SoldeCongeSerializer, AutorisationAbsenceSerializer,
    AssuranceMaladieSerializer, RHStatsSerializer,
)

# ── Couleurs INS ──────────────────────────────────────────────
ROUGE  = (206, 17,  38)
JAUNE  = (252, 209, 22)
VERT   = (0,   154, 68)
DARK   = (15,  33,  55)
GRIS   = (245, 247, 250)
BORDER = (221, 228, 237)
TEXT   = (74,  103, 128)


# ══════════════════════════════════════════════════════════════
#  PAGINATION
# ══════════════════════════════════════════════════════════════

class RHPagination(PageNumberPagination):
    page_size            = 20
    page_size_query_param = "page_size"
    max_page_size        = 100


# ══════════════════════════════════════════════════════════════
#  HELPER — Upload Cloudinary
# ══════════════════════════════════════════════════════════════

def upload_fichier(file, folder="rh"):
    """Upload un fichier vers Cloudinary et retourne le public_id."""
    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        resource_type="auto",
    )
    return result.get("secure_url") or result.get("public_id")


# ══════════════════════════════════════════════════════════════
#  RÉFÉRENTIELS
# ══════════════════════════════════════════════════════════════

class DirectionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Direction.objects.all()
        return _ok(DirectionSerializer(qs, many=True).data)

    def post(self, request):
        s = DirectionSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return _created(s.data)
        return _bad(s.errors)


class DirectionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(Direction, pk=pk)
        return _ok(DirectionSerializer(obj).data)

    def patch(self, request, pk):
        obj = get_object_or_404(Direction, pk=pk)
        s = DirectionSerializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return _ok(s.data)
        return _bad(s.errors)

    def delete(self, request, pk):
        get_object_or_404(Direction, pk=pk).delete()
        return _no_content()


class FonctionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Fonction.objects.select_related("direction").all()
        return _ok(FonctionSerializer(qs, many=True).data)

    def post(self, request):
        s = FonctionSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return _created(s.data)
        return _bad(s.errors)


class FonctionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(Fonction, pk=pk)
        return _ok(FonctionSerializer(obj).data)

    def patch(self, request, pk):
        obj = get_object_or_404(Fonction, pk=pk)
        s = FonctionSerializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return _ok(s.data)
        return _bad(s.errors)

    def delete(self, request, pk):
        get_object_or_404(Fonction, pk=pk).delete()
        return _no_content()


# ══════════════════════════════════════════════════════════════
#  PERSONNEL — LIST / CREATE
# ══════════════════════════════════════════════════════════════

class PersonnelListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Personnel.objects.select_related("fonction", "direction").all()

        # Filtres
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(nom__icontains=search)     | Q(prenom__icontains=search) |
                Q(matricule_interne__icontains=search) |
                Q(matricule_fp__icontains=search)      |
                Q(email__icontains=search)
            )
        type_emp = request.query_params.get("type_employe")
        if type_emp:
            qs = qs.filter(type_employe=type_emp)

        direction_id = request.query_params.get("direction")
        if direction_id:
            qs = qs.filter(direction_id=direction_id)

        actif = request.query_params.get("actif")
        if actif is not None:
            qs = qs.filter(actif=(actif.lower() == "true"))

        paginator = RHPagination()
        page      = paginator.paginate_queryset(qs, request)
        serializer = PersonnelListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        data = request.data.copy()

        # ── Upload des pièces jointes vers Cloudinary ──────────
        for field in ["photo", "piece_identite", "rib", "autres_pieces"]:
            f = request.FILES.get(field)
            if f:
                try:
                    url = upload_fichier(f, folder=f"rh/{field}")
                    data[field] = url
                    print(f"[RH][UPLOAD] {field} → {url}")
                except Exception as e:
                    print(f"[RH][UPLOAD ERROR] {field}: {e}")

        serializer = PersonnelDetailSerializer(data=data)
        if serializer.is_valid():
            agent = serializer.save(created_by=request.user)
            # Créer le solde congé si contractuel
            if agent.type_employe == "contractuel":
                sc, _ = SoldeConge.objects.get_or_create(personnel=agent)
                sc.recalcul_acquis()
            # Créer l'assurance maladie automatiquement
            AssuranceMaladie.objects.get_or_create(
                personnel=agent,
                defaults={"date_adhesion": agent.date_debut}
            )
            return _created(PersonnelDetailSerializer(agent).data)
        return _bad(serializer.errors)


# ══════════════════════════════════════════════════════════════
#  PERSONNEL — DETAIL / UPDATE / DELETE
# ══════════════════════════════════════════════════════════════

class PersonnelDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(Personnel, pk=pk)
        return _ok(PersonnelDetailSerializer(obj).data)

    def patch(self, request, pk):
        obj  = get_object_or_404(Personnel, pk=pk)
        data = request.data.copy()

        for field in ["photo", "piece_identite", "rib", "autres_pieces"]:
            f = request.FILES.get(field)
            if f:
                try:
                    url = upload_fichier(f, folder=f"rh/{field}")
                    data[field] = url
                except Exception as e:
                    print(f"[RH][UPLOAD ERROR] {field}: {e}")

        s = PersonnelDetailSerializer(obj, data=data, partial=True)
        if s.is_valid():
            agent = s.save()
            return _ok(PersonnelDetailSerializer(agent).data)
        return _bad(s.errors)

    def delete(self, request, pk):
        get_object_or_404(Personnel, pk=pk).delete()
        return _no_content()


# ══════════════════════════════════════════════════════════════
#  PERSONNEL — PDF FICHE
# ══════════════════════════════════════════════════════════════

class PersonnelPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        agent = get_object_or_404(Personnel, pk=pk)
        pdf   = _build_pdf_fiche_agent(agent)
        resp  = HttpResponse(pdf, content_type="application/pdf")
        fname = f"agent_{agent.matricule_interne}.pdf"
        resp["Content-Disposition"] = f'attachment; filename="{fname}"'
        return resp


# ══════════════════════════════════════════════════════════════
#  CONGÉS — LIST / CREATE
# ══════════════════════════════════════════════════════════════

class CongeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = DemandeConge.objects.select_related("personnel", "valide_par_sup", "valide_par_drh").all()

        personnel_id = request.query_params.get("personnel")
        if personnel_id:
            qs = qs.filter(personnel_id=personnel_id)

        statut = request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)

        annee = request.query_params.get("annee")
        if annee:
            qs = qs.filter(date_debut__year=annee)

        paginator = RHPagination()
        page      = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(DemandeCongeSerializer(page, many=True).data)

    def post(self, request):
        s = DemandeCongeSerializer(data=request.data)
        if s.is_valid():
            conge = s.save()
            return _created(DemandeCongeSerializer(conge).data)
        return _bad(s.errors)


# ══════════════════════════════════════════════════════════════
#  CONGÉS — DETAIL
# ══════════════════════════════════════════════════════════════

class CongeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(DemandeConge, pk=pk)
        return _ok(DemandeCongeSerializer(obj).data)

    def patch(self, request, pk):
        obj = get_object_or_404(DemandeConge, pk=pk)
        s   = DemandeCongeSerializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return _ok(s.data)
        return _bad(s.errors)

    def delete(self, request, pk):
        get_object_or_404(DemandeConge, pk=pk).delete()
        return _no_content()


# ══════════════════════════════════════════════════════════════
#  CONGÉS — VALIDATION
# ══════════════════════════════════════════════════════════════

class CongeValidationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        conge = get_object_or_404(DemandeConge, pk=pk)
        s = ValidationCongeSerializer(data=request.data)
        if not s.is_valid():
            return _bad(s.errors)

        action      = s.validated_data["action"]
        commentaire = s.validated_data.get("commentaire", "")
        now         = timezone.now()

        if action == "valider_sup":
            if conge.statut != "en_attente":
                return _bad({"detail": "Le congé n'est pas en attente."})
            conge.statut          = "validee_sup"
            conge.valide_par_sup  = request.user
            conge.date_valid_sup  = now

        elif action == "valider_drh":
            if conge.statut != "validee_sup":
                return _bad({"detail": "Le congé doit d'abord être validé par le supérieur."})
            conge.statut         = "validee_drh"
            conge.valide_par_drh = request.user
            conge.date_valid_drh = now
            if commentaire:
                conge.commentaire_rh = commentaire
            # Mettre à jour le solde pour les contractuels
            _mettre_a_jour_solde(conge)
            # Générer l'autorisation d'absence
            _generer_autorisation(conge)

        elif action == "refuser":
            conge.statut         = "refusee"
            conge.commentaire_rh = commentaire

        elif action == "annuler":
            conge.statut = "annulee"

        conge.save()
        return _ok({
            "detail": f"Congé {action} avec succès.",
            "conge":  DemandeCongeSerializer(conge).data,
        })


def _mettre_a_jour_solde(conge):
    """Met à jour le solde de congé pour les contractuels."""
    if conge.personnel.type_employe != "contractuel":
        return
    sc, _ = SoldeConge.objects.get_or_create(personnel=conge.personnel)
    sc.recalcul_acquis()
    sc.jours_pris += conge.nombre_jours
    sc.save()


def _generer_autorisation(conge):
    """Génère une autorisation d'absence lors de la validation DRH."""
    AutorisationAbsence.objects.get_or_create(conge=conge)


# ══════════════════════════════════════════════════════════════
#  CONGÉS — PDF AUTORISATION D'ABSENCE
# ══════════════════════════════════════════════════════════════

class AutorisationPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        conge = get_object_or_404(DemandeConge, pk=pk)
        aut   = get_object_or_404(AutorisationAbsence, conge=conge)
        pdf   = _build_pdf_autorisation(conge, aut)
        resp  = HttpResponse(pdf, content_type="application/pdf")
        resp["Content-Disposition"] = f'attachment; filename="autorisation_{aut.numero}.pdf"'
        return resp


# ══════════════════════════════════════════════════════════════
#  SOLDE CONGÉS
# ══════════════════════════════════════════════════════════════

class SoldeCongeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            obj = get_object_or_404(SoldeConge, personnel_id=pk)
            obj.recalcul_acquis()
            return _ok(SoldeCongeSerializer(obj).data)
        qs = SoldeConge.objects.select_related("personnel").all()
        return _ok(SoldeCongeSerializer(qs, many=True).data)


# ══════════════════════════════════════════════════════════════
#  ASSURANCE MALADIE
# ══════════════════════════════════════════════════════════════

class AssuranceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = AssuranceMaladie.objects.select_related(
            "personnel", "personnel__direction", "personnel__fonction"
        ).all()
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(personnel__nom__icontains=search) |
                Q(personnel__prenom__icontains=search) |
                Q(numero_carte__icontains=search)
            )
        paginator = RHPagination()
        page      = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(AssuranceMaladieSerializer(page, many=True).data)


class AssuranceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(AssuranceMaladie, personnel_id=pk)
        return _ok(AssuranceMaladieSerializer(obj).data)

    def patch(self, request, pk):
        obj = get_object_or_404(AssuranceMaladie, personnel_id=pk)
        s   = AssuranceMaladieSerializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return _ok(s.data)
        return _bad(s.errors)


# ══════════════════════════════════════════════════════════════
#  TABLEAU DE BORD / STATS
# ══════════════════════════════════════════════════════════════

class RHStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        data  = {
            "total_personnel":   Personnel.objects.count(),
            "fonctionnaires":    Personnel.objects.filter(type_employe="fonctionnaire").count(),
            "contractuels":      Personnel.objects.filter(type_employe="contractuel").count(),
            "actifs":            Personnel.objects.filter(actif=True).count(),
            "inactifs":          Personnel.objects.filter(actif=False).count(),
            "conges_en_attente": DemandeConge.objects.filter(statut="en_attente").count(),
            "conges_valides":    DemandeConge.objects.filter(statut="validee_drh").count(),
            "cnss_expires":      Personnel.objects.filter(
                                     cnss_date_fin__lte=today, actif=True
                                 ).count(),
            "masse_salariale":   Personnel.objects.filter(actif=True).aggregate(
                                     total=Sum("net_a_payer")
                                 )["total"] or 0,
        }
        return _ok(RHStatsSerializer(data).data)


# ══════════════════════════════════════════════════════════════
#  PDF — FICHE AGENT (fpdf2)
# ══════════════════════════════════════════════════════════════

def _build_pdf_fiche_agent(agent):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_margins(20, 15, 20)

    # ── Bandeau tricolore ────────────────────────────────────
    pdf.set_fill_color(*ROUGE); pdf.rect(0, 0, 70,  4, "F")
    pdf.set_fill_color(*JAUNE); pdf.rect(70, 0, 70, 4, "F")
    pdf.set_fill_color(*VERT);  pdf.rect(140,0, 70, 4, "F")

    # ── En-tête ──────────────────────────────────────────────
    pdf.set_y(10)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(*DARK)
    pdf.cell(0, 8, "MPCID — Institut National de la Statistique", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*TEXT)
    pdf.cell(0, 5, "République de Guinée · Fiche de Personnel", ln=True)
    pdf.ln(4)

    # Ligne séparatrice verte
    pdf.set_draw_color(*VERT)
    pdf.set_line_width(0.8)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(6)

    # ── Bloc identification ──────────────────────────────────
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*VERT)
    pdf.cell(0, 7, f"{agent.prenom.upper()} {agent.nom.upper()}", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*TEXT)
    pdf.cell(0, 5, f"Matricule : {agent.matricule_interne}   |   Type : {agent.get_type_employe_display()}", ln=True)
    if agent.matricule_fp:
        pdf.cell(0, 5, f"Matricule Fonction Publique : {agent.matricule_fp}", ln=True)
    pdf.ln(4)

    def section(titre):
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(*VERT)
        pdf.set_fill_color(*GRIS)
        pdf.cell(0, 6, f"  {titre}", ln=True, fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*DARK)
        pdf.ln(1)

    def champ(label, valeur, w1=55):
        pdf.set_font("Helvetica", "B", 8)
        pdf.set_text_color(*TEXT)
        pdf.cell(w1, 6, f"{label} :", border="B")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*DARK)
        pdf.cell(0, 6, str(valeur) if valeur else "—", border="B", ln=True)

    def deux_champs(l1, v1, l2, v2):
        pdf.set_font("Helvetica", "B", 8)
        pdf.set_text_color(*TEXT)
        pdf.cell(35, 6, f"{l1} :", border="B")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*DARK)
        pdf.cell(55, 6, str(v1) if v1 else "—", border="B")
        pdf.set_font("Helvetica", "B", 8)
        pdf.set_text_color(*TEXT)
        pdf.cell(35, 6, f"  {l2} :", border="B")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*DARK)
        pdf.cell(0, 6, str(v2) if v2 else "—", border="B", ln=True)

    # ── Identité ────────────────────────────────────────────
    section("IDENTITÉ")
    deux_champs("Date de naissance", agent.date_naissance, "Lieu de naissance", agent.lieu_naissance)
    deux_champs("Sexe", agent.get_sexe_display(), "Nationalité", agent.nationalite)
    champ("Adresse résidentielle", agent.adresse)
    deux_champs("Email", agent.email, "Téléphone", agent.telephone)
    pdf.ln(3)

    # ── Poste ────────────────────────────────────────────────
    section("POSTE & AFFECTATION")
    deux_champs("Direction", agent.direction, "Fonction", agent.fonction)
    deux_champs("Date de début", agent.date_debut, "Date de fin", agent.date_fin or "En cours")
    pdf.ln(3)

    # ── Diplôme ──────────────────────────────────────────────
    if agent.diplome:
        section("FORMATION & DIPLÔME")
        champ("Diplôme", agent.diplome)
        deux_champs("Date d'obtention", agent.diplome_date, "Lieu", agent.diplome_lieu)
        pdf.ln(3)

    # ── Rémunération ─────────────────────────────────────────
    section("RÉMUNÉRATION")
    def fmt_gnf(v):
        try:
            return f"{float(v):,.0f} GNF".replace(",", " ")
        except Exception:
            return str(v)
    deux_champs("Salaire de base", fmt_gnf(agent.salaire), "Prime", fmt_gnf(agent.prime) if agent.type_employe == "fonctionnaire" else "—")
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(*VERT)
    pdf.cell(0, 7, f"  Net à payer : {fmt_gnf(agent.net_a_payer)}", ln=True)
    pdf.set_text_color(*DARK)
    pdf.ln(2)

    # ── CNSS ─────────────────────────────────────────────────
    if agent.cnss_id:
        section("CNSS")
        champ("ID CNSS", agent.cnss_id)
        deux_champs("Date de début", agent.cnss_date_debut, "Date de fin", agent.cnss_date_fin or "—")
        pdf.ln(3)

    # ── Footer ───────────────────────────────────────────────
    pdf.set_y(-18)
    pdf.set_draw_color(*BORDER)
    pdf.set_line_width(0.3)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*TEXT)
    pdf.cell(0, 5, f"Document généré le {timezone.now().strftime('%d/%m/%Y')} — Système de Gestion RH — INS Guinée", align="C")

    return bytes(pdf.output())


# ══════════════════════════════════════════════════════════════
#  PDF — AUTORISATION D'ABSENCE (fpdf2)
# ══════════════════════════════════════════════════════════════

def _build_pdf_autorisation(conge, aut):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_margins(20, 15, 20)

    # Bandeau
    pdf.set_fill_color(*ROUGE); pdf.rect(0, 0, 70,  4, "F")
    pdf.set_fill_color(*JAUNE); pdf.rect(70, 0, 70, 4, "F")
    pdf.set_fill_color(*VERT);  pdf.rect(140,0, 70, 4, "F")

    pdf.set_y(12)
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(*DARK)
    pdf.cell(0, 8, "MPCID — Institut National de la Statistique", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*TEXT)
    pdf.cell(0, 5, "République de Guinée", ln=True, align="C")
    pdf.ln(5)

    # Titre
    pdf.set_fill_color(*VERT)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "AUTORISATION D'ABSENCE", ln=True, fill=True, align="C")
    pdf.ln(5)

    # Numéro
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*VERT)
    pdf.cell(0, 6, f"Référence : {aut.numero}", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*TEXT)
    pdf.cell(0, 5, f"Date de délivrance : {aut.date_generation.strftime('%d/%m/%Y')}", ln=True, align="C")
    pdf.ln(8)

    agent = conge.personnel

    # Corps
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*DARK)
    texte = (
        f"Nous soussignés, Direction des Ressources Humaines de l'Institut National de la "
        f"Statistique (INS), autorisons :"
    )
    pdf.multi_cell(0, 6, texte)
    pdf.ln(5)

    # Bloc agent
    pdf.set_fill_color(*GRIS)
    pdf.set_draw_color(*BORDER)
    pdf.set_line_width(0.3)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*VERT)
    pdf.cell(0, 9, f"  {agent.prenom.upper()} {agent.nom.upper()}", ln=True, fill=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*DARK)
    pdf.cell(0, 6, f"  Matricule : {agent.matricule_interne}   |   Fonction : {agent.fonction or '—'}   |   Direction : {agent.direction or '—'}", ln=True, fill=True)
    pdf.ln(6)

    # Détail congé
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*DARK)
    d1   = conge.date_debut.strftime("%d/%m/%Y")
    d2   = conge.date_fin.strftime("%d/%m/%Y")
    nj   = conge.nombre_jours
    type_label = dict(DemandeConge.TYPE_CHOICES).get(conge.type_conge, conge.type_conge)
    texte2 = (
        f"À bénéficier d'un {type_label.lower()} du {d1} au {d2} "
        f"({nj} jour{'s' if nj > 1 else ''} calendaire{'s' if nj > 1 else ''})."
    )
    pdf.multi_cell(0, 7, texte2)

    if conge.motif:
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(*TEXT)
        pdf.cell(30, 6, "Motif :")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(0, 6, conge.motif)

    pdf.ln(14)

    # Signatures
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(*DARK)
    col = 85
    pdf.cell(col, 6, "L'Intéressé(e)", align="C")
    pdf.cell(col, 6, "La Direction des RH", align="C", ln=True)
    pdf.ln(14)
    pdf.set_draw_color(*BORDER)
    x = pdf.get_x()
    y = pdf.get_y()
    pdf.line(x + 10,  y, x + col - 10,  y)
    pdf.line(x + col + 10, y, x + col * 2 - 10, y)

    # Footer
    pdf.set_y(-18)
    pdf.set_font("Helvetica", "", 7)
    pdf.set_text_color(*TEXT)
    pdf.cell(0, 5, f"Document généré le {timezone.now().strftime('%d/%m/%Y')} — INS Guinée — Système de Gestion RH", align="C")

    return bytes(pdf.output())


# ══════════════════════════════════════════════════════════════
#  HELPERS HTTP
# ══════════════════════════════════════════════════════════════

from rest_framework.response import Response

def _ok(data):
    return Response(data, status=status.HTTP_200_OK)

def _created(data):
    return Response(data, status=status.HTTP_201_CREATED)

def _bad(errors):
    return Response(errors, status=status.HTTP_400_BAD_REQUEST)

def _no_content():
    return Response(status=status.HTTP_204_NO_CONTENT)