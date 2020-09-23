const Router = require('koa-router');
const db = require('../database');
const jwtk = require('jsonwebtoken');
var config = require('../config/index');
const bcrypt = require('bcrypt');
const mailer = require('./mailer/sender');
var fs=require('fs');
require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var template = require('./mailer/template.html');
var templateString = require('./mailer/templateString');

const router = new Router({
  prefix: '/users'
});

const jwt = require('jsonwebtoken');
var config = require('../config/index');

router.post('/login', async (ctx) => {
	console.log(ctx.request.body)
	if (ctx.request.length==0) {
		ctx.throw(400, 'Error request');
	}

	let login = ctx.request.body;
	return db.users.login(login).then(user=>{
		console.log(user)		
		return bcrypt.compare(login.password, user.password).then(function(res) {
			if(res){
				let userTemp = {
					id_usuario:user.id_usuario,
					email:user.email,
					name:user.name,
					exp: Math.floor(Date.now() / 1000) + (60 * 60 * 4)
				};
				var token = jwt.sign(JSON.stringify(userTemp), config.secret);
				userTemp.token = token;
				ctx.status = 200
				ctx.body = {user:userTemp}	
			}else{
				ctx.status = 400
				ctx.body = {message:"La contraseña no es corrrecta"}	
			}
		});
	}).catch(error=>{
		console.log(error);
		ctx.status = 400
		ctx.body = {message:"El correo electrónico no existe"}
	})
});


router.post('/recover_pass', async (ctx) => {
	if (ctx.request.body.mail=='') {
		ctx.throw(400, 'Error request');
	}

	let mailObj = ctx.request.body;
	return db.users.login(mailObj).then(user=>{
		//ENVIO DE PASSWORD
		//generar token 

		let token = jwtk.sign(JSON.stringify({id_usuario: user.id_usuario}), config.secret);
		//actualizar el usuario con token_password = token
		console.log(token);
		user.password = token;
		return db.users.saveToken(user).then(r=>{
			//r.token_password

			    let formatter=templateString.generateTemplateString(template);
		    	let mailOption = {
		        to: user.mail,
		        subject:'Cambiar contraseña',
		        html: formatter({nombre:user.fullname,token:user.password})
				}	
				
				// ctx.status = 201
				// ctx.body = {message:"Se ha enviado un correo electrónico con la nueva contraseña"}
		    	
		    	return mailer.mailSender(mailOption).then(response=>{
		          	ctx.status = 201
					ctx.body = {message:"Se ha enviado un correo electrónico con la nueva contraseña"}	
		        }).catch(error=>{
		            ctx.status = 400;
		            ctx.body = {message:"No se envio el correo"}
		        })

		}).catch(error=>{
			ctx.status = 400
			ctx.body ={message:error.message}
		})
	}).catch(error=>{
		ctx.status = 400
		ctx.body = {message:"El correo electrónico no existe"}
	})
});

router.post('/changePassword', async (ctx) => {
	
	let data = ctx.request.body;

	try {
	  var decoded = jwt.verify(data.token, config.secret);			
	  return bcrypt.hash(data.password, 10).then(function(hash) {
		data.password = hash;    	
		data.id_usuario = decoded.id_usuario;
		return db.users.changePassword(data).then(user=>{
			ctx.status = 201;
			ctx.body = {message:"ok"}
		}).catch(err=>{
			ctx.status = 400;
      		ctx.body = {message:"No se pudo cambiar la contraseña."}
		})

	})
	
	} catch(err) {
	  ctx.status = 400;
      ctx.body = {message:"No se pudo cambiar la contraseña"}
	}
	
	/*let registroObj = ctx.request.body;
	registroObj.ip = ctx.request.ip;
	return bcrypt.hash(registroObj.password, 10).then(function(hash) {
		registroObj.password = hash;
        return db.users.create(registroObj).then(user=>{*/

    
});


router.post('/register', async (ctx) => {
	console.log(ctx.request.body)
	if (ctx.request.body.email=='' || ctx.request.body.email==undefined) {
		ctx.throw(400, 'Falta el correo electónico');
	}
	if (ctx.request.body.name=='' || ctx.request.body.name==undefined) {
		ctx.throw(400, 'Falta el nombre');
	}

	if (ctx.request.body.age=='' || ctx.request.body.age==undefined) {
		ctx.throw(400, 'Falta la edad');
	}
	if (ctx.request.body.password=='' || ctx.request.body.password==undefined) {
		ctx.throw(400, 'Falta la contraseña');
	}

	let registroObj = ctx.request.body;
	registroObj.ip = ctx.request.ip;
	return bcrypt.hash(registroObj.password, 10).then(function(hash) {
		registroObj.password = hash;
		console.log("Registrando")
        return db.users.create(registroObj).then(user=>{
		console.log("devuelve",user)
			/*let userTemp = {
				id_usuario:user.id_usuario,
				email:user.email,
				name:user.name,
				exp: Math.floor(Date.now() / 1000) + (60 * 60 * 4)
			};*/
		let userTemp = {
				id_usuario:user.id_usuario,
				
			};
			//var token = jwt.sign(JSON.stringify(userTemp), config.secret);
			//userTemp.token = token;
			//userTemp.id_usuario = user.id_usuario;
		console.log("userTMp")
			ctx.status = 200
			ctx.body = user.id_usuario	
        }).catch(error=>{
			let message = error.message;
			console.log(error.constraint)
			if(error.constraint=="users_email_uindex")
				message = "El correo electrónico ya se encuentra registrado";

            ctx.status = 400;
            ctx.body = {message:"El correo ya esta registrado"}
        })
    });	
});

router.post('/parent', async (ctx) => {
	console.log(ctx.request.body)
	
	let user = ctx.request.body;
	user.ip = ctx.request.ip;
	
			let userTemp = {
				id_parent:user.id_parent,
				email:user.email,
				name:user.name,
				id_kid:user.id_kid,
				parentezco:user.parentezco			
			};
			var token = jwt.sign(JSON.stringify(userTemp), config.secret);		
			userTemp.key = token;

		return db.users.saveParent(userTemp).then(user=>{
			console.log("saveParent",user);
			ctx.status = 200
			ctx.body = user.key	
        }).catch(error=>{
			let message = error.message;
			console.log(error.constraint)
            ctx.status = 400;
            ctx.body = {message:message}
        })
	
});

/*Verifica si el codigo del niño existe*/


router.post('/test_parent', async (ctx) => {
    if (ctx.request.body.key==undefined || ctx.request.body.key==null) {
        ctx.throw(400, 'Error request');
    }
	console.log("route",ctx.request.body)
    let parent = ctx.request.body;43	
    return db.users.testTokenParent(parent).then(res=>{
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});

module.exports = router;
