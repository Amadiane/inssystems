# courriers/models.py

from django.db import models
from cloudinary.models import CloudinaryField
from django.utils import timezone
import cloudinary


def generate_numero_ordre():
    last = CourrierArrive.objects.order_by('-id').first()
    if last and last.numero_ordre:
        try:
            parts   = last.numero_ordre.split('/')
            new_num = int(parts[-1]) + 1
        except (ValueError, IndexError):
            new_num = 1
    else:
        new_num = 1
    return f"MPCID/INS/{str(new_num).zfill(4)}"


class CourrierArrive(models.Model):

    numero_ordre = models.CharField(
        max_length=30, unique=True, editable=False,
        verbose_name="Numéro d'ordre"
    )
    date_arrivee = models.DateField(default=timezone.now, verbose_name="Date d'arrivée")
    origine      = models.CharField(max_length=200, verbose_name="Origine")
    reference    = models.CharField(max_length=200, verbose_name="Référence")
    date_envoi   = models.DateField(null=True, blank=True, verbose_name="Date d'envoi")
    objet        = models.TextField(verbose_name="Objet")

    # ── Stocke le scan comme texte (public_id Cloudinary ou URL) ──
    # On utilise CharField au lieu de CloudinaryField pour éviter
    # les problèmes de sérialisation et de double upload
    scan = models.CharField(
        max_length=500,
        null=True, blank=True,
        verbose_name="Scan (public_id ou URL Cloudinary)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='courriers_crees'
    )

    class Meta:
        verbose_name        = "Courrier Arrivé"
        verbose_name_plural = "Courriers Arrivés"
        ordering            = ['-date_arrivee', '-id']

    def __str__(self):
        return f"{self.numero_ordre} — {self.origine} ({self.date_arrivee})"

    def save(self, *args, **kwargs):
        if not self.numero_ordre:
            self.numero_ordre = generate_numero_ordre()
        super().save(*args, **kwargs)

    @property
    def scan_url(self):
        """
        Retourne toujours une URL HTTPS valide pour le scan,
        peu importe si on a stocké un public_id ou une URL complète.
        """
        val = self.scan
        if not val:
            return None

        val = str(val).strip()

        # Déjà une URL complète
        if val.startswith("http://") or val.startswith("https://"):
            # Forcer HTTPS
            return val.replace("http://", "https://", 1)

        # C'est un public_id → construire l'URL
        if val and val not in ("None", "", "null"):
            try:
                # Déterminer le resource_type depuis l'extension
                if val.lower().endswith(".pdf") or "/raw/" in val:
                    resource_type = "raw"
                else:
                    resource_type = "image"

                cfg        = cloudinary.config()
                cloud_name = cfg.cloud_name
                if cloud_name:
                    return f"https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{val}"
            except Exception:
                pass

        return None


# ── Choices pour le tableau de circulation ───────────────
FONCTION_CHOICES = [
    ('DG',  'Directeur Général'),
    ('DGA', 'Directeur Général Adjoint'),
    ('DIR', 'Le Directeur'),
    ('SD',  'Le Sous Directeur'),
]

class LigneCirculation(models.Model):
    courrier = models.ForeignKey(
        CourrierArrive, on_delete=models.CASCADE,
        related_name='lignes_circulation'
    )
    fonction       = models.CharField(max_length=10, choices=FONCTION_CHOICES)
    ordre          = models.PositiveSmallIntegerField(default=0)
    date_signature = models.DateField(null=True, blank=True)
    annotation     = models.TextField(blank=True, default='')
    observation    = models.TextField(blank=True, default='')

    class Meta:
        ordering       = ['ordre']
        unique_together = [('courrier', 'fonction')]

    def __str__(self):
        return f"{self.get_fonction_display()} — {self.courrier.numero_ordre}"


# ── Signal : créer les 4 lignes à la création ────────────
from django.db.models.signals import post_save
from django.dispatch import receiver

