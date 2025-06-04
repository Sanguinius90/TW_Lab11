import express from 'express';
import { config } from './config';
import Controller from "./interfaces/controller.interface";
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';


class App {
    public app: express.Application;
    private io: SocketIOServer;
    private server: HTTPServer;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.connectToDatabase();
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: '*',
            },
        });
    }

    private initializeMiddlewares(): void {
        this.app.use(express.json());
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private async connectToDatabase(): Promise<void> {
        try {
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }

    public getIo(): SocketIOServer {
        return this.io;
    }

}
export default App;