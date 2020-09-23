'use strict';


class RecetasRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }

    insertReceta(receta){
        return this.db.one("insert into recetas (usuario_id, receta, foto) \
        values (${id_usuario},${receta},${image}) returning id_receta,foto",receta);
    }

    getRecetasHome(){
        return this.db.any("select id_receta,receta,foto from recetas where estado=true and evaluado=true order by id_receta desc limit 3")
    }

    getTotalRecetas(){
        return this.db.any("select id_receta,receta,foto from recetas where estado=true and evaluado=true order by id_receta desc");
    }

    updateRecetaFoto(foto,id_receta){
        return this.db.any("update recetas set resized=true,foto=$1 where id_receta=$2",[foto,id_receta]);
    }



}

module.exports = RecetasRepository;