RESPONSABLES_DEFAUT = [('DG', 1), ('DGA', 2), ('DIR', 3), ('SD', 4)]

@receiver(post_save, sender=CourrierArrive)
def creer_lignes_circulation(sender, instance, created, **kwargs):
    if created:
        LigneCirculation.objects.bulk_create([
            LigneCirculation(courrier=instance, fonction=code, ordre=ordre)
            for code, ordre in RESPONSABLES_DEFAUT
        ])










# ══════════════════════════════════════════════════════════
#  À AJOUTER dans Base/models.py  (après CourrierArrive)
# ══════════════════════════════════════════════════════════

from django.db import models
from django.utils import timezone
import cloudinary


# ── Numéro de sortie auto : format INS-OUT/XXXX ──────────
def generate_numero_sortie():
    last = CourrierSortant.objects.order_by('-id').first()
    if last and last.numero_sortie:
        try:
            parts   = last.numero_sortie.split('/')
            new_num = int(parts[-1]) + 1
        except (ValueError, IndexError):
            new_num = 1
    else:
        new_num = 1
    return f"INS-OUT/{str(new_num).zfill(4)}"


class CourrierSortant(models.Model):
    """
    Fiche de Sortie du Courrier — INS Guinée
    Numéro distinct du courrier arrivé (format INS-OUT/XXXX)
    """

    # ── Identifiant ─────────────────────────────────────────
    numero_sortie = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
        verbose_name="Numéro de sortie",
        help_text="Généré automatiquement au format INS-OUT/XXXX"
    )

    # ── Informations du courrier ─────────────────────────────
    origine = models.CharField(
        max_length=200,
        verbose_name="Origine",
        help_text="Service ou entité émettrice"
    )

    objet = models.TextField(
        verbose_name="Objet"
    )

    destinataire = models.CharField(
        max_length=200,
        verbose_name="Nom du destinataire"
    )

    date_sortie = models.DateField(
        default=timezone.now,
        verbose_name="Date de sortie"
    )

    # ── Pièce jointe (URL Cloudinary stockée comme texte) ──
    scan = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name="Scan / Pièce jointe (URL Cloudinary)"
    )

    # ── Métadonnées ──────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True,     verbose_name="Modifié le")
    created_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='courriers_sortants_crees',
        verbose_name="Créé par"
    )

    class Meta:
        verbose_name        = "Courrier Sortant"
        verbose_name_plural = "Courriers Sortants"
        ordering            = ['-date_sortie', '-id']

    def __str__(self):
        return f"{self.numero_sortie} — {self.destinataire} ({self.date_sortie})"

    def save(self, *args, **kwargs):
        if not self.numero_sortie:
            self.numero_sortie = generate_numero_sortie()
        super().save(*args, **kwargs)

    @property
    def scan_url(self):
        """Retourne l'URL HTTPS du scan, que ce soit un public_id ou une URL complète."""
        val = self.scan
        if not val:
            return None
        val = str(val).strip()
        if val.startswith("http://") or val.startswith("https://"):
            return val.replace("http://", "https://", 1)
        if val and val not in ("None", "", "null"):
            try:
                if val.lower().endswith(".pdf") or "/raw/" in val:
                    resource_type = "raw"
                else:
                    resource_type = "image"
                cfg = cloudinary.config()
                if cfg.cloud_name:
                    return f"https://res.cloudinary.com/{cfg.cloud_name}/{resource_type}/upload/{val}"
            except Exception:
                pass
        return None








# ══════════════════════════════════════════════════════════
#  À AJOUTER dans Base/models.py  (après CourrierSortant)
# ══════════════════════════════════════════════════════════

from django.db import models
from django.utils import timezone


TYPE_COURRIER_CHOICES = [
    ('arrive',  'Courrier Arrivé'),
    ('sortant', 'Courrier Sortant'),
    ('interne', 'Document Interne'),
]

STATUT_CHOICES = [
    ('actif',    'Actif'),
    ('archive',  'Archivé'),
    ('detruit',  'Détruit'),
]


