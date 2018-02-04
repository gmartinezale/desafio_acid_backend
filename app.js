const http = require('http');
const https = require('https');
const request = require('request');
const querystring = require('querystring');
const url = require('url');
const redis = require('redis');
const server = http.createServer().listen(5555);
const API_KEY = "890W28J9DJ0Q67EU";

var client = redis.createClient();
var bitcoinHelper = require('./helpers/bitcoin_helper');
var ethHelper = require('./helpers/eth_helper');

//DIARIO = https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_INTRADAY&symbol=BTC&market=CLP&apikey=890W28J9DJ0Q67EU

server.on('request', function (req, res) {
    if (req.method == 'GET') {
        var url_parts = url.parse(req.url,true);
        var data = url_parts.query;
        var URL = "";
        res.writeHead(200, {'Content-Type': 'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':"Origin, X-Requested-With, Content-Type, Accept"});
        try{
            if (Math.random(0, 1) < 0.1) throw new Error('How unfortunate! The API Request Failed')
            if(data.type_money == 'BTC'){
                bitcoinHelper.getDataBTC(data,client,API_KEY,(dataBtc)=>{
                    res.end(dataBtc);
                });
            }else{
                ethHelper.getDataETH(data,client,API_KEY,(dataEth)=>{
                    res.end(dataEth);
                });
            }
        }catch(err){
            console.log(err.message);
            res.end(JSON.stringify({error:err.message}))
        }
    }else{res.end();}
});