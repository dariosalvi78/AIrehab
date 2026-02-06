<template>
    <q-card v-if="!loading" lass="q-pl-mx q-ma-md" flat>
        <q-card-section v-if="role == 'admin'" >
            <div class="text-h6">{{ $t('admin.dialog.new_user.header') }}</div>
            <div class="text-body2" v-html="$t('admin.dialog.new_user.description')"></div>
        </q-card-section>
        <q-card-section v-else>
            <div class="text-h6">{{ $t('common.new_user.header') }}</div>
            <div class="text-body2" v-html="$t('common.new_user.description')"></div>
        </q-card-section>
        <q-form v-if="role == 'admin'" class="q-px-md">
            <q-input
                ref="qEmail"
                class="q-my-lg"
                v-model="email"
                :label="$t('common.new_user.form.email')"
                type="email"
                :hint="$t('common.new_user.form.email_hint')"
                :rules="patterns.email"
                :lazy-rules="true"
            />
        </q-form>
        <q-form v-if="role !== 'admin'" class="q-px-md">
            <q-input
                ref="qPass"
                class="q-my-lg"
                filled
                v-model="password"
                :label="$t('common.new_user.form.password')"
                type="password"
                :hint="$t('common.new_user.form.password_hint', { feedback: getPwdFeedback })"
                :rules="patterns.password"
                :lazy-rules="true"
            />
            <q-input
                ref="qConfirmPass"
                class="q-my-lg"
                filled
                v-model="passwordConfirm"
                :label="$t('common.new_user.form.password_confirm')"
                type="password"
                :hint="$t('common.new_user.form.password_confirm_hint')"
                :rules="patterns.passwordConfirm"
                :lazy-rules="true"
            />
        </q-form>
        <q-card-actions v-if="role == 'admin'" align="right" class="q-px-lg text-primary">
            <q-btn flat :label="$t('common.cancel')" no-caps v-close-popup />
            <q-btn :label="$t('common.send')" no-caps type="submit" color="primary" class="q-ml-sm" @click="formSubmit"/>
        </q-card-actions>
        <q-card-actions v-else align="center" class="text-primary full-width">
            <q-btn :label="$t('common.new_user.create')" no-caps type="submit" color="secondary" size="16px" class="full-width" @click="formSubmit"/>
        </q-card-actions>
    </q-card>
</template>

<script>
import API from 'src/API.js';
import pwd from '../../utils/passwordValidation.js'
import store from 'src/utils/storage.js';
import { patterns } from 'quasar'

export default {
    name: 'NewUserForm',
    props: { user: Object },
    emits: ['sendInvitation'],
    data () {
        return {
            email: undefined,
            password: undefined,
            passwordConfirm: undefined,
            patterns: {
                email: [(val) => patterns.testPattern.email(val) || this.$t('common.new_user.form.email_error')],
                password: [() => !this.getPwdStrength || this.getPwdStrength],
                passwordConfirm: [(pwd) => pwd === this.password || this.$t('common.new_user.form.password_confirm_error')]
            },
            loading: true
        }
    },
    beforeMount () {
        if (this.user) {
            this.email = this.user.email
            this.role = this.user.role
        }
        this.loading = !this.loading
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
        async formSubmit (e) {
            e.preventDefault()
            let refs = Object.keys(this.$refs), formError = false
            for (const r in refs) {
                let refInput = this.$refs[refs[r]]
                refInput.validate()
                if (refInput.hasError) formError = true
            }
            if (formError) {
                return this.$q.notify({
                    color: 'negative',
                    position: 'top',
                    message: this.$t('common.notification.error'),
                    icon: 'report_problem'
                })
            }
            if (this.role == 'admin') return this.$emit('sendInvitation', { email: this.email })
            else await this.addNewUser()
        },
        async addNewUser() {
            try {
                const user = {
                    role: 'physiotherapist',
                    email: this.email,
                    password: this.password,
                    token: this.user.token
                }
                const response = await API.addUser(user.role, user.email, user.password, user.token)
                if (response) {
                    this.$q.notify({
                        type: 'positive',
                        color: 'positive',
                        position: 'top',
                        message: this.$t('common.notification.account_created')
                    })
                    store.setItem('isLoggedIn', true)
                    return this.$router.push('/home/consent')
                }
            } catch (err) {
                return this.$q.notify({
                    color: 'negative',
                    position: 'top',
                    message: err.response.status === 410
                        ? this.$t('common.notification.invitation_expired')
                        : this.$t('common.notification.account_error', { error: err }),
                    icon: 'report_problem'
                })
            }
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