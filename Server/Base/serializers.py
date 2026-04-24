# courriers/serializers.py

from rest_framework import serializers
from .models import CourrierArrive, LigneCirculation


class LigneCirculationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour une ligne du tableau de circulation."""

    fonction_display = serializers.CharField(
        source='get_fonction_display',
        read_only=True
    )

    class Meta:
        model  = LigneCirculation
        fields = [
            'id',
            'fonction',
            'fonction_display',
            'ordre',
            'date_signature',
            'annotation',
            'observation',
        ]


class CourrierArriveListSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour la liste des courriers (sans les lignes)."""

    scan_url = serializers.SerializerMethodField()

    class Meta:
        model  = CourrierArrive
        fields = [
            'id',
            'numero_ordre',
            'date_arrivee',
            'origine',
            'reference',
            'date_envoi',
            'objet',
            'scan_url',
            'created_at',
            'updated_at',
        ]

    def get_scan_url(self, obj):
        """Retourne l'URL publique Cloudinary du scan."""
        if obj.scan:
            return obj.scan.url
        return None


class CourrierArriveDetailSerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet avec :
    - le scan Cloudinary (upload et lecture URL)
    - les lignes de circulation imbriquées (lecture + mise à jour)
    """

    # ── Lecture : URL publique du scan ───────────────────────
    scan_url = serializers.SerializerMethodField(read_only=True)

    # ── Écriture : champ fichier pour l'upload Cloudinary ───
    scan = serializers.FileField(
        write_only=True,
        required=False,
        allow_null=True,
        help_text="Fichier image ou PDF du courrier scanné"
    )

    # ── Lignes de circulation imbriquées (lecture) ───────────
    lignes_circulation = LigneCirculationSerializer(
        many=True,
        read_only=True
    )

    # ── Champ calculé : nom de l'auteur ──────────────────────
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = CourrierArrive
        fields = [
            'id',
            'numero_ordre',        # read_only via editable=False sur le model
            'date_arrivee',
            'origine',
            'reference',
            'date_envoi',
            'objet',
            'scan',                # write_only (upload)
            'scan_url',            # read_only  (URL retournée)
            'lignes_circulation',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_name',
        ]
        read_only_fields = [
            'numero_ordre',
            'created_at',
            'updated_at',
            'created_by',
        ]

    def get_scan_url(self, obj):
        if obj.scan:
            return obj.scan.url
        return None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None

    def create(self, validated_data):
        # L'utilisateur connecté est injecté comme créateur
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class LigneCirculationUpdateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur dédié à la mise à jour d'une ligne de circulation
    (signature d'un responsable).
    """

    class Meta:
        model  = LigneCirculation
        fields = [
            'id',
            'date_signature',
            'annotation',
            'observation',
        ]


class CourrierArriveImpressionSerializer(serializers.ModelSerializer):
    """
    Sérialiseur enrichi pour l'impression / téléchargement PDF.
    Inclut toutes les données nécessaires à l'entête MPCID et au tableau.
    """

    scan_url           = serializers.SerializerMethodField()
    lignes_circulation = LigneCirculationSerializer(many=True, read_only=True)
    created_by_name    = serializers.SerializerMethodField()

    class Meta:
        model  = CourrierArrive
        fields = [
            'id',
            'numero_ordre',
            'date_arrivee',
            'origine',
            'reference',
            'date_envoi',
            'objet',
            'scan_url',
            'lignes_circulation',
            'created_at',
            'created_by_name',
        ]

    def get_scan_url(self, obj):
        return obj.scan.url if obj.scan else None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None