import DataModel from '../schemas/data.schema';
import {IData, Query} from "../models/data.model";

export default class DataService {

    public async createData(dataParams: IData) {
        try {
            const dataModel = new DataModel(dataParams);
            await dataModel.save();
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }

    public async query(deviceID: string) {
        try {
            const data = await DataModel.find({deviceId: deviceID}, { __v: 0, _id: 0 });
            return data;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }

    public async get(deviceID: string) {
        return DataModel.find({deviceId: deviceID}, {__v: 0, _id: 0})
            .limit(1)
            .sort({$natural: -1});
    }

    public async getAllNewest(): Promise<IData[]> {
        const latestData: IData[] = [];
        await Promise.all(
            Array.from({ length: 17 }, async (_, i) => {
                try {
                    const latest = await DataModel.find({ deviceId: i }, { __v: 0, _id: 0 })
                        .limit(1)
                        .sort({ $natural: -1 });
                    if (latest.length) {
                        latestData.push(latest[0]);
                    } else {
                        latestData.push({ deviceId: i } as IData);
                    }
                } catch (error) {
                    console.error(`Błąd pobierania danych urządzenia ${i}: ${error.message}`);
                    latestData.push({ deviceId: i } as IData);
                }
            })
        );
        return latestData;
    }

    public async deleteData(deviceID: string) {
        return DataModel.deleteMany({deviceId: deviceID});
    }
}