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