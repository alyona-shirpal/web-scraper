import * as express from 'express';

export const newRoute = (
    app: express.Application,
): void => {
    app.post('/new-route', (req: express.Request, res: express.Response): void => {
            res.send();

    });
};

