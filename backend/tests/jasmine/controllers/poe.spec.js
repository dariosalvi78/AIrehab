import sessions from '../../../src/DOM/physiotherapySessionCollection.js'
import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import poeCollection from '../../../src/DOM/poeCollection.js'
import exercises from '../../../src/controllers/exercises.js'
import poe from '../../../src/controllers/poe.js'
import mock from '../../mock_data.js'
import poeMotionAnalysis from '../../../src/utils/poeMotionAnalysis.js'
import fileHandler from '../../../src/utils/fileHandler.js'
import scheduler from '../../../src/utils/scheduler.js'

beforeAll(function () {
    this.physiotherapist = mock.physiotherapist
    this.patient = mock.patient
    this.exercises = JSON.parse(JSON.stringify(mock.exercises))
    this.poe = mock.poe
    this.poe_results = mock.poe_results
})

describe('getPOEEvaluation access:', function () {

    it('get evaluation requires authentication', async function () {
        spyOn(poeCollection, 'getEvaluationsFromID')
        await poe.getPOEEvaluation({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(poeCollection.getEvaluationsFromID).not.toHaveBeenCalled()
            }
        })
    })
    it('get evaluation requires params exercise id', async function () {
        spyOn(poeCollection, 'getEvaluationsFromID')
        await poe.getPOEEvaluation({
            user: this.physiotherapist,
            params: {}
        }, {
            sendStatus(status) {
                expect(status).toBe(400)
                expect(poeCollection.getEvaluationsFromID).not.toHaveBeenCalled()
            }
        })
    })
    it('generic error on get poe from exercise', async function () {
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'getEvaluationsFromID').and.returnValue(undefined)
        await poe.getPOEEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(poeCollection.getEvaluationsFromID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('try to get poe results but video is processing', async function () {
        let exercise = this.exercises[1], physiotherapist = this.physiotherapist, patient = this.patient
        spyOn(poeCollection, 'getEvaluationsFromID').and.returnValue([])
        spyOn(exercisesCollection, 'getOneExerciseByEmail').and.returnValue({ patientID: patient.id, ...exercise })
        spyOn(poeMotionAnalysis, 'isEvaluationOngoing').and.returnValue({ status: 200 })
        await poe.getPOEEvaluation({
            user: physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(200)
                expect(poeCollection.getEvaluationsFromID).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.getOneExerciseByEmail).toHaveBeenCalledWith(exercise.id, physiotherapist.email)
                expect(poeMotionAnalysis.isEvaluationOngoing).toHaveBeenCalledWith(exercise.physiotherapySessionId, exercise.id, exercise.videoFile)
            }
        })
    })
    it('get latest poe results after video is done processing', async function () {
        let exercise = this.exercises[1], physiotherapist = this.physiotherapist, patient = this.patient, results = this.poe_results
        spyOn(poeCollection, 'getEvaluationsFromID').and.returnValue([])
        spyOn(exercisesCollection, 'getOneExerciseByEmail').and.returnValue({ patientID: patient.id, ...exercise })
        spyOn(poeMotionAnalysis, 'isEvaluationOngoing').and.returnValue({ status: 201 })
        spyOn(fileHandler, 'getAnalysedVideo').and.returnValue(results)
        spyOn(poeCollection, 'updateEvaluationResults')
        await poe.getPOEEvaluation({
            user: physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(Array.isArray(data._results)).toEqual(true)
                for(const poe in data._results) {
                    expect(data._results[poe].posturalOrientation).toBeDefined()
                    expect(data._results[poe].repetition).toBeDefined()
                    expect(data._results[poe].score).toBeDefined()
                    expect(data._results[poe].scoreConfidence_0).toBeDefined()
                    expect(data._results[poe].scoreConfidence_1).toBeDefined()
                    expect(data._results[poe].scoreConfidence_2).toBeDefined()
                }
                expect(poeCollection.getEvaluationsFromID).toHaveBeenCalledWith(exercise.id)
                expect(exercisesCollection.getOneExerciseByEmail).toHaveBeenCalledWith(exercise.id, physiotherapist.email)
                expect(poeMotionAnalysis.isEvaluationOngoing).toHaveBeenCalledWith(exercise.physiotherapySessionId, exercise.id, exercise.videoFile)
                expect(poeCollection.updateEvaluationResults).toHaveBeenCalledTimes(Object.keys(results).length)
            }
        })
    })
    it('admin can get poe from exercise', async function () {
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'getEvaluationsFromID').and.returnValue([this.poe])
        await poe.getPOEEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(poeCollection.getEvaluationsFromID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('physiotherapist can get poe from exercise', async function () {
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'getEvaluationsFromID').and.returnValue([this.poe])
        await poe.getPOEEvaluation({
            user: this.physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(poeCollection.getEvaluationsFromID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
})

describe('sendVideoForPOEEvaluation access:', function () {

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
            params: { exerciseID: 0 }
        }, {
            status(status) {
                expect(status).toBe(500)
                expect(poeMotionAnalysis.uploadVideo).not.toHaveBeenCalled()
                return this
            },
            send(data) {
                expect(data).toBeDefined()
            }
        })
    })
    it('admin can send evaluation', async function () {
        let exercise = this.exercises[1], patient = this.patient
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue({ ...exercise })
        spyOn(poeMotionAnalysis, 'uploadVideo').and.returnValue(true)
        spyOn(scheduler, 'startPOEEvaluationTask').and.returnValue(true)
        await poe.sendVideoForPOEEvaluation({
            body: { metaInfo: true },
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(200)
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
                expect(poeMotionAnalysis.uploadVideo).toHaveBeenCalledWith(exercise.id, exercise.physiotherapySessionId, exercise.videoFile, exercise.type)
                expect(scheduler.startPOEEvaluationTask).toHaveBeenCalled()
            }
        })
    })
    it('physiotherapist can send evaluation', async function () {
        let exercise = this.exercises[1], patient = this.patient
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue({ ...exercise })
        spyOn(poeMotionAnalysis, 'uploadVideo').and.returnValue(true)
        spyOn(scheduler, 'startPOEEvaluationTask').and.returnValue(true)
        await poe.sendVideoForPOEEvaluation({
            body: { metaInfo: true },
            user: this.physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(200)
                expect(exercisesCollection.getExerciseByID).toHaveBeenCalledWith(exercise.id)
                expect(poeMotionAnalysis.uploadVideo).toHaveBeenCalledWith(exercise.id, exercise.physiotherapySessionId, exercise.videoFile, exercise.type)
                expect(scheduler.startPOEEvaluationTask).toHaveBeenCalled()
            }
        })
    })
})