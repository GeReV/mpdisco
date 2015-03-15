var gulp         = require('gulp');
var scsslint     = require('gulp-scss-lint');
var handleErrors = require('../util/handleErrors');
var config       = require('../config').sass;

gulp.task('sasslint', function () {
  return gulp.src(config.src)
    .pipe(scsslint())
    .on('error', handleErrors);
});
