# courriers/serializers.py

from rest_framework import serializers
from .models import CourrierArrive, LigneCirculation


class LigneCirculationSerializer(serializers.ModelSerializer):
    fonction_display = serializers.CharField(source='get_fonction_display', read_only=True)

    class Meta:
        model  = LigneCirculation
        fields = ['id', 'fonction', 'fonction_display', 'ordre',
                  'date_signature', 'annotation', 'observation']


class CourrierArriveListSerializer(serializers.ModelSerializer):
    # Utilise directement la @property du modèle
    scan_url = serializers.ReadOnlyField()

    class Meta:
        model  = CourrierArrive
        fields = ['id', 'numero_ordre', 'date_arrivee', 'origine',
                  'reference', 'date_envoi', 'objet', 'scan_url',
                  'created_at', 'updated_at']


class CourrierArriveDetailSerializer(serializers.ModelSerializer):
    # Utilise directement la @property du modèle
    scan_url           = serializers.ReadOnlyField()
    lignes_circulation = LigneCirculationSerializer(many=True, read_only=True)
    created_by_name    = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = CourrierArrive
        fields = ['id', 'numero_ordre', 'date_arrivee', 'origine',
                  'reference', 'date_envoi', 'objet', 'scan', 'scan_url',
                  'lignes_circulation', 'created_at', 'updated_at',
                  'created_by', 'created_by_name']
        read_only_fields = ['numero_ordre', 'created_at', 'updated_at', 'created_by', 'scan_url']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class LigneCirculationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = LigneCirculation
        fields = ['id', 'date_signature', 'annotation', 'observation']


class CourrierArriveImpressionSerializer(serializers.ModelSerializer):
    scan_url           = serializers.ReadOnlyField()
    lignes_circulation = LigneCirculationSerializer(many=True, read_only=True)
    created_by_name    = serializers.SerializerMethodField()

    class Meta:
        model  = CourrierArrive
        fields = ['id', 'numero_ordre', 'date_arrivee', 'origine',
                  'reference', 'date_envoi', 'objet', 'scan_url',
                  'lignes_circulation', 'created_at', 'created_by_name']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None








# ══════════════════════════════════════════════════════════
#  À AJOUTER dans Base/serializers.py
# ══════════════════════════════════════════════════════════

from rest_framework import serializers
from .models import CourrierSortant


class CourrierSortantListSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour la liste des courriers sortants."""
    scan_url = serializers.ReadOnlyField()  # utilise la @property du modèle

    class Meta:
        model  = CourrierSortant
        fields = [
            'id',
            'numero_sortie',
            'origine',
            'objet',
            'destinataire',
            'date_sortie',
            'scan_url',
            'created_at',
            'updated_at',
        ]


class CourrierSortantDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour la fiche sortante."""
    scan_url        = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = CourrierSortant
        fields = [
            'id',
            'numero_sortie',
            'origine',
            'objet',
            'destinataire',
            'date_sortie',
            'scan',
            'scan_url',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_name',
        ]
        read_only_fields = ['numero_sortie', 'created_at', 'updated_at', 'created_by', 'scan_url']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class CourrierSortantImpressionSerializer(serializers.ModelSerializer):
    """Sérialiseur enrichi pour impression / téléchargement."""
    scan_url        = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = CourrierSortant
        fields = [
            'id',
            'numero_sortie',
            'origine',
            'objet',
            'destinataire',
            'date_sortie',
            'scan_url',
            'created_at',
            'created_by_name',
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None







# ══════════════════════════════════════════════════════════
#  À AJOUTER dans Base/serializers.py
# ══════════════════════════════════════════════════════════

from rest_framework import serializers
from .models import Archive


class ArchiveListSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour la liste des archives."""
    scan_url       = serializers.ReadOnlyField()
    type_display   = serializers.ReadOnlyField()
    statut_display = serializers.ReadOnlyField()

    class Meta:
        model  = Archive
        fields = [
            'id',
            'numero_archive',
            'type_courrier',
            'type_display',
            'objet',
            'origine',
            'destinataire',
            'date_document',
            'date_archivage',
            'reference_courrier',
            'statut',
            'statut_display',
            'scan_url',
            'created_at',
        ]


class ArchiveDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour la fiche archive."""
    scan_url        = serializers.ReadOnlyField()
    type_display    = serializers.ReadOnlyField()
    statut_display  = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = Archive
        fields = [
            'id',
            'numero_archive',
            'type_courrier',
            'type_display',
            'objet',
            'origine',
            'destinataire',
            'date_document',
            'date_archivage',
            'reference_courrier',
            'statut',
            'statut_display',
            'observations',
            'scan',
            'scan_url',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_name',
        ]
        read_only_fields = [
            'numero_archive', 'created_at', 'updated_at',
            'created_by', 'scan_url', 'type_display', 'statut_display',
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class ArchiveImpressionSerializer(serializers.ModelSerializer):
    scan_url        = serializers.ReadOnlyField()
    type_display    = serializers.ReadOnlyField()
    statut_display  = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = Archive
        fields = [
            'id', 'numero_archive', 'type_courrier', 'type_display',
            'objet', 'origine', 'destinataire', 'date_document',
            'date_archivage', 'reference_courrier', 'statut', 'statut_display',
            'observations', 'scan_url', 'created_at', 'created_by_name',
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None