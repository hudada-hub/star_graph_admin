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
    static success<T>(data: T, message: string = 'success') {
      return NextResponse.json({
        code: 0,
        message,
        data,
      });
    }
  
    // 错误响应
    static error(message: string = 'error', code: number = 1) {
      return NextResponse.json({
        code,
        message,
        data: null,
      });
    }
  
    // 无权限响应
    static forbidden(message: string = '无权访问') {
      return NextResponse.json({
        code: 403,
        message,
        data: null,
      }, { status: 403 });
    }
  
    // 未认证响应
    static unauthorized(message: string = '未登录') {
      return NextResponse.json({
        code: 401,
        message,
        data: null,
      }, { status: 401 });
    }
  
    // 参数错误响应
    static badRequest(message: string = '请求参数错误') {
      return NextResponse.json({
        code: 400,
        message
      }, { status: 400 });
    }
  
    // 资源不存在响应
    static notFound(message: string = '资源不存在') {
      return NextResponse.json({
        code: 404,
        message,
        data: null,
      }, { status: 404 });
    }
  }