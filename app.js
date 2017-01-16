var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var board = require('./routes/board'); //board = board.js


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));//dir이름views라는 것으로 할당한다.
app.set('view engine', 'ejs');//view 엔진또한 ejs로 할당한다.

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
console.log(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname + 'public')));//정적파일



app.use('/board', board);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found'); //'Not Found' => localhost:3000 에서 출력
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {  //env = string
  app.use(function(err, req, res, next) {//미들웨어 콜백 함수 *에러메시지 매개변수 4개 필수
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