def generate_numero_archive():
    last = Archive.objects.order_by('-id').first()
    if last and last.numero_archive:
        try:
            parts   = last.numero_archive.split('/')
            new_num = int(parts[-1]) + 1
        except (ValueError, IndexError):
            new_num = 1
    else:
        new_num = 1
    return f"INS-ARC/{str(new_num).zfill(4)}"


class Archive(models.Model):
    """
    Module Archives — INS Guinée
    Référence centralisée de tous les documents archivés
    (courriers arrivés, sortants, documents internes)
    """

    # ── Identifiant ─────────────────────────────────────────
    numero_archive = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
        verbose_name="Numéro d'archive",
        help_text="Généré automatiquement au format INS-ARC/XXXX"
    )

    # ── Informations du document ─────────────────────────────
    type_courrier = models.CharField(
        max_length=20,
        choices=TYPE_COURRIER_CHOICES,
        default='arrive',
        verbose_name="Type de courrier"
    )

    objet = models.TextField(
        verbose_name="Objet / Description"
    )

    origine = models.CharField(
        max_length=200,
        verbose_name="Origine / Émetteur"
    )

    destinataire = models.CharField(
        max_length=200,
        blank=True,
        default='',
        verbose_name="Destinataire (si sortant)"
    )

    date_document = models.DateField(
        default=timezone.now,
        verbose_name="Date du document"
    )

    date_archivage = models.DateField(
        default=timezone.now,
        verbose_name="Date d'archivage"
    )

    # ── Référence au courrier source (optionnel) ─────────────
    reference_courrier = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name="Référence courrier source",
        help_text="Ex: MPCID/INS/0001 ou INS-OUT/0001"
    )

    # ── Statut ───────────────────────────────────────────────
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='archive',
        verbose_name="Statut"
    )

    # ── Annotations ──────────────────────────────────────────
    observations = models.TextField(
        blank=True,
        default='',
        verbose_name="Observations"
    )

    # ── Pièce jointe ─────────────────────────────────────────
    scan = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name="Scan / Document numérisé (URL Cloudinary)"
    )

    # ── Métadonnées ──────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='archives_crees',
        verbose_name="Archivé par"
    )

    class Meta:
        verbose_name        = "Archive"
        verbose_name_plural = "Archives"
        ordering            = ['-date_archivage', '-id']

    def __str__(self):
        return f"{self.numero_archive} — {self.objet[:50]} ({self.date_archivage})"

    def save(self, *args, **kwargs):
        if not self.numero_archive:
            self.numero_archive = generate_numero_archive()
        super().save(*args, **kwargs)

    @property
    def scan_url(self):
        val = self.scan
        if not val:
            return None
        val = str(val).strip()
        if val.startswith("http://") or val.startswith("https://"):
            return val.replace("http://", "https://", 1)
        if val and val not in ("None", "", "null"):
            try:
                import cloudinary
                if val.lower().endswith(".pdf") or "/raw/" in val:
                    resource_type = "raw"
                else:
                    resource_type = "image"
                cfg = cloudinary.config()
                if cfg.cloud_name:
                    return f"https://res.cloudinary.com/{cfg.cloud_name}/{resource_type}/upload/{val}"
            except Exception:
                pass
        return None

    @property
    def type_display(self):
        return dict(TYPE_COURRIER_CHOICES).get(self.type_courrier, self.type_courrier)

    @property
    def statut_display(self):
        return dict(STATUT_CHOICES).get(self.statut, self.statut)












# rh/models.py
import cloudinary
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# ══════════════════════════════════════════════════════════════
#  HELPERS — Numéros automatiques
# ══════════════════════════════════════════════════════════════

def generate_matricule_fon():
    last = Personnel.objects.filter(type_employe="fonctionnaire").order_by("-id").first()
    n = 1
    if last and last.matricule_interne:
        try:
            n = int(last.matricule_interne.split("-")[-1]) + 1
        except (ValueError, IndexError):
            pass
    return f"INS-FON-{str(n).zfill(4)}"


