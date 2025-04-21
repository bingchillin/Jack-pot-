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
  } from '@nestjs/swagger';
  
  interface ApiGroupOptions {
    tag?: string;
    summary?: string;
    param?: { name: string; type?: any; description?: string };
    bodyType?: any;
    responses?: {
      status: number;
      description: string;
      type?: any;
    }[];
  }
  
  export function ApiGroup(options: ApiGroupOptions) {
    const decorators = [];
  
    if (options.tag) decorators.push(ApiTags(options.tag));
    if (options.summary) decorators.push(ApiOperation({ summary: options.summary }));
    if (options.param)
      decorators.push(ApiParam({
        name: options.param.name,
        type: options.param.type ?? 'string',
        description: options.param.description ?? '',
      }));
    if (options.bodyType) decorators.push(ApiBody({ type: options.bodyType }));
    if (options.responses) {
      for (const res of options.responses) {
        decorators.push(ApiResponse(res));
      }
    }
  
    return applyDecorators(...decorators);
  }
  