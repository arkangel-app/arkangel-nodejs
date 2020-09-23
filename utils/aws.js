const AWS = require('aws-sdk');
const s3 = new AWS.S3({signatureVersion: 'v4',region: 'us-east-1'});
const myBucket = 'oreo-2019';
const signedUrlExpireSeconds = 60 * 60 * 24 * 2;
const Sharp = require('sharp');
const db = require('../database');
const moment = require('moment');

module.exports.getPresignetUrl = (key,type) => {
	const url = s3.getSignedUrl(type, {
	    Bucket: myBucket,
	    Key: key,
	    Expires: signedUrlExpireSeconds
	});
	return url;
}

module.exports.resizeS3 = async (receta) => {
	try {
		let key = `post/${receta.foto}`
        let s3Image = await s3.getObject({Bucket: myBucket, Key: key}).promise();
		let size = parseInt(s3Image.ContentLength/1000);
		let buffer = await Sharp(s3Image.Body).resize(850, null).toFormat('jpg').toBuffer();
		let foto = receta.foto.replace('.png', '.jpg').replace('.PNG','.jpg').replace('.JPEG','.jpg').replace('.jpeg','.jpg');
		foto = moment().format('x') +'_'+ foto;
		await s3.putObject({Body: buffer,Bucket: myBucket,ContentType: 'image/jpg',Key: `post/${foto}`}).promise();
		await db.recetas.updateRecetaFoto(foto,receta.id_receta);
    }catch(e){
      //error
      console.log(e.message);
    }
}

