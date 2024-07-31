const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/restaurant', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


const restaurantSchema = new mongoose.Schema({
  name: String,
  location: String,
  cuisine: String,
  rating: Number
});


const Restaurant = mongoose.model('Restaurant', restaurantSchema);


app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    return res.json(restaurants);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


app.post('/restaurants', async (req, res) => {
  const restaurant = new Restaurant(req.body);
  try {
    await restaurant.save();
    return res.status(201).json(restaurant);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});


app.put('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    return res.json(restaurant);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});


app.delete('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    return res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get('/restaurants/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const result = await Restaurant.find({
      $or: [
        { name: new RegExp(query, 'i')},
        { location: new RegExp(query, 'i')},
        { cuisine: new RegExp(query, 'i')}
        //{ rating: new RegExp(query, 'i')}
      ]
    });

    res.json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
