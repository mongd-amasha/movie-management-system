document.addEventListener('DOMContentLoaded', function () {
    const userNameElement = document.querySelector('.nav-links span');
    const userEmail = userNameElement ? userNameElement.getAttribute('data-email') : '';

    if (userEmail.trim() !== '') {
        sessionStorage.setItem('loggedInUser', userEmail);
    } else {
        sessionStorage.removeItem('loggedInUser');
    }

    console.log("SessionStorage User:", sessionStorage.getItem('loggedInUser'));

    const searchInput = document.getElementById('movieName');
    const resultsDiv = document.getElementById('results');
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            const query = searchInput.value.trim();

            if (query.length < 3) {
                resultsDiv.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(() => searchMovies(query), 300);
        });
    }

    function searchMovies(query) {
        resultsDiv.innerHTML = `<p>Loading...</p>`;
        fetch(`https://www.omdbapi.com/?apikey=20468f26&s=${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    displayMovies(data.Search);
                } else {
                    resultsDiv.innerHTML = `<p>No movies found.</p>`;
                }
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    function displayMovies(movies) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
    
        movies.forEach(movie => {
            const poster = movie.Poster !== "N/A" ? movie.Poster : "/images/default-poster.jpg";
    
            resultsDiv.innerHTML += `
                <div class="card">
                    <img src="${poster}" alt="${movie.Title}" />
                    <h3>${movie.Title}</h3>
                    <button onclick="showMovieDetails('${movie.imdbID}')">Details</button>
                </div>
            `;
        });
    }
    
    window.showMovieDetails = function (movieID) {
        window.location.href = `/detail?movieID=${movieID}`;
    };
    const urlParams = new URLSearchParams(window.location.search);
    const movieID = urlParams.get('movieID');
    const favoriteButton = document.getElementById('favoriteButton');
    if (movieID && favoriteButton) {
        let movieTitle = '';
        fetch(`https://www.omdbapi.com/?apikey=20468f26&i=${movieID}`)
            .then(response => response.json())
            .then(movie => {
                movieTitle = movie.Title;
            });
        favoriteButton.addEventListener('click', function () {
            fetch('/favorites')
                .then(response => response.json())
                .then(favorites => {
                    const isFavorite = favorites.some(fav => fav.movieID === movieID);
                    if (isFavorite) {
                        removeFromFavorites(movieID);
                    } else {
                        addToFavorites(movieID, movieTitle);
                    }
                });
        });
    }

    function addToFavorites(movieID, title) {
        fetch('/add-to-favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieID, title })
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
                alert('Movie added to favorites');
                favoriteButton.innerText = 'Remove from Favorites';
            }
        }).catch(error => console.error('Error adding to favorites:', error));
    }

    function removeFromFavorites(movieID) {
        fetch('/remove-from-favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieID })
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
                alert('Movie removed from favorites');
                favoriteButton.innerText = 'Add to Favorites';
            }
        }).catch(error => console.error('Error removing from favorites:', error));
    }
});