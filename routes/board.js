var express = require('express');//express 로드
var router = express.Router();

//   MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool
({
    connectionLimit: 3,
    host: 'localhost',
    user: 'guestmember',
    database: 'test',
    password: '4321'
});

/**/
router.get('/', function(req, res, next) {
    // 그냥 board/ 로 접속할 경우 전체 목록 표시로 리다이렉팅
    res.redirect('/board/list');
});

// 리스트 전체 보기 GET
router.get('/list', function(req,res,next){

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var sqlForSelectList = "SELECT idx, creator_id, title, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate,hit FROM board";
        connection.query(sqlForSelectList, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('list', {title: ' 게시판 전체 글 조회', rows: rows});
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});

// 글쓰기 화면 표시 GET
router.get('/write', function(req,res,next){
    res.render('write',{title : "게시판 글 쓰기"});
});



// 글쓰기 로직 처리 POST
router.post('/write', function(req,res,next){

    var creator_id = req.body.creator_id;
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [creator_id,title,content,passwd];

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var sqlForInsertBoard = "insert into board(creator_id, title, content, passwd) values(?,?,?,?)";
        connection.query(sqlForInsertBoard,datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.redirect('/board');
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });

});
//글 조회 로직 처리
router.get('/read/:idx',function(req,res,next)
{
    var idx = req.params.idx; //주소창에 붙는 idx값을 가져옴

    pool.getConnection(function(err,connection)
    {
        var sql = "select idx, creator_id, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, hit from board where idx=?";
        connection.query(sql,[idx], function(err,row)
        {
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ",row);
            res.render('read', {title:"글 조회", row:row[0]});


            // 조회수 값
            var hit = req.body.hit;
            // 조회수 값 수정
            var sql = 'update board set hit = hit + 1 where idx = ?';
            connection.query(sql, [idx, hit], function (err, result) {
                console.log(result);
            });
            connection.release();
        });
    });
});

router.get('/update',function(req,res,next)
{
    var idx = req.query.idx;

    pool.getConnection(function(err,connection)
    {
        if(err) console.error("커넥션 객체 얻어오기 에러 : ",err);

        var sql = "select idx, creator_id, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, hit from board where idx=?";//db 행찾기
        connection.query(sql, [idx], function(err,rows)
        {
            if(err) console.error(err);
            console.log("update에서 1개 글 조회 결과 확인 : \n",rows);
            res.render('update', {title:"글 수정", row:rows[0]});
            connection.release();
        });
    });

});



router.post('/update',function(req,res,next)
{
    var idx = req.body.idx;
    var creator_id = req.body.creator_id;
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    pool.getConnection(function(err,connection)
    {

        var sql = "update board set creator_id=? , title=?,content=?, regdate=now() where idx=? and passwd=?";
        connection.query(sql,[creator_id,title,content,idx,passwd],function(err,result)
        {

            console.log(result);
            if(err) console.error("글 수정 중 에러 발생 err : ",err);

            if(result.affectedRows == 0)
            {
                res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 값이 변경되지 않았습니다.');history.back();</script>");
            }
            else
            {
                res.redirect('/board/read/'+idx);
            }
            connection.release();
        });
    });
});



//delete - board 연결
router.get('/delete/:idx',function(req,res,next)
{
    var idx = req.params.idx;
    res.render('delete', {title:"글삭제",idx:idx});
});
router.post('/delete',function(req,res,next)
{
    var idx = req.body.idx;
    var passwd = req.body.passwd;
    console.log("\n",passwd,"\n",idx,"\n");
    pool.getConnection(function(err,connection)
        {

        connection.query("DELETE FROM `test`.`board` WHERE `idx`=? and `passwd`=?",[idx,passwd],function(err,result)
        {
            console.log(result,idx);
            if(err) console.error("글 삭제 중 에러 발생 err : ",err);

            if(result.affectedRows == 0)
            {
                res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 값이 변경되지 않았습니다.');history.back();</script>");
            }
            else
            {
                res.redirect('/board/list');
            }
            connection.release();
        });
    });
});


module.exports = router;
