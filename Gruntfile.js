module.exports = function(grunt) {

    var paths = {
        dev: '.'
    };

    var port = {
        dev: '3003'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths: paths,
        port: port,
        connect: {
            dev: {
                options: {
                    port: '<%= port.dev %>',
                    hostname: '0.0.0.0',
                    keepalive: true,
                    open: true,
                    base: [paths.dev]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');


    grunt.registerTask('dev', [
        'connect:dev'
    ]);
};