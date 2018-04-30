var juego = new Phaser.Game(800,220,Phaser.CANVAS,'bloque_juego');
var cursorparamover;//para mover el terreno conforme se aprieta las flechitas 
var tileSprite;//para actualizar el movimiento del terreno, darle macarena
var limitesTerreno=0;//pa que no se salga de los limites del nivel
var Marco;//el personaje
var Mapa;
var Layer;
var Estado = {
  preload: function(){//sube todo
      juego.load.tilemap('mario','assets/super_mario.json',null,Phaser.Tilemap.TILED_JSON);
      juego.load.image('fondoterreno','assets/fondo.png');//cargo mi imagen
      juego.load.spritesheet('Correr','assets/Correr.png',31.75,40);//cargo mi conjunto de imagenes para marco y la nombro MarcoRun
      juego.load.spritesheet('Quieto','assets/Quieto.png',30,40);
  },
  
  create: function(){//se arranca solo una vez como un constructor  mas o menos
      juego.physics.startSystem(Phaser.Physics.ARCADE);

      tileSprite=juego.add.tileSprite(0,0,800,220,'fondoterreno');//muestro por pantalla el terreno dandole los limites laterales, superior e inferior + el objeto
      cursors = juego.input.keyboard.createCursorKeys();//guardo en cursors lo que se presiona por teclado

      
      //Marco=juego.add.sprite(50,160,'Correr');//asigno y muestro mi conjunto de imagenes en MarcoRun
      Marco=juego.add.sprite(50,160,'Quieto');//no podes tener 2 animations.play ni dos add.sprite se superponen
      juego.physics.enable(Marco);
      juego.physics.arcade.gravity.y = 0;
      

      
      Marco.animations.add('CorreR',[0,2,3,4,5,6],10,true);//Agarro solo un par de frames porque los faltantes estan mal cortados CorreR = [0,2,3,4,5,6] frames de Correr
      Marco.animations.add('QuietO',[0,1,2],3,true);
  },  
  
  update:function(){//se verifica frame a frame izi
  //  Marco.animations.play('CorreR');
    Marco.animations.play('QuietO');//al no poder tener 2 animations.play solo corro por defecto la QuietO y de ahi me muevo QuietO es la padre
    Marco.body.velocity.x = 0;
    
       if (cursors.up.isDown)
    {
        if (Marco.body.onFloor())
        {
            Marco.body.velocity.y = -200;
        }
    }

   if(cursors.right.isDown&&Marco.x<=770){
       Marco.x++;
       if(Marco.x>=600&&limitesTerreno<460){
            tileSprite.tilePosition.x -=6;
            Marco.x--;
            limitesTerreno++;
       }
       if(limitesTerreno>=460){
           Marco.x++;
       }
       } if(cursors.left.isDown&&Marco.x!==10){
       Marco.x--;
   }
   }
    
  
};

juego.state.add('principal', Estado);
juego.state.start('principal');