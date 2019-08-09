// ================ SET UP
var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var cors = require('cors')

var app = express()
var router = express.Router()

// ========= SET UP LOCAL
var config = require('./app/config')
var User = require('./app/models/user')
var port = 3000

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

mongoose.connect(config.database, {
    useNewUrlParser: true
})
app.set('secretKey', config.secret)
app.use(cors()) // permission browser domain apa saja

// =============== ROUTE API
router.post('/login', (req, res) => {
    User.findOne({
        email: req.body.email
    }, (error, user) => {
        if(error) throw error

        if(!user) {
            res.json({success: false, message: 'User tidak ada di database'})
        } else {
            //harusnya password salah
            if(user.password != req.body.password){
                res.json({success: false, message: 'password user salah!'})
            } else {
                // mulai membuat token
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: '24h' // 1 day
                  });

                //ngirim balik token
                res.json({
                    success : true,
                    message : 'token berhasil di dapatkan',
                    token : token
                })
            }
        }
    })
})


router.get('/', (req, res) => { //router untuk home nya
    res.send('ini di route home!')
})

//proteksi route dengan token
router.use((req, res, next) => {
    //mengambil token.. cara lain : req.body.token || req.query.token
    var token = req.headers['authorization']

    //decode token
    if (token) {
        jwt.verify(token, app.get('secretKey'), (error, decoded) => { // cek token nya sama atu tidak
            if (error) {
                return res.json({success : false, message : 'problem pada token'})
            } else {
                req.decoded = decoded
                
                //apakah sudah expired
                if (decoded.exp <= Date.now()/1000) {
                    return res.status(400).send({
                        success : false,
                        message : 'token sudah expired',
                        date    : Date.now()/1000,
                        exp     : decoded.exp
                    })
                }

                next()
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'token tidak tersedia'
        })
    }
})

router.get('/users', (req, res) => { // router untuk user
    User.find({}, (err, users) => {
        res.json(users)
    })
})

router.get('/profile', (req, res) => {
    res.json(req.decoded) //_doc untuk ambil data spesifik dari data user nya
})

//prefix /api
app.use('/api', router)

app.listen(3000)
