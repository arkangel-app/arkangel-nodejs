const nodemailer = require('nodemailer');

module.exports.mailSender = (Options)=>{
	let transporter = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 587,
        secure: false,
				auth: {
				        user: 'arkangel.notificaciones@gmail.com',
				        pass: 'test'
				    }
    });

    let mailOptions = {
        from: '"ARKANGEL" <arkangel.notificaciones@gmail.com>',
        to: Options.to,
        subject: Options.subject,
        html: Options.html
    };

    return new Promise((resolve,reject)=>{
    	transporter.sendMail(mailOptions, (error, info) => {
	        if (error) {
			console.log(error);
	            reject(error);
	        }else{
	        	resolve(info.messageId);
	        }

	    });
    })

}
