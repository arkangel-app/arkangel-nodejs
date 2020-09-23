'use strict';


class EmocionesRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }

  
    saveDairyEmotion(values){
console.log("save repo",values)
        return this.db.one("insert into dairy_humor(kid_id, animo_id, causa_id, mensaje, send_parent) values \
        (${kid_id},${animo_id},${causa_id},${mensaje},${send_parent}) returning *",values)
    }


    saveDairySimpleEmotion(values){
        return this.db.one("insert into dairy_humor(kid_id, animo_id) values \
        (${kid_id},${animo_id}) returning id_dairy_humor",values)
    }

    kidRecomendation(values){
        if(values.causa_id==""){
             return this.db.one("select image,title_suger,descripcion from kid_suger ks where ks.animo_id=${animo_id} \
             ORDER BY RANDOM() limit 1", values)
        }else{
        return this.db.one("select image,title_suger,descripcion from kid_suger ks where ks.animo_id=${animo_id} \
            and ks.causa_id=${causa_id} ORDER BY RANDOM() limit 1", values)
        }
        }

    parentRecomendation(values){
        return this.db.one("select id_parent_suger,title,descripcion from parent_suger ps where ps.animo_id=${animo_id} \
            and ps.causa_id=${causa_id} ORDER BY RANDOM() limit 1", values)
    }

    parentNotification(values){
        return this.db.one("insert into parent_notification(parent_suger_id, dairy_humor_id) \
                            values(${id_parent_suger},${id_dairy_humor}) returning *", values)
    }

    getNotificationDataById(values){
        return this.db.one("select TO_CHAR(dh.created, 'DD/MM/YYYY hh:mm') as created, dh.mensaje as msg, e.name as emotion, r.name as reason,p.name as parent, p.email, \
                            u.name as kid, ps.title as title, p.key, ps.descripcion as sugerencia from parent_notification n \
                            join parent_suger ps on ps.id_parent_suger = n.parent_suger_id \
                            join dairy_humor dh on dh.id_dairy_humor=n.dairy_humor_id \
                            join emotions e on e.id_emotion = dh.animo_id \
                            left join emotions_reason r on r.id_emotion_reason=dh.causa_id \
                            join parents p on p.id_kid=dh.kid_id \
                            join users u on u.id_usuario=p.id_kid \
                            where n.status='A' and n.id_parent_notification=${id_parent_notification}", values)        
    }

    /*MUESTRA TODAS LAS NOTIFICACIONES QUE LE LLEGARON AL PAPA DEL NINO*/
    listNotificationsByKid(values){
        return this.db.any("select n.id_parent_notification, TO_CHAR(dh.created, 'DD/MM/YYYY hh:mm') as created, dh.mensaje as msg, e.name as emotion, r.name as reason, \
                            u.name as kid, ps.title as title, ps.descripcion as sugerencia from parent_notification n \
                            join parent_suger ps on ps.id_parent_suger = n.parent_suger_id \
                            join dairy_humor dh on dh.id_dairy_humor=n.dairy_humor_id \
                            join emotions e on e.id_emotion = dh.animo_id \
                            left join emotions_reason r on r.id_emotion_reason=dh.causa_id \
                            join parents p on p.id_kid=dh.kid_id \
                            join users u on u.id_usuario=p.id_kid \
                            where n.status='A' and dh.kid_id=${id_kid} order by n.id_parent_notification desc", values)
    }

    getPersonalityTest(){
        return this.db.any("select * from personality_test where status='A'")
    }

    getQuestion(values){
        return this.db.one("select * from personality_test where status='A' and id_question=${id_question}",values)
    }

    testResult(values){
        return this.db.one("insert into personality_result(kid_id, extroversion, agreeableness, neuroticism, \
                            result, personality_id) values (${kid_id}, ${extroversion}, ${agreeableness}, ${neuroticism}, \
                            ${personality}, ${personality_id}) returning result", values)
    }    



}

module.exports = EmocionesRepository;
