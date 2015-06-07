module.exports = function(grunt) {


  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');

  grunt.initConfig({

    sass: {
      files: {
        expand: true,
        cwd: "css",
        dest: "css",
        src: "*.scss",
        ext: '.css'
      }
    },

    watch: {
      sass: {
        files: ['css/*.scss'],
        tasks: ["sass"]
      }
    }

  });

  grunt.registerTask("default", ["sass", "watch"]);
};