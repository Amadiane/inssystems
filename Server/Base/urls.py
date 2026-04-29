from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    CourrierArriveListCreateView,
    CourrierArriveDetailView,
    CourrierScanUploadView,
    LigneCirculationUpdateView,
    CourrierArriveImpressionView,
    CourrierScanDebugView,
)
from .views import (
    CourrierSortantListCreateView,
    CourrierSortantDetailView,
    CourrierSortantScanUploadView,
    CourrierSortantImpressionView,
)
from .views import (
    ArchiveListCreateView,
    ArchiveDetailView,
    ArchiveScanUploadView,
    AutoArchivageArriveeView,
    AutoArchivageSortantView,
    ArchiveStatsView,
    ArchiveImpressionView,
)
from .views import (
    CourrierArriveePDFView,
    CourrierSortantPDFView,
    ArchivePDFView,
)
from .views import (
    # Référentiels
    DirectionListCreateView, DirectionDetailView,
    FonctionListCreateView,  FonctionDetailView,
    # Personnel
    PersonnelListCreateView, PersonnelDetailView, PersonnelPDFView,
    # Congés
    CongeListCreateView, CongeDetailView, CongeValidationView,
    AutorisationPDFView,
    # Solde congés
    SoldeCongeView,
    # Assurance maladie
    AssuranceListView, AssuranceDetailView,
    # Stats
    RHStatsView,
)


router = DefaultRouter()



