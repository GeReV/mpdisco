var gulp = require('gulp');

// Run this to compress all the things!
gulp.task('production', function(){
  // This runs only if the karma tests pass
  gulp.start(['images', 'font', 'minifyCss', 'uglifyJs'])
});
