
export const loadConfig = () => {
    return {
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
        }
    }
}