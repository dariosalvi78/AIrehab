<template>
    <q-dialog ref="qDialog">
        <q-card class="q-pl-mx" style="min-width: 350px">
            <q-card-section>
                <div class="text-h6">{{mode == 'new' || mode == 'adminNew' ? $t('patient.add') : $t('patient.edit') }}</div>
            </q-card-section>
            <q-card-section v-if="mode == 'adminEdit'">
                <div class="text-body2">
                    <q-icon style="bottom: 2px" size="sm" name="person"/>
                    {{  $t('patient.form.admin.assigned_to', { email: user.physiotherapistEmail }) }}
                </div>
                <div class="text-body2">
                    <q-icon style="bottom: 2px" size="sm" name="calendar_month"/>
                    {{ $t('patient.form.admin.created', { created: formatDate(user.createdTimestamp) }) }}
                </div>
            </q-card-section>
            <q-form class="q-px-sm">
                <div class="q-pt-md" v-if="mode == 'new'">
                    <div class="q-px-sm text-body2">{{ $t('patient.form.type') }}</div>
                    <q-list v-for="item in [
                            { type: 'real', name: $t('patient.form.real'), desc: $t('patient.form.real_desc') }, 
                            { type: 'mock', name: $t('patient.form.test'), desc: $t('patient.form.test_desc') }
                        ]" :key="item.type">
                        <q-item tag="label" v-ripple>
                            <q-item-section avatar>
                                <q-radio v-model="this.testPatient" :type="item.type" :val="item.type == 'mock' ? true : false" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{item.name}}</q-item-label>
                                <q-item-label caption>
                                   {{item.desc}}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
                <q-tab-panels v-model="this.testPatient" animated>
                    <q-tab-panel :name="true" class="q-pa-sm">
                        <div class="q-py-sm text-body2" v-html="$t('patient.form.test_patient_desc')" />
                    </q-tab-panel>
                    <q-tab-panel :name="false" class="q-pa-none">
                        <q-input
                            v-if="mode == 'adminNew'"
                            filled
                            v-model="this.physiotherapistEmail"
                            :label="$t('patient.form.admin.email')"
                            type="email"
                            :hint="!user.physiotherapistEmail ? 'e.g. user@email.com' : $t('patient.form.admin.email_hint')"
                            :readonly="!!user.physiotherapistEmail"
                        />
                        <q-input
                            ref="qName"
                            class="q-my-md"
                            filled
                            v-model="this.new.fullName"
                            :label="$t('patient.form.name')"
                            type="text"
                            :hint="$t('patient.form.name_hint')"
                            :rules="patterns.name"
                        />
                        <q-input
                            ref="qDate"
                            class="q-my-md"            
                            filled
                            v-model="this.new.dateOfBirth"
                            :label="$t('patient.form.date')"
                            mask="####-##-##"
                            :hint="$t('patient.form.date_hint') + ' - yyyy-mm-dd'"
                            :rules="patterns.dob"
                        >
                        <template v-slot:append>
                            <q-icon name="event" style="cursor:pointer;">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                                <q-date 
                                mask="YYYY-MM-DD"
                                v-model="this.new.dateOfBirth" 
                                @update:model="() => qDateProxy.hide()" 
                                today-btn
                                :options="dateRestrictions"
                                >
                                <template v-slot>
                                    <div class="row items-center justify-end q-gutter-sm">
                                        <q-btn :label="$t('common.confirm')" color="primary" size="sm" v-close-popup />
                                    </div>
                                </template>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                        </q-input>
                        <q-input
                            ref="qHeight"
                            class="q-my-md"            
                            filled
                            v-model="this.new.height"
                            :label="$t('patient.form.height') + ' (cm)'"
                            type="number"
                            :hint="$t('patient.form.height_hint')"
                            :rules="patterns.measurements('height')"
                        />
                        <q-input
                            ref="qWeight"
                            class="q-my-md"            
                            filled
                            v-model="this.new.weight"
                            :label="$t('patient.form.weight') + ' (kg)'"
                            type="number"
                            :hint="$t('patient.form.weight_hint')"
                            :rules="patterns.measurements('weight')"
                        />
                        <q-input
                            class="q-my-md"
                            filled
                            v-model="this.new.injuries"
                            :label="$t('patient.profile.notes')"
                            type="textarea"
                            :hint="$t('patient.form.notes_hint')"
                            :rules="patterns.notes"
                        />
                        <q-toggle class="text-body2" v-model="hasInjury" :label="!hasInjury ? $t('patient.form.no_injuries') : $t('patient.form.injuries') " />
                        <div class="q-my-md q-gutter-sm" v-if="hasInjury">
                            <div class="q-px-sm text-body2">{{ $t('patient.form.injured_side') }}</div>
                            <q-radio v-for="side in this.sides" :key="side" v-model="this.new.injuredSide" :val="side" :label="$t(`patient.injuries.${side}`)" />
                        </div>
                        <q-select
                            v-if="hasInjury"
                            class="q-my-md"
                            filled
                            clearable
                            behavior="menu"
                            emit-value
                            map-options
                            v-model="this.new.injuredBodyPart"
                            :options="this.bodyParts"
                            :label="$t('patient.form.injured_part')"
                            :hint="$t('patient.form.injured_part_hint')"
                        />
                    </q-tab-panel>
                </q-tab-panels>
            </q-form>
            <q-card-actions align="right" class="text-primary" v-if="!this.testPatient">
                <q-btn flat :label="$t('common.cancel')" v-close-popup />
                <q-btn 
                    :label="$t('common.confirm')" 
                    type="submit" 
                    color="primary" 
                    class="q-ml-sm" 
                    @click="formSubmit()"
                />
            </q-card-actions>
            <q-card-actions align="center" v-else>
                <q-select
                    ref="qInputExerciseType"
                    class="q-mb-lg full-width"
                    filled
                    clearable
                    behavior="menu"
                    emit-value
                    map-options
                    v-model="this.testExercise.selected"
                    :options="this.testExercise.types"
                    :label="$t('exercises.form.type')"
                    :hint="$t('exercises.form.type_hint')"
                    :rules="patterns.exerciseType"
                />
                <q-btn 
                    class="prompts"
                    :label="$t('common.go_to_exercise')" 
                    type="submit" 
                    color="secondary" 
                    @click="formSubmitMockPatient()"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import patientEnums from '../../utils/types/patientTypesEnum'
