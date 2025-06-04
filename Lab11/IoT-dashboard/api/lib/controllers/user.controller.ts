import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import {auth} from '../middlewares/auth.middleware';
import {admin} from '../middlewares/admin.middleware';
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";
import {authorizeRoles} from "../middlewares/role.middleware";
import DataService from "../modules/services/data.service";

class UserController implements Controller {
    public path = '/api/user';
    public router = Router();
    private userService = new UserService();
    private passwordService = new PasswordService();
    private tokenService = new TokenService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/all` ,  authorizeRoles('admin'), this.getAllUsers);
        this.router.post(`${this.path}/create`, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, this.authenticate);
        this.router.post(`${this.path}/reset-password`, this.resetPassword);
        this.router.delete(`${this.path}/clean-expired`, authorizeRoles('admin'), this.cleanExpiredTokens);
        this.router.delete(`${this.path}/logout/:userId`,auth, this.removeHashSession);

    }

    private getAllUsers = async (request: Request, response: Response, next: NextFunction) => {
        const users = await this.userService.getAllUsers();
        response.status(200).json(users);
    };

    private authenticate = async (request: Request, response: Response, next: NextFunction) => {
        const { login, password } = request.body;

        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                return response.status(401).json({ error: 'Unauthorized' });
            }
            const isAuthorized = await this.passwordService.authorize(user._id, password);
            if (!isAuthorized) {
                return response.status(401).json({ error: 'Unauthorized' });
            }
            const token = await this.tokenService.create(user);
            response.status(200).json(this.tokenService.getToken(token));
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({ error: 'Unauthorized' });
        }
    };


    private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        console.log('userData', userData)
        try {
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password)
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword
                });
            }
            response.status(200).json(user);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({error: 'Bad request', value: error.message});
        }
    };

    private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
        const {userId} = request.params;
        try {
            const result = await this.tokenService.remove(userId);
            console.log('aaa', result)
            response.status(200).json(result);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({error: 'Unauthorized'});
        }
    };

    private resetPassword = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        const { login } = request.body;

        if (!login) {
            response.status(400).json({ error: 'Login (email or username) is required.' });
            return;
        }

        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                response.status(404).json({ error: 'User not found.' });
                return;
            }

            const newPassword = this.generatePassword(8); // np. "a1b2c3d4"
            const hashedPassword = await this.passwordService.hashPassword(newPassword);

            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword
            });

            console.log(`[RESET] Użytkownik: ${user.email} → nowe hasło: ${newPassword}`);

            response.status(200).json({
                message: 'Password has been reset and sent to the user (simulated).'
            });
        } catch (error: any) {
            console.error(`Password reset error: ${error.message}`);
            response.status(500).json({ error: 'Internal server error' });
        }
    };

    private generatePassword(length: number): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }


    private cleanExpiredTokens = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.tokenService.removeExpiredTokens();
            res.status(200).json({ message: 'Usunięto przeterminowane tokeny', count: result.deletedCount });
        } catch (error) {
            res.status(500).json({ error: 'Błąd przy czyszczeniu tokenów' });
        }
    };
}

export default UserController;