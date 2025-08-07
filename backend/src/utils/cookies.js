'use strict'

const cookies = {
  session: {
    name: '__Host-session.id',
    options: {
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      path: '/'
    }
  },
  patient: {
    name: '__Host-patient.id',
    options: {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      path: '/'
    }
  }
}

export default cookies