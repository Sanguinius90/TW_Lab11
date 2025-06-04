export const config = {
    port: process.env.PORT || 3100,
    supportedDevicesNum: 17,
    JwtSecret: "secret",
    databaseUrl: process.env.MONGODB_URI || ''
};
