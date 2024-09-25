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
                hint="e.g. user@email.com"
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
                class="q-my-md"            
                filled
                v-model="this.new.height"
                label="Height (cm)"
                type="number"
                hint="Optional. Patient height"
            />
            <q-input
                class="q-my-md"            
                filled
                v-model="this.new.weight"
                label="Weight (kg)"
                type="number"
                hint="Optional. Patient weight"
            />
            <q-input
                class="q-my-md"            
                filled
                v-model="this.new.injuries"
                label="Notes"
                type="textarea"
                hint="Optional. List of injuries"
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
import nicers from '../../utils/nicers'

export default {
    name: 'PatientEditForm',
    props: { formMode: String, user: Object },
    data () {
        return {
            new: {
                fullName: undefined,
                dateOfBirth: undefined,
                height: undefined,
                weight: undefined,
                injuries: undefined
            },
            physiotherapistEmail: undefined,
            mode: 'new'
        }
    },
    async mounted () {
        this.resetForm()
        if (this.formMode == 'edit' ) await this.populateEdit()
    },
    watch: {
        async user () {
            await this.populateEdit()
        }
    },
    methods: {
        formSubmit () {
            if (this.$refs.qDate.hasError) {
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
                height: +this.new.height,
                weight: +this.new.weight,
                injuries: this.new.injuries
            }
            if (this.mode == 'adminNew') userSubmitted.physiotherapistEmail = this.physiotherapistEmail
            if (this.mode === 'new' || this.mode == 'adminNew') this.$emit('addNewUser', userSubmitted)
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
                this.new.height = this.user.height
                this.new.weight = this.user.weight
                this.new.injuries = this.user.injuries
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