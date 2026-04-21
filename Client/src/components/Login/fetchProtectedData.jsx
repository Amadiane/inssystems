import axios from 'axios';

const fetchProtectedData = async () => {
    const token = localStorage.getItem('accessToken');
    const apiUrl = import.meta.env.VITE_API_BACKEND;

    if (!token) {
        // Rediriger vers la page de login si le token est absent
        return;
    }

    try {
        const response = await axios.get(apiUrl + "/api/protected/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Erreur lors de la récupération des données protégées', error);
    }
};
