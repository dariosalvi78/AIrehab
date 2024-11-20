import jasmine from 'jasmine'
import config from '../src/utils/config.js'

config.log.path = '../backend/tests/tests_logs/'
config.uploads.base_path = '../backend/tests/tests_uploads/'
config.poe.runModel = 'false'

const runner = new jasmine()

runner.loadConfig({
    spec_dir: "./tests/jasmine",
    spec_files: [
        "**/*[sS]pec.?(m)js"
    ],
    helpers: [
        "helpers/**/*.?(m)js"
    ],
    env: {
        stopSpecOnExpectationFailure: false,
        random: true
    }
})

runner.execute()
