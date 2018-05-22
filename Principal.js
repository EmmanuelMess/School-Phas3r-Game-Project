const juego = new Phaser.Game(800, 220, Phaser.CANVAS, 'bloque_juego');

let tileSprite;//para actualizar el movimiento del terreno, darle macarena
let limitesTerreno = 0;//pa que no se salga de los limites del nivel
let Mapa;
let Layer;
let Marco;
let Cursors;

class MarcoPlayer extends Phaser.Sprite {
    constructor(juego, x, y) {
        super(juego, x, y, 'Quieto');
        this.animations.add('Quiet', [0, 1, 2], 3, true);
        /*
        Marco.animations.add('CorreR', [0, 2, 3, 4, 5, 6], 10, true);//Agarro solo un par de frames porque los faltantes estan mal cortados CorreR = [0,2,3,4,5,6] frames de Correr
        Marco.animations.add('QuietO', [0, 1, 2], 3, true);
        */
    }

    mover(cursors) {
        if (cursors.up.isDown) {
            if (this.body.onFloor()) {
                this.body.velocity.y = -200;
            }
        }

        if (cursors.right.isDown && Marco.x <= 770) {
            this.x++;
            if (this.x >= 600 && limitesTerreno < 460) {
                tileSprite.tilePosition.x -= 6;
                this.x--;
                limitesTerreno++;

            }
            if (limitesTerreno >= 460) {
                this.x++;
            }
        }
        if (cursors.left.isDown && this.x !== 10) {
            this.x--;
        }
    }

    updateSpecial(cursors) {
        this.animations.play('Quiet');
        this.mover(cursors);
    }
}

let Estado = {
    preload: function () {//sube todo
        juego.load.tilemap('mario', 'assets/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
        juego.load.image('fondoterreno', 'assets/fondo.png');//cargo mi imagen
        juego.load.spritesheet('Correr', 'assets/Correr.png', 31.75, 40);//cargo mi conjunto de imagenes para marco y la nombro MarcoRun
        juego.load.spritesheet('Quieto', 'assets/Quieto.png', 30, 40);
        juego.load.image('Quieto2', 'assets/Quieto.png');
    },

    create: function () {//se arranca solo una vez como un constructor  mas o menos
        juego.physics.startSystem(Phaser.Physics.ARCADE);

        tileSprite = juego.add.tileSprite(0, 0, 800, 220, 'fondoterreno');//muestro por pantalla el terreno dandole los limites laterales, superior e inferior + el objeto
        Cursors = juego.input.keyboard.createCursorKeys();//guardo en Cursors lo que se presiona por teclado

        Marco = new MarcoPlayer(juego, 25, 160, 1);

        juego.add.existing(Marco);
        juego.physics.enable(Marco);

        juego.physics.arcade.gravity.y = 0;
    },

    update: function () {//se verifica frame a frame izi
        Marco.updateSpecial(Cursors);
    }
};

juego.state.add('principal', Estado);
juego.state.start('principal');