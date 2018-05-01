const JUEGO = new Phaser.Game(800, 220, Phaser.CANVAS, 'bloque_juego');

let cursorParaMover;//para mover el terreno conforme se aprieta las flechitas
let tileSprite;//para actualizar el movimiento del terreno, darle macarena
let limitesTerreno = 0;//pa que no se salga de los limites del nivel
let marco;//el personaje
let mapa;
let layer;

const ANIMATION_CORRER = "correr anim";
const ANIMATION_QUIETO = "quieto anim";

const ESTADO = {
    preload: function () {//sube todo
        JUEGO.load.tilemap('mario', 'assets/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
        JUEGO.load.image('fondoterreno', 'assets/fondo.png');//cargo mi imagen
        JUEGO.load.spritesheet('Correr', 'assets/Correr.png', 31.75, 40);//cargo mi conjunto de imagenes para marco y la nombro MarcoRun
        JUEGO.load.spritesheet('Quieto', 'assets/Quieto.png', 30, 40, 3);
    },

    create: function () {//se arranca solo una vez como un constructor  mas o menos
        JUEGO.physics.startSystem(Phaser.Physics.ARCADE);

        tileSprite = JUEGO.add.tileSprite(0, 0, 800, 220, 'fondoterreno');//muestro por pantalla el terreno dandole los limites laterales, superior e inferior + el objeto
        cursors = JUEGO.input.keyboard.createCursorKeys();//guardo en cursors lo que se presiona por teclado

        marco = JUEGO.add.sprite(50, 160, 'Quieto');//no podes tener 2 animations.play ni dos add.sprite se superponen
        JUEGO.physics.enable(marco);
        JUEGO.physics.arcade.gravity.y = 0;

        marco.animations.add(ANIMATION_QUIETO, [0, 0, 1, 1, 2, 2], 7, true);
        marco.animations.add(ANIMATION_CORRER, [0, 2, 3, 4, 5, 6], 7, true);//Agarro solo un par de frames porque los faltantes estan mal cortados CorreR = [0,2,3,4,5,6] frames de Correr
    },

    update: function () {//se verifica frame a frame izi
        marco.animations.play(ANIMATION_QUIETO);//al no poder tener 2 animations.play solo corro por defecto la QuietO y de ahi me muevo QuietO es la padre
        marco.body.velocity.x = 0;

        if (cursors.up.isDown) {
            if (marco.body.onFloor()) {
                marco.body.velocity.y = -200;
            }
        }

        if (cursors.right.isDown && marco.x <= 770) {
            marco.animations.play(ANIMATION_CORRER);
            marco.x++;
            if (marco.x >= 600 && limitesTerreno < 460) {
                tileSprite.tilePosition.x -= 6;
                marco.x--;
                limitesTerreno++;
            }
            if (limitesTerreno >= 460) {
                marco.x++;
            }
        }
        if (cursors.left.isDown && marco.x !== 10) {
            marco.x--;
        }
    }
};

JUEGO.state.add('principal', ESTADO);
JUEGO.state.start('principal');