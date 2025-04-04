document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    
    // Add loading indicator
    let isWaitingForResponse = false;
    
    function addMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("p-3", "rounded-lg", "w-fit", "max-w-xs", "mb-2");

        if (sender === "user") {
            messageDiv.classList.add("bg-blue-500", "text-white", "ml-auto");
        } else {
            messageDiv.classList.add("bg-gray-200");
        }

        messageDiv.innerHTML = `<strong>${sender === "user" ? "You" : "TrailBuddy"}:</strong> ${message}`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to latest message
    }
    
    function addTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.id = "typingIndicator";
        typingDiv.classList.add("p-3", "rounded-lg", "bg-gray-200", "w-fit", "max-w-xs", "mb-2");
        typingDiv.innerHTML = `<strong>TrailBuddy:</strong> <span class="typing-animation">Thinking<span>.</span><span>.</span><span>.</span></span>`;
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typingIndicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Listen for Enter key in the input field
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            window.sendMessage();
        }
    });
    
    // Process user input and handle response
    window.sendMessage = async function () {
        const message = userInput.value.trim();
        if (message === "" || isWaitingForResponse) return;
        
        addMessage("user", message);
        userInput.value = "";
        
        // Show typing indicator
        isWaitingForResponse = true;
        addTypingIndicator();
        
        try {
            const aiResponse = await getGeminiResponse(message);
            removeTypingIndicator();
            addMessage("ai", aiResponse);
        } catch (error) {
            console.error("Error getting AI response:", error);
            removeTypingIndicator();
            addMessage("ai", "Sorry, I encountered an issue processing your request. Please try again.");
        } finally {
            isWaitingForResponse = false;
        }
    };
    
    async function getGeminiResponse(userMessage) {
        const API_KEY = "AIzaSyBUC1J_-DHANnfg4qgk9eCtDn5Tvvqr1tE";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        
        // Create context-specific prompt with guardrails
        const systemContext = `You are TrailBuddy, a helpful assistant specializing in hiking, camping, and outdoor activities. 
Your goal is to provide accurate, helpful information about:
- Hiking trails and recommendations
- Camping locations and advice
- Outdoor gear and equipment
- Weather considerations for outdoor activities
- Safety tips for wilderness exploration

When providing information:
- Be specific and detailed when discussing hiking and camping topics
- If asked about topics outside your expertise, gently redirect to outdoor-related topics
- Keep responses concise (2-5 sentences) and easy to understand
- If you don't know something specific, say so rather than making up information
- Focus on practical, actionable advice for outdoor enthusiasts
- Never provide incorrect or dangerous outdoors advice

Current features available in this app:
- Location search for hiking and camping spots
- Weather information for planning trips
- Chat assistance for outdoor advice`;

        // Construct the prompt with user message and history
        const userQuery = `User message: ${userMessage}

Based on this message, provide a helpful, accurate response about hiking, camping, or outdoor activities. If the user is asking about something unrelated to outdoors, politely redirect them to topics you can help with.`;
                
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: systemContext },
                            { text: userQuery }
                        ]
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extract the response text
            if (data.candidates && data.candidates[0] && data.candidates[0].content && 
                data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "I'm having trouble processing that request. Could you try asking about hiking or camping topics?";
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            return "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
        }
    }
    
    // Add welcome message
    setTimeout(() => {
        addMessage("ai", "Welcome to TrailBuddy! I can help you find hiking trails, camping spots, and provide outdoor advice. How can I assist with your adventure plans today?");
    }, 500);
    
    // Add click event for send button if it exists
    if (sendButton) {
        sendButton.addEventListener("click", window.sendMessage);
    }
    
    // Optional: Add some CSS for the typing animation
    const style = document.createElement('style');
    style.textContent = `
    .typing-animation span {
        opacity: 0;
        animation: typingDot 1.5s infinite;
    }
    .typing-animation span:nth-child(2) {
        animation-delay: 0.5s;
    }
    .typing-animation span:nth-child(3) {
        animation-delay: 1s;
    }
    @keyframes typingDot {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }`;
    document.head.appendChild(style);
});