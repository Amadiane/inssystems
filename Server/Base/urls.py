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
]
 
  

