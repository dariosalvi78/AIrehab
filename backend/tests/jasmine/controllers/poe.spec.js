import sessions from '../../../src/DOM/physiotherapySessionCollection.js'
import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import poeCollection from '../../../src/DOM/poeCollection.js'
import exercises from '../../../src/controllers/exercises.js'
import config from '../../../src/utils/config.js'
import poe from '../../../src/controllers/poe.js'
import mock from '../../mock_data.js'
import poeMotionAnalysis from '../../../src/utils/poeMotionAnalysis.js'

beforeAll(function () {
    this.physiotherapist = mock.physiotherapist
    this.patient = mock.patient
    this.exercises = mock.exercises
    this.poe = mock.poe
})

describe('getPOEEvaluation access:', function () {

    it('get evaluation requires authentication', async function () {
        spyOn(poeCollection, 'getEvaluationFromID')
        await poe.getPOEEvaluation({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(poeCollection.getEvaluationFromID).not.toHaveBeenCalled()
            }
        })
    })
    it('get evaluation requires params exercise id', async function () {
        spyOn(poeCollection, 'getEvaluationFromID')
        await poe.getPOEEvaluation({
            user: this.physiotherapist,
            params: {}
        }, {
            sendStatus(status) {
                expect(status).toBe(400)
                expect(poeCollection.getEvaluationFromID).not.toHaveBeenCalled()
            }
        })
    })
    it('generic error on get poe from exercise', async function () {
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'getEvaluationFromID').and.returnValue(undefined)
        await poe.getPOEEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(poeCollection.getEvaluationFromID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('try to get poe results but video is processing', async function () {
        let exercise = this.exercises[0], physiotherapist = this.physiotherapist, patient = this.patient
        spyOn(poeCollection, 'getEvaluationFromID').and.returnValue(undefined)
        spyOn(exercisesCollection, 'getOneExerciseByEmail').and.returnValue({ patientID: patient.id , ...exercise})
        spyOn(poeMotionAnalysis, 'isEvaluationOngoing').and.returnValue(true)
        await poe.getPOEEvaluation({
            user: physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(204)
                expect(poeCollection.getEvaluationFromID).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.getOneExerciseByEmail).toHaveBeenCalledWith(exercise.id, physiotherapist.email)
                expect(poeMotionAnalysis.isEvaluationOngoing).toHaveBeenCalledWith(patient.id)
            }
        })
    })
    it('get latest poe results after video is done processing', async function () {
        let exercise = this.exercises[0], physiotherapist = this.physiotherapist, patient = this.patient
        spyOn(poeCollection, 'getEvaluationFromID').and.returnValue(undefined)
        spyOn(exercisesCollection, 'getOneExerciseByEmail').and.returnValue({ patientID: patient.id , ...exercise})
        spyOn(poeMotionAnalysis, 'isEvaluationOngoing').and.returnValue(false)
        spyOn(poeMotionAnalysis, 'getLatestPOEAnalysis').and.returnValue([{ score: 1 }, { score: 0 }, { score: 2 }, this.poe])
        spyOn(poeCollection, 'updateEvaluationResults').and.returnValue(this.poe)
        await poe.getPOEEvaluation({
            user: physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(poeCollection.getEvaluationFromID).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.getOneExerciseByEmail).toHaveBeenCalledWith(exercise.id, physiotherapist.email)
                expect(poeMotionAnalysis.isEvaluationOngoing).toHaveBeenCalledWith(patient.id)
                expect(poeMotionAnalysis.getLatestPOEAnalysis).toHaveBeenCalled()
                expect(poeCollection.updateEvaluationResults).toHaveBeenCalled()
            }
        })
    })
    it('admin can get poe from exercise', async function () {
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'getEvaluationFromID').and.returnValue(this.poe)
        await poe.getPOEEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(poeCollection.getEvaluationFromID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('physiotherapist can get poe from exercise', async function () {
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'getEvaluationFromID').and.returnValue(this.poe)
        await poe.getPOEEvaluation({
            user: this.physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(poeCollection.getEvaluationFromID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
})

xdescribe('sendVideoForPOEEvaluation access:', function () {

    it('send evaluation requires authentication', async function () {
        spyOn(poeMotionAnalysis, 'uploadVideo')
        await poe.sendVideoForPOEEvaluation({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(poeMotionAnalysis.uploadVideo).not.toHaveBeenCalled()
            }
        })
    })
    it('cant send evaluation of non existing exercise', async function () {
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(undefined)
        spyOn(poeMotionAnalysis, 'uploadVideo')
        await poe.sendVideoForPOEEvaluation({
            user: this.physiotherapist,
            params: { exerciseID: 0 }
        }, {
            status(status) {
                expect(status).toBe(404)
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(0)
                return this
            }, 
            send(data) {
                expect(data).toContain('Exercise does not exist')
                expect(poeMotionAnalysis.uploadVideo).not.toHaveBeenCalled()
            }
        })
    })
    it('cant send evaluation if no video exist', async function () {
        let exercise = this.exercises[0]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        spyOn(poeMotionAnalysis, 'uploadVideo')
        await poe.sendVideoForPOEEvaluation({
            user: this.physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            status(status) {
                expect(status).toBe(400)
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
                return this
            }, 
            send(data) {
                expect(data).toContain('Video does not exist')
                expect(poeMotionAnalysis.uploadVideo).not.toHaveBeenCalled()
            }
        })
    })
    it('generic error on send evaluation', async function () {
        let exercise = this.exercises[0]
        spyOn(poeMotionAnalysis, 'uploadVideo')
        await poe.sendVideoForPOEEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(poeMotionAnalysis.uploadVideo).not.toHaveBeenCalled()
            }
        })
    })
    it('admin can send evaluation', async function () {
        let exercise = this.exercises[1], patient = this.patient
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue({ patientID: patient.id, ...exercise })
        spyOn(poeMotionAnalysis, 'uploadVideo').and.returnValue(true)
        await poe.sendVideoForPOEEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(200)
                expect(poeMotionAnalysis.uploadVideo).toHaveBeenCalledWith(patient.id, exercise.videoFile, exercise.type)
            }
        })
    })
    it('physiotherapist can send evaluation', async function () {
        let exercise = this.exercises[1], patient = this.patient
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue({ patientID: patient.id, ...exercise })
        spyOn(poeMotionAnalysis, 'uploadVideo').and.returnValue(true)
        await poe.sendVideoForPOEEvaluation({
            user: this.physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(200)
                expect(poeMotionAnalysis.uploadVideo).toHaveBeenCalledWith(patient.id, exercise.videoFile, exercise.type)
            }
        })
    })
})