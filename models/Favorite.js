const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    link: { type: String, required: true },
    description: { type: String, required: true },
    review: { type: String, required: true },
    visibility: { type: String, enum: ['public', 'private'], required: true },
    clicks: { type: Number, default: 0 }
});

const FavoriteSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    movieID: { type: String, required: true },
    title: { type: String, required: true },
    links: [LinkSchema]
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
