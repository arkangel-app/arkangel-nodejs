'use strict';


class UsersRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }

    login(login){

        let correo = login.email.toUpperCase();
        return this.db.one("select id_usuario,name,email,password from users usr \
        where usr.status='A' and upper(usr.email)=upper($1)",correo);
    }

    create(userData){
        console.log("data",userData)
        return this.db.one("insert into users (email, password, name, age, sexo) values \
        (${email},${password},${name},${age},${sexo}) returning id_usuario",userData)
    }

    saveParent(values){
        console.log(values)
        return this.db.one("insert into parents (name, email, id_kid, parentezco, key) values \
        (${name},${email},${id_kid},${parentezco},${key}) returning key",values)
    }

    saveToken(data){

      return this.db.one("UPDATE usuarios SET token_password=${password} WHERE email=${email} returning *s",data);
    }

    testTokenParent(data){
        console.log("data",data)
        data.keys=data.key.replace(/['"]+/g, '');
         
         console.log("change",data.key.replace(/['"]+/g, ''))
          console.log("dale",data)
      return this.db.one("select p.id_kid, usr.name as kid, p.name, p.parentezco from parents p join users usr \
                          on usr.id_usuario = p.id_kid where p.key = ${keys}",data);
    }


    changePassword(user){
   
       return this.db.one("update usuarios set token_password=null, password=${password} where id_usuario=${id_usuario} and estado=true and token_password is not null returning *",user); 
    }


}

module.exports = UsersRepository;
