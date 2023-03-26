const express = require("express");
const cors = require("cors");
const app = express();
const models = require('./models');
const multer = require('multer');
const upload = multer({
    storage : multer.diskStorage({
        destination : function (req,file, cb) {
            cb(null, 'uploads/');
        },
        filename : function (req, file, cb){
            cb(null, file.originalname);
        },
    }),
  });
const port = 8080;

app.use(express.json());
app.use(cors());
app.use('/uploads',express.static('uploads'));

app.get('/banners', (req, res)=> { //
    models.Banner.findAll({
        limit : 2 //n개까지 보여준다.
    })
     .then((result)=> { //값이 제대로 들어오면 배너값 출력
        res.send({
            banners : result,
        });
      })
     .catch((error)=> { //에러 발생 시 보여줌
        console.error('error');
        res.status(500).send('에러가 발생했습니다.');
    })
})

app.get("/products", (req, res) => {
  //  const query = req.query;
 //  console.log('QUERY : ',query);
    models.Product.findAll({ //findAll 사용 시 너무 많은 양의 데이터가 있을 시 전체 레코드를 조회하기 때문에 많은 시간이 소요됨(비효율적)
    //    limit : 1,    //한번에 n개씩 조회하겠다.
    order : [["createdAt","DESC"]],//정렬 방식 바꿈 id -> createAt(생성일자) 내림차순으로 변경
    attributes : [ //아래 데이터들만 보여줘라
        'id',
        'name',
        'price',
        'createdAt',
        'seller',
        'imageUrl',
        'soldout'
    ],

}).then((result)=>{
        console.log("PRODCUTS : ", result);
        res.send({
            products : result
        })
    }).catch((error)=>{
        console.error(error);
        res.status(400).send("에러발생");
    })
 
});

app.post("/products", (req, res) => {
    const body = req.body;
    const {name, description, price, seller, imageUrl} = body;
    if(!name || !description || !price || !seller || !imageUrl) {//하나라도 입력이 안될 시! 방어코드용
        res.status(400).send("모든 필드를 입력해주세요!");
    }
    models.Product.create({ 
        name,
        description,
        price,
        seller,
        imageUrl,
    }).then((result)=> {
        console.log("상품 생성 결과 : ",result);
        res.send({
            result,
        });
    })
    .catch((error)=> {
    console.error(error);
    res.status(400).send("상품 업로드에 문제가 발생했습니다.");
  })
});

app.get("/products/:id", (req, res) => { //상품 상세정보 로직
    const params = req.params;
    const {id} = params;
    models.Product.findOne({
        where : {
            id : id
        }
    }).then((result)=>{
        console.log("PRODUCT : ", result);
        res.send({
            product : result,
        })
    }).catch((error)=>{
        console.error(error);
        res.status(400).send("상품 조회에 에러가 발생했습니다.");
    })

});

app.post('/image',upload.single('image'),(req,res)=>{//이미지 파일을 해당 경로로 업로드하고 폴더에 해당 이미지 저장시킴
    const file = req.file;
    console.log(file);
    res.send({
        imageUrl : file.path,
    })
})


app.post("/purchase/:id",(req, res) =>{ //결제하기 로직
    const {id} = req.params;
    models.Product.update(
      {
        soldout : 1,
    },
    {
        where : {
            id,
        },
    }
    ).then((result)=> {
        res.send({
            result : true,
        });
    }).catch((error)=> {
        console.error(error);
        res.status(500).send('에러가 발생했습니다.');
    })
});


app.listen(port, () => {//node scrver.js 동작 시 보여주는 구문
  console.log("말랑카우의 쇼핑몰 서버가 돌아가고 있습니다");
  models.sequelize.sync().then(()=>{
  console.log('DB연결 성공!');
  })
  .catch((err)=>{ //node server.js 동작 후 error 발생 시 보여줌
  console.error(err);
  console.log('DB연결 애러!');
  process.exit();
  })
});
