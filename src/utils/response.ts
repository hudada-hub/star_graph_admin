// src/utils/response.ts
import { NextResponse } from 'next/server';

// 响应状态码枚举
export enum ResponseCode {
    SUCCESS = 0,           // 成功
    ERROR = 1,            // 一般错误
    UNAUTHORIZED = 401,    // 未授权
    FORBIDDEN = 403,       // 禁止访问
    NOT_FOUND = 404,       // 未找到
    SERVER_ERROR = 500,    // 服务器错误
  }
  
  // 响应接口
  export interface ApiResponse<T = any> {
    code: ResponseCode;
    message: string;
    data?: T;
  }
  
  // 响应工具类
  export class ResponseUtil {
    // 成功响应
    static success<T>(data?: T, message: string = '操作成功'): NextResponse {
      return NextResponse.json({
        code: ResponseCode.SUCCESS,
        message,
        data,
      });
    }
  
    // 错误响应
    static error(message: string = '操作失败', code: ResponseCode = ResponseCode.ERROR): NextResponse {
      return NextResponse.json({
        code,
        message,
      }, { status: code >= 400 ? code : 200 });
    }
  
    // 未授权响应
    static unauthorized(message: string = '未授权'): NextResponse {
      return NextResponse.json({
        code: ResponseCode.UNAUTHORIZED,
        message,
      }, { status: 401 });
    }
  
    // 服务器错误响应
    static serverError(message: string = '服务器错误'): NextResponse {
      return NextResponse.json({
        code: ResponseCode.SERVER_ERROR,
        message,
      }, { status: 500 });
    }
  }