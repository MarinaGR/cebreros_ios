var api_url='http://www.cebreros.es/api/v1/';
var extern_url='http://www.cebreros.es/';
var local_url='./resources/json/';
var storage_url='Cebreros/resources/';
var file_path;

var online;

var coord_image_ppal=new Array();
var coord_image=new Array();
var array_coord_image_ppal=new Array();
var array_coord_image=new Array();

var total_img_gals=0, total_gals=0;
var intentos;

var zoom=1.15;

var now=new Date(2014,0,1).getTime(); 

var destination;
var fs;
var DATADIR;

var archivos={
			  "":['routes'],		
			  route:['/1', '/2', '/3', '/4', '/5', '/6', '/7'],		
			  gallery:['/2','/3', '/4'],
			  category:['/14', '/17', '/18'],
			  page:['/42', '/43', '/44', '/45', '/46', '/47', '/48', 
					'/49', '/50', '/51', '/52', '/53', '/54','/55',
					'/56', '/57','/58','/60','/61','/63']
			};
			 
function onBodyLoad()
{	
    document.addEventListener("deviceready", onDeviceReady, false);
	document.getElementById("boton_menu").addEventListener("click", onMenuKeyDown, false);	
	document.getElementById("boton_salir").addEventListener("click", onBackKeyDown, false);	
}
function onDeviceReady()
{
	document.addEventListener("offline", onOffline, false);
	document.addEventListener("online", onOnline, false);

	//cordova.plugins.backgroundMode.enable(); 	
	
	document.addEventListener("backbutton", onBackKeyDown, false);
	document.addEventListener("menubutton", onMenuKeyDown, false);
	
	check_internet();
	 
}    
function check_internet(){

	var isOffline = 'onLine' in navigator && !navigator.onLine;

	var networkState = navigator.connection.type;
	var states = {};
	states[Connection.UNKNOWN]  = 'Conexion desconocida';
	states[Connection.ETHERNET] = 'Conexion Ethernet';
	states[Connection.WIFI]     = 'Conexion WiFi';
	states[Connection.CELL_2G]  = 'Conexion 2G';
	states[Connection.CELL_3G]  = 'Conexion 3G';
	states[Connection.CELL_4G]  = 'Conexion 4G';
	states[Connection.CELL]     = 'Conexion generica';
	states[Connection.NONE]     = 'Sin conexion';
		
	if(!isOffline) 
	{			
		online=true;
	}
	else
	{			
		online=false;
	}

}
function onBackKeyDown()
{
	if((window.location.href).indexOf("index.html")>-1) ;
	{		
		navigator.app.exitApp();
		return false;
	}
	window.history.back();
}
function onMenuKeyDown()
{
	var user_session=getSessionStorage("user_session"); 
	window.location.href='index.html';
}
function onBackKeyDown()
{
	window.history.back();
}
function onOutKeyDown()
{
	navigator.app.exitApp();
	return false;
}

function onOnline()
{
	online=true;
}
function onOffline()
{
	online=false;
}

