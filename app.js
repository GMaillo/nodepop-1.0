var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/**
 * Conexión con base de datos
 */
require('./lib/connectMongoose');
require('./models/Anuncio');

app.use('/apiv1/anuncios', require('./routes/apiv1/anuncios'));

/**
 * Rutas de mi aplicación
 */
app.use('/',       require('./routes/index') );
app.use('/users',      require('./routes/users'));

app.use('/apiv1/anuncios', require('./routes/apiv1/anuncios'));
app.use('/img/anuncios', express.static(path.join(__dirname, './public/images')));

app.locals.title='NodePop';

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // comprobar error de validación
  if (err.array) { // error de validación
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPI(req) ?
    {message: 'Not valid', error: err.mapped()}:
    `Not valid - ${errInfo.param} ${errInfo.msg}`;
  }

  res.status(err.status || 500);

  if (isAPI(req)){
    res.json({success: false, error: err.message});
    return;
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  
  res.render('error');
});

function isAPI(req) {
  return req.originalUrl.indexOf('/apiv') === 0;
}

module.exports = app;
