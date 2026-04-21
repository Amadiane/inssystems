import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();  // Récupération de l'ID du blog à partir de l'URL
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BACKEND;

  useEffect(() => {
    if (!id) {
      setError('L\'ID du blog est manquant.');
      setLoading(false);
      return;
    }
  
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/blog/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBlog(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBlog();
  }, [id]);
  

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="h-16"></div>
      <div className="pt-8"></div>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Erreur lors du chargement du blog: {error}</p>
          </div>
        ) : blog ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-64 sm:h-80 md:h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 md:h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Image non disponible</p>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col justify-between w-full md:w-1/2">
                <h3 className="text-3xl font-bold mb-3">{blog.title}</h3>
                <div className="text-sm text-gray-500 flex items-center mb-4">
                  <Clock size={16} className="mr-1" />
                  <span>{formatDate(blog.created_at)}</span>
                </div>
                <p className="text-gray-600 text-lg">{blog.content}</p>
              </div>
            </div>
          </div>
        ) : (
          <p>Le blog demandé n'existe pas.</p>
        )}
      </main>
    </div>
  );
};

export default BlogDetail;