def generate_matricule_con():
    last = Personnel.objects.filter(type_employe="contractuel").order_by("-id").first()
    n = 1
    if last and last.matricule_interne:
        try:
            n = int(last.matricule_interne.split("-")[-1]) + 1
        except (ValueError, IndexError):
            pass
    return f"INS-CON-{str(n).zfill(4)}"


# ══════════════════════════════════════════════════════════════
#  RÉFÉRENTIELS
# ══════════════════════════════════════════════════════════════

class Direction(models.Model):
    nom  = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Direction"
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class Fonction(models.Model):
    titre      = models.CharField(max_length=200, unique=True)
    direction  = models.ForeignKey(Direction, on_delete=models.SET_NULL, null=True, blank=True, related_name="fonctions")

    class Meta:
        verbose_name = "Fonction"
        ordering = ["titre"]

    def __str__(self):
        return self.titre


# ══════════════════════════════════════════════════════════════
#  PERSONNEL
# ══════════════════════════════════════════════════════════════

class Personnel(models.Model):

    TYPE_CHOICES = [
        ("fonctionnaire", "Fonctionnaire"),
        ("contractuel",   "Contractuel"),
    ]
    SEXE_CHOICES = [
        ("M", "Masculin"),
        ("F", "Féminin"),
    ]

    # ── Identification ──────────────────────────────────────
    type_employe        = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Type d'employé")
    matricule_interne   = models.CharField(max_length=30, unique=True, editable=False, verbose_name="Matricule interne")
    matricule_fp        = models.CharField(max_length=100, blank=True, null=True, verbose_name="Matricule Fonction Publique")

    # ── Identité ────────────────────────────────────────────
    nom                 = models.CharField(max_length=100, verbose_name="Nom")
    prenom              = models.CharField(max_length=100, verbose_name="Prénom")
    sexe                = models.CharField(max_length=1, choices=SEXE_CHOICES, verbose_name="Sexe")
    date_naissance      = models.DateField(verbose_name="Date de naissance")
    lieu_naissance      = models.CharField(max_length=200, verbose_name="Lieu de naissance")
    nationalite         = models.CharField(max_length=100, default="Guinéenne", verbose_name="Nationalité")

    # ── Contact ──────────────────────────────────────────────
    adresse             = models.CharField(max_length=300, blank=True, verbose_name="Adresse résidentielle")
    email               = models.EmailField(blank=True, null=True, unique=True, verbose_name="Email")
    telephone           = models.CharField(max_length=30, blank=True, verbose_name="Téléphone")

    # ── Poste ────────────────────────────────────────────────
    fonction            = models.ForeignKey(Fonction, on_delete=models.SET_NULL, null=True, blank=True, related_name="agents")
    direction           = models.ForeignKey(Direction, on_delete=models.SET_NULL, null=True, blank=True, related_name="agents")

    # ── Diplôme ──────────────────────────────────────────────
    diplome             = models.CharField(max_length=200, blank=True, verbose_name="Diplôme obtenu")
    diplome_date        = models.DateField(null=True, blank=True, verbose_name="Date d'obtention")
    diplome_lieu        = models.CharField(max_length=200, blank=True, verbose_name="Lieu d'obtention")

    # ── Contrat ──────────────────────────────────────────────
    date_debut          = models.DateField(verbose_name="Date de début")
    date_fin            = models.DateField(null=True, blank=True, verbose_name="Date de fin")
    actif               = models.BooleanField(default=True, verbose_name="Actif")

    # ── Rémunération ─────────────────────────────────────────
    salaire             = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Salaire de base (GNF)")
    prime               = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Prime gouvernementale (GNF)")
    net_a_payer         = models.DecimalField(max_digits=15, decimal_places=2, default=0, editable=False, verbose_name="Net à payer (GNF)")

    # ── CNSS ─────────────────────────────────────────────────
    cnss_id             = models.CharField(max_length=100, blank=True, verbose_name="Identifiant CNSS")
    cnss_date_debut     = models.DateField(null=True, blank=True, verbose_name="CNSS — Date de début")
    cnss_date_fin       = models.DateField(null=True, blank=True, verbose_name="CNSS — Date de fin")

    # ── Pièces jointes (stockées sur Cloudinary via upload manuel) ──
    piece_identite      = models.CharField(max_length=500, blank=True, null=True, verbose_name="Pièce d'identité (URL/public_id)")
    rib                 = models.CharField(max_length=500, blank=True, null=True, verbose_name="RIB (URL/public_id)")
    autres_pieces       = models.CharField(max_length=500, blank=True, null=True, verbose_name="Autres pièces jointes")

    # ── Photo ────────────────────────────────────────────────
    photo               = models.CharField(max_length=500, blank=True, null=True, verbose_name="Photo (URL/public_id)")

    # ── Méta ─────────────────────────────────────────────────
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)
    created_by          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="personnel_crees")

    class Meta:
        verbose_name         = "Personnel"
        verbose_name_plural  = "Personnel"
        ordering             = ["nom", "prenom"]

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.matricule_interne})"

    # ── Calcul automatique net à payer ───────────────────────
    def calcul_net(self):
        if self.type_employe == "fonctionnaire":
            return (self.salaire or 0) + (self.prime or 0)
        return self.salaire or 0

    def save(self, *args, **kwargs):
        # Génère le matricule interne à la création
        if not self.matricule_interne:
            if self.type_employe == "fonctionnaire":
                self.matricule_interne = generate_matricule_fon()
            else:
                self.matricule_interne = generate_matricule_con()
        # Calcul net automatique
        self.net_a_payer = self.calcul_net()
        super().save(*args, **kwargs)

    # ── Propriétés URL Cloudinary ─────────────────────────────
    @property
    def photo_url(self):
        if not self.photo:
            return None
        if self.photo.startswith("http"):
            return self.photo
        try:
            return cloudinary.CloudinaryImage(self.photo).build_url()
        except Exception:
            return self.photo

    @property
    def piece_identite_url(self):
        if not self.piece_identite:
            return None
        if self.piece_identite.startswith("http"):
            return self.piece_identite
        try:
            return cloudinary.CloudinaryImage(self.piece_identite).build_url()
        except Exception:
            return self.piece_identite

    @property
    def rib_url(self):
        if not self.rib:
            return None
        if self.rib.startswith("http"):
            return self.rib
        try:
            return cloudinary.CloudinaryImage(self.rib).build_url()
        except Exception:
            return self.rib

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"

    @property
    def cnss_expire(self):
        if self.cnss_date_fin and self.cnss_date_fin <= timezone.now().date():
            return True
        return False