function ajax_recover_data(type, id, container, isLocal, haveCanvas, canvas_number) {
		
	if(isLocal==true || isLocal=="true")
	{			
		var objajax=$.getJSON(local_url+type+id+".json", f_success)
			.fail(function(jqXHR, textStatus, errorThrown) {
				//alert('Error: '+type+id+" - "+textStatus+"  "+errorThrown);	
				$("#"+container).append("No se han cargado los datos del archivo.<br>Error: "+type+id+" - "+textStatus+"  "+errorThrown);
			});
	
	}
	else 
	{
		$.ajax({
		  url: api_url+type+id,
		  type: 'GET',
		  dataType: 'json',
		  crossDomain: true, 
		  success: f_success,
		  error: f_error,
		  async:false,
		});
	
	}

	function f_success(data) {
	
		//data = $.parseJSON(data);
		
		switch(type)
		{
			case "category": 			
					var cadena="";

					$.each(data.Result.Items, function(index, d){   
					
						if(d.ID!=64)
						{
							var fecha=d.DatePublish;
							var imagen=d.Image; 

							//if(online)
							{
								if(imagen!=null && imagen!="null" && imagen!="" && (imagen.indexOf("jpg")>0 || imagen.indexOf("png")>0)) 
								{						
									if(imagen.indexOf("http")<0)
									{
										if(imagen.indexOf("public/images")>=0 || imagen.indexOf("public/thumbnails")>=0)
											cadena+="<div style='width:100%;height:75px;background:#FFF url("+extern_url+imagen+") no-repeat center;background-size:cover;'></div>";
										else
											cadena+="<div style='width:100%;height:75px;background:#FFF url("+extern_url+"public/thumbnails/"+imagen+") no-repeat center;background-size:cover;'></div>";							
									}
									else
										cadena+="<div style='width:100%;height:75px;background:#FFF url("+imagen+") no-repeat center;background-size:cover;'></div>";
								}
								else
								{
									cadena+="<div style='width:100%;height:75px;background:#FFF url(./resources/images/general/sin_imagen.jpg) no-repeat center;background-size:cover;'></div>";
								}
							}
							/*else
							{
								cadena+="<div style='width:100%;height:25px;background:#FFF url(./resources/images/general/sin_imagen.jpg) no-repeat center;background-size:cover;'></div>";
							}*/
								
							if(isLocal!=true && isLocal!="true")
							{
								var fecha_solo=fecha.toString().split(/[ ]+/g);
								var fecha_split=fecha_solo[0].split("-");
								
								cadena+="<div class='fecha_01'>"+fecha_split[2]+"/"+fecha_split[1]+"/"+fecha_split[0]+"</div>";
								//cadena+="<div class='fecha_01'>"+fecha.getDate()+"/"+(fecha.getMonth()+1)+"/"+fecha.getFullYear()+"</div>";
							}
							
							//cadena+="<h3>"+decodeURIComponent(escape(d.Title))+"</h3>";
							cadena+="<h3>"+d.Title+"</h3>";
							
							if(isLocal)
								cadena+="<a class='vermas' href='noticia.html?id="+d.ID+"&local=true'>VER</a>";
							else
								cadena+="<a class='vermas' href='noticia.html?id="+d.ID+"&local=false'>VER</a>";
						}

					});

					$("#"+container).html(cadena);
				
					break;
					
			case "page": 			
					var cadena="";
				
					var d=data.Result.Data;
						
					var fecha=d.DatePublish;
					var imagen=d.Image; 
					cadena+="<h2>"+d.Title+"</h2>";
					
					if(isLocal!=true && isLocal!="true")
					{
						var fecha_solo=fecha.toString().split(/[ ]+/g);
						var fecha_split=fecha_solo[0].split("-");
								
						cadena+="<div class='fecha_02'>"+fecha_split[2]+"/"+fecha_split[1]+"/"+fecha_split[0]+"</div>";
						//cadena+="<div class='fecha_02'>"+fecha.getDate()+"/"+(fecha.getMonth()+1)+"/"+fecha.getFullYear()+"</div>";
					}

					//if(online)
					{
						if(imagen!=null && imagen!="null" && imagen!="" && (imagen.indexOf("jpg")>0 || imagen.indexOf("png")>0)) 
						{						
							if(imagen.indexOf("http")<0)
							{
								if(imagen.indexOf("public/images")>=0 || imagen.indexOf("public/thumbnails")>=0)
									cadena+="<img src='"+extern_url+imagen+"' style='display:block;margin:auto;' alt='Imagen principal' />";
								else
									cadena+="<img src='"+extern_url+"public/thumbnails/"+imagen+"' style='display:block;margin:auto;' alt='Imagen principal' />";
							
							}
							else
								cadena+="<img src='"+imagen+"' style='display:block;margin:auto;' alt='Imagen principal' />";
							
						}
					}
					
					cadena+=d.Page;
					
					var geolocation2=d.Geolocation;
					if(geolocation2!="" && geolocation2!=null)
					{
						geolocation2=geolocation2.split(/[(,)]/);
						var geo_lat=geolocation2[1];
						var geo_lon=geolocation2[2];
						var my_zoom=parseInt(geolocation2[3]);
														
						destination=geo_lat+","+geo_lon;
						
						//get_geo_route_map();
						
						//cadena+="<br><iframe width='100%' style='height:450px;border:none;' id='geo_route_map'  src='https://www.google.com/maps/embed/v1/directions?key=AIzaSyAD0H1_lbHwk3jMUzjVeORmISbIP34XtzU&origin="+destination+"&destination="+destination+"&avoid=tolls|highways&language=es' ></iframe>";
						
						//cadena+="<div id='datos_geo_position'>Esperando geolocalizaci&oacute;n...</div>";	

						cadena+='<br><a class="vermas" href="http://www.maps.google.com/maps?z='+my_zoom+'&q=loc:'+destination+'&avoid=tolls|highways&language=es" >Ver geolocalizaci&oacute;n en Google Maps 1</a>';	

						cadena+='<br><a href="http://www.maps.google.com/maps?z='+my_zoom+'&q=loc:'+destination+'&avoid=tolls|highways&language=es" onclick="window.open(\'http://www.maps.google.com/maps?z='+my_zoom+'&q=loc:'+destination+'&avoid=tolls|highways&language=es\', \'_system\', \'location=yes\');" class="vermas" >Ver geolocalizaci&oacute;n en Google Maps 2</a>';
						
						cadena+='<br><a href="#" onclick="window.open(\'http://www.maps.google.com/maps?z='+my_zoom+'&q=loc:'+destination+'&avoid=tolls|highways&language=es\', \'_system\', \'location=yes\');" class="vermas" >Ver geolocalizaci&oacute;n en Google Maps 3</a>';
						
						cadena+='<br><a href="#" onclick="window.open(\'http://www.maps.google.com/maps?z='+my_zoom+'&q=loc:'+destination+'&avoid=tolls|highways&language=es\', \'_blank\', \'location=yes\');" class="vermas" >Ver geolocalizaci&oacute;n en Google Maps 4</a>';
						
						cadena+='<br><a href="#" onclick="window.open(\'http://www.maps.google.com/maps?z='+my_zoom+'&q=loc:'+destination+'&avoid=tolls|highways&language=es\', \'_self\', \'location=yes\');" class="vermas" >Ver geolocalizaci&oacute;n en Google Maps 5</a>';
						
						

					}
					
					//if(online)
					{
						
						var imagenes=data.Result.Images;
						if(data.Result.TotalImages>0) 
						{
							for(i=0;i<data.Result.TotalImages;i++)
								cadena+="<br><img src='"+(extern_url+"public/thumbnails/"+imagenes[i].Image)+"' style='display:block;margin:auto;' alt='Imagen' />";
								
							cadena+="<br>";
						}
						
						var videos=data.Result.Videos;
						if(data.Result.TotalVideos>0) 
						{
							for(i=0;i<data.Result.TotalVideos;i++)
							{
								var src_video=$(videos[i].Embed).attr('src');
								
								if(src_video.substring(0, 2)=="//")
								{
									var new_src_video="http:"+src_video;
									cadena+="<br>"+videos[i].Embed.replace(src_video, new_src_video);
								}
									
								if(src_video.substring(0, 4)=="http")
									cadena+="<br>"+videos[i].Embed;			
									
								$(videos[i].Embed).css('max-width','100%'); 	
							}
							
							cadena+="<br>";
						}
					}
					
					var adjuntos=data.Result.Attachments;
					if(data.Result.TotalAttachments>0) 
					{
						for(i=0;i<data.Result.TotalAttachments;i++)
							cadena+='<br><a class="vermas" onclick="window.open(\''+extern_url+'public/files/'+adjuntos[i].File+'\', \'_system\', \'location=yes\');" href="#" >'+adjuntos[i].Description+'</a>';
						
						cadena+="<br>";
					}
					var enlaces=data.Result.Links;
					if(data.Result.TotalLinks>0) 
					{
						for(i=0;i<data.Result.TotalLinks;i++)
							cadena+='<br><a class="vermas" onclick="window.open(\''+enlaces[i].Link+'\', \'_system\', \'location=yes\');" href="#" >'+enlaces[i].Description+'</a>';
						
						cadena+="<br>";
					}
				
					$("#"+container).html(cadena);
					
					$("a").on("click", function(e) {
						var url = $(this).attr('href');
						var containsHttp = new RegExp('http\\b'); 
						
						if(containsHttp.test(url)) { 
							e.preventDefault(); 
							window.open(url, "_system", "location=yes"); // For iOS
							//navigator.app.loadUrl(url, {openExternal: true}); //For Android
						}
					});	
				
					break;
					
			case "calendar": break;
			case "calendar_day": break;
			case "event": break;
			
			case "galleries": 
					var cadena="";
					
					$.each(data.Result.Items, function(index, d){   
						var imagen=d.Image; 
						
						cadena+="<div class='buttons_galleries'>";
						if(imagen!=null && imagen!="null" && imagen!="") 
						{
							//Sacar ruta local para la imagen	
							var imagen_local=imagen.split("/public/images/");
							
							cadena+="<div style='width:100%;height:75px;background: #FFF url("+local_url+'/gallery/'+d.ID+'/'+imagen_local[1]+") no-repeat center;background-size:cover;'></div>";
						}
							
						cadena+="<h3>"+d.Title+"</h3>";
						
						if(isLocal)
							cadena+="<a class='vermas' href='fotos.html?id="+d.ID+"&local=true'>VER</a></div>";
						else
							cadena+="<a class='vermas' href='fotos.html?id="+d.ID+"&local=false'>VER</a></div>";

					});
					
					cadena+="<div style='clear:both'> </div>";

					$("#"+container).html(cadena);
					break;
					
			case "gallery": 
					var cadena="";
				
					var d=data.Result;
					
					var fecha=new Date(d.DatePublish);
					var imagen=d.Image; 
					cadena+="<h2>"+d.Title+"</h2>";
					
					cadena+=d.Description;
					
					if(isLocal)
					{
						if(d.Total>0) 
						{
							var imagenes=d.Items;
							for(i=0;i<d.Total;i++)
							{
								//Sacar ruta local para la imagen	
								var imagen_local=(imagenes[i].Image).split("/public/images/");
							
								cadena+='<br><img src="'+local_url+'gallery/'+d.ID+'/'+imagen_local[1]+'" style="display:block;margin:auto;" alt="Imagen" onclick="window.open(\''+local_url+'gallery/'+d.ID+'/'+imagen_local[1]+'\', \'_system\', \'location=yes\');"  />';
								
							}
						}
						
					}
					else
					{
						if(online)
						{
							if(d.Total>0) 
							{
								var imagenes=d.Items;
								for(i=0;i<d.Total;i++)
									cadena+="<br><img src='"+imagenes[i].Image+"' style='display:block;margin:auto;' alt='Imagen' />";
									//Cargar imagen web
							}
						}	
					}
					$("#"+container).html(cadena);
					
					$("a").on("click", function(e) {
						var url = $(this).attr('href');
						var containsHttp = new RegExp('http\\b'); 
						
						if(containsHttp.test(url)) { 
							e.preventDefault(); 
							window.open(url, "_system", "location=yes"); // For iOS
							//navigator.app.loadUrl(url, {openExternal: true}); //For Android
						}
					});	

					break;
					
			case "routes": 
					var cadena="";
					
					$.each(data.Result.Items, function(index, d){   
						var fecha=new Date(d.DatePublish);
						
						cadena+="<div class='buttons_routes' onclick='window.location.href=\"mapa.html?id="+d.ID+"\"'>";
						
						var imagen=d.Image; 
						if(imagen!=null && imagen!="null" && imagen!="") 
						{
							//Sacar ruta local para la imagen	
							var array_ruta_imagen=imagen.split("/public/images/");
							var imagen_local="./resources/images/mapas/"+array_ruta_imagen[1];	
						
							cadena+="<div style='width:100%;height:100px;background:url("+imagen_local+") no-repeat center;background-size:cover;'></div>";
						}
							
						cadena+="<h5>"+d.Title+"</h5>";
						cadena+="</div>";
					});
					
					cadena+="<div style='clear:both'> </div>";

					$("#"+container).html(cadena);
					break;
					
			case "route": 
					var cadena="";
					
					if(haveCanvas==true)
					{
						var src_image="";
				
						switch(id)
						{
							case "/1":src_image='./resources/images/mapas/mapa_01.jpg';  
									  coord_image_ppal=[["top-left", "40.4797", "-4.4814"],["bottom-left", "40.4210", "-4.4814"], ["top-right","40.4797", "-4.3656"]];
									  break;
									  
							case "/2": src_image='./resources/images/mapas/mapa_02.jpg';  
									   coord_image_ppal=[["top-left", "40.4880", "-4.5537"],["bottom-left", "40.4294", "-4.5537"], ["top-right","40.4880", "-4.4379"]];
									   break;
									   
							case "/3": src_image='./resources/images/mapas/mapa_03.jpg';
									   coord_image_ppal=[["top-left", "40.5029", "-4.5515"],["bottom-left", "40.4443", "-4.5515"], ["top-right","40.5029", "-4.4357"]];
									   break;
									   
							case "/4": src_image='./resources/images/mapas/mapa_04.jpg';  
									   coord_image_ppal=[["top-left", "40.4736", "-4.4936"],["bottom-left", "40.4149", "-4.4936"], ["top-right","40.4736", "-4.3778"]];
									   break;
									   
							case "/5": src_image='./resources/images/mapas/mapa_05.jpg';  
									   coord_image_ppal=[["top-left", "40.4840", "-4.5260"],["bottom-left", "40.4253", "-4.5260"], ["top-right","40.4840", "-4.4102"]];
									   break;
									
							case "/6": src_image='./resources/images/mapas/mapa_06.jpg';  
									   coord_image_ppal=[["top-left", "40.5063", "-4.5182"],["bottom-left", "40.4476", "-4.5182"], ["top-right","40.5063", "-4.4024"]];
									   break;
									   
							case "/7": src_image='./resources/images/mapas/mapa_07.jpg';  
									   coord_image_ppal=[["top-left", "40.4977", "-4.4984"],["bottom-left", "40.4391", "-4.4984"], ["top-right","40.4977", "-4.3826"]];
									   break;
									   
							default: src_image='';  
									 break;
						}
						
						var d=data.Result;
						draw_canvas(container,src_image,'./resources/rutas/'+data.Result.DownloadGPX,id,canvas_number); 
						
						if(canvas_number==1)
						{
							$("#"+container).css("height",height);
							$("#datos_geo").append("<div id='datos_geo_position'></div>");
						}
		
						break;
					}
					
					var d=data.Result;

					cadena+="<h2>"+d.Title+"</h2>";
					
					var imagen=d.Image; 
					if(imagen!=null && imagen!="null" && imagen!="") 
					{
						//Sacar ruta local para la imagen	
						var array_ruta_imagen=imagen.split("/public/images/");
						var imagen_local="./resources/images/mapas/"+array_ruta_imagen[1];	
					
						cadena+="<img src='"+imagen_local+"' alt='Imagen de la ruta' />";
					}

					cadena+=d.Page;
					
					cadena+="<div class='data_route'>";
					cadena+="<p class='title_01'>DATOS DE LA RUTA</p>";
					cadena+="<p><b>Altitud m&aacute;xima:</b> "+d.MaxAltitude+"</p>"+
							"<p><b>Altitud m&iacute;nima:</b> "+d.MinAltitude+"</p>"+
							"<p><b>Dificultad:</b>  "+d.Difficulty+"</p>"+
							"<p><b>Distancia:</b>  "+d.Distance+"</p>"+
							"<p><b>Ruta circular monumentos:</b> "+d.Monuments+"</p>"+
							"<p><b>Panor&aacute;micas:</b>  "+d.Panoramics+"</p>";
							"<p><b>Realizable en bici:</b>  "+d.CycleReady+"</p>";
					cadena+="</div>";		

					/*var imagenes=d.Items;
					if(d.Total>0) 
					{
						for(i=0;i<d.Total;i++)
							cadena+="<br><img src='"+imagenes[i].MinImage+"' alt='Imagen ruta' />";
					}*/
					
					if(d.WikilocLink!="")
					{
						cadena+='<p><br><br><a class="vermas" onclick="window.open(\''+d.WikilocLink+'\', \'_system\', \'location=yes\');" href="#" >Ver ruta en Wikiloc</a></p>';
					}						
										
					cadena+="<p><a class='vermas' href='canvas.html?id="+id+"'>Ver ruta con geolocalizaci&oacute;n</a></p>";				
					
					$("#"+container).append(cadena);
					
					$("a").on("click", function(e) {
						var url = $(this).attr('href');
						var containsHttp = new RegExp('http\\b'); 
						
						if(containsHttp.test(url)) { 
							e.preventDefault(); 
							window.open(url, "_system", "location=yes"); // For iOS
							//navigator.app.loadUrl(url, {openExternal: true}); //For Android
						}
					});	
					
					break;

		}
	
	}
	function f_error(jqXHR, textStatus, errorThrown){
		//alert('Error: '+textStatus+" - "+errorThrown);	
		$("#"+container).html("Necesita tener conexi&oacute;n a internet para acceder a esta secci&oacute;n.");
	}

}

