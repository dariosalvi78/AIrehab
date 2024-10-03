import exercisesCollection from '../../../src/DOM/exercisesCollection.js'
import poeCollection from '../../../src/DOM/poeCollection.js'
import poe from '../../../src/controllers/poe.js'

beforeAll(function () {
    this.physiotherapist = {
        id: 1,
        email: 'email@test.com',
        hashedPassword: 'password',
        role: 'physiotherapist',
        createdTimestamp: new Date().toISOString()
    }
    this.exercises = [
        { id: 1, type: 'test', notes: 'exercise 1...', videoFile: 'filename.mp4' },
        { id: 2, type: 'test2', notes: 'exercise 2...', videoFile: 'filename.mp4' }
    ]
    this.poe = {
        id: 1,
        exerciseId: this.exercises[0].id,
        patientId: 2,
        score: 0,
        posturalOrientation: 'kneeMedialToFootPosition'
    }
})

describe('getEvaluation access:', function () {

    it('get evaluation requires authentication', async function () {
        spyOn(poeCollection, 'getEvaluationFromID')
        await poe.getEvaluation({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(poeCollection.getEvaluationFromID).not.toHaveBeenCalled()
            }
        })
    })
    it('get evaluation requires params exercise id', async function () {
        spyOn(poeCollection, 'getEvaluationFromID')
        await poe.getEvaluation({
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
        await poe.getEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(poeCollection.getEvaluationFromID).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('admin can get poe from exercise', async function () {
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'getEvaluationFromID').and.returnValue(this.poe)
        await poe.getEvaluation({
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
        await poe.getEvaluation({
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

describe('sendEvaluation access:', function () {

    it('send evaluation requires authentication', async function () {
        spyOn(poeCollection, 'getEvaluationFromID')
        await poe.sendEvaluation({ user: undefined }, {
            sendStatus(status) {
                expect(status).toBe(403)
                expect(poeCollection.getEvaluationFromID).not.toHaveBeenCalled()
            }
        })
    })
    it('cant send evaluation of non existing exercise', async function () {
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(undefined)
        await poe.sendEvaluation({
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
            }
        })
    })
    it('cant send evaluation if no video exist', async function () {
        let exercise = this.exercises[0]
        delete exercise.videoFile
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        await poe.sendEvaluation({
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
            }
        })
    })
    it('generic error on send evaluation', async function () {
        let exercise = this.exercises[0]
        spyOn(poeCollection, 'getEvaluationFromID').and.returnValue(exercise)
        await poe.sendEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            sendStatus(status) {
                expect(status).toBe(500)
                expect(poeCollection.getEvaluationFromID).not.toHaveBeenCalled()
            }
        })
    })
    it('admin can send evaluation', async function () {
        let exercise = this.exercises[1]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        spyOn(poeCollection, 'updateEvaluationResults').and.returnValue(this.poe)
        await poe.sendEvaluation({
            user: { role: 'admin' },
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(poeCollection.updateEvaluationResults).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
    it('physiotherapist can send evaluation', async function () {
        let exercise = this.exercises[1]
        spyOn(exercisesCollection, 'getExerciseByID').and.returnValue(exercise)
        spyOn(poeCollection, 'updateEvaluationResults').and.returnValue(this.poe)
        await poe.sendEvaluation({
            user: this.physiotherapist,
            params: { exerciseID: exercise.id }
        }, {
            send(data) {
                expect(data).toBeDefined()
                expect(data).toBeInstanceOf(Object)
                expect(poeCollection.updateEvaluationResults).toHaveBeenCalledWith(exercise.id)
            }
        })
    })
})