# ══════════════════════════════════════════════════════════════
#  CONGÉS
# ══════════════════════════════════════════════════════════════

class DemandeConge(models.Model):

    STATUT_CHOICES = [
        ("en_attente",  "En attente"),
        ("validee_sup", "Validée par le supérieur"),
        ("validee_drh", "Validée par la DRH"),
        ("refusee",     "Refusée"),
        ("annulee",     "Annulée"),
    ]
    TYPE_CHOICES = [
        ("annuel",    "Congé annuel"),
        ("maladie",   "Congé maladie"),
        ("maternite", "Congé maternité"),
        ("sans_solde","Congé sans solde"),
        ("autre",     "Autre"),
    ]

    personnel       = models.ForeignKey(Personnel, on_delete=models.CASCADE, related_name="conges")
    type_conge      = models.CharField(max_length=20, choices=TYPE_CHOICES, default="annuel")
    date_debut      = models.DateField(verbose_name="Date de début du congé")
    date_fin        = models.DateField(verbose_name="Date de fin du congé")
    nombre_jours    = models.PositiveIntegerField(editable=False, verbose_name="Nombre de jours")
    motif           = models.TextField(blank=True, verbose_name="Motif")
    statut          = models.CharField(max_length=20, choices=STATUT_CHOICES, default="en_attente")

    # Validations
    valide_par_sup  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="conges_valides_sup")
    date_valid_sup  = models.DateTimeField(null=True, blank=True)
    valide_par_drh  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="conges_valides_drh")
    date_valid_drh  = models.DateTimeField(null=True, blank=True)
    commentaire_rh  = models.TextField(blank=True)

    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name         = "Demande de congé"
        verbose_name_plural  = "Demandes de congé"
        ordering             = ["-created_at"]

    def __str__(self):
        return f"Congé {self.personnel} du {self.date_debut} au {self.date_fin}"

    def save(self, *args, **kwargs):
        # Calcul automatique du nombre de jours (jours calendaires)
        if self.date_debut and self.date_fin:
            delta = (self.date_fin - self.date_debut).days + 1
            self.nombre_jours = max(delta, 0)
        super().save(*args, **kwargs)