import exerciseEnums from '../../utils/types/exerciseTypesEnum.js'
import nicers from '../../utils/nicers'

export default {
    name: 'PatientEditForm',
    props: { formMode: String, user: Object },
    emits: ['addNewPatient', 'editPatient'],
    data () {
        return {
            patterns: {
                name: [injuries => !injuries ? true : injuries.length <= 25 || this.$t('patient.form.name_error')],
                dob: [(date) => this.dateRestrictions(date) || this.$t('patient.form.date_error')],
                measurements: (type) => [m => !m ? true : m <= 200 && m >= 0 || this.$t(`patient.form.${type}_error`)],
                notes: [injuries => !injuries ? true : injuries.length <= 150 || this.$t('exercises.form.notes_error')],
                exerciseType: [type => !!type  || this.$t('exercises.form.type_error')]
            },
            new: {
                fullName: undefined,
                dateOfBirth: undefined,
                height: undefined,
                weight: undefined,
                injuries: undefined,
                injuredSide: undefined,
                injuredBodyPart: undefined,
            },
            physiotherapistEmail: undefined,
            mode: 'new',
            hasInjury: false,
            bodyParts: [],
            sides: [],
            testExercise: { selected: undefined, types: [] },
            testPatient: false
        }
    },
    async mounted () {
        this.resetForm()
        patientEnums.types.patient.map((type, i) => this.bodyParts[i] = { value: type, label: this.$i18n.t(`patient.injuries.${type}`) })
        patientEnums.types.sides.map((type, i) => this.sides[i] = type)
        if (this.formMode == 'edit' ) await this.populateEdit()
    },
    watch: {
        async user () {
            await this.populateEdit()
        },
        testPatient (testSelected) {
            if (testSelected) for (const e in exerciseEnums.types.exercise) { 
                this.testExercise.types[e] = { value: exerciseEnums.types.exercise[e], label: this.$i18n.t(`exercises.form.types.${exerciseEnums.types.exercise[e]}`) }
            }
        }
    },
    methods: {
        formSubmit () {
            let refs = Object.keys(this.$refs), formError = false
            for (const r of refs) {
                let refInput = this.$refs[r]
                if (refInput.hasError) {
                    refInput.validate()
                    return this.$q.notify({
                        color: 'negative',
                        position: 'top',
                        message: this.$t('common.notification.error'),
                        icon: 'report_problem'
                    })
                }
            }
            let userSubmitted = {
                fullName: this.new.fullName,
                dateOfBirth: this.new.dateOfBirth, 
                height: this.new.height ? +this.new.height : null,
                weight: this.new.weight ? +this.new.weight : null,
                injuries: this.new.injuries ? this.new.injuries : '',
                injuredSide: '',
                injuredBodyPart: '',
            }
            if (this.hasInjury) {
                userSubmitted.injuredSide = this.new.injuredSide ? this.new.injuredSide : '',
                userSubmitted.injuredBodyPart = this.new.injuredBodyPart ? this.new.injuredBodyPart : ''
            }
            if (this.mode == 'adminNew') userSubmitted.physiotherapistEmail = this.physiotherapistEmail
            if (this.mode === 'new' || this.mode == 'adminNew') this.$emit('addNewPatient', userSubmitted)
            else if (this.mode === 'edit' || this.mode === 'adminEdit') this.$emit('editPatient', userSubmitted)
            this.$refs.qDialog.hide()
            this.resetForm()
            return
        },
        formSubmitMockPatient () {
            this.$refs.qInputExerciseType.validate()
             if (this.$refs.qInputExerciseType.hasError) {
                return this.$q.notify({
                    color: 'negative',
                    position: 'top',
                    message: this.$t('common.notification.error'),
                    icon: 'report_problem'
                })
            }
            let userSubmitted = {
                fullName: 'test_patient',
                dateOfBirth: new Date().toISOString(),
                height: null,
                weight: null,
                injuries: '',
                injuredSide: '',
                injuredBodyPart: this.testExercise.selected,
                isTestPatient: this.testPatient
            }
            this.$emit('addNewPatient', userSubmitted)
            this.$refs.qDialog.hide()
            this.resetForm()
            return
        },
        populateEdit () {
            this.mode = this.formMode
            if (this.mode == 'edit' || this.mode == 'adminEdit' && this.user) {
                this.new.fullName = this.mode == 'edit' ? this.user.names : this.user.email
                this.new.dateOfBirth = new Date(this.user.dateofbirth).toLocaleDateString()
                this.new.height = +this.user.height
                this.new.weight = +this.user.weight
                this.new.injuries = this.user.injuries
                this.testPatient = false
                if (this.user.injuredBodyPart || this.user.injuredSide) {
                    this.hasInjury = true
                    this.new.injuredBodyPart = this.user.injuredBodyPart
                    this.new.injuredSide = this.user.injuredSide
                }
            }
            else if (this.mode == 'adminNew' && this.user) {
                this.new = {}
                this.physiotherapistEmail = this.user.physiotherapistEmail
            }
        },
        formatDate (date) {
            return nicers.formattedDate(date)
        },
        resetForm () {
            this.mode = 'new'
            this.physiotherapistEmail = undefined
            this.new = {}
            this.testPatient = false
        },
        dateRestrictions (qDate) {
            return nicers.formDatetimeValidation(qDate, 'patient')
        }
    }
}
</script>

<style scoped>

</style>