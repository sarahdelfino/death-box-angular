// Karma configuration file
// https://karma-runner.github.io/latest/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'), // ✅ new
      
    ],
    client: {
      clearContext: false,
      jasmine: {
        // optional: keep tests deterministic
        random: false,
      },
    },

    // ✅ replace coverageIstanbulReporter with coverageReporter
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/death-box-angular'),
      reporters: [
        { type: 'html' },
        { type: 'lcovonly' },
        { type: 'text-summary' },
      ],
      // optional thresholds
      check: {
        global: { statements: 0, branches: 0, functions: 0, lines: 0 },
      },
    },

    // ✅ reporter name is "coverage" for karma-coverage
    reporters: ['progress', 'kjhtml', 'coverage'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,

    // Use regular Chrome locally; Headless is nicer in CI
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,

    // optional: CI-friendly headless launcher
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
  });
};
