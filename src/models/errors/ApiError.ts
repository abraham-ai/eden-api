import { ObjectId } from "mongodb";

interface ApiErrorOptions {
  taskId?: string;
  userId?: ObjectId;
  generatorName?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  public taskId?: string;
  public userId?: ObjectId;
  public generatorName?: string;
  public statusCode: number;

  constructor(
    public message: string,
    {
      taskId,
      userId,
      generatorName,
      statusCode = 500,
    }: ApiErrorOptions = {}
  ) {
    super(message);
    this.taskId = taskId;
    this.userId = userId;
    this.generatorName = generatorName;
    this.statusCode = statusCode;
  }
}