var canvasOffset;
var offsetX;
var offsetY;

var ctx;

var imageX = 0;
var imageY = 0;
var img_global;

var draggingImage = false;
var isDown = false;
var startX=0;
var startY=0;


function handleMouseDown(e) {
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
	draggingImage = true;
}
function handleTouchStart(e) {
    startX = parseInt(e.changedTouches[0].clientX - offsetX);
    startY = parseInt(e.changedTouches[0].clientY - offsetY);
	draggingImage = true;
}

function handleMouseUp(e) {
    draggingImage = false;
    //Pintar la ruta y la geolocalización teniendo en cuenta la nueva posición 'x' e 'y' de la imagen
	draw_points2(ctx);
}
function handleTouchEnd(e) {
    draggingImage = false;
	e.preventDefault();
    //Pintar la ruta y la geolocalización teniendo en cuenta la nueva posición 'x' e 'y' de la imagen
	draw_points2(ctx);
}

function handleMouseOut(e) {
    handleMouseUp(e);
}

  
function handleMouseMove(e) {
	if(draggingImage) {
	
        imageClick = false;

		mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

         // mover la imagen con la cantidad del ultimo drag
        var dx = mouseX - startX;
        var dy = mouseY - startY;
        imageX -= dx*2;
        imageY += dy*2;
        // reset startXY para la siguiente vez
        startX = mouseX;       
		startY = mouseY;
		
		
		if(imageX > 0)
			imageX=0;
		if(imageY > 0)
			imageY=0;
			
		if(imageX < -(img_global.height-$("#mapa_canvas").width()))
			imageX= -(img_global.height-$("#mapa_canvas").width());		
			
		if(imageY < -(img_global.width-$("#mapa_canvas").height()))
			imageY= -(img_global.width-$("#mapa_canvas").height());		

        // repintamos
		ctx.clearRect(0, 0, canvas.height, canvas.width);
		ctx.drawImage(img_global, 0, 0, img_global.width, img_global.height, imageY, imageX, img_global.width, img_global.height);

    }

}
function handleTouchMove(e) {
  
	if(draggingImage) {
	
        imageClick = false;

		mouseX = parseInt(e.changedTouches[0].clientX - offsetX);
        mouseY = parseInt(e.changedTouches[0].clientY - offsetY);

        // mover la imagen con la cantidad del ultimo drag
        var dx = mouseX - startX;
        var dy = mouseY - startY;
        imageX -= dx;
        imageY += dy;
        // reset startXY para la siguiente vez
        startX = mouseX;       
		startY = mouseY;
		
		
		if(imageX > 0)
			imageX=0;
		if(imageY > 0)
			imageY=0;
			
		if(imageX < -(img_global.height-$("#mapa_canvas").width()))
			imageX= -(img_global.height-$("#mapa_canvas").width());		
			
		if(imageY < -(img_global.width-$("#mapa_canvas").height()))
			imageY= -(img_global.width-$("#mapa_canvas").height());		

        // repintamos
		ctx.clearRect(0, 0, canvas.height, canvas.width);
		ctx.drawImage(img_global, 0, 0, img_global.width, img_global.height, imageY, imageX, img_global.width, img_global.height);

    }
	
	e.preventDefault();

}

