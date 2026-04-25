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