urlpatterns = [
    path("", include(router.urls)),
    path("login/", LoginView.as_view(), name="login"),
    path('courriers-arrives/',                                          CourrierArriveListCreateView.as_view(),  name='courrier-arrive-list-create'),
    path('courriers-arrives/<int:pk>/',                                 CourrierArriveDetailView.as_view(),      name='courrier-arrive-detail'),
    path('courriers-arrives/<int:pk>/scan/',                            CourrierScanUploadView.as_view(),        name='courrier-arrive-scan'),
    path('courriers-arrives/<int:pk>/circulation/<int:ligne_id>/',      LigneCirculationUpdateView.as_view(),    name='ligne-circulation-update'),
    path('courriers-arrives/<int:pk>/impression/',                      CourrierArriveImpressionView.as_view(),  name='courrier-arrive-impression'),
 
    # ── Debug (retirer en production) ─────────────────────────────────────
    path('courriers-arrives/<int:pk>/debug-scan/',                      CourrierScanDebugView.as_view(),         name='courrier-scan-debug'),

    path(
        'courriers-sortants/',
        CourrierSortantListCreateView.as_view(),
        name='courrier-sortant-list-create'
    ),
 
    # GET    → consulter la fiche complète
    # PATCH  → modification partielle
    # DELETE → supprimer
    path(
        'courriers-sortants/<int:pk>/',
        CourrierSortantDetailView.as_view(),
        name='courrier-sortant-detail'
    ),
 
    # POST   → uploader / remplacer le scan
    # DELETE → supprimer uniquement le scan
    path(
        'courriers-sortants/<int:pk>/scan/',
        CourrierSortantScanUploadView.as_view(),
        name='courrier-sortant-scan'
    ),
 
    # GET → données enrichies pour génération PDF
    path(
        'courriers-sortants/<int:pk>/impression/',
        CourrierSortantImpressionView.as_view(),
        name='courrier-sortant-impression'
    ),

    # Statistiques (avant les routes avec <pk> pour éviter conflit)
    path('archives/stats/',                        ArchiveStatsView.as_view(),            name='archive-stats'),
 
    # Liste + Création manuelle
    path('archives/',                              ArchiveListCreateView.as_view(),        name='archive-list-create'),
 
    # Détail, Modification, Suppression
    path('archives/<int:pk>/',                     ArchiveDetailView.as_view(),            name='archive-detail'),
 
    # Upload / Suppression scan
    path('archives/<int:pk>/scan/',                ArchiveScanUploadView.as_view(),        name='archive-scan'),
 
    # Auto-archivage depuis courrier arrivé
    path('archives/from-arrive/<int:pk>/',         AutoArchivageArriveeView.as_view(),     name='archive-from-arrive'),
 
    # Auto-archivage depuis courrier sortant
    path('archives/from-sortant/<int:pk>/',        AutoArchivageSortantView.as_view(),     name='archive-from-sortant'),
 
    # Données impression
    path('archives/<int:pk>/impression/',          ArchiveImpressionView.as_view(),        name='archive-impression'),

    path('courriers-arrives/<int:pk>/pdf/',   CourrierArriveePDFView.as_view(),  name='courrier-arrive-pdf'),
 
    # PDF Courrier Sortant
    path('courriers-sortants/<int:pk>/pdf/',  CourrierSortantPDFView.as_view(),  name='courrier-sortant-pdf'),
 
    # PDF Archive
    path('archives/<int:pk>/pdf/',            ArchivePDFView.as_view(),          name='archive-pdf'),









    # ── Référentiels ─────────────────────────────────────────
    path("directions/",                      DirectionListCreateView.as_view()),
    path("directions/<int:pk>/",             DirectionDetailView.as_view()),
 
    path("fonctions/",                       FonctionListCreateView.as_view()),
    path("fonctions/<int:pk>/",              FonctionDetailView.as_view()),
 
    # ── Personnel ────────────────────────────────────────────
    # GET  /api/rh/personnel/           → liste paginée + filtres
    # POST /api/rh/personnel/           → créer un agent (FormData avec fichiers)
    path("personnel/",                       PersonnelListCreateView.as_view()),
 
    # GET    /api/rh/personnel/<pk>/    → détail complet
    # PATCH  /api/rh/personnel/<pk>/    → modifier
    # DELETE /api/rh/personnel/<pk>/    → supprimer
    path("personnel/<int:pk>/",              PersonnelDetailView.as_view()),
 
    # GET /api/rh/personnel/<pk>/pdf/   → télécharger fiche PDF
    path("personnel/<int:pk>/pdf/",          PersonnelPDFView.as_view()),
 
    # ── Congés ───────────────────────────────────────────────
    # GET  /api/rh/conges/              → liste + filtres (personnel, statut, annee)
    # POST /api/rh/conges/              → créer une demande
    path("conges/",                          CongeListCreateView.as_view()),
 
    # GET    /api/rh/conges/<pk>/       → détail
    # PATCH  /api/rh/conges/<pk>/       → modifier
    # DELETE /api/rh/conges/<pk>/       → supprimer
    path("conges/<int:pk>/",                 CongeDetailView.as_view()),
 
    # POST /api/rh/conges/<pk>/valider/ → valider_sup | valider_drh | refuser | annuler
    path("conges/<int:pk>/valider/",         CongeValidationView.as_view()),
 
    # GET /api/rh/conges/<pk>/autorisation/pdf/ → PDF autorisation d'absence
    path("conges/<int:pk>/autorisation/pdf/",AutorisationPDFView.as_view()),
 
    # ── Solde congés ─────────────────────────────────────────
    # GET /api/rh/soldes/               → tous les soldes
    path("soldes/",                          SoldeCongeView.as_view()),
    # GET /api/rh/soldes/<pk>/          → solde d'un agent (pk = personnel id)
    path("soldes/<int:pk>/",                 SoldeCongeView.as_view()),
 
    # ── Assurance maladie ────────────────────────────────────
    # GET /api/rh/assurances/           → tableau assurance (filtrable)
    path("assurances/",                      AssuranceListView.as_view()),
    # GET   /api/rh/assurances/<pk>/    → détail (pk = personnel id)
    # PATCH /api/rh/assurances/<pk>/    → mettre à jour
    path("assurances/<int:pk>/",             AssuranceDetailView.as_view()),
]
 
  

