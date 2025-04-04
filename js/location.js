document.addEventListener("DOMContentLoaded", function () {
    const locationInput = document.getElementById("locationInput");
    const resultsDiv = document.getElementById("results");
    const loadingIndicator = `
        <div class="flex justify-center my-8">
            <div class="relative w-24 h-24">
                <div class="absolute top-0 mt-4 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div class="absolute top-0 mt-4 w-16 h-16 border-4 border-transparent border-t-green-500 rounded-full animate-spin" style="animation-direction: reverse;"></div>
                <div class="absolute w-6 h-6 bg-blue-100 rounded-full top-7 left-5"></div>
                <div class="absolute w-4 h-4 bg-white rounded-full top-8 left-6"></div>
            </div>
        </div>
        <p class="text-center text-gray-600 italic">Finding adventure activities...</p>
    `;

    window.searchLocations = async function () {
        const query = locationInput.value.trim();
        if (query === "") return;

        // Show loading indicator
        resultsDiv.innerHTML = loadingIndicator;

        try {
            // Get adventure activities directly using Gemini API
            await getAdventureActivities(query);
        } catch (error) {
            resultsDiv.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md">
                    <div class="flex items-center">
                        <svg class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="font-medium text-red-600">Error fetching adventure sports data.</p>
                    </div>
                    <p class="text-sm text-red-500 mt-1">Please try again later or check your connection.</p>
                </div>
            `;
            console.error("Error:", error);
        }
    };

    async function getAdventureActivities(location) {
        const API_KEY = "AIzaSyBUC1J_-DHANnfg4qgk9eCtDn5Tvvqr1tE";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        
        // Craft specific prompt for adventure sports with formatting instructions
        const prompt = `
You are an adventure sports expert providing information about outdoor activities in specific locations.

Location: ${location}

Create a well-formatted response about adventure sports and activities in this location with the following:

1. Start with a short, engaging headline about adventure sports in ${location} wrapped in <h1> tags
2. Add a brief introduction (2-3 sentences) wrapped in <p> tags with the location name in <strong> tags
3. Create a section called "Popular Adventure Activities" with:
   - Each activity name in <h3> tags with emoji
   - Brief description in <p> tags with important terms in <strong> tags
   - Difficulty level in <em> tags
   - Best season in <mark> tags
4. Add a section called "Unique Local Adventures" with 2-3 location-specific activities
5. End with a "Safety Tips" section with 2-3 important safety considerations

Use HTML formatting to make text more readable:
- <strong> for important terms and emphasis
- <em> for difficulty levels and special notes
- <mark> for seasonal information
- <h1>, <h2>, <h3> for headings and subheadings
- <ul> and <li> for lists

If this location is not known for adventure activities, suggest suitable outdoor activities based on geography without making up information.

DO NOT include:
- General tourism information about hotels, restaurants, etc.
- Cultural activities that aren't adventure/sport related
- Transportation options
- Any disclaimers about your knowledge or abilities

Format the response to be visually appealing with proper HTML structure.`;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        topP: 0.8,
                        topK: 40
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && 
                data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                
                const activitiesContent = data.candidates[0].content.parts[0].text;
                
                // Create the beautiful UI container
                resultsDiv.innerHTML = "";
                const contentContainer = document.createElement("div");
                contentContainer.className = "bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-lg overflow-hidden";
                
                // Add header image based on location
                const headerDiv = document.createElement("div");
                headerDiv.className = "h-40 bg-cover bg-center relative";
                headerDiv.style.backgroundImage = `url('https://source.unsplash.com/800x300/?${encodeURIComponent(location + " landscape")}')`;
                
                // Add overlay and location name
                const overlayDiv = document.createElement("div");
                overlayDiv.className = "absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center";
                overlayDiv.innerHTML = `<h2 class="text-white text-3xl font-bold drop-shadow-lg">${location}</h2>`;
                headerDiv.appendChild(overlayDiv);
                
                contentContainer.appendChild(headerDiv);
                
                // Add content area with styled content
                const contentDiv = document.createElement("div");
                contentDiv.className = "p-6 adventure-content";
                
                // Process the content HTML
                contentDiv.innerHTML = enhanceContentStyling(activitiesContent);
                
                contentContainer.appendChild(contentDiv);
                resultsDiv.appendChild(contentContainer);
                
                // Add custom styles
                addCustomStyles();
                
            } else {
                resultsDiv.innerHTML = `
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-md">
                        <p class="font-medium">No adventure activities information available for ${location}.</p>
                        <p class="text-sm text-gray-600 mt-2">Try searching for another location known for outdoor adventures.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
            resultsDiv.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md">
                    <div class="flex items-center">
                        <svg class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="font-medium text-red-600">Unable to retrieve adventure information.</p>
                    </div>
                    <p class="text-sm text-red-500 mt-1">Please try again later.</p>
                </div>
            `;
        }
    }

    function enhanceContentStyling(htmlContent) {
        // Replace basic HTML with enhanced Tailwind styling
        let enhancedContent = htmlContent
            // Style headings
            .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-3xl font-bold text-blue-700 mb-4">$1</h1>')
            .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-2xl font-semibold text-blue-600 mt-6 mb-3 border-b pb-2">$1</h2>')
            .replace(/<h3>(.*?)<\/h3>/g, '<h3 class="text-xl font-medium text-blue-500 mt-4 mb-2">$1</h3>')
            
            // Style paragraphs
            .replace(/<p>(.*?)<\/p>/g, '<p class="my-3 text-gray-700 leading-relaxed">$1</p>')
            
            // Style emphasis
            .replace(/<strong>(.*?)<\/strong>/g, '<strong class="font-semibold text-gray-900">$1</strong>')
            .replace(/<em>(.*?)<\/em>/g, '<em class="italic text-gray-600">$1</em>')
            .replace(/<mark>(.*?)<\/mark>/g, '<mark class="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">$1</mark>')
            
            // Style lists
            .replace(/<ul>/g, '<ul class="my-3 space-y-2 list-none">')
            .replace(/<li>(.*?)<\/li>/g, '<li class="flex items-start"><span class="text-green-500 mr-2">&#8227;</span><span>$1</span></li>');
        
        // Add activity cards styling
        enhancedContent = enhancedContent.replace(
            /(<h3 class=".*?">(.*?)<\/h3>\s*<p class=".*?">(.*?)<\/p>(\s*<em class=".*?">(.*?)<\/em>)?(\s*<mark class=".*?">(.*?)<\/mark>)?)/g,
            '<div class="bg-white rounded-lg shadow-md p-4 my-4 hover:shadow-lg transition-shadow duration-300">\n$1\n</div>'
        );
        
        return enhancedContent;
    }

    function addCustomStyles() {
        // Add custom CSS for enhanced styling
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .adventure-content h1 {
                background: linear-gradient(to right, #3b82f6, #10b981);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                display: inline-block;
            }
            
            .adventure-content h2 {
                border-image: linear-gradient(to right, #3b82f6, #10b981);
                border-image-slice: 1;
            }
            
            .adventure-content mark {
                background: linear-gradient(to right, rgba(254, 240, 138, 0.5), rgba(253, 224, 71, 0.5));
            }
            
            .adventure-content strong {
                font-weight: 600;
                color: #1e40af;
            }
            
            .adventure-content ul li span:first-child {
                display: inline-block;
                transform: translateY(0.1em);
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Add an "Enter" key listener to the input field
    locationInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            window.searchLocations();
        }
    });
});