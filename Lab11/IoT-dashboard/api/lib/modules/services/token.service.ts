import jwt from 'jsonwebtoken';
import TokenModel from '../schemas/token.schema';
import { config } from '../../config';

class TokenService {
    constructor() {
        this.startExpirationWatcher();
    }

    public async create(user: any) {
        const access = 'auth';
        const userData = {
            userId: user.id,
            name: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            access: access
        };

        const value = jwt.sign(userData, config.JwtSecret, { expiresIn: '30s' });
        const decoded: any = jwt.decode(value);
        const expiresAt = new Date(decoded.exp * 1000);

        try {
            const result = await new TokenModel({
                userId: user.id,
                type: 'authorization',
                value,
                createDate: Date.now(),
                expiresAt
            }).save();

            return result;
        } catch (error) {
            console.error('Błąd podczas tworzenia tokena:', error);
            throw new Error('Błąd przy tworzeniu tokena');
        }
    }

    public getToken(token: any) {
        return { token: token.value };
    }

    public async remove(userId: string) {
        try {
            const result = await TokenModel.deleteOne({ userId });

            if (result.deletedCount === 0) {
                throw new Error('Nie znaleziono tokenu do usunięcia');
            }
            return result;
        } catch (error) {
            console.error('Błąd podczas usuwania tokena:', error);
            throw new Error('Błąd przy usuwaniu tokena');
        }
    }

    public async removeExpiredTokens() {
        const now = new Date();
        try {
            const result = await TokenModel.deleteMany({ expiresAt: { $lt: now } });
            console.log(`[TokenService] Usunięto ${result.deletedCount} przeterminowanych tokenów`);
            return result;
        } catch (error) {
            console.error('Błąd przy czyszczeniu tokenów:', error.message);
            throw new Error('Błąd przy czyszczeniu tokenów');
        }
    }

    private startExpirationWatcher() {
        setInterval(async () => {
            try {
                await this.removeExpiredTokens();
            } catch (e: any) {
                console.error('[TokenService] Błąd czyszczenia tokenów:', e.message);
            }
        }, 1000 * 60 * 60);
        console.log('[TokenService] Watcher do czyszczenia tokenów uruchomiony (co godzinę)');
    }
}

export default TokenService;