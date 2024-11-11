
const config = {
    db: {
        host: process.env.DB_HOSTNAME,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    },
    server: {
        port: process.env.SERVER_PORT,
    },
    environment: process.env.ENVIRONMENT,
    domain: process.env.DOMAIN_NAME,
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
        from_address: process.env.MAIL_SENDER,
        smtp_user: process.env.MAIL_USER,
        smtp_password: process.env.MAIL_PASSWORD
    },
    poe: {
        base_url: process.env.POE_BASE_URL,
        port: process.env.POE_PORT
    },
    certs: {
        key: process.env.CERT_PRIVATE_KEY,
        chain_file: process.env.CERT_CHAIN
    }
}

export default config