class SoldeConge(models.Model):
    """
    Solde de congés pour les contractuels (2,5 j/mois = 30 j/an).
    Mis à jour automatiquement à chaque validation DRH.
    """
    personnel       = models.OneToOneField(Personnel, on_delete=models.CASCADE, related_name="solde_conge")
    jours_acquis    = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    jours_pris      = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    jours_restants  = models.DecimalField(max_digits=6, decimal_places=1, default=0, editable=False)
    annee           = models.PositiveIntegerField(default=timezone.now().year)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Solde de congé"

    def __str__(self):
        return f"Solde congé — {self.personnel} ({self.annee})"

    def save(self, *args, **kwargs):
        self.jours_restants = (self.jours_acquis or 0) - (self.jours_pris or 0)
        super().save(*args, **kwargs)

    def recalcul_acquis(self):
        """Recalcul des jours acquis : 2.5 j/mois depuis date_debut."""
        from dateutil.relativedelta import relativedelta
        p = self.personnel
        if p.date_debut:
            today  = timezone.now().date()
            rdelta = relativedelta(today, p.date_debut)
            mois   = rdelta.years * 12 + rdelta.months
            self.jours_acquis = round(mois * 2.5, 1)
            self.save()


class AutorisationAbsence(models.Model):
    """Générée automatiquement lors de la validation DRH d'un congé."""
    conge           = models.OneToOneField(DemandeConge, on_delete=models.CASCADE, related_name="autorisation")
    numero          = models.CharField(max_length=30, unique=True, editable=False)
    date_generation = models.DateField(auto_now_add=True)
    pdf_url         = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        verbose_name = "Autorisation d'absence"

    def __str__(self):
        return f"Autorisation {self.numero}"

    def save(self, *args, **kwargs):
        if not self.numero:
            last = AutorisationAbsence.objects.order_by("-id").first()
            n = int(last.numero.split("-")[-1]) + 1 if last else 1
            self.numero = f"AUT-{timezone.now().year}-{str(n).zfill(4)}"
        super().save(*args, **kwargs)


# ══════════════════════════════════════════════════════════════
#  ASSURANCE MALADIE
# ══════════════════════════════════════════════════════════════

class AssuranceMaladie(models.Model):
    """Vue automatique : récupère les données depuis Personnel."""
    personnel       = models.OneToOneField(Personnel, on_delete=models.CASCADE, related_name="assurance")
    numero_carte    = models.CharField(max_length=100, blank=True, verbose_name="N° carte assurance")
    date_adhesion   = models.DateField(null=True, blank=True, verbose_name="Date d'adhésion")
    date_expiration = models.DateField(null=True, blank=True, verbose_name="Date d'expiration")
    actif           = models.BooleanField(default=True)
    notes           = models.TextField(blank=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Assurance maladie"

    def __str__(self):
        return f"Assurance — {self.personnel}"