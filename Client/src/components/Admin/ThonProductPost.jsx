import { useEffect, useState } from "react";
import CONFIG from "../../config/config.js";
import {
  Package,
  Loader2,
  Trash2,
  PlusCircle,
  Edit2,
  X,
  Save,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Check
} from "lucide-react";

const ThonProductPost = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    title_fr: "",
    title_en: "",
    content_fr: "",
    content_en: "",
    image: null,
    is_active: true,
  });

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(CONFIG.API_THON_PRODUCT_LIST);
      if (!res.ok) throw new Error("Erreur lors du chargement des produits");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // CLOUDINARY UPLOAD
  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CONFIG.CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
      return json.secure_url;
    } catch (err) {
      console.error("Erreur upload Cloudinary:", err);
      return null;
    }
  };

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      if (files && files[0]) {
        setFormData({ ...formData, [name]: files[0] });
        setPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      title_fr: "",
      title_en: "",
      content_fr: "",
      content_en: "",
      image: null,
      is_active: true,
    });
    setPreview(null);
    setEditingId(null);
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let imageUrl = null;
      
      // Si on a une nouvelle image uploadée (File object)
      if (formData.image && formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      } 
      // Si on a une URL d'image existante (string)
      else if (typeof formData.image === "string" && formData.image) {
        imageUrl = formData.image;
      }

      const payload = {
        title_fr: formData.title_fr,
        title_en: formData.title_en,
        content_fr: formData.content_fr,
        content_en: formData.content_en,
        image: imageUrl,
        is_active: formData.is_active,
      };

      const url = editingId
        ? CONFIG.API_THON_PRODUCT_UPDATE(editingId)
        : CONFIG.API_THON_PRODUCT_CREATE;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      setSuccessMessage(
        editingId ? "Produit mis à jour avec succès !" : "Produit ajouté avec succès !"
      );
      resetForm();
      await fetchProducts();
      setShowForm(false);
      setShowList(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

    try {
      const res = await fetch(CONFIG.API_THON_PRODUCT_DELETE(id), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      setSuccessMessage("Produit supprimé avec succès !");
      await fetchProducts();
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    }
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      title_fr: product.title_fr || "",
      title_en: product.title_en || "",
      content_fr: product.content_fr || "",
      content_en: product.content_en || "",
      image: product.image_url || product.image || null,
      is_active: product.is_active ?? true,
    });
    setPreview(product.image_url || product.image || null);
    setShowForm(true);
    setShowList(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // LOADING STATE
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#F47920] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER MODERNE */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] opacity-0 group-hover:opacity-20 blur-xl transition-opacity rounded-2xl"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-[#FDB71A] via-[#F47920] to-[#E84E1B] rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="text-white w-7 h-7" />
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                    Produits de Thon
                  </h1>
                  <p className="text-gray-500 font-medium mt-1">
                    Catalogue & Gamme Produits
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={fetchProducts}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                  Actualiser
                </button>

                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    if (!showForm) {
                      resetForm();
                      setShowList(false);
                    } else {
                      setShowList(true);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  {showForm ? (
                    <>
                      <X className="w-5 h-5" />
                      Fermer
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Nouveau Produit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="flex-1 text-red-700 font-medium">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="flex-1 text-green-700 font-medium">
              {successMessage}
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-500 hover:text-green-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* FORMULAIRE */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit}>
              {/* En-tête du formulaire */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-1 h-8 bg-gradient-to-b from-[#FDB71A] to-[#E84E1B] rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingId ? "Modifier le produit" : "Nouveau produit"}
                </h3>
              </div>

              {/* Grille des champs - Titres */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Titre (FR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title_fr"
                    value={formData.title_fr}
                    onChange={handleChange}
                    placeholder="Ex: Thon à l'huile d'olive"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#FDB71A] focus:ring-2 focus:ring-[#FDB71A]/20 transition-all bg-white font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Title (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title_en"
                    value={formData.title_en}
                    onChange={handleChange}
                    placeholder="Ex: Tuna in Olive Oil"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#F47920] focus:ring-2 focus:ring-[#F47920]/20 transition-all bg-white font-medium"
                    required
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-6 mb-6">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Description (FR)
                  </label>
                  <textarea
                    name="content_fr"
                    value={formData.content_fr}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Décrivez le produit en français..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#FDB71A] focus:ring-2 focus:ring-[#FDB71A]/20 transition-all bg-white font-medium resize-none"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Description (EN)
                  </label>
                  <textarea
                    name="content_en"
                    value={formData.content_en}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the product in English..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#F47920] focus:ring-2 focus:ring-[#F47920]/20 transition-all bg-white font-medium resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Image et Statut */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Upload image */}
                <div className="space-y-3">
                  <label className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#E84E1B]" />
                    Image du produit
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-gradient-to-r file:from-[#FDB71A] file:to-[#F47920] file:text-white hover:file:scale-105 file:transition-all file:cursor-pointer focus:border-[#F47920]"
                    />
                  </div>
                  {preview && (
                    <div className="flex justify-center mt-4">
                      <div className="relative bg-white border border-gray-200 rounded-2xl p-4 shadow-lg w-48 h-48">
                        <img
                          src={preview}
                          alt="Aperçu"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Statut actif */}
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Statut de publication
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-5 h-5 rounded accent-[#FDB71A] cursor-pointer"
                    />
                    <label
                      htmlFor="is_active"
                      className="font-semibold text-gray-700 cursor-pointer flex items-center gap-2"
                    >
                      {formData.is_active ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Produit actif
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          Produit inactif
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingId ? "Mettre à jour" : "Créer le produit"}
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                      setShowList(true);
                    }}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* LISTE DES PRODUITS */}
        {showList && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            {/* En-tête */}
            <div className="p-6 md:p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#FDB71A] to-[#E84E1B] rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    Liste des produits
                    <span className="bg-gradient-to-r from-[#FDB71A] to-[#F47920] text-white px-3 py-1 rounded-full font-semibold text-sm">
                      {products.length}
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 md:p-8">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-[#F47920] animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Chargement...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Aucun produit pour le moment
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Créez votre premier produit
                  </p>
                </div>
              ) : (
                <>
                  {/* Grille */}
                  <div className="grid gap-6 mb-6">
                    {currentItems.map((product) => (
                      <div
                        key={product.id}
                        className="group relative bg-white/60 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-400/30 transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#FDB71A]/50"
                      >
                        <div className="flex flex-col md:flex-row gap-4 p-4">
                          {/* Image */}
                          <div className="relative w-full md:w-48 h-48 flex-shrink-0 overflow-hidden rounded-xl">
                            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                              {(product.image_url || product.image) ? (
                                <img
                                  src={product.image_url || product.image}
                                  alt={product.title_fr}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                                  }}
                                />
                              ) : (
                                <Package className="w-24 h-24 text-gray-300" />
                              )}
                            </div>
                            {/* Badge actif/inactif */}
                            <div className="absolute top-2 right-2">
                              {product.is_active ? (
                                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                                  <Check className="w-3 h-3" />
                                  Actif
                                </span>
                              ) : (
                                <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  Inactif
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Contenu */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-black text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#E84E1B] group-hover:via-[#F47920] group-hover:to-[#FDB71A] transition-all">
                                  {product.title_fr}
                                </h4>
                                {!product.is_active && (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">
                                    Masqué
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm font-medium mb-2">
                                {product.title_en}
                              </p>
                              {product.content_fr && (
                                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-2">
                                  {product.content_fr}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 mt-4">
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                <Eye size={16} />
                                Voir
                              </button>

                              <button
                                onClick={() => {
                                  handleEdit(product);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FDB71A] to-[#F47920] text-white text-sm font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                <Edit2 size={16} />
                                Modifier
                              </button>

                              <button
                                onClick={() => handleDelete(product.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                <Trash2 size={16} />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              currentPage === pageNumber
                                ? "bg-gradient-to-r from-[#FDB71A] to-[#F47920] text-white"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DÉTAIL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête modal */}
            <div className="bg-gradient-to-r from-[#FDB71A] via-[#F47920] to-[#E84E1B] p-6 relative">
              <button
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                onClick={() => setSelectedProduct(null)}
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <h2 className="text-2xl font-bold text-white pr-12">
                {selectedProduct.title_fr}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {selectedProduct.title_en}
              </p>
            </div>

            {/* Contenu modal */}
            <div className="p-6 overflow-y-auto flex-1">
              {(selectedProduct.image_url || selectedProduct.image) && (
                <img
                  src={selectedProduct.image_url || selectedProduct.image}
                  className="w-full h-80 object-cover rounded-xl mb-6"
                  alt={selectedProduct.title_fr}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}

              <div className="space-y-4">
                {selectedProduct.content_fr && (
                  <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-[#FDB71A]">
                    <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                      Description (FR)
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedProduct.content_fr}
                    </p>
                  </div>
                )}

                {selectedProduct.content_en && (
                  <div className="bg-red-50 p-4 rounded-xl border-l-4 border-[#F47920]">
                    <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                      Description (EN)
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedProduct.content_en}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions modal */}
            <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#FDB71A] to-[#F47920] text-white rounded-lg font-semibold hover:shadow-md transition-all flex items-center gap-2"
                onClick={() => {
                  handleEdit(selectedProduct);
                  setSelectedProduct(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                onClick={() => handleDelete(selectedProduct.id)}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>

              <button
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setSelectedProduct(null)}
              >
                <X className="w-4 h-4" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThonProductPost;