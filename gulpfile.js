const gulp = require('gulp');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const connect = require('gulp-connect');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const watchify = require('watchify');
const browserify = require('browserify');

const gutil = require('gulp-util');
const notify = require("gulp-notify");

const paths = {
    src:'./app',
    js:'./app/*.js',
    html:'./app/*.jade',
    css:'./app/*.scss',
    dest:'./dist'
};

function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end'); // Keep gulp from hanging on this task
}
// Based on: http://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
function buildScript(file, watch) {
    var props = {
        entries: [paths.src + '/' + file],
        debug: true
    };
    var bundler = watch ? watchify(browserify(props)) : browserify(props);
    bundler.transform( babelify,{presets: ["es2015", "react"]});
    function rebundle() {
        var stream = bundler.bundle();
        return stream.on('error', handleErrors)
            .pipe(source('bundle.js'))
            .pipe(gulp.dest(paths.dest + '/'));
    }
    bundler.on('update', function() {
        rebundle();
        gutil.log('Rebundle...');
    });
    return rebundle();
}
gulp.task('clean', function(done) {
    //del(['build'], done);
});

gulp.task('clean', function(done) {
    //del(['build'], done);
});

gulp.task('js', function(){
    return buildScript('tr808.js', false);
});

gulp.task('css', function(){
    return gulp.src(paths.css)
        .pipe(sass())
        .pipe(gulp.dest(paths.dest+'/'))
        .pipe(connect.reload());
});

gulp.task('html', function(){
    return gulp.src(paths.html)
        .pipe(jade())
        .pipe(gulp.dest(paths.dest+'/'))
        .pipe(connect.reload());
});


gulp.task('watch', function(){
    connect.server({
        root:paths.dest,
        port:8888,
        debug:true
    });
    gulp.watch(paths.css,['css']);
    gulp.watch(paths.html,['html']);

    return buildScript('tr808.js', true);
});