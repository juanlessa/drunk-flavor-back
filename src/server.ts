import { app } from '@shared/infra/http/app';

const serverPort = Number(process.env.APP_PORT);
app.listen(serverPort, () => {
	console.log(`🚀 Server started on port ${serverPort}`);
});
