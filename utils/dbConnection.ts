import { Connection, createConnection, MysqlError } from "mysql";

interface DbConnection {
  host: string;
  pass: string;
  user: string;
}

const dbConnection = ({ host, pass, user }: DbConnection): Connection => {
  try {
    const db: Connection = createConnection({
      connectTimeout: 4000,
      host: host,
      user: user,
      password: pass,
    });
    return db;
  } catch (error: unknown) {
    console.error("Failed to connect to database", error as MysqlError);
    throw error;
  }
};

export { dbConnection };
