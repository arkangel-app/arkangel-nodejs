process.env.AWS_ACCESS_KEY_ID = 'dfdsf';
process.env.AWS_SECRET_ACCESS_KEY = 'BTsX1B';

const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');
var cors = require('koa-cors');
var convert = require('koa-convert');
const jwt = require('jsonwebtoken');
var config = require('./config/index');

/*
//const whitelist = ['http://localhost:3000'];
const whitelist = ['*'];

//const whitelist = [];
function checkOriginAgainstWhitelist(ctx) {
    const requestOrigin = ctx.accept.headers.origin;
    if (!whitelist.includes(requestOrigin) ){
        return;
    }
    return requestOrigin;
 }
app.use(convert(cors({ origin: checkOriginAgainstWhitelist })));
*/

app.use(cors({origin:'*'}));

app.proxy = true;

app.use(async (ctx,next) => {
	if (ctx.request.headers) {
		if(ctx.request.headers.authorization){
			try {
			  var decoded = jwt.verify(ctx.request.headers.authorization, config.secret);
			  ctx.request.user=decoded;
			} catch(err) {
			  ctx.request.user = undefined;
			}
		}
	}else{
		ctx.request.user = undefined;
	}
	return next();
})

const usersRoutes = require('./routes/users');
const emocionesRoutes = require('./routes/emociones');
const recetasRoutes = require('./routes/recetas');
const indexRoutes = require('./routes/index');

app.use(koaBody());
app.use(usersRoutes.routes());
app.use(emocionesRoutes.routes());
app.use(recetasRoutes.routes());
app.use(indexRoutes.routes());

app.use(async ctx => {
  ctx.body = 'arkangel';
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`started on port: ${port}`);
});
