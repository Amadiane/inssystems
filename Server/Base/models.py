# courriers/models.py

from django.db import models
from cloudinary.models import CloudinaryField
from django.utils import timezone


def generate_numero_ordre():
    """Génère automatiquement un numéro d'ordre au format MPCID/INS/XXXX"""
    last = CourrierArrive.objects.order_by('-id').first()
    if last and last.numero_ordre:
        try:
            parts = last.numero_ordre.split('/')
            last_num = int(parts[-1])
            new_num = last_num + 1
        except (ValueError, IndexError):
            new_num = 1
    else:
        new_num = 1
    return f"MPCID/INS/{str(new_num).zfill(4)}"


class CourrierArrive(models.Model):
    """
    Fiche de Circulation du Courrier Arrivé — INS Guinée
    Entête conforme MPCID
    """

    # ── Identifiant ─────────────────────────────────────────
    numero_ordre = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
        verbose_name="Numéro d'ordre",
        help_text="Généré automatiquement au format MPCID/INS/XXXX"
    )

    # ── Informations du courrier ─────────────────────────────
    date_arrivee = models.DateField(
        default=timezone.now,
        verbose_name="Date d'arrivée"
    )

    origine = models.CharField(
        max_length=200,
        verbose_name="Origine",
        help_text="Ex: BCRG, Ministère des Finances..."
    )

    reference = models.CharField(
        max_length=200,
        verbose_name="Référence",
        help_text="Référence du courrier émetteur"
    )

    date_envoi = models.DateField(
        verbose_name="Date d'envoi (Du)",
        null=True,
        blank=True
    )

    objet = models.TextField(
        verbose_name="Objet",
        help_text="Objet du courrier"
    )

    # ── Pièce jointe via Cloudinary ──────────────────────────
    scan = CloudinaryField(
        folder='ins_guinee/courriers_arrives',
        resource_type='auto',   # accepte image ET pdf
        null=True,
        blank=True,
        verbose_name="Scan / Pièce jointe"
    )

    # ── Métadonnées ──────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True,     verbose_name="Modifié le")
    created_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='courriers_crees',
        verbose_name="Créé par"
    )

    class Meta:
        verbose_name = "Courrier Arrivé"
        verbose_name_plural = "Courriers Arrivés"
        ordering = ['-date_arrivee', '-id']

    def __str__(self):
        return f"{self.numero_ordre} — {self.origine} ({self.date_arrivee})"

    def save(self, *args, **kwargs):
        # Génère le numéro d'ordre uniquement à la création
        if not self.numero_ordre:
            self.numero_ordre = generate_numero_ordre()
        super().save(*args, **kwargs)


# ── Responsables habilités à signer ─────────────────────────
FONCTION_CHOICES = [
    ('DG',  'Directeur Général'),
    ('DGA', 'Directeur Général Adjoint'),
    ('DIR', 'Le Directeur'),
    ('SD',  'Le Sous Directeur'),
]

class LigneCirculation(models.Model):
    """
    Tableau de circulation joint à la fiche courrier.
    Une ligne par responsable signataire.
    """

    courrier = models.ForeignKey(
        CourrierArrive,
        on_delete=models.CASCADE,
        related_name='lignes_circulation',
        verbose_name="Courrier"
    )

    fonction = models.CharField(
        max_length=10,
        choices=FONCTION_CHOICES,
        verbose_name="Fonction"
    )

    # Ordre d'affichage fixe dans le tableau
    ordre = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Ordre d'affichage"
    )

    date_signature = models.DateField(
        null=True, blank=True,
        verbose_name="Date"
    )

    annotation = models.TextField(
        blank=True, default='',
        verbose_name="Annotation"
    )

    observation = models.TextField(
        blank=True, default='',
        verbose_name="Observation"
    )

    class Meta:
        verbose_name = "Ligne de circulation"
        verbose_name_plural = "Lignes de circulation"
        ordering = ['ordre']
        # Une seule ligne par fonction et par courrier
        unique_together = [('courrier', 'fonction')]

    def __str__(self):
        return f"{self.get_fonction_display()} — {self.courrier.numero_ordre}"


# ── Signal : créer automatiquement les 4 lignes à la création ─
from django.db.models.signals import post_save
from django.dispatch import receiver

RESPONSABLES_DEFAUT = [
    ('DG',  1),
    ('DGA', 2),
    ('DIR', 3),
    ('SD',  4),
]

@receiver(post_save, sender=CourrierArrive)
def creer_lignes_circulation(sender, instance, created, **kwargs):
    """Crée automatiquement les 4 lignes du tableau de circulation à la création."""
    if created:
        lignes = [
            LigneCirculation(
                courrier=instance,
                fonction=code,
                ordre=ordre
            )
            for code, ordre in RESPONSABLES_DEFAUT
        ]
        LigneCirculation.objects.bulk_create(lignes)