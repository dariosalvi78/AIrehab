
const config = {
    db: {
        host: process.env.HOSTNAME,
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
    }
}

export default config