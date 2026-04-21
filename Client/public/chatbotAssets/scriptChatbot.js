document.addEventListener("DOMContentLoaded", function () {
    const messagesContainer = document.getElementById("messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const resetButton = document.getElementById("reset-button");
    const voiceButton = document.getElementById("voice-button"); // Bouton de reconnaissance vocale
    const welcomeMessage = document.getElementById("welcome-message");
    const chatbox = document.getElementById("chatbox");
    const chatAvatar = document.getElementById("chat-avatar");
    const closeButton = document.getElementById("close-button");
    const warningAlert = document.getElementById("chatbot-warning-alert");
    const closeAlert = document.getElementById("close-chatbot-alert");
    // const voiceSelect = document.getElementById('voice-select');
    // Définir voiceSelect ici

    let selectedVoice; // Variable pour stocker la voix sélectionnée
    let speechEnabled = true;
    let recognition;
    let voicesLoaded = false;
    let voiceDropdownVisible = false;

    // Variables to track dragging
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    chatAvatar.addEventListener("mousedown", (event) => {
        isDragging = true;
        const rect = chatAvatar.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        event.preventDefault(); // Prevent default text selection
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    document.addEventListener("mousemove", (event) => {
        if (isDragging) {
            chatAvatar.style.left = `${event.clientX - offsetX}px`;
            chatAvatar.style.top = `${event.clientY - offsetY}px`;

            // Add boundaries to prevent dragging outside the viewport
            const parentRect = document.documentElement.getBoundingClientRect();
            const avatarRect = chatAvatar.getBoundingClientRect();

            if (avatarRect.left < 0) chatAvatar.style.left = "0px";
            if (avatarRect.top < 0) chatAvatar.style.top = "0px";
            if (avatarRect.right > parentRect.width)
                chatAvatar.style.left = `${
                    parentRect.width - avatarRect.width
                }px`;
            if (avatarRect.bottom > parentRect.height)
                chatAvatar.style.top = `${
                    parentRect.height - avatarRect.height
                }px`;
        }
    });


    // Initialiser les voix disponibles et les filtrer par langue
    function initializeVoices(language = "en") {
        const voices = window.speechSynthesis.getVoices();
        const filteredVoices = voices.filter((voice) =>
            voice.lang.startsWith(language)
        );

        if (filteredVoices.length > 0) {
            selectedVoice = filteredVoices[0];
        } else if (voices.length > 0) {
            selectedVoice = voices[0]; // Voix par défaut si aucune voix ne correspond à la langue
        }
        console.log(
            "Voix par défaut sélectionnée :",
            selectedVoice ? selectedVoice.name : "Aucune voix disponible"
        );
        return filteredVoices;
    }

    window.speechSynthesis.onvoiceschanged = initializeVoices;

    // Fonction pour afficher/masquer le menu de sélection de voix et mettre à jour la voix sélectionnée
    function toggleVoiceSelection(button, messageDiv, language) {
        let voiceSelect = messageDiv.querySelector(".voice-select-dropdown");

        if (voiceSelect) {
            voiceSelect.remove(); // Supprimer le menu déroulant s'il est déjà présent
        } else {
            // Créer un nouveau menu déroulant de voix
            voiceSelect = document.createElement("select");
            voiceSelect.classList.add("voice-select-dropdown");

            const voices = initializeVoices(language); // Filtrer les voix en fonction de la langue
            voices.forEach((voice, index) => {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            });

            voiceSelect.addEventListener("change", (event) => {
                selectedVoice = voices[event.target.value];
                console.log(
                    "Voix sélectionnée :",
                    selectedVoice ? selectedVoice.name : "None"
                );
                voiceSelect.style.display = "none"; // Masquer après sélection
            });

            messageDiv.appendChild(voiceSelect);
        }
    }

    // Update the selectVoiceByLanguage function to set a voice based on the language
    function selectVoiceByLanguage(language) {
        const voices = window.speechSynthesis.getVoices();
        selectedVoice =
            voices.find((voice) => voice.lang.startsWith(language)) ||
            voices[0];
        console.log(
            "Selected voice based on language:",
            selectedVoice ? selectedVoice.name : "No voice available"
        );
    }

    // Update speakText to use the selected voice for the given language
    function speakText(text, lang) {
        // Arrêter toute lecture en cours avant de commencer la nouvelle
        if (window.speechSynthesis.speaking) {
            console.log(
                "Arrêt de la lecture en cours pour prioriser le nouveau texte."
            );
            window.speechSynthesis.cancel();
        }

        // Configurer la nouvelle synthèse vocale
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice; // Utiliser la voix sélectionnée
        utterance.lang = lang;

        // Gérer les événements pour plus de contrôle
        utterance.onstart = () => {
            console.log("Lecture commencée :", text);
        };

        utterance.onend = () => {
            console.log("Lecture terminée.");
        };

        utterance.onerror = (event) => {
            console.error("Erreur de synthèse vocale :", event.error);
        };

        // Lancer la lecture
        window.speechSynthesis.speak(utterance);
    }
    window.addEventListener("beforeunload", () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel(); // Arrêter toute lecture en cours
        }
    });

    closeButton.addEventListener("click", () => {
        chatbox.style.display = "none";
        // chatAvatar.style.display = "block";

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel(); // Arrêter toute lecture en cours
        }
    });


    // Afficher le chatbot
    closeAlert.addEventListener("click", () => {
        warningAlert.style.display = "none";
    });
    chatAvatar.addEventListener("click", () => {
        chatbox.style.display = "block";
        // chatAvatar.style.display = "none";
    });

    // Fermer le chatbot et revenir à l'avatar
    closeButton.addEventListener("click", () => {
        chatbox.style.display = "none";
        chatAvatar.style.display = "block";
    });

    let lastBotMessage = "";
    try {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
    } catch (e) {
        console.error("Speech recognition not supported:", e);
        warningAlert.style.display = "block";
        voiceButton.style.display = "none"; // Optionally hide the voice button if unsupported
    }

    if (recognition) {
        // Speech recognition configuration
        recognition.lang = "fr-FR"; // Set language (use 'en-US' for English)
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // Start voice recognition on button click
        voiceButton.addEventListener("click", () => {
            if (voiceButton.disabled) return;
            recognition.start();
            updateVoiceButtonState(true);
        });

        // Recognition result handler
        recognition.onresult = function (event) {
            const voiceText = event.results[0][0].transcript;
            userInput.value = voiceText;
            updateVoiceButtonState(false);
        };

        recognition.onerror = function (event) {
            console.error("Speech recognition error:", event.error);
            updateVoiceButtonState(false);
        };

        recognition.onend = function () {
            updateVoiceButtonState(false);
        };
    }
    async function addMessage(text, type, language = "en", suggestions = []) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", type);

        if (type === "bot") {
            // Ajouter le texte du bot
            if (text.includes("<ul>")) {
                messageDiv.innerHTML = text; // Interprète le HTML tel quel
            } else {
                messageDiv.textContent = text; // Sinon, affiche du texte brut
            }

            // Conteneur pour les boutons (son et voix)
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");

            // Bouton de son
            const repeatButton = document.createElement("button");
            repeatButton.classList.add("repeat-button");
            repeatButton.innerHTML = speechEnabled ? "🔊" : "🔇";
            repeatButton.addEventListener("click", () =>
                toggleSpeech(repeatButton, text, language)
            );
            buttonContainer.appendChild(repeatButton);

            // Bouton pour ouvrir le sélecteur de voix
            const voiceSelectButton = document.createElement("button");
            voiceSelectButton.classList.add("voice-select-button");
            voiceSelectButton.innerHTML = "🗣️";
            voiceSelectButton.title = "Choisir une voix";
            buttonContainer.appendChild(voiceSelectButton);

            // Sélecteur de voix
            const voiceDropdown = document.createElement("select");
            voiceDropdown.classList.add("voice-select-dropdown");
            voiceDropdown.style.display = "none"; // Masqué par défaut
            const voices = initializeVoices(language); // Charger les voix
            voices.forEach((voice, index) => {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceDropdown.appendChild(option);
            });

            // Ajouter un événement pour relire le texte après changement de voix
            voiceDropdown.addEventListener("change", () => {
                selectedVoice = voices[voiceDropdown.value];
                console.log(
                    "Nouvelle voix sélectionnée :",
                    selectedVoice ? selectedVoice.name : "None"
                );

                // Relire immédiatement le texte avec la nouvelle voix
                if (speechEnabled) {
                    speakText(text, language);
                }

                // Cacher le sélecteur après sélection
                voiceDropdown.style.display = "none";
            });

            buttonContainer.appendChild(voiceDropdown);

            // Afficher/masquer le sélecteur de voix au clic
            voiceSelectButton.addEventListener("click", () => {
                voiceDropdown.style.display =
                    voiceDropdown.style.display === "none" ? "block" : "none";
            });

            messageDiv.appendChild(buttonContainer);

            // Lecture de la réponse bot immédiatement après son ajout
            if (speechEnabled) {
                selectVoiceByLanguage(language); // Configurer la voix pour la langue
                speakText(text, language); // Lire la réponse actuelle
            }

            // Ajouter un conteneur pour le sélecteur des suggestions (si nécessaire)
            if (suggestions.length > 0) {
                const suggestionContainer = document.createElement("div");
                suggestionContainer.classList.add("suggestion-container");
                suggestionContainer.style.marginTop = "10px";

                // Ajouter un titre pour les suggestions
                const suggestionLabel = document.createElement("div");
                // suggestionLabel.textContent = 'Suggestions de questions similaires :';
                suggestionLabel.style.fontWeight = "bold";
                suggestionLabel.style.color = "#340B8C";
                suggestionContainer.appendChild(suggestionLabel);

                // Dropdown pour suggestions
                const suggestionDropdown = document.createElement("select");
                suggestionDropdown.classList.add("suggestion-dropdown");
                suggestionDropdown.innerHTML =
                    "<option disabled selected>Suggestions...</option>";
                suggestions.forEach((suggestion) => {
                    const option = document.createElement("option");
                    option.value = suggestion;
                    option.textContent = suggestion;
                    suggestionDropdown.appendChild(option);
                });

                suggestionDropdown.addEventListener("change", () => {
                    userInput.value = suggestionDropdown.value;
                    sendMessage(); // Envoyer la suggestion comme une nouvelle requête
                });

                suggestionContainer.appendChild(suggestionDropdown);
                messageDiv.appendChild(suggestionContainer);
            }
        } else {
            messageDiv.textContent = text;
        }

        messagesContainer.appendChild(messageDiv);

        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }

    function scrollToBottom() {
        const lastMessage = messagesContainer.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }

    // Modified sendMessage function with language detection handling
    async function sendMessage() {
        const text = userInput.value.trim();
        if (text) {
            welcomeMessage.style.display = "none";
            addMessage(text, "user");
            userInput.value = "";

            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/chatbot/",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: text }),
                    }
                );

                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }

                const data = await response.json();
                console.log("Réponse reçue :", data);

                // Ajouter la réponse et les suggestions
                addMessage(
                    data.response,
                    "bot",
                    data.language,
                    data.suggestions
                );
                showSatisfactionButtons();
            } catch (error) {
                console.error("Erreur lors de l'appel API :", error);
                addMessage(
                    "Une erreur est survenue. Veuillez réessayer.",
                    "bot"
                );
            }

            setTimeout(() => {
                scrollToBottom();
            }, 200);
        } else {
            addMessage(
                "Veuillez entrer un message ou poser une question.",
                "bot"
            );
        }
    }

    function showSatisfactionButtons() {
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("satisfaction-buttons");

        const yesButton = document.createElement("button");
        yesButton.classList.add( "btn-success", "btn-sm", "mr-2");
        yesButton.innerHTML = "😊 Oui";

        const noButton = document.createElement("button");
        noButton.classList.add( "btn-danger", "btn-sm");
        noButton.innerHTML = "😞 Non";

        buttonContainer.appendChild(yesButton);
        buttonContainer.appendChild(noButton);
        messagesContainer.appendChild(buttonContainer);

        // Scroll after adding satisfaction buttons
        setTimeout(() => {
            scrollToBottom();
        }, 100);

        yesButton.addEventListener("click", () => handleFeedback(true));
        noButton.addEventListener("click", () => handleFeedback(false));
    }

    function handleFeedback(isPositive) {
        const buttons = document.querySelector(".satisfaction-buttons");
        if (buttons) buttons.remove();

        if (isPositive) {
            addMessage("Merci pour votre retour positif ! 😊", "bot");
        } else {
            const contactMessage = document.createElement("div");
            contactMessage.classList.add("message", "bot");
            contactMessage.innerHTML = `Nous sommes désolés pour cela. Cliquez ici pour nous contacter : <a href="/contact" target="_blank" class="contact-link">Contactez-nous</a>`;

            messagesContainer.appendChild(contactMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        // Scroll after adding satisfaction buttons
        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }

    function toggleSpeech(button, text, lang) {
        speechEnabled = !speechEnabled;
        button.innerHTML = speechEnabled ? "🔊" : "🔇";
        if (speechEnabled) {
            speakText(text, lang);
        } else {
            window.speechSynthesis.cancel();
        }
    }
    // function speakText(text) {
    //     if ('speechSynthesis' in window) {
    //         const utterance = new SpeechSynthesisUtterance(text);
    //         window.speechSynthesis.speak(utterance);
    //     } else {
    //         console.log("La synthèse vocale n'est pas supportée par ce navigateur.");
    //     }
    // }

    function resetChat() {
        messagesContainer.innerHTML = "";
        welcomeMessage.style.display = "flex";
    }

    // Mettre à jour l'état du bouton de reconnaissance vocale
    function updateVoiceButtonState(isRecording) {
        if (isRecording) {
            voiceButton.classList.add("recording");
            voiceButton.disabled = true;
            voiceButton.innerHTML = "🎙...";
        } else {
            voiceButton.classList.remove("recording");
            voiceButton.disabled = false;
            voiceButton.innerHTML = "🎤";
        }
    }

    const chatboxFooter = document.getElementById("chatbox-footer");

    // Ajustement automatique de la hauteur du footer en fonction de la taille de l'input
    function adjustFooter() {
        const inputHeight = userInput.clientHeight;
        chatboxFooter.style.height = inputHeight + 50 + "px"; // Ajuster la hauteur
    }

    window.addEventListener("resize", adjustFooter);
    adjustFooter();

    userInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default action (like adding a new line in textareas)
            sendMessage();
        }
    });

    sendButton.addEventListener("click", sendMessage);
    // resetButton.addEventListener('click', resetChat);
});