function draw_canvas(container,src_image, src_gpx, id, canvas_number) 
{	
	
	$("#"+container).append('<div id="mapa_canvas" style="overflow:hidden; width=100%; opacity:1"></div>');
	
	//Tendría que ser proporcional al tamaño de la imagen que vamos a cargar
		
		width=$(window).width(); 
		height=$(window).height();
		
		if(canvas_number==1)
		{
			$("#mapa_canvas").css("width",width);
			$("#mapa_canvas").css("height",height);
			$("#mapa_canvas").append('<canvas id="canvas" width="'+width+'" height="'+height+'" style="position:relative;top:0;left:0;" ></canvas>');
			
			var canvas = document.getElementById("canvas");			
			
			$.get(src_gpx, function(xml) { 
			}).done(function(xml_Doc) {
			
				coord_image=coord_image_ppal;
			
				var altura=(coord_image[0][1]-coord_image[1][1]);
				var anchura=(coord_image[0][2]-coord_image[2][2]);
				
				var k=0;
				$(xml_Doc).find("rtept").each(function() {
					var lat=$(this).attr("lat");
					var lon=$(this).attr("lon");
					
					array_coord_image_ppal[k]=lat+","+lon;
					k++;
					
				});
				
				k=0;
				array_coord_image_ppal.forEach(function(latlon) {
				
					var latlon_split=latlon.split(",");
					lat=latlon_split[0];
					lon=latlon_split[1];
				
					var lat_canvas=parseFloat(((coord_image[0][1]-lat)*width)/altura);
					var lon_canvas=parseFloat(((coord_image[0][2]-lon)*height)/anchura);

					lat_canvas=lat_canvas.toFixed(3);
					lon_canvas=lon_canvas.toFixed(3);
					
					array_coord_image[k]=lat_canvas+","+lon_canvas;
					k++;
				});

				
				var img = new Image();
				img.src = src_image;
				img.onload = function(){
				
					var contexto = canvas.getContext("2d");
					
					contexto.lineWidth = 3;
					contexto.fillStyle = "orange";		
					contexto.strokeStyle = "orange";		
					contexto.font = '12px "Tahoma"';	
					
					contexto.save();
					// Translate 
					contexto.translate(width, 0);
					// Rotate it
					contexto.rotate(90*Math.PI/180);
					//contexto.restore();		
					
					contexto.drawImage(img, 0, 0, height, width);

					draw_points(contexto);
				
				}
				
			}).fail(function(){
				$("#"+container).append("<p>No se pudo cargar la ruta.</p>");
			});
			
		}
		if(canvas_number==2)
		{
			var img = new Image();
			img.src = src_image;
			img.onload = function(){
			
				img_global=img;
				
				$("#mapa_canvas").css("width",width);
				$("#mapa_canvas").css("height",height);
				
				$("#mapa_canvas").append('<canvas id="canvas" width="'+img.height+'" height="'+img.width+'" style="position:relative;top:0;left:0;" ></canvas>');
				
				$("#canvas").width(img.height);
				$("#canvas").height(img.width);			
				
				//$("#canvas").draggable();
				
				canvasOffset = $("#canvas").offset();
				offsetX = canvasOffset.left;
				offsetY = canvasOffset.top;
				
				$("#canvas").mousedown(function (e) {
					handleMouseDown(e);
				});
				$("#canvas").mousemove(function (e) {
					handleMouseMove(e);
				});
				$("#canvas").mouseup(function (e) {
					handleMouseUp(e);
				});
				$("#canvas").mouseout(function (e) {
					handleMouseOut(e);
				});
				
				var canvas = document.getElementById("canvas");			
				
				canvas.addEventListener("touchstart", handleTouchStart);
				canvas.addEventListener("touchmove", handleTouchMove);
				canvas.addEventListener("touchend", handleTouchEnd);
				
				
				$.get(src_gpx, function(xml) { 
				}).done(function(xml_Doc) {
				
					coord_image=coord_image_ppal;
				
					var altura=(coord_image[0][1]-coord_image[1][1]);
					var anchura=(coord_image[0][2]-coord_image[2][2]);
					
					var k=0;
					$(xml_Doc).find("rtept").each(function() {
						var lat=$(this).attr("lat");
						var lon=$(this).attr("lon");
						
						array_coord_image_ppal[k]=lat+","+lon;
						k++;
						
					});
					
					k=0;
					array_coord_image_ppal.forEach(function(latlon) {
					
						var latlon_split=latlon.split(",");
						lat=latlon_split[0];
						lon=latlon_split[1];
					
						var lat_canvas=parseFloat(((coord_image[0][1]-lat)*img.height)/altura);
						var lon_canvas=parseFloat(((coord_image[0][2]-lon)*img.width)/anchura);

						lat_canvas=lat_canvas.toFixed(3);
						lon_canvas=lon_canvas.toFixed(3);
						
						array_coord_image[k]=lat_canvas+","+lon_canvas;
						k++;
					});

					{
						var contexto = canvas.getContext("2d");
						ctx=contexto;
						
						contexto.lineWidth = 3;
						contexto.fillStyle = "orange";		
						contexto.strokeStyle = "orange";		
						contexto.font = '12px "Tahoma"';	
						
						contexto.save();
						
						contexto.scale(zoom, zoom);
						
						// Translate 
						contexto.translate(width, 0);
						// Rotate it
						contexto.rotate(90*Math.PI/180);
						//contexto.restore();		
						
						contexto.drawImage(img, 0, 0, img.width, img.height);

						draw_points(contexto);
					}
								
				}).fail(function(){
					$("#"+container).append("<p>No se pudo cargar la ruta.</p>");
				});
			}
			
		}
}

