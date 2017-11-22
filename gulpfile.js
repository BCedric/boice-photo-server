const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const pump = require('pump');
const watch = require('gulp-watch')
const nodemon = require('gulp-nodemon')


gulp.task('babel', () =>
    gulp.src(['./src/**/*.js'])
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('bin'))
);

gulp.task('compress', function (cb) {
  pump([
        gulp.src('bin/**/*.js'),
        uglify(),
        gulp.dest('bin')
    ],
    cb
  );
});

gulp.task('default', function () {
   var stream = nodemon({
    script: 'bin/index.js'
  , ignore: ["bin/*"]
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  , tasks: ['babel']
  })
  stream
      .on('restart', function () {
        console.log('restarted!')
      })
      .on('crash', function() {
        console.error('Application has crashed!\n')
         stream.emit('restart', 10)  // restart the server in 10 seconds
      })
})

gulp.task('build', function () {
  gulp.start('babel')
  gulp.start('compress')
})
