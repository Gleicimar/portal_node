const express = require('express');
const  mongoose = require('mongoose')
const path =require('path');
var bodyParser = require('body-parser');

const app = express();

const posts = require('./Posts.js');

mongoose.set('strictQuery', tryarue);

mongoose.connect('mongodb+srv://root:271121@cluster0.mhdtgfi.mongodb.net/portal_de_noticia',{useNewUrlParser:true,useUnifiedTopology:true}).then( ()=>{
    console.log('conectado com sucesso');
}).catch( (err)=>{
console.log(err.message)
});

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended:true,
}));
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
app.use('/public',express.static(path.join(__dirname, 'public')));
app.set('views',path.join(__dirname, '/pages'));

app.get('/',(req,res)=>{
    if(req.query.busca == null){
        posts.find({}).sort({'id':-1}).exec((err,posts)=>{
            ////console.log(posts[0]);
            posts=posts.map((val)=>{
                return{
                    titulo:val.titulo,
                    conteudo:val.conteudo,
                    descricaoCurta:val.conteudo.substr(0,95),
                    imagem:val.imagem,
                    slug:val.slug,
                    categoria:val.categoria
                }
            });

        });
        posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

            // console.log(posts[0]);

             postsTop = postsTop.map(function(val){

                     return {
                         titulo: val.titulo,
                         conteudo: val.conteudo,
                         descricaoCurta: val.conteudo.substr(0,100),
                         imagem: val.imagem,
                         slug: val.slug,
                         categoria: val.categoria,
                         views: val.views
                     }
             })
             res.render('home',{posts:posts,postsTop:postsTop
                });
         }) 
    }else{
        posts.find({titulo:{$regex:req.query.busca,$options:"i"}},(err,posts)=>{

            posts=posts.map((val)=>{
                return{
                    titulo:val.titulo,
                    conteudo:val.conteudo,
                    descricaoCurta:val.conteudo.substr(0,95),
                    imagem:val.imagem,
                    slug:val.slug,
                    categoria:val.categoria
                }
            });

            console.log(posts);
            res.render('busca',{posts:posts,contagem:posts.length});

        });
    }

})
app.get('/:slug',(req,res)=>{
    //res.send(req.params.slug);
    posts.findOneAndUpdate({slug:req.params.slug},{$inc:{views:1}},{new:true},(err,resposta)=>{
        if(resposta !=null){
            posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

                // console.log(posts[0]);
    
                 postsTop = postsTop.map(function(val){
    
                         return {
                             titulo: val.titulo,
                             conteudo: val.conteudo,
                             descricaoCurta: val.conteudo.substr(0,100),
                             imagem: val.imagem,
                             slug: val.slug,
                             categoria: val.categoria,
                             views: val.views
                         }
                       })
                        res.render('single',{noticia:resposta,
                                            postsTop:postsTop
                                  });
                    })
                }else{
                    res.redirect('/');
                }
            })
        })
       
app.get('/painel',(req,res)=>{
    res.render('home_painel',{});
})
app.listen(5000,()=>{
    console.log('servidor rodando');
});
