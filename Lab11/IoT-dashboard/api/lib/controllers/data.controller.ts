import Controller from '../interfaces/controller.interface';
import { Request, Response, Router, NextFunction } from 'express';
import { checkIdParam } from "../middlewares/deviceIdParam.middleware";
import DataService from "../modules/services/data.service";
import { config } from '../config';
import Joi from 'joi';

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    private readings: number[] = [4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6];

    constructor(private dataService: DataService) {
        this.initializeRoutes();
    }


    private initializeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`, checkIdParam, this.getAllDeviceData);
        this.router.get(`${this.path}/:id/latest`, checkIdParam, this.getLatestReadingById);
        this.router.get(`${this.path}/:id/:num`, checkIdParam, this.getReadingsRangeById);
        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);
        this.router.delete(`${this.path}/all`, this.deleteAllData);
        this.router.delete(`${this.path}/:id`, checkIdParam, this.deleteDataById);
    }

    private getLatestReadingsFromAllDevices = async (req: Request, res: Response) => {
        res.status(200).json(this.readings);
    }

    private getAllDeviceData = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const allData = await this.dataService.query(id);
        response.status(200).json(allData);
     };

    private getLatestReadingById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 0 || id >= this.readings.length) {
            return res.status(404).json({ message: 'Nie znaleziono odczytu o podanym ID' });
        }
        const max = Math.max(...this.readings);
        res.status(200).json({ maxValue: max });
    }

    private getReadingsRangeById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const num = parseInt(req.params.num);
        if (isNaN(id) || isNaN(num) || id < 0 || id >= this.readings.length) {
            return res.status(400).json({ message: 'Błędne dane wejściowe' });
        }
        const sliced = this.readings.slice(id, id + num);
        res.status(200).json(sliced);
    }

    private addData = async (req: Request, res: Response, next: NextFunction) => {
        const { air } = req.body;
        const { id } = req.params;

        const schema = Joi.object({
            air: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().integer().positive().required(),
                        value: Joi.number().positive().required()
                    })
                )
                .unique((a, b) => a.id === b.id),
            deviceId: Joi.number().integer().positive().valid(parseInt(id, 10)).required()
        });

        try {
            const validatedData = await schema.validateAsync({ air, deviceId: parseInt(id, 10) });

            const readingData = {
                temperature: validatedData.air[0].value,
                pressure: validatedData.air[1].value,
                humidity: validatedData.air[2].value,
                deviceId: validatedData.deviceId,
                readingDate: new Date()
            };

            await this.dataService.createData(readingData);
            res.status(200).json(readingData);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            res.status(400).json({ error: 'Invalid input data.' });
        }
    };


    private deleteAllData = async (req: Request, res: Response) => {
        this.readings = [];
        res.status(200).json({ message: 'Wszystkie dane zostały usunięte' });
    }

    private deleteDataById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 0 || id >= this.readings.length) {
            return res.status(404).json({ message: 'Nie znaleziono odczytu do usunięcia' });
        }
        this.readings.splice(id, 1);
        res.status(200).json({ message: `Usunięto odczyt o indeksie ${id}` });
    }
}

export default DataController;