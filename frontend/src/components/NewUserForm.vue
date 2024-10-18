<template>
    <q-dialog ref="qDialog">
        <q-card class="q-pl-mx" style="min-width: 350px">
            <q-card-section>
                <div class="text-h6">New Physiotherapist</div>
                <div class="text-body2">Account details will be sent to the specified email</div>
            </q-card-section>
            <q-form class="q-px-lg">
                <q-input
                    class="q-my-lg"            
                    filled
                    v-model="this.email"
                    label="Email"
                    type="email"
                    hint="e.g. user@email.com"
                />
                <q-input
                    ref="qPass"
                    class="q-my-lg"            
                    filled
                    v-model="this.password"
                    label="Password"
                    type="password"
                    :hint="'Password for physiotherapist ' + getPwdFeedback"
                    :rules="[(pwd) => !getPwdStrength || getPwdStrength]"
                />
                <q-input
                    ref="qConfirmPass"
                    class="q-my-lg"            
                    filled
                    v-model="this.passwordConfirm"
                    label="Confirm password"
                    type="password"
                    hint="Must be the same password"
                    :rules="[(pwd) => pwd === this.password || 'Please enter the same password']"
                />
                <!-- <q-option-group
                    :options="optionsRadio"
                    type="radio"
                    v-model="this.new.role"
                /> -->
            </q-form>
            <q-card-actions align="right" class="q-px-lg text-primary">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn label="Submit" type="submit" color="primary" class="q-ml-sm" @click="formSubmit"/>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import pwd from '../utils/passwordValidation.js'

export default {
    name: 'NewUserForm',
    props: { role: String },
    emits: ['newUser'],
    data () {
        return {
            email: undefined,
            password: undefined,
            passwordConfirm: undefined
        }
    },
    updated () {
        this.resetForm()
    },
    computed: {
        getPwdStrength () {
            return pwd.checkPwdStrength(this.password)
        },
        getPwdFeedback () {
            return pwd.getPwdFeedback(this.password)
        }
    },
    methods: {
        async formSubmit () {
            this.$refs.qPass.validate()
            this.$refs.qConfirmPass.validate()
            if (this.$refs.qPass.hasError || this.$refs.qConfirmPass.hasError) {
                return this.$q.notify({
                    color: 'negative',
                    position: 'top',
                    message: 'Please review fields and try again',
                    icon: 'report_problem'
                })
            }
            const newUser = {
                role: this.role,
                email: this.email,
                password: this.password
            }
            this.$emit('newUser', newUser)
            this.$refs.qDialog.hide()
        },
        resetForm () {
            this.email = undefined
            this.password = undefined
            this.passwordConfirm = undefined
        }
    }
}
</script>

<style scoped>

</style>