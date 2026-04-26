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