const express = require('express');
const router = express.Router();

// Tomamos el modelo Article
let Article = require('../models/article');

// Tomamos el modelo User
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, function(req, res) {
  res.render('add_article',{
    title: 'Add Articles'
  });
});

// Add Submit Post Route
router.post('/add', function(req, res){
  req.checkBody('title','Titulo requerido').notEmpty();
  //req.checkBody('author','Author requerido').notEmpty();
  req.checkBody('body','Contenido requerido').notEmpty();

  // Tomamos los Errores
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article', {
      errors:errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success','Ariculo Creado');
        res.redirect('/');
      }
    });
  }
});

// Solicitamos el Formulario de Edicion
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req('danger', 'Acceso Denegado');
      res.redirect('/');
    }
    res.render('edit_article', {
      title:'Edit Article',
      article:article
    });
  });
});

// Update Submit Post Route
router.post('/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}
  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success','Ariculo Actualizado');
      res.redirect('/');
    }
  });
});

// Eliminando Articulos
router.delete('/:id', function(req,res){
  if(!req.user._id){
    res..status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Eliminado');
      });
    }
  });
});

// Solicitar un Articulo
router.get('/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
      User.findById(article.author, function(err,user){
        res.render('article', {
          article: article,
          author: user.name
        });
      });
    });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Seria conveniente registrarse');
    res.redirect('/users/login');
  }
}

module.exports = router;
