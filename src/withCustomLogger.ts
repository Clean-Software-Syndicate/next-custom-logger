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

const wrapRenderToErrorResponse = (originalRenderer: RenderErrorToResponse) => (loggerMethod: LoggerMethod) => {
    return async function (this: NextServer, ctx: RequestContext, err: Error | null) {
        loggerMethod.call(this, ctx, err);

        return originalRenderer.call(this, ctx, err);
    }
}

const wrapServerRequestHandler = (server: NextServer, loggerMethod: LoggerMethod) => {
    const originalHandler = server.getServerRequestHandler;

    return async function(this: NextServer) {
        const serverProto = Object.getPrototypeOf(this.server);
        serverProto.renderErrorToResponse = wrapRenderToErrorResponse(serverProto.renderErrorToResponse)(loggerMethod);

        return originalHandler.call(this);
    }
}

export default function withCustomLogger(server: NextServer, loggerMethod: LoggerMethod) {
    const serverProto = Object.getPrototypeOf(server);
    serverProto.getServerRequestHandler = wrapServerRequestHandler(server, loggerMethod);

    return server;
}
