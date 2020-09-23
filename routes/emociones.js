const Router = require('koa-router');
const db = require('../database');
const validate = require('./validate');
const aws = require('../utils/aws')

const mailer = require('./mailer/sender');
const router = new Router({
  prefix: '/emociones'
});

var template = require('./mailer/template.html');
var templateString = require('./mailer/templateString');
var id_humor=0 


        function getParentRecomendation(data){
                console.log('recomendacion para papa')
                id_humor = data.id_dairy_humor
                db.emociones.parentRecomendation(data).then(res=>{
                console.log(res)                    
                sendNotificationtoParent(res)
            }).catch(error=>{
            
            }) 
        } 

        function sendNotificationtoParent(data){
            console.log('preparando correo')
            console.log(data)
            let notificationValues = {
                id_dairy_humor: id_humor,
                id_parent_suger:data.id_parent_suger
            }
            db.emociones.parentNotification(notificationValues).then(res=>{
                console.log('guardo la notificacion en la base')

                noti={id_parent_notification:res.id_parent_notification}    
                
                console.log(noti)
                getNotificationById(noti)
            }).catch(error=>{
                console.log(error)
            }) 
        }


        function getNotificationById(data){
            console.log('getNotificationDataById')
            console.log(data)
         db.emociones.getNotificationDataById(data).then(res=>{
            console.log('notificacion')
            console.log(res)
                let formatter=templateString.generateTemplateString(template);
                let mailOption = {
                to: res.email,
                subject:'Nuevo mensaje desde Arkangel',
                html: formatter({parent:res.parent,                                    
                                 kid:res.kid,
                                 emotion:res.emotion,
                                 mensaje: res.msg,
                                 sugerencia: res.sugerencia,
                                 key: res.key
                                 })
                } 


                mailer.mailSender(mailOption).then(response=>{
                    
                    console.log('correo enviado')  
                }).catch(error=>{
                    console.log(error)
                })
            }).catch(error=>{
                console.log(error)
            })    
        }

router.post('/save_dairy_emotion', async (ctx) => {

    let data = ctx.request.body;
    console.log(data)
    return db.emociones.saveDairyEmotion(data).then(res=>{
      console.log("dairy emotion. ",data);
      console.log("dairy emotion. ",data.send_parent)
        id_humor=data.id_dairy_humor;
        if(data.send_parent=="true"){
              console.log("quiere enviar al papa")
              getParentRecomendation(res)
        }        
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
      console.log(error)
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});

router.post('/save_dairy_simple_emotion', async (ctx) => {
    let data = ctx.request.body;
    return db.emociones.saveDairySimpleEmotion(data).then(res=>{
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});

router.post('/kid_recomendation', async (ctx) => {
    let data = ctx.request.body;
  console.log(data)
    return db.emociones.kidRecomendation(data).then(res=>{
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
      console.log(error)
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});


router.post('/list_notifications_by_kid', async (ctx) => {
    let data = ctx.request.body;
  console.log(data)
  
    return db.emociones.listNotificationsByKid(data).then(res=>{
      console.log(res)
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
      console.log(error)
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});



router.post('/get_notification_by_id', async (ctx) => {
    let data = ctx.request.body;
    return db.emociones.getNotificationDataById(data).then(res=>{
      console.log(res)
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
      console.log(error)
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});



/*TEST DE PERSONALIDAD*/

router.get('/personality_test', async (ctx) => {
    return db.emociones.getPersonalityTest().then(res=>{
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});

router.post('/get_question_by_id', async (ctx) => {
    let data = ctx.request.body;
    return db.emociones.getQuestion(data).then(res=>{
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});

/*Calcula y envia el resultado del test*/
router.post('/test_result', async (ctx) => {
    let data = ctx.request.body;
    console.log(data);    
    let  ext= 20 + (((parseInt(data.r2) + 
                        parseInt(data.r5) + 
                        parseInt(data.r13) -
                        parseInt(data.r6) - 
                        parseInt(data.r11) - 
                        parseInt(data.r14))*2)/6)*5
    let  agr= 14 + ((parseInt(data.r7) + 
                     parseInt(data.r12) +
                     parseInt(data.r15) + 
                     parseInt(data.r17) -
                     parseInt(data.r8) - 
                     parseInt(data.r1))*2)
    let  neu= 14 + ((parseInt(data.r3) - 
                     parseInt(data.r4) -                      
                     parseInt(data.r9) -
                     parseInt(data.r10) - 
                     parseInt(data.r16))*2)

    let pers = Math.max(ext,agr,neu)
    let personality = "";
    let personality_id;
    if(ext==pers){
        personality="Extrovertido"
        personality_id=1
    } else if(agr==pers){
        personality="Agradable"
        personality_id=2
    } else {
        personality="Nervioso y ansioso"
        personality_id=3        
    }


    let respObj = {
        kid_id:data.kid_id,
        extroversion:ext,
        agreeableness:agr,
        neuroticism:neu,
        personality:personality,
        personality_id:personality_id
    }    

    return db.emociones.testResult(respObj).then(res=>{
        ctx.status = 200;
        ctx.body = res
    }).catch(error=>{
        ctx.status = 400;
        ctx.body = {message:error.message}
    })
});

module.exports = router;
