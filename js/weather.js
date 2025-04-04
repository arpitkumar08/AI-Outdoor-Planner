document.addEventListener("DOMContentLoaded", function () {
    const locationInput = document.getElementById("locationInput");
    const resultsDiv = document.getElementById("results");

    window.searchWeather = function () {
        const query = locationInput.value.trim();
        if (query === "") return;

        resultsDiv.innerHTML = "<p class='text-center text-gray-600'>Fetching weather...</p>";

        const apiKey = "99f6c8247476d21eb6093678b334c273";
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=${apiKey}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                resultsDiv.innerHTML = ""; // Clear previous results
                
                const weatherElement = document.createElement("div");
                weatherElement.classList.add("p-4", "border", "bg-blue-50", "rounded-lg", "shadow-md", "mt-2");

                const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                
                weatherElement.innerHTML = `
                    <div class="flex items-center">
                        <img src="${iconUrl}" alt="${data.weather[0].description}" class="w-16 h-16">
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold">Weather in ${data.name}</h3>
                            <p class="text-gray-600">Temperature: ${Math.round(data.main.temp)}°C</p>
                            <p class="text-gray-600">Feels like: ${Math.round(data.main.feels_like)}°C</p>
                            <p class="text-gray-600">Condition: ${data.weather[0].description}</p>
                            <p class="text-gray-600">Humidity: ${data.main.humidity}%</p>
                        </div>
                    </div>
                `;

                resultsDiv.appendChild(weatherElement);
            })
            .catch(error => {
                resultsDiv.innerHTML = "<p class='text-center text-red-500'>Error fetching weather data. Please check the location name.</p>";
                console.error("Error:", error);
            });
    };
});