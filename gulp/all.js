module.exports = function (gulp) {
  gulp.task('all', [ 'html', 'img', 'css', 'lib', 'js' ])
  gulp.task('default', [ 'server', 'watch' ])
}
