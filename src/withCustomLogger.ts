import { IncomingMessage, ServerResponse } from 'http'
import { ParsedUrlQuery } from 'querystring'

interface NextServer {
    getServerRequestHandler(): any
    server: any
}

export type RequestContext = {
    req: IncomingMessage
    res: ServerResponse
    pathname: string
    query: ParsedUrlQuery
}

interface LoggerMethod {
    (ctx: RequestContext, err: Error | null): void
}

interface RenderErrorToResponse {
    (ctx: RequestContext, _err: Error | null): Promise<any>
}

interface RenderErrorToHTML {
    (err: Error | null, req: IncomingMessage, res: ServerResponse, _pathname: string, query: ParsedUrlQuery): any
}

const wrapRenderToErrorResponse = (originalRenderer: RenderErrorToResponse) => (loggerMethod: LoggerMethod) => {
    return async function (this: NextServer, ctx: RequestContext, err: Error | null) {
        loggerMethod.call(this, ctx, err);

        return originalRenderer.call(this, ctx, err);
    }
}

const wrapRenderErrorToHTML = (originalRenderer: RenderErrorToHTML) => (loggerMethod: LoggerMethod) => {
    return async function (this: NextServer, err: Error | null, req: IncomingMessage, res: ServerResponse, pathname: string, query: ParsedUrlQuery = {}) {
        const ctx: RequestContext = { req, res, pathname, query };
        loggerMethod.call(this, ctx, err);
        
        return originalRenderer.call(this, err, req, res, pathname, query);
    }
}

const wrapServerRequestHandler = (server: NextServer, loggerMethod: LoggerMethod) => {
    const originalHandler = server.getServerRequestHandler;

    return async function(this: NextServer) {
        const serverProto = Object.getPrototypeOf(this.server);
        if (serverProto.renderErrorToResponse) {
            serverProto.renderErrorToResponse = wrapRenderToErrorResponse(serverProto.renderErrorToResponse)(loggerMethod);
        }

        if (serverProto.renderErrorToHTML) {
            serverProto.renderErrorToHTML = wrapRenderErrorToHTML(serverProto.renderErrorToHTML)(loggerMethod);
        }

        return originalHandler.call(this);
    }
}

export default function withCustomLogger(server: NextServer, loggerMethod: LoggerMethod) {
    const serverProto = Object.getPrototypeOf(server);
    serverProto.getServerRequestHandler = wrapServerRequestHandler(server, loggerMethod);

    return server;
}
