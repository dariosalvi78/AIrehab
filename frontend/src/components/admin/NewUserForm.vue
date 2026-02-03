<template>
    <q-dialog ref="qDialog">
        <q-card class="q-pl-mx q-ma-md">
            <q-card-section>
                <div class="text-h6">{{ $t('admin.dialog.new_user.header') }}</div>
                <div class="text-body2" v-html="$t('admin.dialog.new_user.description')"></div>
            </q-card-section>
            <q-form class="q-px-lg">
                <q-input
                    ref="qEmail"
                    class="q-my-lg"
                    filled
                    v-model="this.email"
                    :label="$t('admin.dialog.new_user.form.email')"
                    type="email"
                    hint="e.g. user@email.com"
                    :rules="patterns.email"
                    :lazy-rules="true"
                />
                <q-input
                    ref="qPass"
                    class="q-my-lg"
                    filled
                    v-model="this.password"
                    :label="$t('admin.dialog.new_user.form.password')"
                    type="password"
                    :hint="$t('admin.dialog.new_user.form.password_hint', { feedback: getPwdFeedback })"
                    :rules="patterns.password"
                />
                <q-input
                    ref="qConfirmPass"
                    class="q-my-lg"
                    filled
                    v-model="this.passwordConfirm"
                    :label="$t('admin.dialog.new_user.form.password_confirm')"
                    type="password"
                    :hint="$t('admin.dialog.new_user.form.password_confirm_hint')"
                    :rules="patterns.passwordConfirm"
                />
            </q-form>
            <q-card-actions align="right" class="q-px-lg text-primary">
                <q-btn flat :label="$t('common.cancel')" no-caps v-close-popup />
                <q-btn :label="$t('common.send')" no-caps type="submit" color="primary" class="q-ml-sm" @click="formSubmit"/>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import pwd from '../../utils/passwordValidation.js'
import { patterns } from 'quasar'
export default {
    name: 'NewUserForm',
    props: { role: String },
    emits: ['newUser'],
    data () {
        return {
            email: undefined,
            password: undefined,
            passwordConfirm: undefined,
            patterns: {
                email: [(val) => patterns.testPattern.email(val) || this.$t('admin.dialog.new_user.form.email_error')],
                password: [() => !this.getPwdStrength || this.getPwdStrength],
                passwordConfirm: [(pwd) => pwd === this.password || this.$t('admin.dialog.new_user.form.password_confirm_error')]
            }
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
            this.$refs.qEmail.validate()
            this.$refs.qPass.validate()
            this.$refs.qConfirmPass.validate()
            if (this.$refs.qEmail.hasError || this.$refs.qPass.hasError || this.$refs.qConfirmPass.hasError) {
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