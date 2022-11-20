const express = require('express');
const app = express();
const mongo = require('mongoose');
const consultaService = require('./services/consultaService.js') // CARREGANDO O MODULO DA CONSULTA

app.set('view-engine', 'ejs'); // ENGINE DO EJS
app.use(express.static("public")); // SETANDO PASTA PUBLICA

//EXPRESS PARSER
app.use(express.urlencoded({extended: true}))
app.use(express.json());

// CONEXÃO DO BANCO DE DADOS
const uri = "mongodb://127.0.0.1:27017/Odonto";
    mongo.connect(uri).then(()=> {console.log('Conectado!');})


// ROTAS DE CADASTRO
app.get('/cadastro', (req,res) => {
    res.render('create.ejs')
})
app.post('/create', async (req,res) => {
    var consulta = await consultaService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
        )

        if(consulta){
            res.redirect('/'); 
        }else{
            res.send('Erro')
        }
})


//ROTAS DE INFORMAÇÃO RECEBIDA
app.get('/', (req,res) => {
    res.render('index.ejs')
})

app.get('/getcalendar', async (req,res) => {
    var consultas = await consultaService.GetAll(false);
    res.json(consultas) // O FULLCALENDAR SÓ ACEITA JSON
})

app.get('/event/:id', async(req,res) => {
    var id = req.params.id
    var paciente = await consultaService.GetById(id);
    res.render('event.ejs', {paciente: paciente}) // PEGANDO UM PARAMETRO POR CLICK DO FULLCALENDAR
})


app.get('/finish/:id', async(req,res) => {
    var id = req.params.id;
    try{
        var result = await consultaService.Finish(id)
        if (result){
            res.redirect('/')
        }
    }catch(err){
        console.log(err)
        return false;
    }
})


app.get('/list', async(req,res) => {
    var consultas = await consultaService.GetAll(true);
    res.render('list.ejs')
})

app.get('/getlistfull', async(req,res) => {
    var consultas = await consultaService.GetAll(true);
    res.json(consultas); // O FULLCALENDAR SÓ ACEITA JSON
})


setInterval(() => { //POLLING 
    consultaService.SendNotification();
},5000)

app.listen(8080, ()=> {})