import createServer from "next";
import sinon from 'sinon';
import expect from 'expect';

import withCustomLogger, {RequestContext} from "./withCustomLogger";

describe('test monkey patched custom logger', function () {
    it('should attach logger', async function () {
        const server = createServer({ dev: true, quiet: true });

        const logger = sinon.spy(function (ctx: RequestContext, err: Error | null) {});

        // @ts-ignore
        const wrappedServer = withCustomLogger(server, logger);

        // monkey patch the server for testing.
        const serverProto = Object.getPrototypeOf(server);
        serverProto.renderErrorToResponse = function () {};
        wrappedServer.server = server;

        // @ts-ignore
        await wrappedServer.getServerRequestHandler(); // have to call this once first

        // @ts-ignore
        wrappedServer.renderErrorToResponse({}, new Error()).then(console.log).catch(console.error);
        await server.close()

        expect(logger.calledOnce).toBe(true);
    });
});
