
const DATABASE_URL = 'https://marty-webapp-default-rtdb.firebaseio.com/';
const LOG_PATH = 'logs';

const SHOULD_WRITE_LOGS = true;

export default class OnlineLogger {
    static async writeLog(logTitle: string, log: string): Promise<void> {
        if (!SHOULD_WRITE_LOGS) return;
        try {

            const logPath = `${LOG_PATH}/${new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-')}_${logTitle}.json`;
            const response = await fetch(`${DATABASE_URL}${logPath}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ log })
            });
            if (!response.ok) {
                throw new Error('Failed to write log to database');
            }
        } catch (error) {
            console.error('Failed to write log to database:', error);
        }
    }
}