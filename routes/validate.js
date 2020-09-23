module.exports.loginRequired = async (ctx,next) => {
	if (ctx.request.user) {
		return next();
	}else{
		//return next();
		ctx.status = 403;
		//ctx.body = {message:"Acceso no aturorizado"};
		return ctx;

		//ctx.throw(403, 'Acceso no autorizado');
		//ctx.headers = ctx.response.headers;
		// ctx.throw(403, 'Acceso no autorizado');
		// let e = new Error();
  //           e.status=  status;
  //           e.headers = ctx.response.headers;
  //       return e;

		//throw Object.assign(new Error('Acceso no autorizado'), {status: 403})
	}
}
