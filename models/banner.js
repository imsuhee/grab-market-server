module.exports = function(sequelize,dataTypes){
const banner = sequelize.define('Banner',{ //테이블 명 베너
    imageUrl : { //이미지url 
        type : dataTypes.STRING(300),
        allowNull : false,
    },
    href : {//이미지 클릭 시 경로정보
        type : dataTypes.STRING(200),
        allowNull : false,
    },
});
return banner;
}