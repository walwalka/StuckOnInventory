import process from 'node:process';
import * as dotenv from 'dotenv'

dotenv.config();

export const sqlIp = process.env.SQL_SERVER_IP;
export const sqlPort = process.env.SQL_SERVER_PORT;
export const sqlUser = process.env.SQL_USER;
export const sqlDb = process.env.SQL_DB;
export const sqlPass = process.env.SQL_PASS;