function draw_points(contexto)
{
				
	for(i=0;i<array_coord_image.length;i++)
	{
		var array_points=array_coord_image[i].split(",");
		var lat_canvas=array_points[0];
		var lon_canvas=array_points[1];

		//contexto.lineTo(lon_canvas,lat_canvas);								
		//contexto.stroke();
		
		contexto.beginPath();
		contexto.arc(lon_canvas,lat_canvas, 3, 0, 2 * Math.PI, true);
		contexto.fill();
		contexto.closePath();
			
		//contexto.fillText(i,lon_canvas,lat_canvas);
	}
	
	show_geoloc();
}

function draw_points2(contexto)
{
	var altura=(coord_image[0][1]-coord_image[1][1]);
	var anchura=(coord_image[0][2]-coord_image[2][2]);
					
	k=0;
	array_coord_image_ppal.forEach(function(latlon) {
	
		var latlon_split=latlon.split(",");
		lat=latlon_split[0];
		lon=latlon_split[1];
	
		var lat_canvas=parseFloat(((coord_image[0][1]-lat)*img_global.height)/altura)+imageX;
		var lon_canvas=parseFloat(((coord_image[0][2]-lon)*img_global.width)/anchura)+imageY;

		lat_canvas=lat_canvas.toFixed(3);
		lon_canvas=lon_canvas.toFixed(3);
		
		array_coord_image[k]=lat_canvas+","+lon_canvas;
		k++;
	});
	
	contexto.fillStyle = "orange";		
	contexto.strokeStyle = "orange";		
				
	for(i=0;i<array_coord_image.length;i++)
	{
		var array_points=array_coord_image[i].split(",");
		var lat_canvas=array_points[0];
		var lon_canvas=array_points[1];

		//contexto.lineTo(lon_canvas,lat_canvas);								
		//contexto.stroke();
		
		contexto.beginPath();
		contexto.arc(lon_canvas,lat_canvas, 3, 0, 2 * Math.PI, true);
		contexto.fill();
		contexto.closePath();
			
		//contexto.fillText(i,lon_canvas,lat_canvas);
	}
	
	show_geoloc(true);
}


