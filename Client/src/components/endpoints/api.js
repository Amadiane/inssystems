import axios from 'axios';

//const BASE_URL = 'http://127.0.0.1:8000/api/'

const BASE_URL = import.meta.env.VITE_API_BACKEND + '/api/';


const LOGIN_URL = `${BASE_URL}login/`
const REGISTER_URL = `${BASE_URL}register/`
const LOGOUT_URL = `${BASE_URL}logout/`
const NOTES_URL = `${BASE_URL}todos/`
const BLOG_URL = `${BASE_URL}blog/`
const AUTHENTICATED_URL = `${BASE_URL}authenticated/`
const apiUrl = import.meta.env.VITE_API_BACKEND;


axios.defaults.withCredentials = true; 

export const login = async (username, password) => {
    const response = await fetch(apiUrl + "/api/login/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return response.json();
};

// Fonction pour récupérer la liste des blogs
export const getBlogs = async () => {
    const token = localStorage.getItem('token'); // Récupérer le token depuis le localStorage

    if (!token) {
        throw new Error('Token manquant, veuillez vous connecter.');
    }

    try {
        const response = await axios.get(BLOG_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,  // Ajouter le token à l'en-tête
            },
        });

        return response.data; // Retourne la liste des blogs
    } catch (error) {
        throw new Error(`Erreur: ${error.message}`);
    }
};

// Fonction pour créer un blog
export const createBlog = async (title, content, author, tags, image) => {
    const token = localStorage.getItem('token'); // Récupérer le token depuis le localStorage

    if (!token) {
        throw new Error('Token manquant, veuillez vous connecter.');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', author);
    formData.append('tags', tags);
    if (image) {
        formData.append('image', image);
    }

    try {
        const response = await axios.post(BLOG_URL, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,  // Ajouter le token à l'en-tête
                'Content-Type': 'multipart/form-data', // Indiquer qu'il s'agit d'un envoi de fichiers
            },
            body: formData,
        });

        return response.data; // Retourne les données du blog créé
    } catch (error) {
        throw new Error(`Erreur: ${error.message}`);
    }
};



export const get_notes = async () => {
    const response = await axios.get(NOTES_URL, { withCredentials: true });
    return response.data;
};

export const logout = async () => {
    const response = await axios.post(LOGOUT_URL, { withCredentials: true });
    return response.data;
};

export const register = async (username, email, password) => {
    const response = await axios.post(REGISTER_URL, {username, email, password}, { withCredentials: true });
    return response.data;
};

export const authenticated_user = async () => {
    const response = await axios.get(AUTHENTICATED_URL, { withCredentials: true });
    return response.data
}