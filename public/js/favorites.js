document.addEventListener('DOMContentLoaded', function () {
    const favoritesListDiv = document.getElementById('favoritesList');

    fetch('/favorites')
        .then(response => response.json())
        .then(favorites => {
            if (favorites.length === 0) {
                favoritesListDiv.innerHTML = '<p>No favorite movies found.</p>';
            } else {
                displayFavorites(favorites);
            }
        })
        .catch(error => console.error('Error loading favorites:', error));

    function displayFavorites(favorites) {
        favoritesListDiv.innerHTML = '';

        favorites.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'card';
            movieCard.innerHTML = `
                <img src="https://img.omdbapi.com/?i=${movie.movieID}&apikey=20468f26" alt="${movie.title}" />
                <h3>${movie.title}</h3>
                <button class="btn btn-danger" onclick="removeFromFavorites('${movie.movieID}', '${movie.title}')">Remove</button>
            `;
            favoritesListDiv.appendChild(movieCard);
        });
    }

    window.removeFromFavorites = function (movieID, movieTitle) {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to remove "${movieTitle}" from your favorites.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                fetch('/remove-from-favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ movieID })
                }).then(() => {
                    Swal.fire('Removed!', `"${movieTitle}" has been removed from your favorites.`, 'success').then(() => {
                        location.reload();
                    });
                }).catch(error => console.error('Error removing from favorites:', error));
            }
        });
    };
});