function show_geoloc(redraw)
{
	if (navigator.geolocation)
	{
		//navigator.geolocation.watchPosition(draw_geoloc, error_geoloc, options);
		
		options = {
		  enableHighAccuracy: true,
		  timeout: 15000,
		  maximumAge: 30000
		};
		
		$("#cargando").show('fade', function() {
			if(redraw)
				navigator.geolocation.getCurrentPosition(draw_geoloc2,error_geoloc,options);
			else
				navigator.geolocation.getCurrentPosition(draw_geoloc,error_geoloc,options);
			
		});
	}
	else
	{	
		$("#datos_geo_position").html("<p>Tu dispositivo no permite la geolocalizaci&oacute;n din&aacute;mica.</p>");	
		$("#cargando").hide();
	}
}

function draw_geoloc(position)
{
	var lat = position.coords.latitude;
  	var lon = position.coords.longitude;
	
	//var lat=40.455;
	//var lon=-4.465;

	var canvas = document.getElementById("canvas");						
	var contexto = canvas.getContext("2d");
	contexto.fillStyle = "#BE0000";		
	contexto.strokeStyle = "#BE0000";		
	contexto.font = '12px "Tahoma"';		

	var width=canvas.width;
	var height=canvas.height;
							
	var altura=(coord_image[0][1]-coord_image[1][1]);
	var anchura=(coord_image[0][2]-coord_image[2][2]);
	
	var lat_canvas=parseFloat(((coord_image[0][1]-lat)*width)/altura);
	var lon_canvas=parseFloat(((coord_image[0][2]-lon)*height)/anchura);
								
	lat_canvas=Math.round(lat_canvas * 100)/100;
	lon_canvas=Math.round(lon_canvas * 100)/100;
	
	contexto.beginPath();
	contexto.arc(lon_canvas,lat_canvas, 7, 0, 2 * Math.PI, true);
	contexto.fill();
	contexto.closePath();
	
	//$("#datos_geo_position").html("<p>Est&aacute;s en la posici&oacute;n: "+lat+", "+lon+"</p><p>Precisi&oacute;n: "+position.coords.accuracy+"<br>Velocidad: "+position.coords.speed+"<br>Altitud: "+position.coords.altitude+"<br></p>");
	
	$("#cargando").hide();
	
	$("#datos_geo_position").html("<div class='data_route'>"+
									  "<p class='title_01'>GEOLOCALIZACI&Oacute;N</p>"+
									  "<b>TU POSICI&Oacute;N</b><br>"+
									  "<b>Latitud: </b>:" +lat+"<br>"+
									  "<b>Longitud: </b>: "+lon+"<br>"+
									  "<b>Precisi&oacute;n:</b> "+position.coords.accuracy+"<br>"+
									  "<b>Velocidad:</b> "+position.coords.speed+"<br>"+
									  "<b>Altitud:</b>  "+position.coords.altitude+"<br><br>"+
								  "</div><br>");
								  
	if(lat>=coord_image[0][1] || lat<=coord_image[1][1] || lon<=coord_image[0][2] || lon>=coord_image[2][2])
		$("#datos_geo_position").html("<div class='data_route'>"+
										"<p class='title_01'>GEOLOCALIZACI&Oacute;N</p>"+
										"<b>TU POSICI&Oacute;N</b> est&aacute; fuera de este mapa<br>"+
										"<b>Latitud: </b>:" +lat+"<br>"+
										"<b>Longitud: </b>: "+lon+"<br><br>"+
								  "</div><br>");	
		
}
function draw_geoloc2(position)
{
	var lat = position.coords.latitude;
  	var lon = position.coords.longitude;
	
	//var lat=40.455;
	//var lon=-4.465;

	var canvas = document.getElementById("canvas");						
	var contexto = canvas.getContext("2d");
	contexto.fillStyle = "#BE0000";		
	contexto.strokeStyle = "#BE0000";		
	contexto.font = '12px "Tahoma"';		

	var width=canvas.width;
	var height=canvas.height;
							
	var altura=(coord_image[0][1]-coord_image[1][1]);
	var anchura=(coord_image[0][2]-coord_image[2][2]);
							
	var lat_canvas=parseFloat(((coord_image[0][1]-lat)*img_global.height)/altura)+imageX;
	var lon_canvas=parseFloat(((coord_image[0][2]-lon)*img_global.width)/anchura)+imageY;
								
	lat_canvas=Math.round(lat_canvas * 100)/100;
	lon_canvas=Math.round(lon_canvas * 100)/100;
	
	contexto.beginPath();
	contexto.arc(lon_canvas,lat_canvas, 7, 0, 2 * Math.PI, true);
	contexto.fill();
	contexto.closePath();
	
	$("#cargando").hide();
		
}
function error_geoloc(error)
{
	if(error.code == 1) {
		$("#datos_geo_position").html("<p>La geolocalizaci&oacute;n ha fallado. Acceso denegado.</p>");	
	} 
	else if( error.code == 2) {
		$("#datos_geo_position").html("<p>La geolocalizaci&oacute;n ha fallado. Posición no disponible.</p>");	
	}
	else {
		$("#datos_geo_position").html("<p>La geolocalizaci&oacute;n ha fallado.</p>");	
	}
	$("#cargando").hide();
}

