import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function Createpostcontent({ setFormData, formData, name }) {
    const [content, setContent] = useState("");
    console.log(content);

    return (
        <Editor
            apiKey="adcqj94qbelb4hxl3u8hliljc3kyf2ceq2flqhen709xvi3b"  // Assure-toi que cette clé est valide
            init={{
                width: 700,
                plugins: [
                    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
                    'image', 'link', 'lists', 'media', 'searchreplace', 'table',
                    'visualblocks', 'wordcount' // Plugins gratuits uniquement
                ],
                toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | removeformat',
                menubar: false, // Optionnel : enlève la barre de menu
                branding: false, // Enlève la mention TinyMCE en bas de l'éditeur
            }}
            initialValue="Welcome to TinyMCE!"
            onEditorChange={(newContent) => setFormData({ ...formData, [name]: newContent })}
        />
    );
}
