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
]
 
  

