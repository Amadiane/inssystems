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










# rh/serializers.py
import cloudinary
import cloudinary.uploader
from rest_framework import serializers
from .models import (
    Direction, Fonction, Personnel,
    DemandeConge, SoldeConge, AutorisationAbsence, AssuranceMaladie,
)


# ══════════════════════════════════════════════════════════════
#  RÉFÉRENTIELS
# ══════════════════════════════════════════════════════════════

class DirectionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Direction
        fields = ["id", "nom", "code"]


class FonctionSerializer(serializers.ModelSerializer):
    direction_nom = serializers.CharField(source="direction.nom", read_only=True)

    class Meta:
        model  = Fonction
        fields = ["id", "titre", "direction", "direction_nom"]


# ══════════════════════════════════════════════════════════════
#  PERSONNEL
# ══════════════════════════════════════════════════════════════

class PersonnelListSerializer(serializers.ModelSerializer):
    """Serializer léger pour la liste (tableau)."""
    nom_complet    = serializers.ReadOnlyField()
    fonction_nom   = serializers.CharField(source="fonction.titre",    read_only=True)
    direction_nom  = serializers.CharField(source="direction.nom",     read_only=True)
    photo_url      = serializers.ReadOnlyField()
    cnss_expire    = serializers.ReadOnlyField()

    class Meta:
        model  = Personnel
        fields = [
            "id", "matricule_interne", "matricule_fp", "type_employe",
            "nom", "prenom", "nom_complet", "sexe",
            "fonction", "fonction_nom", "direction", "direction_nom",
            "email", "telephone", "actif",
            "salaire", "prime", "net_a_payer",
            "date_debut", "date_fin",
            "cnss_id", "cnss_date_fin", "cnss_expire",
            "photo_url",
        ]


class PersonnelDetailSerializer(serializers.ModelSerializer):
    """Serializer complet pour le détail/création/modification."""
    nom_complet          = serializers.ReadOnlyField()
    fonction_nom         = serializers.CharField(source="fonction.titre",    read_only=True)
    direction_nom        = serializers.CharField(source="direction.nom",     read_only=True)
    photo_url            = serializers.ReadOnlyField()
    piece_identite_url   = serializers.ReadOnlyField()
    rib_url              = serializers.ReadOnlyField()
    cnss_expire          = serializers.ReadOnlyField()
    net_a_payer          = serializers.ReadOnlyField()

    class Meta:
        model  = Personnel
        fields = [
            "id", "matricule_interne", "matricule_fp", "type_employe",
            "nom", "prenom", "nom_complet", "sexe",
            "date_naissance", "lieu_naissance", "nationalite",
            "adresse", "email", "telephone",
            "fonction", "fonction_nom", "direction", "direction_nom",
            "diplome", "diplome_date", "diplome_lieu",
            "date_debut", "date_fin", "actif",
            "salaire", "prime", "net_a_payer",
            "cnss_id", "cnss_date_debut", "cnss_date_fin", "cnss_expire",
            "photo", "photo_url",
            "piece_identite", "piece_identite_url",
            "rib", "rib_url",
            "autres_pieces",
            "created_at", "updated_at",
        ]
        read_only_fields = ["matricule_interne", "net_a_payer", "created_at", "updated_at"]


# ══════════════════════════════════════════════════════════════
#  CONGÉS
# ══════════════════════════════════════════════════════════════

class DemandeCongeSerializer(serializers.ModelSerializer):
    personnel_nom    = serializers.CharField(source="personnel.nom_complet", read_only=True)
    personnel_type   = serializers.CharField(source="personnel.type_employe", read_only=True)
    type_conge_label = serializers.CharField(source="get_type_conge_display", read_only=True)
    statut_label     = serializers.CharField(source="get_statut_display",     read_only=True)
    valide_par_sup_nom = serializers.CharField(source="valide_par_sup.get_full_name", read_only=True)
    valide_par_drh_nom = serializers.CharField(source="valide_par_drh.get_full_name", read_only=True)

    class Meta:
        model  = DemandeConge
        fields = [
            "id", "personnel", "personnel_nom", "personnel_type",
            "type_conge", "type_conge_label",
            "date_debut", "date_fin", "nombre_jours", "motif",
            "statut", "statut_label",
            "valide_par_sup", "valide_par_sup_nom", "date_valid_sup",
            "valide_par_drh", "valide_par_drh_nom", "date_valid_drh",
            "commentaire_rh",
            "created_at", "updated_at",
        ]
        read_only_fields = ["nombre_jours", "created_at", "updated_at"]

    def validate(self, data):
        debut = data.get("date_debut")
        fin   = data.get("date_fin")
        if debut and fin and fin < debut:
            raise serializers.ValidationError("La date de fin doit être après la date de début.")
        return data


class ValidationCongeSerializer(serializers.Serializer):
    """Payload pour valider ou refuser un congé."""
    action      = serializers.ChoiceField(choices=["valider_sup", "valider_drh", "refuser", "annuler"])
    commentaire = serializers.CharField(required=False, allow_blank=True)


class SoldeCongeSerializer(serializers.ModelSerializer):
    personnel_nom = serializers.CharField(source="personnel.nom_complet", read_only=True)
    personnel_type = serializers.CharField(source="personnel.type_employe", read_only=True)

    class Meta:
        model  = SoldeConge
        fields = [
            "id", "personnel", "personnel_nom", "personnel_type",
            "jours_acquis", "jours_pris", "jours_restants", "annee",
            "updated_at",
        ]
        read_only_fields = ["jours_restants", "updated_at"]


class AutorisationAbsenceSerializer(serializers.ModelSerializer):
    conge_info = DemandeCongeSerializer(source="conge", read_only=True)

    class Meta:
        model  = AutorisationAbsence
        fields = ["id", "numero", "conge", "conge_info", "date_generation", "pdf_url"]
        read_only_fields = ["numero", "date_generation"]


# ══════════════════════════════════════════════════════════════
#  ASSURANCE MALADIE
# ══════════════════════════════════════════════════════════════

class AssuranceMaladieSerializer(serializers.ModelSerializer):
    personnel_nom       = serializers.CharField(source="personnel.nom_complet",   read_only=True)
    personnel_type      = serializers.CharField(source="personnel.type_employe",  read_only=True)
    personnel_direction = serializers.CharField(source="personnel.direction.nom", read_only=True)
    personnel_fonction  = serializers.CharField(source="personnel.fonction.titre",read_only=True)

    class Meta:
        model  = AssuranceMaladie
        fields = [
            "id", "personnel", "personnel_nom", "personnel_type",
            "personnel_direction", "personnel_fonction",
            "numero_carte", "date_adhesion", "date_expiration",
            "actif", "notes", "updated_at",
        ]
        read_only_fields = ["updated_at"]


# ══════════════════════════════════════════════════════════════
#  DASHBOARD / STATS
# ══════════════════════════════════════════════════════════════

class RHStatsSerializer(serializers.Serializer):
    total_personnel     = serializers.IntegerField()
    fonctionnaires      = serializers.IntegerField()
    contractuels        = serializers.IntegerField()
    actifs              = serializers.IntegerField()
    inactifs            = serializers.IntegerField()
    conges_en_attente   = serializers.IntegerField()
    conges_valides      = serializers.IntegerField()
    cnss_expires        = serializers.IntegerField()
    masse_salariale     = serializers.DecimalField(max_digits=20, decimal_places=2)