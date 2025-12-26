const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Favorite = require('./models/Favorite');
const app = express();
mongoose.connect('mongodb+srv://mongd:su%212J%40pQSD%21YdaT@devcluster.ixq1j.mongodb.net/moviesDB?retryWrites=true&w=majority&appName=devcluster')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.render('register', { error: 'Passwords do not match' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.render('register', { error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        req.session.user = user;
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Server error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.send(`<script>
            sessionStorage.removeItem('loggedInUser');
            window.location.href = '/login';
        </script>`);
    });
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
});

app.get('/', (req, res) => res.render('index'));

app.get('/detail', (req, res) => {
    const movieID = req.query.movieID;
    if (!movieID) {
        return res.render('detail', { error: 'Movie ID is missing!' });
    }
    res.render('detail', { movieID });
});

app.get('/movie-links/:movieID', async (req, res) => {
    try {
        const movieID = req.params.movieID;
        const movieLinks = await Favorite.find({ movieID });

        if (!movieLinks) {
            return res.status(404).json({ error: 'No links found for this movie' });
        }

        let formattedLinks = [];
        movieLinks.forEach(movie => {
            movie.links.forEach(link => {
                formattedLinks.push({
                    userEmail: movie.userEmail,
                    link: link.link,
                    description: link.description,
                    review: link.review,
                    visibility: link.visibility
                });
            });
        });

        res.json(formattedLinks);
    } catch (error) {
        console.error('Error fetching movie links:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/public-movies', async (req, res) => {
    try {
        const movies = await Favorite.find({ "links.visibility": "public" });
        if (req.headers.accept.includes('application/json')) {
            return res.json(movies);
        } else {
            res.render('public', { movies });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch public movies." });
    }
});


app.get('/public', (req, res) => {
    res.render('public');
});

app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied: You are not an Admin.');
    }
    res.render('admin', { user: req.session.user });
});

app.get('/admin-links', async (req, res) => {
    try {
        const movies = await Favorite.find().exec();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admin links." });
    }
});

app.post('/track-click', async (req, res) => {
    const { movieID, link } = req.body;
    try {
        const movie = await Favorite.findOne({ movieID });
        if (movie) {
            const linkToUpdate = movie.links.find(l => l.link === link);
            if (linkToUpdate) {
                linkToUpdate.clicks += 1;
                await movie.save();
            }
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to track click." });
    }
});

app.post('/delete-link', async (req, res) => {
    const { movieID, link } = req.body;
    try {
        const movie = await Favorite.findOne({ movieID });
        if (movie) {
            movie.links = movie.links.filter(l => l.link !== link);
            await movie.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete link." });
    }
});

app.get('/favorites', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        const favorites = await Favorite.find({ userEmail: req.session.user.email });
        if (req.headers.accept.includes('text/html')) {
            res.render('favorites', { favorites });
        } else {
            res.json(favorites);
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.post('/add-to-favorites', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    let { movieID, title, link, description, review, visibility } = req.body;

    if (!movieID || !title) {
        return res.status(400).json({ error: 'Movie ID and title are required' });
    }

    if (link && !/^https?:\/\//.test(link)) {
        return res.status(400).json({ error: 'Invalid link format. Links must start with http:// or https://' });
    }

    try {
        let favorite = await Favorite.findOne({ userEmail: req.session.user.email, movieID });

        if (!favorite) {
            favorite = new Favorite({ 
                userEmail: req.session.user.email, 
                movieID, 
                title, 
                links: [] 
            });
        }

        if (description || review) {
            favorite.links.push({
                link: link || null,
                description: description || 'No description provided.',
                review: review || 'No review provided.',
                visibility: visibility || 'public',
                clicks: 0
            });
        }

        await favorite.save();
        res.json({ success: true, message: 'Movie added to favorites successfully' });
    } catch (error) {
        console.error('Error saving favorite:', error);
        res.status(500).json({ error: 'Server error while saving review' });
    }
});

app.post('/remove-from-favorites', async (req, res) => {
    const { movieID } = req.body;
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

    try {
        await Favorite.deleteOne({
            userEmail: req.session.user.email,
            movieID
        });

        res.json({ success: true, action: 'removed' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));