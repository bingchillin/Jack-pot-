import {
    applyDecorators,
    SetMetadata,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiBody,
    ApiResponse,
    ApiQuery,
  } from '@nestjs/swagger';
  
  interface ApiGroupOptions {
    tag?: string;
    summary?: string;
    description?: string;
    param?: { 
      name: string; 
      type?: any; 
      description?: string;
      example?: any;
    };
    query?: {
      name: string;
      type?: any;
      description?: string;
      example?: any;
    };
    bodyType?: any;
    bodyExample?: any;
    responses?: {
      status: number;
      description: string;
      type?: any;
      example?: any;
    }[];
  }
  
  export function ApiGroup(options: ApiGroupOptions) {
    const decorators = [];
  
    if (options.tag) decorators.push(ApiTags(options.tag));
    if (options.summary) decorators.push(ApiOperation({ 
      summary: options.summary,
      description: options.description 
    }));
    if (options.param)
      decorators.push(ApiParam({
        name: options.param.name,
        type: options.param.type ?? 'string',
        description: options.param.description ?? '',
        example: options.param.example
      }));
    if (options.query)
      decorators.push(ApiQuery({
        name: options.query.name,
        type: options.query.type ?? 'string',
        description: options.query.description ?? '',
        example: options.query.example
      }));
    if (options.bodyType) decorators.push(ApiBody({ 
      type: options.bodyType,
      examples: options.bodyExample ? { 
        default: { 
          summary: 'Example request',
          value: options.bodyExample 
        } 
      } : undefined
    }));
    if (options.responses) {
      for (const res of options.responses) {
        decorators.push(ApiResponse({
          status: res.status,
          description: res.description,
          type: res.type,
          examples: res.example ? { 
            default: { 
              summary: 'Example response',
              value: res.example 
            } 
          } : undefined
        }));
      }
    }
  
    return applyDecorators(...decorators);
  }
  