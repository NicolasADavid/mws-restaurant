import gulp from 'gulp';
import del from 'del';
import newer from 'gulp-newer'
import runSequence from 'run-sequence';
import babelify from 'babelify';
import assign from 'lodash/assign';
import browserify from 'browserify';
import watchify from 'watchify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import log from 'fancy-log';
import mergeStream from 'merge-stream';
import sourcemaps from 'gulp-sourcemaps';

const browserSync = require ('browser-sync').create();

const paths = {
    js: {
        src: 'src/**/*.js',
        dest: 'dist/',
        bundles: ['js/main.js', 'js/restaurant_info.js', 'sw.js']
    }
}

const copy = {
    src: ['src/**/*.*'],
    dest: 'dist/'
}

Object.keys(paths).forEach(prop => {
    let src = [].concat(paths[prop].src);
    src = src.filter(path => path[0] !== "!").map(path => `!${path}`);
    copy.src = copy.src.concat(src);
});

gulp.task('clean', function(done) {
    log(('Cleaning'));
    return del(['dist/'], done);
});

gulp.task('js', function () {
    console.log("to do");
});

gulp.task('html', function () {
    console.log("to do");
});

gulp.task('css', function () {
    console.log("to do");
});

gulp.task('copy', function() {
    log('Copying..');

    return gulp.src(copy.src)
        .pipe(newer(copy.dest))
        .pipe(gulp.dest(copy.dest));
});

gulp.task('build', function(done){
    return runSequence(
        'clean',
        'js:bundle',
        'copy',
        done
    )
})

gulp.task('sync', ['build'], function() {
    browserSync.init({
        port: 8000,
        server: {
            baseDir: './dist'
        }
    })

    gulp.watch(copy.src, ['copy']).on('change', browserSync.reload);

    Object.keys(jsBundles).forEach(function(key) {
        var b = jsBundles[key];
        b.on('update', function() {
            return bundle(b, key);
        });
    });

})


gulp.task('default', [ 'html', 'css', 'js', 'sync' ], function () {
    // return gulp.src("src/main.js")
    // // .pipe(sourcemaps.init())
    // .pipe(babel())
    // // .pipe(concat("all,js"))
    // // .pipe(sourcemaps.write("."))
    // .pipe(gulp.dest("dist"));
});

function createBundle(src) {
    if (!src.push) {
        src = [src];
    }

    var customOpts = {
        entries: src,
        debug: true
    };

    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));

    b.transform("babelify", {presets: ["@babel/preset-env"]})

    b.on('log', log);

    return b;
}

function bundle(b, outputPath) {
    var splitPath = outputPath.split('/');
    var outputFile = splitPath[splitPath.length - 1];
    var outputDir = splitPath.slice(0,-1).join('/');

    return b.bundle()
        .on('error', function(err) {
            log.error( err );
        })
        .on('end', function() {
            log(`${outputFile} bundle done`);
        })
        .pipe(source(outputFile))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.js.dest + outputDir))
        .pipe(browserSync.stream());

        log("done???")
}

const jsBundles = {};

paths.js.bundles.forEach(bundle => {
    jsBundles[bundle] = createBundle(`./src/${bundle}`);
});

gulp.task('js:bundle', function (done) {
    return mergeStream.apply(null,
        Object.keys(jsBundles).map(function(key) {
            return bundle(jsBundles[key], key);
        })
    );
});
