var request = require('request');
const _ = require('lodash');
const LIMIT_DIARY = 25; //EQUIVALENTE A LAS 24h
const LIMIT_MONTHLY = 13; //EQUIVALENTE A LO MENSUAL

function getDataBTC(data,client,API_KEY,callback){
	var key_redis = (data.period == 'diario') ? 'data_btc_diary':'data_btc_monthly';
	var function_api = (data.period == 'diario') ? 'DIGITAL_CURRENCY_INTRADAY':'DIGITAL_CURRENCY_MONTHLY';
	var key_to_each = (data.period == 'diario') ? 'Time Series (Digital Currency Intraday)':'Time Series (Digital Currency Monthly)';
	var key_data = (data.period == 'diario') ? '1a. price (CLP)':'4a. close (CLP)';
	var time_expire = (data.period == 'diario') ? 60*60:60*60*24;
	var limit = (data.period == 'diario') ? LIMIT_DIARY:LIMIT_MONTHLY;
	client.get(key_redis,(err,val) => {
        if(val == null){ //NO EXISTE LLAVE
            var labelGraph = [];
            var dataGraph = [];
            URL = "https://www.alphavantage.co/query?function="+function_api+"&symbol=BTC&market=CLP&apikey="+API_KEY;
            request(URL, { json: true }, (err, resp, body) => {
                if (err) { return console.log(err); }
                var i = 0;
                var skip = 0;
                var graph_format = {labels:[],series:[]}
                var series = [];
                _.forEach(resp.body[key_to_each],(detail,datetime) => {
                    if(i == limit){
                        return;
                    }
                    if(i==0 || data.period == 'mensual' || (data.period == 'diario' && skip==12)){
                        detail.datetime= datetime;
                        graph_format.labels.push(datetime);
                        series.push(parseInt(detail[key_data]));
                        i++;
                    }
                    if(skip == 12) skip = 0; //SE RESETEA YA QUE PASA UNA HORA
                    skip++;
                });
                graph_format.series = [series];
                var save_data = JSON.stringify(graph_format);
                client.set(key_redis,save_data);
                client.expire(key_redis,time_expire);
                callback(JSON.stringify({graph_format:graph_format}));
            });
        }else{
            val = JSON.parse(val);
            callback(JSON.stringify({graph_format:val}));
        }
    });
}

exports.getDataBTC = getDataBTC;