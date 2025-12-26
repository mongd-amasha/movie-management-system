document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const movieID = urlParams.get('movieID');
    const apiKey = '20468f26';
    const movieDetailsDiv = document.getElementById('movieDetails');
    const movieLinksDiv = document.getElementById('movieLinks');
    const favoriteForm = document.getElementById('favoriteForm');
    const favoriteButton = document.getElementById('favoriteButton');

    let movieTitle = '';

    if (movieID) {
        fetchMovieDetails(movieID);
        fetchMovieLinks(movieID);
    } else {
        movieDetailsDiv.innerHTML = '<p>Error: Movie ID not found in URL.</p>';
    }

    function fetchMovieDetails(movieID) {
        fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movieID}`)
            .then(response => response.json())
            .then(movie => {
                if (movie.Response === 'True') {
                    movieTitle = movie.Title;
                    movieDetailsDiv.innerHTML = `
                        <img src="${movie.Poster}" alt="${movie.Title}">
                        <h2>${movie.Title}</h2>
                        <p><strong>Genre:</strong> ${movie.Genre}</p>
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Actors:</strong> ${movie.Actors}</p>
                        <p><strong>Plot:</strong> ${movie.Plot}</p>
                    `;
                    checkIfFavorite(movie.imdbID);
                }
            })
            .catch(error => console.error('Error fetching movie details:', error));
    }

    function fetchMovieLinks(movieID) {
        fetch(`/movie-links/${movieID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch links');
                }
                return response.json();
            })
            .then(links => {
                movieLinksDiv.innerHTML = '';

                if (links.length === 0) {
                    movieLinksDiv.innerHTML = '<p>No links available.</p>';
                    return;
                }

                const loggedInUser = sessionStorage.getItem('loggedInUser');

                links.forEach(link => {
                    const isOwner = loggedInUser && loggedInUser.trim().toLowerCase() === link.userEmail.trim().toLowerCase();

                    let deleteButtonHTML = isOwner
                        ? `<button onclick="deleteLink('${movieID}', '${link.link}')" class="btn btn-danger">Delete</button>`
                        : '';

                    movieLinksDiv.innerHTML += `
                        <div>
                            <p><strong>${link.userEmail}</strong>: ${link.review}</p>
                            <p>${link.description}</p>
                            <a href="${link.link}" target="_blank">${link.link}</a>
                            <p><strong>Visibility:</strong> ${link.visibility}</p>
                            ${deleteButtonHTML}
                            <hr>
                        </div>
                    `;
                });
            })
            .catch(error => console.error('Error fetching links:', error));
    }

    window.goBack = function() {
        window.history.back();
    };

    window.deleteLink = function(movieID, link) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this link permanently.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/delete-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ movieID, link })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Deleted!', 'Your link has been deleted.', 'success');
                        fetchMovieLinks(movieID);
                    } else {
                        Swal.fire('Error!', 'Could not delete the link.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error deleting link:', error);
                    Swal.fire('Error!', 'An error occurred while deleting.', 'error');
                });
            }
        });
    };

    function checkIfFavorite(movieID) {
        fetch('/favorites')
            .then(response => response.json())
            .then(favorites => {
                const isFavorite = favorites.some(movie => movie.movieID === movieID);
                updateFavoriteButton(isFavorite);
            })
            .catch(error => console.error('Error checking favorite:', error));
    }

    function updateFavoriteButton(isFavorite) {
        if (isFavorite) {
            favoriteButton.innerText = 'Remove from Favorites';
            favoriteButton.classList.remove('btn-success');
            favoriteButton.classList.add('btn-danger');
        } else {
            favoriteButton.innerText = 'Add to Favorites';
            favoriteButton.classList.remove('btn-danger');
            favoriteButton.classList.add('btn-success');
        }
    }

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

    function addToFavorites(movieID, title) {
        fetch('/add-to-favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieID, title })
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
                Swal.fire('Added!', 'Movie has been added to your favorites.', 'success');
                updateFavoriteButton(true);
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
                Swal.fire('Removed!', 'Movie removed from favorites.', 'warning');
                updateFavoriteButton(false);
            }
        }).catch(error => console.error('Error removing from favorites:', error));
    }

    if (favoriteForm) {
        favoriteForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const link = document.getElementById('link').value;
            const description = document.getElementById('description').value;
            const review = document.getElementById('review').value;
            const visibility = document.querySelector('input[name="visibility"]:checked')?.value || 'public';

            fetch('/add-to-favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ movieID, title: movieTitle, link, description, review, visibility })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('Saved!', 'Your review has been added.', 'success');
                    fetchMovieLinks(movieID);
                } else {
                    Swal.fire('Error!', data.error || 'Could not save review.', 'error');
                }
            })
            .catch(error => console.error('Error saving favorite:', error));
        });
    }
});
