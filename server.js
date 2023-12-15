import express from 'express'
import mongoose from 'mongoose'
import { engine } from 'express-handlebars'
import Handlebars from 'handlebars'
import bodyParser from 'body-parser'
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
const PORT = 3000

const app = express();
app.engine('handlebars', engine({ defaultLayout: 'main', extname: '.hbs', handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema({
  username: String,
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const User = mongoose.model('User', userSchema);

app.post('/follow', async (req, res) => {
  try {
    const { followerUsername, followeeUsername } = req.body;

    const follower = await User.findOne({ username: followerUsername }).exec();
    const followee = await User.findOne({ username: followeeUsername }).exec();

    if (!follower || !followee) {
      // Manejar el caso en el que no se encuentran los usuarios
      return res.status(404).send('Usuario no encontrado');
    }

    // Verificar si el seguidor ya sigue al usuario
    const isFollowing = follower.following.includes(followee._id);

    if (!isFollowing) {
      // Agregar el followee a la lista de seguidos del follower
      follower.following.push(followee._id);
      await follower.save();
      res.render('index.hbs', {follower});
    } else {
      // El seguidor ya sigue al usuario, puedes manejar esto según tus necesidades
      console.log(`${followerUsername} ya sigue a ${followeeUsername}`);
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    // Manejo de errores
    res.status(500).send('Error interno del servidor');
  }
});

const tweetSchema = new mongoose.Schema({
  username: String,
  content: String,
});

const Tweet = mongoose.model('Tweet', tweetSchema);

app.get('/', async (req, res) => {
  try {
    // Obtener todos los tweets de la base de datos
    const tweets = await Tweet.find({}).exec();
    res.render('index.hbs', {tweets});
  } catch (err) {
    console.error(err);
    console.log(err)
  }
});

app.post('/tweet', async (req, res) => {
  try {
    const { username, content } = req.body;
    const newTweet = new Tweet({ username, content });
    await newTweet.save();
    console.log("El tweet es: " + newTweet)
    res.redirect('/');
  } catch (err) {
    console.error(err);
  }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`)
}) 

mongoose.connect('mongodb+srv://fedec123:fedec123@cluster0.begezap.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Manejar errores de conexión a la base de datos
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conectado a MongoDB');
});