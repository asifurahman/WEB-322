require('dotenv').config()
const express = require('express');
const { Lego, Theme } = require('./db');
const legoData = require("./data/setData.json");
const themeData = require("./data/themeData.json");
const path = require("path");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{
  try {    
    let sets = [];
    let includeTheme = false;

    if(req.query.theme){
      sets = await Lego.findAll({ 
        include: {
          model: Theme,
          where: { name: req.query.theme }
        }
      });
      includeTheme = true;
    } else {
      sets = await Lego.findAll({ include: Theme });
    }

    // Map the sets to include theme name
    sets = sets.map(set => {
      const setJson = set.toJSON();
      if (includeTheme && set.Theme) {
        setJson.theme_name = set.Theme.name;
      }
      return setJson;
    });

    res.render("sets", { sets });
  } catch(err) {
    res.status(404).render("404", { message: err });
  }
});

app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await Lego.findOne({ where: { set_num: req.params.num } });
    res.render("set", {set})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
});

// get all
app.get('/legos', async (req, res) => {
  try {
    const legos = await Lego.findAll();
    res.json(legos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// get by num
app.get('/lego/:set_num', async (req, res) => {
  try {
    const lego = await Lego.findOne({ where: { set_num: req.params.set_num } });
    if (!lego) {
      return res.status(404).json({ error: 'Lego not found' });
    }
    res.json(lego);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// create
app.post('/lego', async (req, res) => {
  try {
    const { set_num, name, year, theme_id, num_parts, img_url } = req.body;
    console.log(set_num, name, year, theme_id, num_parts, img_url)
    const lego = await Lego.create({ set_num, name, year, theme_id, num_parts, img_url });
    res.status(201).json(lego);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
})

// update
app.put('/lego/:num', async (req, res) => {
  try {
    const { name, year, theme_id, num_parts, img_url } = req.body;
    const lego = await Lego.findOne({ where: { set_num: req.params.num } });
    if (!lego) {
      return res.status(404).json({ error: 'Lego not found' });
    }
    await lego.update({ name, year, theme_id, num_parts, img_url });
    res.json(lego);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// delete
app.delete('/lego/:num', async (req, res) => {
  try {
    const lego = await Lego.findOne({ where: { set_num: req.params.num } });
    if (!lego) {
      return res.status(404).json({ error: 'Lego not found' });
    }
    await lego.destroy();
    res.json({ message: 'Lego deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// import all data

app.post('/seed', async (req, res) => {
  try {
    const createdThemes = await Theme.bulkCreate(themeData);
    const createdLegos = await Lego.bulkCreate(legoData);
    res.status(201).json({ message: "seeding completed"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });