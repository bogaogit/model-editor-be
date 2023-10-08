import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
const dynamoDB = new AWS.DynamoDB.DocumentClient();
@Injectable()
export class UserService {
  async createUser(dto: any): Promise<any> {
    const user = {
      id: uuid(),
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await dynamoDB
        .put({
          TableName: process.env.USERS_TABLE_NAME,
          Item: user,
        })
        .promise();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return user;
  }
  async getUserById(id: string): Promise<any> {
    let user;
    try {
      const result = await dynamoDB
        .get({
          TableName: process.env.USERS_TABLE_NAME,
          Key: { id },
        })
        .promise();
      user = result.Item;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return user;
  }
}
