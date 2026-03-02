// Grab required DOM elements using the exact IDs from Part 2
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// Hide the spinner initially on page load
loadingSpinner.classList.add('hidden');

// Required: Use async/await and try/catch/finally
async function searchCountry(countryName) {
    try {
        // Clear previous results and errors before starting a new search
        errorMessage.innerHTML = '';
        countryInfo.innerHTML = '';
        borderingCountries.innerHTML = '';

        // 2.2 Show loading spinner (remove the hidden class)
        loadingSpinner.classList.remove('hidden');

        // 1. Fetch country data using the required API
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        
        // 2.5 Error handling: Throw error if country is not found
        if (!response.ok) {
            throw new Error("Country not found. Please check the spelling and try again.");
        }

        const data = await response.json();
        const country = data[0]; // The API returns an array, grab the first match

        // 3. DOM Update Pattern: Display country info (Name, Capital, Population, Region, Flag)
        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'None'}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag" width="150">
        `;

        // 2.4 Display bordering countries (Name and flag for each neighbor)
        if (country.borders && country.borders.length > 0) {
            let bordersHTML = '<h3>Bordering Countries:</h3>';
            
            // Loop through each border code and fetch individually as per Part 5 instructions
            const bordersPromises = country.borders.map(async (code) => {
                const borderResponse = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
                const borderData = await borderResponse.json();
                const neighbor = borderData[0]; // /alpha/{code} also returns an array
                
                return `
                    <div>
                        <img src="${neighbor.flags.svg}" alt="${neighbor.name.common} flag" width="80">
                        <p>${neighbor.name.common}</p>
                    </div>
                `;
            });
            
            // Wait for all neighbor fetches to finish, then join the HTML together
            const bordersElements = await Promise.all(bordersPromises);
            bordersHTML += bordersElements.join('');
            
            // Update bordering countries section
            borderingCountries.innerHTML = bordersHTML;
        } else {
            borderingCountries.innerHTML = '<h3>Bordering Countries:</h3><p>This country has no land borders.</p>';
        }

    } catch (error) {
        // 2.5 Show user-friendly error message
        errorMessage.innerHTML = error.message;
    } finally {
        // 2.2 Hide loading spinner when done
        loadingSpinner.classList.add('hidden');
    }
}

// Event listeners
// 2.1 Search trigger: Click button
searchBtn.addEventListener('click', () => {
    const country = countryInput.value;
    if (country) {
        searchCountry(country);
    }
});

// 2.1 Search trigger: Press Enter in input
countryInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const country = countryInput.value;
        if (country) {
            searchCountry(country);
        }
    }
});