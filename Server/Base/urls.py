from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    CourrierArriveListCreateView,
    CourrierArriveDetailView,
    CourrierScanUploadView,
    LigneCirculationUpdateView,
    CourrierArriveImpressionView,
)




router = DefaultRouter()



urlpatterns = [
    path("", include(router.urls)),
    path("login/", LoginView.as_view(), name="login"),
    path(
        'courriers-arrives/',
        CourrierArriveListCreateView.as_view(),
        name='courrier-arrive-list-create'
    ),
 
    # ── 2. Détail, Modification, Suppression ─────────────────
    # GET    → consulter la fiche complète (avec lignes)
    # PUT    → modifier entièrement
    # PATCH  → modification partielle
    # DELETE → supprimer (et supprime le scan Cloudinary)
    path(
        'courriers-arrives/<int:pk>/',
        CourrierArriveDetailView.as_view(),
        name='courrier-arrive-detail'
    ),
 
    # ── 3. Upload / Remplacement / Suppression du scan ───────
    # POST   → uploader ou remplacer le scan (multipart)
    # DELETE → supprimer uniquement le scan
    path(
        'courriers-arrives/<int:pk>/scan/',
        CourrierScanUploadView.as_view(),
        name='courrier-arrive-scan'
    ),
 
    # ── 4. Signature d'une ligne de circulation ───────────────
    # PATCH  → le responsable renseigne date, annotation, observation
    path(
        'courriers-arrives/<int:pk>/circulation/<int:ligne_id>/',
        LigneCirculationUpdateView.as_view(),
        name='ligne-circulation-update'
    ),
 
    # ── 5. Données d'impression / téléchargement ─────────────
    # GET    → données complètes enrichies pour génération PDF
    path(
        'courriers-arrives/<int:pk>/impression/',
        CourrierArriveImpressionView.as_view(),
        name='courrier-arrive-impression'
    ),
]
 
  

