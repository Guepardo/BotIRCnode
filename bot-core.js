var net  = require('net'); 

var HOST    = 'irc.icq.com';
var PORT    =  6667;
var NICK    = '[B]igBrother'; 
var CHANNEL = '#brasil'; 

var status = false;

var count = 0; 

console.log('Server listening on ' + HOST +':'+ PORT);

//------------SOCKET-------------------
var client = new net.Socket();
client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    client.write('NICK ' +NICK + ' \n\r');
    client.write('USER '+ NICK +' * 8 : Bot \n\r');
    status = true; 
});

// Executa essa ação quando o servidor envia algum dado. 
client.on('data', function(data) {
    onMessage(data); 
});

// executa essa açao quando o servidor é fechado. 
client.on('close', function() {
    console.log('Connection closed');
    status = false;
});

//--------------FUNÇÕES PARA USO DO SOCKET------------------
function onMessage(data){
	//console.log('DATA: ' + data);
	data = new String(data); 
	count++; 
	
	if( data.indexOf('004') > -1){
		console.log('Você está logado no servidor');
		client.write('JOIN ' + CHANNEL +' \n\r');
		client.write('JOIN #english \n\r');
		client.write('JOIN #portugese \n\r');
		return; 
	}

	if( data.search('433') > -1 ){
		console.log('O seu nick já está sendo usado'); 
		return; 
	}

	if( data.indexOf('PING') == 0){
		onPingRequest(data); 
		return; 
	}

	if( data.search('PRIVMSG') > -1){
		var m = sliceMessage(data); 
		onPRIVMSG(m); 
		console.log('Nome '+ m.nick +' : '+m.msg); 
	}

}
//Function fot treatment PRIVMSG
function onPRIVMSG(m){
	
}

//Função para tratamento ping request
function onPingRequest(data){
	console.log('PONG'); 
	client.write('PONG '+ data.substring(6) +' \n\r')
}

//Fuction for send PRIVMSG protocol; 
function sendPRIVMSG(text){
	client.write('PRIVMSG '+text+' \n\r'); 
}
//Objeto Message
function Message(nick, user, ip, channel, msg){
	this.nick    = nick; 
	this.user    = user; 
	this.ip      = ip; 
	this.channel = channel; 
	this.msg     = msg; 
}

//Função para dividir mensagem; 
function sliceMessage(data){
	var nick, user, ip, channel, text,temp; 

	text = data.substring( data.substring(1).indexOf(':') + 2); 
	data = data.substring(1, data.substring(1).indexOf(':'));

	temp = data.split(' '); 

	channel = temp[2]; 
	ip = temp[0].split('@')[1];

	nick = temp[0].split('@')[0];

	temp = nick.split('!');

	nick = temp[0];
	user = temp[1];
	return new Message(nick, user, ip, channel, text); 
}

//------------------------------LOGS VIA PÁGINAS HTML--------------
// Carrega o módulo de páginas html (vou usar isso para ver logs.)
var http = require('http');

// Configurando requests e response do server. 
var server = http.createServer(function (request, response) {
  try{
  	response.writeHead(200, {"Content-Type": "text/plain"});
	var text = "Server: "+HOST+"\n Channel: "+CHANNEL+"\n NameBot: "+NICK+"\n Stauts: "+ ((status) ? 'Conectado' : 'Desconectado')+"\n Qtd Msg: "+ count +'\n'; 
	response.end(text);
  }catch(error){
  	console.log(error); 
  }
  
});

//Servidor de páginas web ouvindo na porta 8000
var port =  process.env.OPENSHIFT_NODEJS_PORT || 8080;   // Port 8080 if you run locally
var address =  process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"; // Listening to localhost if you run locally
server.listen(port, address);