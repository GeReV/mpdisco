var dest = "./public";
var src = "./client";

module.exports = {
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir: dest
    }
  },
  sass: {
    src: src + "/sass/mpdisco.scss",
    dest: dest + "/css",
    settings: {
      imagePath: "images" // Used by the image-url helper
    }
  },
  images: {
    src: src + "/images/**",
    dest: dest + "/images"
  },
  font: {
    src: src + "/font/**",
    dest: dest + "/font"
  },
  bower: {
    dest: src + "/js/vendor"
  },
  browserify: {
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + "/js/mpdisco.jsx",
      dest: dest + "/js",
      outputName: "mpdisco.js"
    }]
  },
  production: {
    cssSrc: dest + "/*.css",
    jsSrc: dest + "/*.js",
    dest: dest
  }
};