function get_geo_route_map()
{
	if (navigator.geolocation)
	{
		options = {enableHighAccuracy:true, timeout:15000, maximumAge:30000};
		navigator.geolocation.getCurrentPosition(return_user_geoloc,error_user_geoloc,options);
	}
	else
	{	
		var cadena='<br><a class="vermas" onclick="window.open(\'http://www.maps.google.com/maps?q=loc:'+destination+'&avoid=tolls|highways&language=es\', \'_system\', \'location=yes\');" href="#" >Ver geolocalizaci&oacute;n en Google Maps</a>';		
	
		$("#datos_geo_position").html("<p><br>Tu dispositivo no permite la geolocalizaci&oacute;n din&aacute;mica.</p>"+cadena);	
	}
}
function return_user_geoloc(position)
{
	var lat = position.coords.latitude;
  	var lon = position.coords.longitude;
	
	var latlon_user=lat+","+lon;	
	
	var cadena='<br><a class="vermas" onclick="window.open(\'http://www.maps.google.com/maps?saddr='+latlon_user+'&daddr='+destination+'&avoid=tolls|highways&language=es\', \'_system\', \'location=yes\');" href="#" >Ver geolocalizaci&oacute;n en Google Maps</a>';		
	
	$("#datos_geo_position").html(cadena);

}
function error_user_geoloc(position)
{
	var cadena='<br><a class="vermas" onclick="window.open(\'http://www.maps.google.com/maps?q=loc:'+destination+'&avoid=tolls|highways&language=es\', \'_system\', \'location=yes\');" href="#" >Ver geolocalizaci&oacute;n en Google Maps</a>';		
	
	$("#datos_geo_position").html("<p><br>Error en la geolocalizaci&oacute;n</p>"+cadena);
}


function get_var_url(variable){

	var tipo=typeof variable;
	var direccion=location.href;
	var posicion=direccion.indexOf("?");
	
	posicion=direccion.indexOf(variable,posicion) + variable.length; 
	
	if (direccion.charAt(posicion)== "=")
	{ 
        var fin=direccion.indexOf("&",posicion); 
        if(fin==-1)
        	fin=direccion.length;
        	
        return direccion.substring(posicion+1, fin); 
    } 
	else
		return false;
	
}


function onFileSystemError(error) 
{
	console.log("Error File System");
}
function onFileSystemSuccess(fileSystem) 
{

	console.log("File System OK");
	//Cargado el sistema de archivos, crear los directorios pertinentes para la descarga de los ficheros.
		
	fs=fileSystem.root;
	
	setFilePath();		
	
	console.log(fs)
	console.log(file_path);
	
	fs.getDirectory("Cebreros",{create:true, exclusive:false},function() {
		fs.getDirectory(file_path,{create:true, exclusive:false},downloadToDir,onError);
	},onError);
    
    
}

function setFilePath() {
    var ua = navigator.userAgent.toLowerCase();
	var isAndroid = ua.indexOf("android") > -1; 
	if(isAndroid) {
		file_path = "Cebreros/resources";
		//Android
	}
	else {
		file_path = "Cebreros/resources";
		//IOS
	}

}

