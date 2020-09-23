
const Router = require('koa-router');
const db = require('../database');
const validate = require('./validate');
const aws = require('../utils/aws')

const router = new Router({
  prefix: '/recetas'
});


//validate.loginRequired, 
router.post('/post_s3-url',validate.loginRequired, async (ctx) => {
    if (ctx.request.body.filename==undefined) {
        ctx.throw(400, 'Error request');
    }
    var file = ctx.request.body;
    const urlKey = `post/${file.filename}`;
    const urls3 = aws.getPresignetUrl(urlKey,'putObject');
    ctx.status = 200;
    ctx.body = {url:urls3}
});


//validate.loginRequired, 
router.post('/guardar', validate.loginRequired, async (ctx) => {
    if (ctx.request.body.image==undefined || ctx.request.body.receta==undefined) {
        ctx.throw(400, 'Error request');
    }
    let receta = ctx.request.body;
    receta.id_usuario = ctx.request.user.id_usuario;
    return db.recetas.insertReceta(receta).then(receta=>{
        aws.resizeS3(receta);

        ctx.status = 201;
        ctx.body = {message:"La receta se ha subido. Una vez aceptada aparecerá automáticamente en la página"}
    }).catch(error=>{
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});

router.get('/list_home', async (ctx) => {

    return db.recetas.getRecetasHome().then(recetas=>{
        recetas.map(receta=>{
            const urlKey = `post/${receta.foto}`;
			receta.foto = aws.getPresignetUrl(urlKey,'getObject');
        })
        ctx.status = 200;
        ctx.body = {recetas:recetas}
    }).catch(error=>{
        console.log(error);
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});
router.get('/list_all', async (ctx) => {
    return db.recetas.getTotalRecetas().then(recetas=>{
        recetas.map(receta=>{
            const urlKey = `post/${receta.foto}`;
			receta.foto = aws.getPresignetUrl(urlKey,'getObject');
        })
        ctx.status = 200;
        ctx.body = {recetas:recetas}
    }).catch(error=>{
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});

module.exports = router;

  