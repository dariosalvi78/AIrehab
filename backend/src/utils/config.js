
const config = {
    db: {
        host: process.env.DB_HOSTNAME,
        port: process.env.PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    },
    environment: process.env.ENVIRONMENT,
    admin: {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
    },
    JWT: {
        SECRET_KEY: process.env.JWT_SECRET_KEY,
        EXPIRE: process.env.JWT_EXPIRE
    },
    log: {
        path: process.env.LOG_PATH
    },
    uploads: {
        base_path: process.env.BASE_PATH_UPLOADS
    },
    mailer: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        from_address: process.env.MAIL_SENDER
    },
    poe: {
        base_url: process.env.POE_BASE_URL,
        port: process.env.POE_PORT
    }
}

export default config