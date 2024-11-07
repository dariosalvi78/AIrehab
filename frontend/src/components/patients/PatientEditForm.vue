<template>
    <q-dialog ref="qDialog">
        <q-card class="q-pl-mx" style="min-width: 350px">
            <q-card-section>
                <div class="text-h6">{{mode == 'new' || mode == 'adminNew' ? 'Add new patient' : 'Edit patient'}}</div>
                <!-- <div class="text-subtitle2">Send invitation to patient</div> -->
            </q-card-section>
            <q-card-section v-if="mode == 'adminEdit'">
                <div class="text-body2">
                    <q-icon style="bottom: 2px" size="sm" name="person"/>
                    {{ 'Assigned to: ' + user.physiotherapistEmail }}
                </div>
                <div class="text-body2">
                    <q-icon style="bottom: 2px" size="sm" name="calendar_month"/>
                    {{ 'Created: ' + formatDate(user.createdTimestamp) }}
                </div>
            </q-card-section>
            <q-form class="q-px-sm">
            <q-input
                v-if="mode == 'adminNew'"
                filled
                v-model="this.physiotherapistEmail"
                label="Physiotherapist email"
                type="email"
                :hint="!user.physiotherapistEmail ? 'e.g. user@email.com' : 'Assigned to physiotherapist'"
                :readonly="!!user.physiotherapistEmail"
            />
            <!-- <q-input
                filled
                v-model="this.new.email"
                label="Email"
                type="email"
                hint="e.g. user@email.com"
            /> -->
            <q-input
                class="q-my-md"            
                filled
                v-model="this.new.fullName"
                label="Full name"
                type="text"
                hint="Patient full name"
            />
            <q-input
              ref="qDate"
              class="q-my-md"            
              filled
              v-model="this.new.dateOfBirth"
              label="Date"
              mask="####-##-##"
              :rules="[(date) => dateRestrictions(date) || 'Please enter valid date']"
              hint="Date of birth - in yyyy-mm-dd"
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
                            <q-btn label="Confirm" color="primary" size="sm" v-close-popup />
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
                label="Height (cm)"
                type="number"
                hint="Optional. Patient height"
                :rules="[height => !height ? true : height <= 200 && height >= 0 || 'Enter valid height in cm']"
            />
            <q-input
                ref="qWeight"
                class="q-my-md"            
                filled
                v-model="this.new.weight"
                label="Weight (kg)"
                type="number"
                hint="Optional. Patient weight"
                :rules="[weight => !weight ? true : weight <= 200 && weight >= 0 || 'Enter valid weight in kg']"
            />
            <q-input
                class="q-my-md"            
                filled
                v-model="this.new.injuries"
                label="Notes"
                type="textarea"
                hint="Optional. Description / list of injuries"
                :rules="[injuries => !injuries ? true : injuries.length <= 150 || 'Limit reached']"
            />
            <q-toggle v-model="hasInjury" :label="!hasInjury ? 'Patient has no injuries' : 'Patient has injuries' " />
            <div class="q-my-md q-gutter-sm" v-if="hasInjury">
                <div class="q-px-sm">Side of the body that is injured</div>
                <q-radio v-model="this.new.injuredSide" val="left" label="Left" />
                <q-radio v-model="this.new.injuredSide" val="right" label="Right" />
            </div>
            <q-select
                v-if="hasInjury"
                class="q-my-md"
                filled
                clearable
                behavior="menu"
                v-model="this.new.injuredBodyPart"
                :options="this.bodyParts"
                label="Injured body part"
                hint="Part of the body that is injured"
            />
        </q-form>
        <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn 
                label="Submit" 
                type="submit" 
                color="primary" 
                class="q-ml-sm" 
                @click="formSubmit()"
            />
        </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import exerciseEnums from '../../utils/exerciseTypesEnum'
import nicers from '../../utils/nicers'

export default {
    name: 'PatientEditForm',
    props: { formMode: String, user: Object },
    emits: ['addNewPatient', 'editPatient'],
    data () {
        return {
            new: {
                fullName: undefined,
                dateOfBirth: undefined,
                height: undefined,
                weight: undefined,
                injuries: undefined,
                injuredSide: undefined,
                injuredBodyPart: undefined
            },
            physiotherapistEmail: undefined,
            mode: 'new',
            hasInjury: false,
            bodyParts: []
        }
    },
    async mounted () {
        this.resetForm()
        exerciseEnums.types.patient.map((type, i) => {
            this.bodyParts[i] = exerciseEnums.typeToAsc(type)
        })
        if (this.formMode == 'edit' ) await this.populateEdit()
    },
    watch: {
        async user () {
            await this.populateEdit()
        }
    },
    methods: {
        formSubmit () {
            this.$refs.qDate.validate()
            this.$refs.qWeight.validate()
            this.$refs.qHeight.validate()
            if (this.$refs.qDate.hasError || this.$refs.qWeight.hasError || this.$refs.qHeight.hasError) {
                return this.$q.notify({
                    color: 'negative',
                    position: 'top',
                    message: 'Please review fields and try again',
                    icon: 'report_problem'
                })
            }
            let userSubmitted = {
                fullName: this.new.fullName,
                dateOfBirth: this.new.dateOfBirth, 
                height: this.new.height ? +this.new.height : null,
                weight: this.new.weight ? +this.new.weight : null,
                injuries: this.new.injuries ? this.new.injuries : '',
                injuredSide: '',
                injuredBodyPart: ''
            }
            if (this.hasInjury) {
                userSubmitted.injuredSide = this.new.injuredSide ? this.new.injuredSide : '',
                userSubmitted.injuredBodyPart = this.new.injuredBodyPart ? exerciseEnums.typeToDesc(this.new.injuredBodyPart) : ''
            }
            if (this.mode == 'adminNew') userSubmitted.physiotherapistEmail = this.physiotherapistEmail
            if (this.mode === 'new' || this.mode == 'adminNew') this.$emit('addNewPatient', userSubmitted)
            else if (this.mode === 'edit' || this.mode === 'adminEdit') this.$emit('editPatient', userSubmitted)
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
                if (this.user.injuredBodyPart || this.user.injuredSide) {
                    this.hasInjury = true
                    this.new.injuredBodyPart = exerciseEnums.typeToAsc(this.user.injuredBodyPart)
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
        },
        dateRestrictions (qDate) {
            return nicers.formDatetimeValidation(qDate, 'patient')
        }
    }
}
</script>

<style scoped>

</style>