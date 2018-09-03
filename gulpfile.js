const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');

gulp.task('eslint', () => gulp.src(['./*.js', './*/*.js', './*/*/*.js', '*/*/*/*.js', '*/*/*/*/*.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

// new function added to check if ESLint has run the fix
function isFixed(file) {
  return file.eslint !== null && file.eslint.fixed;
}

// new lint and fix task
gulp.task('eslint-fix', () => gulp.src(['./*.js', './*/*.js', './*/*/*.js', '*/*/*/*.js', '*/*/*/*/*.js', '!node_modules/**'])
  .pipe(eslint({
    fix: true,
  }))
  .pipe(eslint.format())
// if running fix - replace existing file with fixed one
  .pipe(gulpIf(isFixed, gulp.dest('./')))
  .pipe(eslint.failAfterError()));
