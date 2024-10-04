import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import config from '../../../src/utils/config.js'
import attachments from '../../../src/controllers/attachments.js'
import fileHandler from '../../../src/utils/fileHandler.js'
import mock from '../../mock_data.js'

beforeAll(function () {
    config.uploads.base_path = '../backend/tests/tests_uploads/'
    this.physiotherapist = mock.physiotherapist
    this.patient = mock.patient
    this.sessions = mock.sessions
})

describe('getExerciseFile access:', function () {

    beforeAll(function () {
        this.exercises = mock.exercises
    })

    it('get exercise file requires authentication', async function () {
        await attachments.getExerciseFile({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    
    it('cant get non existing video from exercise', async function () {
        let exercise = this.exercises[0]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        await attachments.getExerciseFile({ 
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            status(status) {
                expect(status).toBe(400)
                return this
            },
            send(data) {
                expect(data).toContain('Video with given filename does not exist')
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('admin can get exercise file', async function () {
        let exercise = this.exercises[1]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        await attachments.getExerciseFile({ 
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            sendFile (file) {
                expect(file).toBeDefined()
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
            },
            status (status) {
                console.log(status)
            },
            send(data) {
                console.log(data)
            }
        })
    })
    it('physiotherapist can get exercise file', async function () {
        let exercise = this.exercises[1]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        await attachments.getExerciseFile({ 
            user: this.physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            sendFile (file) {
                expect(file).toBeDefined()
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
            },
            status (status) {
                console.log(status)
            },
            send(data) {
                console.log(data)
            }
        })
    })
})

describe('uploadExerciseFile access:', function () {

    it('uploading exercise file requires authentication', async function () {
        await attachments.uploadExerciseFile({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
            }
        })
    })
    it('cant upload exercise video that does not exist', async function () {
        let exercise = this.exercises[0]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(undefined)
        await attachments.uploadExerciseFile({ 
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            status(status) {
                expect(status).toBe(404)
                return this
            },
            send(data) {
                expect(data).toContain('Exercise does not exist')
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('cant upload exercise video if video has already been uploaded', async function () {
        let exercise = this.exercises[1]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        await attachments.uploadExerciseFile({ 
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            status(status) {
                expect(status).toBe(400)
                return this
            },
            send(data) {
                expect(data).toContain('Video has already been uploaded')
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('admin can upload exercise video', async function () {
        let exercise = this.exercises[0]
        let video = { videoFile: 'newvideo.mp4', endTimestamp: 'randomtimestamp' }
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        spyOn(fileHandler, 'save').and.returnValue(video)
        await attachments.uploadExerciseFile({ 
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
                expect(fileHandler.save).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can upload exercise video', async function () {
        let exercise = this.exercises[0]
        let video = { videoFile: 'newvideo.mp4', endTimestamp: 'randomtimestamp' }
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        spyOn(fileHandler, 'save').and.returnValue(video)
        await attachments.uploadExerciseFile({ 
            user: this.physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
                expect(fileHandler.save).toHaveBeenCalled()
            }
        })
    })
})