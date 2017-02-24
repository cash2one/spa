var gulp = require('gulp'),
    //sass = require('gulp-ruby-sass'),
    sass = require('gulp-sass'),
    mincss = require('gulp-mini-css'),
    changed = require('gulp-changed'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    rev = require('gulp-rev'),
    notify = require('gulp-notify'),
    runSequence = require('run-sequence'),
    revCollector = require('gulp-rev-collector'),
    base64 = require('gulp-base64'),
    autoprefixer = require('gulp-autoprefixer');

var raw_css = 'SDRAW/css',
    com_css = 'COMPRESSED/css',
    raw_js = 'SDRAW/js',
    com_js = 'COMPRESSED/js';

require('gulp-awaitable-tasks')(gulp);

//处理scss
gulp.task('sass', function* () {

    ////编译scss
    yield gulp.src(raw_css + '/**/*.scss')
      //.pipe(changed(com_css,{extension: '.css'}))
            .pipe(sass())
            .pipe(autoprefixer({
                browsers: ['last 2 versions', 'Android >= 4.0'],
                cascade: true, //是否美化属性值 默认：true 像这样：
                remove:true //是否去掉不必要的前缀 默认：true
            }))
            .pipe(mincss())
            .pipe(rev()) //添加md5后缀
            .pipe(gulp.dest(com_css))//输出到compressed目录
            .pipe(rev.manifest()) //- 生成一个rev-manifest.json
            .pipe(rename('css-rev-manifest.json')) //重命名
            .pipe(gulp.dest('manifest')); //- 将 rev-manifest.json 保存到 rev 目录内

    ////转换小图标成base64
    yield gulp.src(com_css+'/**/*.css')
            .pipe(base64({
                extensions: ['svg', 'png', /\.jpg#datauri$/i],
                maxImageSize: 8*1024, // 8K
                debug: false
            }))
            .pipe(gulp.dest(com_css));
});

//处理js
gulp.task('minjs', function*() {

    ////合并main.js
    yield  gulp.src([raw_js+'/kit/jweixin-1.0.0.js',raw_js+'/kit/qrcode.js',raw_js+'/page/index.js',raw_js+'/kit/fastclick.js'])
        .pipe(concat('main.js'))
        .pipe(gulp.dest(raw_js+"/page/"));

    ////合并easemob.js
    yield gulp.src([raw_js+'/kit/scanimg.js',raw_js+'/kit/iscroll-probe-5.1.3.js',raw_js+'/kit/easemob.im-1.1.js'])
        .pipe(concat('easemob.js'))
        .pipe(gulp.dest(raw_js+"/kit/"));

    ////压缩js
   yield gulp.src(raw_js + '/**/*.js')
        .pipe(uglify()) //压缩
        .pipe(rev()) //添加md5后缀
        .pipe(gulp.dest(com_js))
        .pipe(rev.manifest()) //- 生成一个rev-manifest.json
        .pipe(rename('js-rev-manifest.json')) //重命名
        .pipe(gulp.dest('manifest')); //- 将 rev-manifest.json 保存到 rev 目录内
});

//替换html中的js、css文件名，并输出到当前根目录下面
gulp.task('rev', function () {
    return gulp.src(['manifest/*-rev-manifest.json', './_index.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(rename('index.html')) //重命名
        .pipe(gulp.dest('./'))                                 //- 替换后的文件输出的目录
});

//清理
gulp.task('clean', function () {
    return gulp.src(['index.html', 'COMPRESSED/*', 'manifest/*'], {read: false})
        .pipe(clean());
});

//启动server
gulp.task('connect', function () {
    connect.server({
        port: 8081
    });
});

//监控改变
gulp.task('watch', function (){
    gulp.watch(raw_css + '/**/*.scss', ['sass']);
    gulp.watch(raw_js + '/**/*.js', ['minjs']);
});

gulp.task('default', function (callback) {
    runSequence('clean', ['minjs', 'sass'],'rev','watch', 'connect', callback);
});

////上线执行 gulp build
gulp.task('build', function (callback) {
    runSequence('clean','changeRev', ['minjs', 'sass'],'rev','pub', callback);
});

//////////////////////////////////////////////////////////////
var fs = require('fs'),
    through = require('through2'),
    stat = fs.stat,
    projectPath = 'spa-manager-account/spa2';
/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
var copy = function( src, dst ){
    // 读取目录中的所有文件/目录
    fs.readdir( src, function( err, paths ){
        if( err ){
            throw err;
        }
        paths.forEach(function( path ){
            var _src = src + '/' + path,
                _dst = dst + '/' + path,
                readable, writable;
            stat( _src, function( err, st ){
                if( err ){
                    throw err;
                }
                // 判断是否为文件
                if( st.isFile() ){
                    // 创建读取流
                    readable = fs.createReadStream( _src );
                    // 创建写入流
                    writable = fs.createWriteStream( _dst );
                    // 通过管道来传输流
                    readable.pipe( writable );
                }
                // 如果是目录则递归调用自身
                else if( st.isDirectory() ){
                    exists( _src, _dst, copy );
                }
            });
        });
    });
};

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
var exists = function( src, dst, callback ){
    fs.exists( dst, function( exists ){
        // 已存在
        if( exists ){
            callback( src, dst );
        }
        // 不存在
        else{
            fs.mkdir( dst, function(){
                callback( src, dst );
            });
        }
    });
};

function dateFormat(date, format){
    var o = {
        "M+" : date.getMonth()+1, //month
        "d+" : date.getDate(), //day
        "h+" : date.getHours(), //hour
        "m+" : date.getMinutes(), //minute
        "s+" : date.getSeconds(), //second
        "q+" : Math.floor((date.getMonth()+3)/3), //quarter
        "S" : date.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}
//复制index.js文件
gulp.task('copySrc', function () {
    return gulp.src([raw_js+'/page/index.js'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(sdraw())
        .pipe(rename('index-src.js')) //重命名
        .pipe(gulp.dest(raw_js+'/page'))                                 //- 替换后的文件输出的目录
    //.pipe(notify({ message: 'after manifest files....' }));
});

function sdraw(){
    return through.obj(function (file, enc, cb) {
        file.contents = new Buffer( file.contents.toString().replace(/\/\/(version = )/g, function (v, v1) {
            return v1;
        }).replace(/(COMPRESSED)(\/js\/page\/)/g, function (v, v1,v2) {
            return 'SDRAW'+v2;
        }));
        cb(null,file);
    });
}

gulp.task('changeRev', function () {
    return gulp.src([raw_js+'/page/index.js'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
      .pipe(through.obj(function (file, enc, cb) {
          file.contents = new Buffer( file.contents.toString().replace(/(var version\s*=\s*)('[\da-zA-Z]+')/g, function (v, v1, v2) {
              var date = dateFormat(new Date(),'yyyyMMdd');
              if(v2.indexOf(date)!=-1){
                  var revI = parseInt(v2.substring(date.length+1)) + 1;
                  return v1 + "'"+date+(revI<10?('0'+revI):revI)+"c'";
              }else{
                  return v1 + "'"+date+"01c'";
              }
          }));
          cb(null,file);
      }))
      .pipe(rename('index.js')) //重命名
      .pipe(gulp.dest(raw_js+'/page'));
});
gulp.task('fileList', function () {
    var lists = [];
    fs.readdir( raw_js+'/page', function( err, paths ){
        if( err ){
            throw err;
        }
        paths.forEach(function( path ){
            if(/\.js$/.test(path)){
                lists.push(path.substring(0,path.length-3));
            }
        });
        console.log(lists);
    });
});

///////////////////////////////////////////////////////////////////
gulp.task('publishSrc',function(){
    exists( 'SDRAW', 'D:/software/tomcat7/wtpwebapps/'+projectPath+'/SDRAW', copy );
});

gulp.task('publishCom',function(){
    exists( 'COMPRESSED', 'D:/software/tomcat7/wtpwebapps/'+projectPath+'/COMPRESSED', copy );
});

gulp.task('copyFile', function (v) {
    fs.writeFileSync('D:/software/tomcat7/wtpwebapps/'+projectPath+'/'+process.argv[4]+'.html', fs.readFileSync(process.argv[4]+'.html'));
    //exists( process.argv[4]+'.html', 'D:/software/tomcat7/wtpwebapps/spa2/spa2/', copy );
});

gulp.task('pub',function(){
    exists( process.cwd(), 'E:/workspace2/spa-manager-projectCoupon/out/artifacts/spa_manager/spa2', copy );
});