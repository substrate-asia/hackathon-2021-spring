
require('./src');

if (process.env.NODE_ENV == 'development') {
	import('./test/test');
}