function downloadToDir(d) {

	var first_time=getLocalStorage("first_time"); 
	if(typeof first_time == "undefined"  || first_time==null || first_time==false || first_time=="false")	
	{
		console.log('created directory '+d.name);

		DATADIR = d;  

		//$("body").prepend("<div id='descarga' onclick='$(this).hide()'><div id='descarga_close'>CERRAR</div></div>");
		$("body").prepend("<div id='descarga'><div id='descarga_close'>CERRAR</div></div>");
			
		$("#descarga").append("<p>DESCARGANDO ARCHIVOS...</p>");
		$("#descarga").append("<p>Esta acci&oacute;n puede tardar algunos minutos.</p>");
		
		//$("#descarga").append('<progress id="barra_carga" max="98" value="1"></progress>');		
		$("#descarga").append('<p id="porcentaje"> </p>');
		
		$.each(archivos, function(folder,files)  
		{	
			$.each(files, function(index,filename)  
			{	
				
				fs.getDirectory(file_path+"/"+folder,{create:true, exclusive:false},function() {
					
					var ft = new FileTransfer();		
					
					var dlPath = fs.toURL()+file_path+"/"+folder+filename+".json"; 			

					ft.download(api_url+folder+filename , dlPath, function() {
							//$("#descarga").append(folder+filename+".json"+" .... OK<br>");
							cargar_barra("barra_carga", 100);
						}, 
						function(error){
							$("#descarga").append(folder+filename+".json"+" .... KO "+error.code+"<br>");
						});
				}
				,function(error){
					$("#descarga").append("Get Directory "+fs.toURL()+file_path+"/"+folder+" fail " + error.code+"<br>");
				});
			});
		});
		
		setTimeout(function() {
			//Descarga imagenes
			fs.getDirectory(file_path+"/gallery",{create:true, exclusive:false},function(dimg) {
			
				var objajax=$.getJSON("./resources/json/galleries.json", function donwload_images(data1) {
				//var objajax=$.getJSON(api_url+"galleries", function donwload_images(data1) {
					
					$.each(data1.Result.Items, function(index, gal){   

						//var objajax2=$.getJSON("./resources/json/gallery/"+gal.ID+".json", function donwload_images(data2) {
						var objajax2=$.getJSON(api_url+"gallery/"+gal.ID, function donwload_images(data2) {
							
							var d=data2.Result;
												
							if(d.Total>0) 
							{
								fs.getDirectory(file_path+"/gallery/"+gal.ID,{create:true, exclusive:false},function() {

									var imagenes=d.Items;
									
									i=0;
									total_img_gals+=d.Total;
									downloadImages(imagenes, i, d.Total, fs.toURL()+file_path+"/gallery/"+gal.ID);
									
								} ,function(error){
									$("#descarga").append("Get Directory "+file_path+"/gallery/"+gal.ID+" fail " + error.code+"<br>");
								});
							}
					
						}).fail(function(jqXHR, textStatus, errorThrown) {							
							console.log("Error al recoger la galeria");											
						});

					});

				}).fail(function(jqXHR, textStatus, errorThrown) {					
					console.log("Error al recoger galleries.json");			
				});
					
			},function(error){
				$("#descarga").append("Get Directory "+file_path+"/gallery fail " + error.code+"<br>");
			});
			
		}, 200);
	}
}

function downloadImages(imagenes, i, total, path) {

	var imagen_local=(imagenes[i].Image).split("/public/images/");

	var ft = new FileTransfer();			
	var dlPath = path+"/"+imagen_local[1]; 
	
	$("#porcentaje").html(total_gals+" %");	
	
	try {	
		ft.download(imagenes[i].Image , dlPath, function() {
		
				//$("#descarga").append(imagen_local[1]+" .... OK<br>");	
				cargar_barra("barra_carga", total_gals);
				total_gals++;
				i++;			
				if(i<total)
					downloadImages(imagenes, i, total, path);
			}, 
			function(error){
				$("#descarga").append(imagen_local[1]+" .... KO (err."+error.code+")<br>");
				intentos++;
				if(i<total && intentos<2)
					downloadImages(imagenes, i, total, path);
				else
				{
					total_gals++;
					intentos=0;
				}
			}
		);
	}
	catch(e) {
	   $("#descarga_close").show();
	}
	
	if(total_img_gals==total_gals+1)
	{
		setTimeout(function() {
			setSessionStorage("tdownload",false);
			setLocalStorage("first_time", true);
			$("#descarga_close").show();
			$("#descarga").hide();
			$("#div_update").html("Actualizacion finalizada");
			
		}, 100);
	}		
}
function cargar_barra(id, total)
{		
	/*var barra_progreso=$("#"+id);
	var value = barra_progreso.val();  
	value+=parseInt(90/total);
    barra_progreso.val(value);  */			
}

function gotFS(fileSystem) 
{
    var reader = fileSystem.root.createReader();
    reader.readEntries(gotList, fail_getFile);  

}
function gotList(entries) {
    var i;
    for (i=0; i<entries.length; i++) {
        if (entries[i].name.indexOf(".json") != -1) {
            console.log(entries[i].name);
        }
    }
}
function success_getFile(parent) {
    console.log("Nombre del padre: " + parent.name);
}
function fail_getFile(error) {
    alert("Ocurrió un error recuperando el fichero: " + error.message);
}
function onError(e){
	$("#descarga_close").show();
	alert("ERROR "+e.code+" - "+e.source+" - "+e.target);
}

function setLocalStorage(keyinput,valinput) 
{
	if(typeof(window.localStorage) != 'undefined') { 
		window.localStorage.setItem(keyinput,valinput); 
	} 
	else { 
		alert("localStorage no definido"); 
	}
}
function getLocalStorage(keyoutput)
{
	if(typeof(window.localStorage) != 'undefined') { 
		return window.localStorage.getItem(keyoutput); 
	} 
	else { 
		alert("localStorage no definido"); 
	}
}
function setSessionStorage(keyinput,valinput)
{
	if(typeof(window.sessionStorage) != 'undefined') { 
		window.sessionStorage.setItem(keyinput,valinput); 
	} 
	else { 
		alert("sessionStorage no definido"); 
	}
}
function getSessionStorage(keyoutput)
{
	if(typeof(window.sessionStorage) != 'undefined') { 
		return window.sessionStorage.getItem(keyoutput); 
	} 
	else { 
		alert("sessionStorage no definido"); 
	}
}