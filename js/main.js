var channel = null;
var role = null;
var ctx = null;
var players = Array();
var me = null;
var map = {};
var res = 4;
var dead = Array();
var imdead = false;

$(document).ready(function () {
	$("#button").hide();
	channel = connect();
	$(document).keydown(keys);
	ctx = $("#tron")[0].getContext("2d");
	ctx.width = $("#tron")[0].width;
	ctx.height = $("#tron")[0].height;
	map.map = Array();
	map.x = ctx.width/res;
	map.y = ctx.height/res;
	for (var x=0; x<map.x;x++){
		map.map[x]=Array();
	}
	for (var x=0; x<map.x;x++){
		for (var y=0; y<map.y;y++){
			map.map[x][y]=0;
		}
	}
});

function runGame() {
	update();
	draw();
}

function update() {
	for (i in players) {
		if((map.map[players[i].x][players[i].y])||
			(players[i].x<0)||(players[i].y<0)||
			(players[i].x>=map.x)||(players[i].y>=map.y)) {
			dead.push(i);
		}
	}
	for (i in dead) {
		delete players[dead[i]];
		for (var x=0; x<map.x;x++){
			for (var y=0; y<map.y;y++){
				if (map.map[x][y]==dead[i]){
					map.map[x][y] = 0;
				}
			}
		}
		imdead=true;
	}
	dead = Array();
	for (i in players) {
		map.map[players[i].x][players[i].y] = players[i].id;
		players[i].x += players[i].xv;
		players[i].y += players[i].yv;
	}
}

function draw() {
	ctx.fillStyle="rgb(255,255,255)";
	ctx.fillRect(0,0,ctx.width,ctx.height);
	ctx.fillStyle="rgb(0,0,0)";
	for (i in players){
		ctx.fillRect(res*players[i].x,res*players[i].y,res,res);
	}
	ctx.fillStyle="rgb(200,200,200)";
	for (var x=0; x<map.x;x++){
		for (var y=0; y<map.y;y++){
			if (map.map[x][y]){
				ctx.fillRect(res*x,res*y,res,res);
			}
		}
	}
}

function keys(e) {
	var nxv=0;
	var nyv=0;
	if (imdead) return;
	switch(e.keyCode) {
		case 37: //left
			nxv=-1;
			nyv=0;
			channel.event_queue("actions",{"object":{"id":me,"xv":nxv,"yv":nyv}});
			break;
		case 38: //up
			nxv=0;
			nyv=-1;
			channel.event_queue("actions",{"object":{"id":me,"xv":nxv,"yv":nyv}});
			break;
		case 39: //right
			nxv=1;
			nyv=0;
			channel.event_queue("actions",{"object":{"id":me,"xv":nxv,"yv":nyv}});
			break;
		case 40: //down
			nxv=0;
			nyv=1;
			channel.event_queue("actions",{"object":{"id":me,"xv":nxv,"yv":nyv}});
			break;
	}
}

function connect() {
	var client = {
		connect: connected,
		event_queue: handler
	};
	return new IMO.Channel(client);
}

function connected() {
	channel.subscribe([{"type":"event_queue","name":"syn"},
		{"type":"event_queue","name":"actions"},
		{"type":"event_queue","name":"players"},
		{"type":"event_queue","name":"start"}],0);
	channel.event_queue("syn",{"object":{"greetings":"hi"}});
}

function handler(name,event) {
	switch(name) {
		case "syn":
			if(event.this_session&role==null) {
				$("#button").show();
				$("#button").click(function(){
					channel.event_queue("start",{"object":{"greetings":"hi"}});
					$("#button").hide();
				});
				role = 0; 
			}
			else if(role==null){
				role = 1;
			}
			if (event.this_session) {
				me = event.setter;
				channel.event_queue("players",{"object":{"id":me,"x":10,"y":Math.round(map.y*Math.random()),"xv":1,"yv":0}});
			}
			
			break;
		case "actions":
			players[event.object.id].xv = event.object.xv;
			players[event.object.id].yv = event.object.yv;
			break;
		case "players":
			players[event.object.id] = event.object;
			break;
		case "start":
			window.setInterval(runGame,100);
			break;
	}
}

function clientCode () {
}

function hostCode () {
}
